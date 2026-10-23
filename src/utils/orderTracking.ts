import { Order, StoreSettings, DeliveryCompany } from '../types';
import { ALGERIAN_WILAYAS, getWilayaByCode } from '../data/wilayas';
import { Language } from '../data/i18n';

export type TrackingStage = 'confirmed' | 'preparing' | 'shipped' | 'delivered';

export interface StageDefinition {
  stage: TrackingStage;
  step: number; // 1, 2, 3, 4
  labels: Record<Language, string>;
  shortMessages: Record<Language, string>;
}

export const TRACKING_STAGES: StageDefinition[] = [
  {
    stage: 'confirmed',
    step: 1,
    labels: {
      fr: 'Confirmée',
      en: 'Confirmed',
      ar: 'تم التأكيد',
      es: 'Confirmado',
    },
    shortMessages: {
      fr: 'Votre commande a été reçue et validée avec succès par notre atelier.',
      en: 'Your order has been received and confirmed by our atelier.',
      ar: 'تم استلام وتأكيد طلبيتكم بنجاح في ورشتنا.',
      es: 'Su pedido ha sido recibido y confirmado por nuestro taller.',
    },
  },
  {
    stage: 'preparing',
    step: 2,
    labels: {
      fr: 'En Préparation',
      en: 'Preparing',
      ar: 'قيد التجهيز',
      es: 'En Preparación',
    },
    shortMessages: {
      fr: 'Vos pièces sont en cours de confection soignée et contrôle qualité.',
      en: 'Your garments are being tailored, finished, and packaged.',
      ar: 'يجري حالياً تفصيل وتجهيز ومراقبة جودة ملابسكم بعناية.',
      es: 'Sus prendas están siendo confeccionadas y empaquetadas.',
    },
  },
  {
    stage: 'shipped',
    step: 3,
    labels: {
      fr: 'Expédiée',
      en: 'Shipped',
      ar: 'تم الشحن',
      es: 'Enviado',
    },
    shortMessages: {
      fr: 'Votre colis a été remis au transporteur et est en cours d’acheminement.',
      en: 'Your parcel has been handed over to the courier and is on its way.',
      ar: 'تم تسليم الشحنة لشركة التوصيل وهي في طريقها إليكم.',
      es: 'Su paquete ha sido entregado a la empresa de transporte y está en camino.',
    },
  },
  {
    stage: 'delivered',
    step: 4,
    labels: {
      fr: 'Livrée',
      en: 'Delivered',
      ar: 'تم التسليم',
      es: 'Entregado',
    },
    shortMessages: {
      fr: 'Votre commande a été livrée avec succès. Merci de votre confiance en RENASC.',
      en: 'Your order has been delivered successfully. Thank you for choosing RENASC.',
      ar: 'تم تسليم طلبيتكم بنجاح. شكراً لثقتكم في RENASC.',
      es: 'Su pedido ha sido entregado con éxito. Gracias por confiar en RENASC.',
    },
  },
];

/**
 * Normalizes any status string into the 4 official RENASC tracking stages.
 * Prioritizes 'shipped'/'en livraison' over 'delivered' to avoid false matches.
 */
export function getOrderStage(status?: string): StageDefinition {
  if (!status) return TRACKING_STAGES[0];
  const s = status.toLowerCase();
  if (s.includes('exp') || s.includes('shipp') || s.includes('transit') || s.includes('en livraison') || s.includes('out for delivery')) {
    return TRACKING_STAGES[2]; // Shipped (Step 3)
  }
  if (s.includes('livré') || s.includes('livre') || s.includes('complet') || s.includes('deliver') || s.includes('terminé')) {
    return TRACKING_STAGES[3]; // Delivered (Step 4)
  }
  if (s.includes('prép') || s.includes('prep') || s.includes('atelier') || s.includes('process')) {
    return TRACKING_STAGES[1]; // Preparing (Step 2)
  }
  return TRACKING_STAGES[0]; // Confirmed (Step 1)
}

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

export const DEMO_ORDERS: Order[] = [];

/**
 * Searches for an order matching an order ID, tracking number, or phone number in local memory.
 */
export function findOrderByQuery(query: string, localOrders: Order[] = []): Order | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  const digitsOnly = clean.replace(/[^0-9]/g, '');
  const allOrders = [...localOrders, ...DEMO_ORDERS];

  // 1. Exact or partial orderNumber match
  const byOrderNum = allOrders.find((o) => {
    const num = (o.orderNumber || '').toLowerCase();
    const id = (o.id || '').toLowerCase();
    return num === clean || num.includes(clean) || id === clean || id.includes(clean);
  });
  if (byOrderNum) return byOrderNum;

  // 2. Tracking number match
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
 * Generates dynamic checkpoints for compatibility.
 */
export function generateTrackingCheckpoints(order: Order, storeSettings?: StoreSettings): TrackingCheckpoint[] {
  const wilayaCode = order.customer?.wilayaCode || '16';
  const wilaya = getWilayaByCode(wilayaCode) || ALGERIAN_WILAYAS[15];
  const carrierName = order.carrierName || 'Yalidine Express';
  const stage = getOrderStage(order.status);
  const currentStageIdx = stage.step - 1;

  return [
    {
      id: 'cp-1',
      stage: 'confirmed',
      titleFr: 'Commande Confirmée',
      titleAr: 'تم تأكيد الطلب',
      titleEn: 'Order Confirmed',
      descriptionFr: 'Votre commande a été vérifiée et enregistrée à l’atelier RENASC.',
      descriptionAr: 'تم استلام وتأكيد تفاصيل الطلبية في ورشة RENASC.',
      descriptionEn: 'Order details reviewed and confirmed at RENASC atelier.',
      locationFr: 'Atelier RENASC (Alger)',
      locationAr: 'ورشة RENASC (الجزائر)',
      timestamp: `${order.date}`,
      isCompleted: currentStageIdx >= 0,
      isCurrent: currentStageIdx === 0,
    },
    {
      id: 'cp-2',
      stage: 'atelier',
      titleFr: 'En Préparation & Confection',
      titleAr: 'قيد التجهيز والخياطة',
      titleEn: 'Crafting & Packaging',
      descriptionFr: 'Finitions des coutures, repassage et mise sous emballage soigné.',
      descriptionAr: 'معاينة القماش، متانة الخياطة، والتغليف الأنيق.',
      descriptionEn: 'Garments crafted, inspected, and packaged with care.',
      locationFr: 'Atelier RENASC (Alger)',
      locationAr: 'ورشة RENASC (الجزائر)',
      timestamp: `${order.date}`,
      isCompleted: currentStageIdx >= 1,
      isCurrent: currentStageIdx === 1,
    },
    {
      id: 'cp-3',
      stage: 'shipped',
      titleFr: `Expédié via ${carrierName}`,
      titleAr: `تم الشحن عبر ${carrierName}`,
      titleEn: `Dispatched with ${carrierName}`,
      descriptionFr: `Colis étiqueté (${order.trackingNumber || 'En cours'}) et pris en charge par le transporteur.`,
      descriptionAr: `تم تسليم الطرد لشركة ${carrierName} برقم التتبع (${order.trackingNumber || 'قريباً'}).`,
      descriptionEn: `Parcel labeled (${order.trackingNumber || 'Pending'}) and handed to carrier.`,
      locationFr: `Hub Logistique ${carrierName}`,
      locationAr: `مركز التوزيع ${carrierName}`,
      timestamp: `${order.date}`,
      isCompleted: currentStageIdx >= 2,
      isCurrent: currentStageIdx === 2,
    },
    {
      id: 'cp-4',
      stage: 'delivered',
      titleFr: 'Colis Livré',
      titleAr: 'تم التسليم بنجاح',
      titleEn: 'Delivered',
      descriptionFr: 'Colis remis en main propre au destinataire. Merci de votre confiance en RENASC.',
      descriptionAr: 'تم تسليم الطرد بنجاح. شكراً لثقتكم في دار RENASC.',
      descriptionEn: 'Parcel successfully delivered. Thank you for choosing RENASC.',
      locationFr: `${order.customer?.city || wilaya.nameEn}`,
      locationAr: `${order.customer?.city || wilaya.nameAr}`,
      timestamp: order.date,
      isCompleted: currentStageIdx >= 3,
      isCurrent: currentStageIdx === 3,
    },
  ];
}

/**
 * Builds a direct WhatsApp inquiry link regarding order status.
 */
export function generateOrderWhatsAppInquiry(
  order: Order,
  whatsappNumber = '213550458812',
  language: Language = 'fr'
): string {
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '') || '213550458812';
  const stage = getOrderStage(order.status);
  const statusLabel = stage.labels[language] || order.status;

  const msg = language === 'ar'
    ? `مرحباً دار RENASC 👋\nأود الاستفسار عن حالة طلبيتي:\n• *رقم الطلب:* ${order.orderNumber}\n• *الزبون:* ${order.customer?.fullName} (${order.customer?.phone})\n• *الولاية:* ${order.customer?.wilayaCode} - ${order.customer?.wilayaName}\n• *الحالة:* ${statusLabel}\n\nشكراً لكم.`
    : `Bonjour RENASC 👋\nJe souhaite suivre l'état de ma commande :\n• *N° Commande :* ${order.orderNumber}\n• *Client :* ${order.customer?.fullName} (${order.customer?.phone})\n• *Wilaya :* ${order.customer?.wilayaCode} - ${order.customer?.wilayaName}\n• *Statut :* ${statusLabel}\n\nMerci de bien vouloir me renseigner.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
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
    ? `مرحباً ${order.customer?.fullName || 'العميل'} 👋\nمعكم دار RENASC للألبسة.\nتم تحديث حالة طلبيتك رقم *${order.orderNumber}*:\n• *الحالة:* ${order.status}\n• *شركة الشحن:* ${carrierName}\n• *كود التتبع:* ${order.trackingNumber}\n• *الموعد التقديري:* ${order.estimatedDelivery}\n${order.trackingNotes ? `• *ملاحظات:* ${order.trackingNotes}\n` : ''}${trackingUrl ? `• *رابط التتبع:* ${trackingUrl}\n` : ''}\nشكراً لاختياركم RENASC Algérie!`
    : `Bonjour ${order.customer?.fullName || 'Client'} 👋\nIci la Maison de Confection RENASC Algérie.\nVotre commande *${order.orderNumber}* a été mise à jour :\n• *Statut :* ${order.status}\n• *Transporteur :* ${carrierName}\n• *N° de Suivi :* ${order.trackingNumber}\n• *Délai estimé :* ${order.estimatedDelivery}\n${order.trackingNotes ? `• *Consignes :* ${order.trackingNotes}\n` : ''}${trackingUrl ? `• *Suivi direct :* ${trackingUrl}\n` : ''}\nMerci pour votre confiance en RENASC !`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
