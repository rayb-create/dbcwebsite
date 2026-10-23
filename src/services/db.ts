export async function saveOrderToDb(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const subtotal = parseNumericPrice(order.subtotal) ?? 0;
    const shipping = parseNumericPrice(order.shipping) ?? parseNumericPrice((order as any).shippingCost) ?? 0;
    const discount = parseNumericPrice(order.discount) ?? 0;
    const total = parseNumericPrice(order.total) ?? Math.max(0, (subtotal - discount) + shipping);

    const docRef = doc(db, 'orders', order.id);
    const orderPayload = {
      ...order,
      subtotal,
      shipping,
      shippingCost: shipping,
      discount,
      total,
      updatedAt: new Date().toISOString(),
    };
    const sanitizedOrder = sanitizeFirestorePayload(orderPayload);
    await setDoc(docRef, sanitizedOrder, { merge: true });

    // Also persist by orderNumber so public customer tracking can directly read and subscribe to it
    if (order.orderNumber && order.orderNumber !== order.id) {
      const numRef = doc(db, 'orders', order.orderNumber);
      await setDoc(numRef, sanitizedOrder, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Normalizes a raw Firestore order document into a strongly-typed Order object.
 */
export function normalizeOrderDocument(docId: string, raw: any): Order {
  const subtotal = parseNumericPrice(raw.subtotal) ?? 0;
  const shipping = parseNumericPrice(raw.shipping) ?? parseNumericPrice(raw.shippingCost) ?? 0;
  const discount = parseNumericPrice(raw.discount) ?? 0;
  const total = parseNumericPrice(raw.total) ?? Math.max(0, (subtotal - discount) + shipping);

  const customer = {
    fullName: raw.customer?.fullName || raw.customerName || 'Client RENASC',
    phone: raw.customer?.phone || raw.phone || '',
    email: raw.customer?.email || raw.email || '',
    address: raw.customer?.address || raw.address || '',
    city: raw.customer?.city || raw.commune || '',
    daira: raw.customer?.daira || raw.daira || '',
    commune: raw.customer?.commune || raw.commune || '',
    wilayaCode: String(raw.customer?.wilayaCode || raw.wilayaCode || '16'),
    wilayaName: raw.customer?.wilayaName || raw.wilayaName || 'Alger',
    notes: raw.customer?.notes || raw.notes || '',
  };

  let status: Order['status'] = 'Reçu / Confirmed';
  const rawStatus = String(raw.status || '').toLowerCase();
  if (rawStatus.includes('exp') || rawStatus.includes('shipp') || rawStatus.includes('transit') || rawStatus.includes('en livraison')) {
    status = 'Expédié / En Livraison';
  } else if (rawStatus.includes('livré') || rawStatus.includes('livre') || rawStatus.includes('complet') || rawStatus === 'delivered') {
    status = 'Livré / Completed';
  } else if (rawStatus.includes('prép') || rawStatus.includes('atelier') || rawStatus === 'processing') {
    status = 'En Préparation / Atelier';
  } else {
    status = 'Reçu / Confirmed';
  }

  const items = Array.isArray(raw.items)
    ? raw.items.map((it: any) => ({
        ...it,
        quantity: Math.max(1, parseNumericPrice(it?.quantity) ?? 1),
        pricePerUnit: parseNumericPrice(it?.pricePerUnit) ?? parseNumericPrice(it?.product?.price) ?? 0,
        size: it?.size || 'Standard',
        color: it?.color || { name: 'Standard', hex: '#1C1C1C' },
        product: it?.product || {
          id: it?.productId || 'garment',
          name: it?.name || 'Vêtement DBC',
          price: parseNumericPrice(it?.pricePerUnit) ?? 0,
          images: [],
        },
      }))
    : [];

  let dateStr = new Date().toLocaleDateString('fr-DZ');
  try {
    if (raw.date) {
      dateStr = String(raw.date);
    } else if (raw.createdAt) {
      dateStr = new Date(raw.createdAt).toLocaleDateString('fr-DZ');
    }
  } catch {
    dateStr = new Date().toLocaleDateString('fr-DZ');
  }

  return {
    ...raw,
    id: raw.id || docId,
    orderNumber: raw.orderNumber || docId,
    date: dateStr,
    customer,
    status,
    deliveryType: (raw.deliveryType || raw.deliveryMethod) === 'desk' ? 'desk' : 'home',
    paymentMethod: raw.paymentMethod === 'baridimob' ? 'baridimob' : 'cod',
    items,
    subtotal,
    shipping,
    discount,
    total,
    currency: raw.currency || 'DZD',
    trackingNumber: raw.trackingNumber || '',
    carrierName: raw.carrierName || raw.carrier || 'Yalidine Express',
    estimatedDelivery: raw.estimatedDelivery || '24h - 48h',
    trackingNotes: raw.trackingNotes || '',
    dispatchedAt: raw.dispatchedAt || undefined,
  };
}

/**
 * Public Order Tracking: Fetches the authoritative, live order document from Firestore.
 */
export async function fetchLiveOrder(
  query: string,
  localOrders: Order[] = []
): Promise<{ order: Order; docId: string } | null> {
  const clean = query.trim();
  if (!clean) return null;

  const localMatch = localOrders.find((o) => {
    const num = (o.orderNumber || '').toLowerCase();
    const id = (o.id || '').toLowerCase();
    const trk = (o.trackingNumber || '').toLowerCase();
    const phone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
    const cleanLower = clean.toLowerCase();
    const digitsOnly = clean.replace(/[^0-9]/g, '');
    return (
      num === cleanLower ||
      num.includes(cleanLower) ||
      id === cleanLower ||
      (trk && (trk === cleanLower || trk.includes(cleanLower))) ||
      (digitsOnly.length >= 6 && phone.includes(digitsOnly))
    );
  });

  const candidateIds = new Set<string>();
  if (localMatch) {
    if (localMatch.orderNumber) candidateIds.add(localMatch.orderNumber);
    if (localMatch.id) candidateIds.add(localMatch.id);
  }
  candidateIds.add(clean);
  candidateIds.add(clean.toUpperCase());

  for (const docId of candidateIds) {
    try {
      const snap = await getDoc(doc(db, 'orders', docId));
      if (snap.exists()) {
        const order = normalizeOrderDocument(snap.id, snap.data());
        return { order, docId: snap.id };
      }
    } catch {
      // Continue to next candidate
    }
  }

  if (localMatch) {
    return { order: localMatch, docId: localMatch.orderNumber || localMatch.id };
  }

  return null;
}

/**
 * Public Order Tracking: Attaches a live snapshot listener to an order document
 * so customer view updates in real time whenever the admin modifies the status in the Manager Panel.
 */
export function subscribeLiveOrder(
  docId: string,
  onUpdate: (order: Order | null) => void,
  onError?: (err: Error) => void
): () => void {
  if (!docId) return () => {};

  const orderRef = doc(db, 'orders', docId);
  return onSnapshot(
    orderRef,
    (snap) => {
      if (snap.exists()) {
        const order = normalizeOrderDocument(snap.id, snap.data());
        onUpdate(order);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('[Firestore] Live order tracking listener notice:', error);
      if (onError) onError(error);
    }
  );
}
