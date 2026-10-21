import { Order, CartItem, StoreSettings, DeliveryCompany } from '../types';
import { PRODUCTS } from '../data/products';
import { ALGERIAN_WILAYAS, Wilaya, getWilayaByCode } from '../data/wilayas';

export interface TrackingCheckpoint {
  id: string;
  stage: 'confirmed' | 'atelier' | 'shipped' | 'transit' | 'out_for_delivery' | 'delivered';
  titleFr: string;
  titleAr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionAr: string;
  descriptionEn: string;
  locationFr: string;
  locationAr: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

// Orders list initialized empty - real orders will be created upon customer purchase
export const DEMO_ORDERS: Order[] = [];

/**
 * Searches for an order matching an order ID, tracking number, or phone number.
 */
export function findOrderByQuery(query: string, localOrders: Order[] = []): Order | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  // Filter digits only for phone matching
  const digitsOnly = clean.replace(/[^0-9]/g, '');

  const allOrders = [...localOrders, ...DEMO_ORDERS];

  // 1. Exact or partial orderNumber match (e.g. DBC-2026-8492 or 8492)
  const byOrderNum = allOrders.find((o) => {
    const num = o.orderNumber.toLowerCase();
    const id = o.id.toLowerCase();
    return num === clean || num.includes(clean) || id === clean || id.includes(clean);
  });
  if (byOrderNum) return byOrderNum;

  // 2. Tracking number match (e.g. DZ-YAL-8492011 or 8492011)
  const byTracking = allOrders.find((o) => {
    const trk = (o.trackingNumber || '').toLowerCase();
    return trk === clean || (clean.length >= 4 && trk.includes(clean));
  });
  if (byTracking) return byTracking;

  // 3. Phone number match
  if (digitsOnly.length >= 6) {
    const byPhone = allOrders.find((o) => {
      const phoneDigits = (o.customer?.phone || '').replace(/[^0-9]/g, '');
      return phoneDigits.includes(digitsOnly);
    });
    if (byPhone) return byPhone;
  }

  // 4. Customer Name match
  if (clean.length >= 3) {
    const byName = allOrders.find((o) => {
      const name = (o.customer?.fullName || '').toLowerCase();
      return name.includes(clean);
    });
    if (byName) return byName;
  }

  return null;
}

/**
 * Generates dynamic, realistic tracking checkpoints according to the order's status and destination wilaya.
 */
export function generateTrackingCheckpoints(order: Order, storeSettings?: StoreSettings): TrackingCheckpoint[] {
  const wilayaCode = order.customer?.wilayaCode || '16';
  const wilaya = getWilayaByCode(wilayaCode) || ALGERIAN_WILAYAS[15]; // Alger default
  const isAlger = wilayaCode === '16';
  const wilayaLabelFr = `${wilaya.code} - ${wilaya.nameEn}`;
  const wilayaLabelAr = `${wilaya.code} - ${wilaya.nameAr}`;

  const carrierName = order.carrierName || storeSettings?.deliveryCompanies?.find(c => c.id === storeSettings?.activeDeliveryCompany)?.name || 'Yalidine Express';

  const status = order.status;

  // Status index mapping
  let currentStageIdx = 0;
  if (status === 'Reçu / Confirmed') {
    currentStageIdx = 0;
  } else if (status === 'En Préparation / Atelier') {
    currentStageIdx = 1;
  } else if (status === 'Expédié / En Livraison') {
    currentStageIdx = 3; // In transit inter-wilaya
  } else if (status === 'Livré / Completed') {
    currentStageIdx = 4; // Completed
  }

  const checkpoints: TrackingCheckpoint[] = [
    {
      id: 'cp-1',
      stage: 'confirmed',
      titleFr: 'Commande Validée & Enregistrée',
      titleAr: 'تم تأكيد الطلب وتسجيله بالورشة',
      titleEn: 'Order Confirmed & Logged',
      descriptionFr: 'Votre commande a été vérifiée par l’équipe de l’Atelier DBC (Alger). Paiement validé.',
      descriptionAr: 'تم التحقق من تفاصيل المقاس واللون من طرف فريق ورشة DBC (الجزائر العاصمة).',
      descriptionEn: 'Order details and sizing reviewed by DBC Workshop team (Algiers).',
      locationFr: 'Atelier DBC Dély Ibrahim (Alger)',
      locationAr: 'ورشة DBC دالي إبراهيم (الجزائر)',
      timestamp: `${order.date} • 09:30`,
      isCompleted: currentStageIdx >= 0,
      isCurrent: currentStageIdx === 0,
    },
    {
      id: 'cp-2',
      stage: 'atelier',
      titleFr: 'Confection & Contrôle Qualité',
      titleAr: 'مرحلة التجهيز ومراقبة جودة القماش',
      titleEn: 'Crafting & Textile Inspection',
      descriptionFr: 'Vérification du grammage coton, finitions des coutures renforcées et mise sous sachet étanche DBC.',
      descriptionAr: 'معاينة كثافة القطن، متانة الخياطة، والتعليب المحكم لحماية القطع أثناء الشحن.',
      descriptionEn: 'Fleece weight verified, seams reinforced, and sealed in waterproof packaging.',
      locationFr: 'Pôle Confection DBC (Alger)',
      locationAr: 'مركز التفصيل والتعبئة (الجزائر)',
      timestamp: `${order.date} • 14:15`,
      isCompleted: currentStageIdx >= 1,
      isCurrent: currentStageIdx === 1,
    },
    {
      id: 'cp-3',
      stage: 'shipped',
      titleFr: `Prise en Charge par ${carrierName}`,
      titleAr: `تسليم الشحنة لـ ${carrierName}`,
      titleEn: `Handed Over to ${carrierName}`,
      descriptionFr: `Colis étiqueté avec N° de suivi (${order.trackingNumber}) et scanné au Hub Logistique de ${carrierName}.`,
      descriptionAr: `تم ترقيم الطرد بكود التتبع (${order.trackingNumber}) وفحصه في المركز اللوجستي لشركة ${carrierName}.`,
      descriptionEn: `Labeled with tracking number (${order.trackingNumber}) at ${carrierName} distribution hub.`,
      locationFr: 'Hub Logistique Oued Smar (Alger)',
      locationAr: 'المركز اللوجستي واد السمار (الجزائر)',
      timestamp: `${order.date} • 18:40`,
      isCompleted: currentStageIdx >= 2,
      isCurrent: currentStageIdx === 2,
    },
    {
      id: 'cp-4',
      stage: 'transit',
      titleFr: isAlger ? 'Dispatch Centre Alger' : `Acheminement Inter-Wilayas vers ${wilaya.nameEn}`,
      titleAr: isAlger ? 'توجيه الشحنة إلى مركز التوزيع بالعاصمة' : `النقل بين الولايات نحو ولاية ${wilaya.nameAr}`,
      titleEn: isAlger ? 'Dispatched to Algiers Distribution Center' : `Inter-Wilaya Transit to ${wilaya.nameEn}`,
      descriptionFr: isAlger
        ? `Colis transféré au réseau local ${carrierName} pour remise au livreur de quartier.`
        : `Colis en transit sécurisé depuis Alger vers le Hub Régional de ${wilayaLabelFr} (Zone ${wilaya.zone.toUpperCase()}).`,
      descriptionAr: isAlger
        ? 'تم نقل الطرد لمركز التوزيع المحلي لتسليمه لسائق الحي.'
        : `الطرد في مسار النقل البري السريع نحو المركز الإقليمي لولاية ${wilayaLabelAr}.`,
      descriptionEn: isAlger
        ? 'Parcel transferred to local delivery depot in Algiers.'
        : `Overnight highway transit from Algiers to regional distribution center in ${wilaya.nameEn}.`,
      locationFr: isAlger ? 'Centre Distribution Alger' : `En Route vers Hub ${wilaya.nameEn}`,
      locationAr: isAlger ? 'مركز توزيع الجزائر' : `في الطريق إلى مركز ${wilaya.nameAr}`,
      timestamp: 'Transit en cours',
      isCompleted: currentStageIdx >= 3,
      isCurrent: currentStageIdx === 3,
    },
    {
      id: 'cp-5',
      stage: 'out_for_delivery',
      titleFr: order.deliveryType === 'home' ? 'En Cours de Livraison Finale' : `Arrivé au Point Relais / Bureau ${carrierName}`,
      titleAr: order.deliveryType === 'home' ? 'مع الموزع للتسليم في العنوان' : `جاهز للاستلام من مكتب ${carrierName}`,
      titleEn: order.deliveryType === 'home' ? 'Out for Final Delivery' : `Ready for Pickup at ${carrierName}`,
      descriptionFr: order.deliveryType === 'home'
        ? `Le livreur est en tournée vers votre adresse à ${order.customer.city || wilaya.nameEn}. Il vous contactera au ${order.customer.phone}.`
        : `Votre colis est disponible au bureau StopDesk de ${order.customer.city || wilaya.nameEn}. Munissez-vous d'une pièce d'identité.`,
      descriptionAr: order.deliveryType === 'home'
        ? `سائق التوصيل في طريقه إلى عنوانكم في ${order.customer.city || wilaya.nameAr}. سيتصل بكم على الرقم ${order.customer.phone}.`
        : `طردكم متاح الآن للاستلام من مكتب StopDesk بـ ${order.customer.city || wilaya.nameAr}. يرجى إحضار بطاقة الهوية.`,
      descriptionEn: order.deliveryType === 'home'
        ? `Driver is on route to your address in ${order.customer.city || wilaya.nameEn}. Expect a phone call shortly.`
        : `Your parcel is awaiting pickup at the StopDesk branch in ${order.customer.city || wilaya.nameEn}.`,
      locationFr: `${order.customer.city || wilaya.nameEn} (${wilaya.code})`,
      locationAr: `${order.customer.city || wilaya.nameAr} (${wilaya.code})`,
      timestamp: order.estimatedDelivery,
      isCompleted: currentStageIdx >= 4,
      isCurrent: currentStageIdx === 3 && status === 'Expédié / En Livraison',
    },
    {
      id: 'cp-6',
      stage: 'delivered',
      titleFr: 'Colis Livré & Encaissé',
      titleAr: 'تم التسليم واستلام المبلغ بنجاح',
      titleEn: 'Delivered & Completed',
      descriptionFr: 'La commande a été remise avec succès au destinataire. Merci de votre confiance en DBC Workshop !',
      descriptionAr: 'تم تسليم الطرد للزبون واستلام ثمن الطلبية. شكراً لاختياركم ملابس ورشة DBC !',
      descriptionEn: 'Package successfully delivered and handed over to customer. Thank you for choosing DBC Workshop!',
      locationFr: `${order.customer.city || wilaya.nameEn}`,
      locationAr: `${order.customer.city || wilaya.nameAr}`,
      timestamp: currentStageIdx >= 4 ? order.date : 'En attente de livraison',
      isCompleted: currentStageIdx >= 4,
      isCurrent: currentStageIdx >= 4,
    },
  ];

  return checkpoints;
}

/**
 * Generates an external tracking URL for the delivery company if available.
 */
export function generateCarrierExternalTrackingUrl(order: Order, deliveryCompanies?: DeliveryCompany[]): string | null {
  if (order.carrierTrackingUrl) return order.carrierTrackingUrl;
  const tracking = order.trackingNumber;
  if (!tracking) return null;

  const carrier = deliveryCompanies?.find(
    (c) => c.name.toLowerCase() === (order.carrierName || '').toLowerCase() || c.id === order.carrierName
  );

  if (carrier && carrier.trackingUrlTemplate && carrier.trackingUrlTemplate.includes('{TRACKING}')) {
    return carrier.trackingUrlTemplate.replace('{TRACKING}', encodeURIComponent(tracking));
  }

  // Common fallbacks based on code prefix
  if (tracking.toUpperCase().includes('YAL')) {
    return `https://yalidine.com/suivi/?tracking=${encodeURIComponent(tracking)}`;
  }
  if (tracking.toUpperCase().startsWith('PRC')) {
    return `https://procolis.com/tracking/${encodeURIComponent(tracking)}`;
  }

  return null;
}

/**
 * Builds a direct WhatsApp message from Workshop Admin to Customer with updated tracking.
 */
export function generateAdminWhatsAppCustomerDispatch(order: Order, storeSettings: StoreSettings, isArabic = false): string {
  const digits = (order.customer?.phone || '').replace(/[^0-9]/g, '');
  const cleanPhone = digits.startsWith('0') ? `213${digits.slice(1)}` : (digits.startsWith('213') ? digits : `213${digits}`);
  const carrierName = order.carrierName || storeSettings?.deliveryCompanies?.find(c => c.id === storeSettings?.activeDeliveryCompany)?.name || 'Yalidine Express';
  const trackingUrl = generateCarrierExternalTrackingUrl(order, storeSettings?.deliveryCompanies);

  const msg = isArabic
    ? `مرحباً ${order.customer.fullName} 👋\nمعكم ورشة DBC للألبسة.\nتم تحديث حالة طلبيتك رقم *${order.orderNumber}*:\n• *الحالة:* ${order.status}\n• *شركة الشحن:* ${carrierName}\n• *كود التتبع:* ${order.trackingNumber}\n• *الموعد التقديري:* ${order.estimatedDelivery}\n${order.trackingNotes ? `• *ملاحظات التوصيل:* ${order.trackingNotes}\n` : ''}${trackingUrl ? `• *رابط التتبع:* ${trackingUrl}\n` : ''}\nشكراً لاختياركم ألبسة ورشة DBC Algérie! 🇩🇿`
    : `Bonjour ${order.customer.fullName} 👋\nIci l’Atelier de Confection DBC Algérie.\nVotre commande *${order.orderNumber}* a été mise à jour :\n• *Statut :* ${order.status}\n• *Transporteur :* ${carrierName}\n• *N° de Suivi :* ${order.trackingNumber}\n• *Délai estimé :* ${order.estimatedDelivery}\n${order.trackingNotes ? `• *Consignes :* ${order.trackingNotes}\n` : ''}${trackingUrl ? `• *Suivi direct :* ${trackingUrl}\n` : ''}\nMerci pour votre confiance en nos confections DBC ! 🇩🇿`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

/**
 * Builds a direct WhatsApp assistance link regarding an order's lookup and status.
 */
export function generateOrderWhatsAppInquiry(order: Order, whatsappNumber = '213550458812', isArabic = false): string {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const wilaya = getWilayaByCode(order.customer.wilayaCode) || ALGERIAN_WILAYAS[15];

  const msg = isArabic
    ? `مرحباً ورشة DBC 👋\nأود الاستفسار عن حالة طلبيتي:\n• *رقم الطلب:* ${order.orderNumber}\n• *كود التتبع:* ${order.trackingNumber}\n• *الزبون:* ${order.customer.fullName} (${order.customer.phone})\n• *الولاية:* ${wilaya.code} - ${wilaya.nameAr} (${order.customer.city})\n• *الحالة الحالية:* ${order.status}\n\nيرجى إفادتي بموعد وصول الموزع، وشكراً.`
    : `Bonjour DBC Workshop 👋\nJe souhaite avoir des informations sur le suivi de ma commande :\n• *N° Commande :* ${order.orderNumber}\n• *N° Suivi :* ${order.trackingNumber}\n• *Client :* ${order.customer.fullName} (${order.customer.phone})\n• *Wilaya :* ${wilaya.code} - ${wilaya.nameEn} (${order.customer.city})\n• *Statut :* ${order.status}\n\nMerci de me donner des précisions sur l'heure de livraison.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
