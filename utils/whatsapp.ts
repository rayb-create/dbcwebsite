import { Product, Currency, StoreSettings } from '../types';
import { Language } from '../data/i18n';
import { formatPrice } from './format';

export type WhatsAppGreetingIntent = 'order' | 'wholesale' | 'inquiry' | 'custom';

export interface WhatsAppGreetingOptions {
  selectedColor?: string;
  selectedSize?: string;
  quantity?: number;
  intent?: WhatsAppGreetingIntent;
  wilayaName?: string;
  wilayaCode?: string;
  customNote?: string;
  currency?: Currency;
  language?: Language;
  isMadeToMeasure?: boolean;
}

/**
 * Normalizes an Algerian or international phone number for wa.me links
 * e.g., '0550 45 88 12' -> '213550458812'
 */
export function cleanWhatsAppNumber(phone?: string): string {
  if (!phone) return '213550458812';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('00213')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = '213' + cleaned.slice(1);
  }
  return cleaned || '213550458812';
}

/**
 * Generates an automated, contextual WhatsApp greeting message populated with the currently viewed product details
 */
export function generateProductWhatsAppMessage(
  product: Product,
  storeSettings?: StoreSettings,
  options: WhatsAppGreetingOptions = {}
): string {
  const isArabic = options.language === 'ar';
  const language = options.language || 'fr';
  const currency = options.currency || 'DZD';
  const storeName = storeSettings?.storeName || 'DBC Workshop Algérie';
  const color = options.selectedColor || product.colors[0]?.name || 'Standard';
  const size = options.isMadeToMeasure ? 'Sur-Mesure (M2M)' : (options.selectedSize || product.sizes[0] || 'L');
  const qty = options.quantity && options.quantity > 0 ? options.quantity : 1;
  const intent = options.intent || 'order';
  const wilayaInfo = options.wilayaName ? (options.wilayaCode ? `${options.wilayaCode} - ${options.wilayaName}` : options.wilayaName) : '';

  const unitPriceFormatted = formatPrice(product.price, currency, isArabic);
  const wholesalePriceFormatted = product.wholesalePriceDzd 
    ? formatPrice(product.wholesalePriceDzd, currency, isArabic)
    : formatPrice(Math.round(product.price * 0.7), currency, isArabic);

  // ARABIC TEMPLATE
  if (isArabic) {
    if (intent === 'wholesale') {
      let msg = `السلام عليكم ورشة ${storeName} 👋\n\n`;
      msg += `أنا تاجر / مهتم بالطلب بـ *سعر الجملة (B2B)* للموديل التالي:\n`;
      msg += `📦 *${product.name}*\n`;
      msg += `• الموديل / الرمز: DBC-${product.id}\n`;
      msg += `• سعر الجملة المتوقع: ${wholesalePriceFormatted} للقطعة\n`;
      msg += `• الكمية المقترحة: ${qty >= 6 ? qty : '6+ قطع'}\n`;
      msg += `• اللون المفضل: ${color}\n`;
      msg += `• القماش: ${product.fabric} (${product.fabricWeight || 'Molleton lourd'})\n`;
      if (wilayaInfo) {
        msg += `• ولاية المتجر / الاستلام: ${wilayaInfo}\n`;
      }
      if (options.customNote) {
        msg += `• ملاحظة خاصة: ${options.customNote}\n`;
      }
      msg += `\nيرجى تزويدي بالكتالوج التجاري وشروط الدفع والتسليم عبر 69 ولاية. شكراً لكم!`;
      return msg;
    }

    if (intent === 'inquiry') {
      let msg = `السلام عليكم ورشة ${storeName} 👋\n\n`;
      msg += `لدي استفسار بخصوص المنتج المعروض:\n`;
      msg += `🔍 *${product.name}*\n`;
      msg += `• اللون المطلوب: ${color}\n`;
      msg += `• المقاس: ${size}\n`;
      msg += `• السعر: ${unitPriceFormatted}\n`;
      if (wilayaInfo) {
        msg += `• التوصيل إلى: ${wilayaInfo}\n`;
      }
      if (options.customNote) {
        msg += `• سؤالي: ${options.customNote}\n`;
      } else {
        msg += `• سؤالي: هل هذا المقاس واللون متوفران حالياً في الورشة للشحن الفوري؟\n`;
      }
      msg += `\nفي انتظار ردكم الكريم.`;
      return msg;
    }

    if (intent === 'custom') {
      let msg = `السلام عليكم ورشة ${storeName} 👋\n\n`;
      msg += `أود الاستفسار عن تفصيل خاص / تطريز مخصص على هذا الموديل:\n`;
      msg += `✂️ *${product.name}*\n`;
      msg += `• اللون: ${color}\n`;
      msg += `• المقاس: ${size}\n`;
      msg += `• القماش: ${product.fabric}\n`;
      if (options.customNote) {
        msg += `• تفاصيل التخصيص: ${options.customNote}\n`;
      }
      msg += `\nهل يمكن تنفيذ ذلك وما هي مدة الإنجاز في الورشة؟ شكراً!`;
      return msg;
    }

    // Default: 'order'
    let msg = `السلام عليكم ورشة ${storeName} 👋\n\n`;
    msg += `أود تأكيد طلب المنتج التالي المعروض في متجركم:\n`;
    msg += `🛍️ *${product.name}*\n`;
    msg += `• المقاس: ${size}\n`;
    msg += `• اللون: ${color}\n`;
    msg += `• الكمية: ${qty} قطعة\n`;
    msg += `• السعر الإفرادي: ${unitPriceFormatted}\n`;
    msg += `• القماش والوزن: ${product.fabric} (${product.fabricWeight || 'ثقيل ممتاز'})\n`;
    if (wilayaInfo) {
      msg += `• ولاية التوصيل: ${wilayaInfo} (توصيل للمنزل أو StopDesk)\n`;
    }
    if (options.customNote) {
      msg += `• ملاحظة إضافية: ${options.customNote}\n`;
    }
    msg += `\nيرجى إعلامي بكيفية تأكيد الطلبية وخيارات الدفع المتاحة (عند الاستلام أو بريدي موب). شكراً لكم!`;
    return msg;
  }

  // ENGLISH TEMPLATE
  if (language === 'en') {
    if (intent === 'wholesale') {
      let msg = `Hello ${storeName} team 👋\n\n`;
      msg += `I am contacting you for a *WHOLESALE / B2B* order for this garment:\n`;
      msg += `🏢 *${product.name}*\n`;
      msg += `• Ref: DBC-${product.id.toUpperCase()}\n`;
      msg += `• Wholesale rate: ${wholesalePriceFormatted} / piece\n`;
      msg += `• Desired quantity: ${qty >= 6 ? `${qty} pieces` : 'From 6 pieces pack'}\n`;
      msg += `• Color(s): ${color}\n`;
      msg += `• Fabric: ${product.fabricWeight || 'Heavyweight'} - ${product.fabric}\n`;
      if (wilayaInfo) {
        msg += `• Delivery Wilaya: ${wilayaInfo}\n`;
      }
      if (options.customNote) {
        msg += `• Notes: ${options.customNote}\n`;
      }
      msg += `\nPlease confirm atelier stock availability and shipping terms. Thank you!`;
      return msg;
    }

    if (intent === 'inquiry') {
      let msg = `Hello ${storeName} 👋\n\n`;
      msg += `I have an inquiry regarding this product:\n`;
      msg += `🔍 *${product.name}*\n`;
      msg += `• Color: ${color}\n`;
      msg += `• Size: ${size}\n`;
      msg += `• Unit price: ${unitPriceFormatted}\n`;
      if (wilayaInfo) {
        msg += `• Delivery to: ${wilayaInfo}\n`;
      }
      if (options.customNote) {
        msg += `• Question: ${options.customNote}\n`;
      } else {
        msg += `• Could you confirm if this size and color are currently in stock for fast dispatch?\n`;
      }
      msg += `\nThank you!`;
      return msg;
    }

    if (intent === 'custom') {
      let msg = `Hello ${storeName} 👋\n\n`;
      msg += `I would like information regarding bespoke tailoring / embroidery on this style:\n`;
      msg += `✂️ *${product.name}*\n`;
      msg += `• Desired size: ${size}\n`;
      msg += `• Color: ${color}\n`;
      msg += `• Fabric: ${product.fabric}\n`;
      if (options.customNote) {
        msg += `• Custom details: ${options.customNote}\n`;
      }
      msg += `\nWhat are your atelier lead times and rates for this? Thank you!`;
      return msg;
    }

    // Default English Order
    let msg = `Hello ${storeName} 👋\n\n`;
    msg += `I would like to order the following garment:\n`;
    msg += `🛍️ *${product.name}*\n`;
    msg += `• Size: ${size}\n`;
    msg += `• Color: ${color}\n`;
    msg += `• Quantity: ${qty}\n`;
    msg += `• Price: ${unitPriceFormatted}\n`;
    msg += `• Fabric: ${product.fabric} (${product.fabricWeight || 'Heavyweight'})\n`;
    if (wilayaInfo) {
      msg += `• Delivery Wilaya: ${wilayaInfo} (Home or StopDesk)\n`;
    }
    if (options.customNote) {
      msg += `• Note: ${options.customNote}\n`;
    }
    msg += `\nPlease let me know how to confirm shipping and payment (Cash on delivery or BaridiMob). 🇩🇿`;
    return msg;
  }

  // SPANISH TEMPLATE
  if (language === 'es') {
    if (intent === 'wholesale') {
      let msg = `Hola equipo de ${storeName} 👋\n\n`;
      msg += `Me pongo en contacto para una compra al por *MAYOR / B2B* de este modelo:\n`;
      msg += `🏢 *${product.name}*\n`;
      msg += `• Referencia: DBC-${product.id.toUpperCase()}\n`;
      msg += `• Precio mayorista: ${wholesalePriceFormatted} / pieza\n`;
      msg += `• Cantidad: ${qty >= 6 ? `${qty} piezas` : 'A partir de 6 piezas'}\n`;
      msg += `• Color(es): ${color}\n`;
      msg += `• Tejido: ${product.fabricWeight || 'Heavyweight'} - ${product.fabric}\n`;
      if (wilayaInfo) {
        msg += `• Wilaya de entrega: ${wilayaInfo}\n`;
      }
      if (options.customNote) {
        msg += `• Detalles: ${options.customNote}\n`;
      }
      msg += `\n¿Podrían confirmarme la disponibilidad en taller y el envío? ¡Gracias!`;
      return msg;
    }

    if (intent === 'inquiry') {
      let msg = `Hola ${storeName} 👋\n\n`;
      msg += `Tengo una consulta sobre este artículo:\n`;
      msg += `🔍 *${product.name}*\n`;
      msg += `• Color: ${color}\n`;
      msg += `• Talla: ${size}\n`;
      msg += `• Precio: ${unitPriceFormatted}\n`;
      if (wilayaInfo) {
        msg += `• Wilaya de entrega: ${wilayaInfo}\n`;
      }
      if (options.customNote) {
        msg += `• Pregunta: ${options.customNote}\n`;
      } else {
        msg += `• ¿Podrían confirmarme si este artículo está disponible para envío rápido?\n`;
      }
      msg += `\n¡Gracias!`;
      return msg;
    }

    if (intent === 'custom') {
      let msg = `Hola ${storeName} 👋\n\n`;
      msg += `Deseo consultar sobre confección a medida o bordado personalizado en este modelo:\n`;
      msg += `✂️ *${product.name}*\n`;
      msg += `• Talla: ${size}\n`;
      msg += `• Color: ${color}\n`;
      msg += `• Tejido: ${product.fabric}\n`;
      if (options.customNote) {
        msg += `• Especificaciones: ${options.customNote}\n`;
      }
      msg += `\n¿Cuáles son los plazos y tarifas del taller? ¡Muchas gracias!`;
      return msg;
    }

    // Default Spanish Order
    let msg = `Hola ${storeName} 👋\n\n`;
    msg += `Deseo realizar un pedido para el siguiente producto:\n`;
    msg += `🛍️ *${product.name}*\n`;
    msg += `• Talla: ${size}\n`;
    msg += `• Color: ${color}\n`;
    msg += `• Cantidad: ${qty}\n`;
    msg += `• Precio: ${unitPriceFormatted}\n`;
    msg += `• Tejido: ${product.fabric} (${product.fabricWeight || 'Heavyweight'})\n`;
    if (wilayaInfo) {
      msg += `• Envío a: ${wilayaInfo} (Domicilio o StopDesk)\n`;
    }
    if (options.customNote) {
      msg += `• Nota: ${options.customNote}\n`;
    }
    msg += `\nPor favor indiquen los pasos para confirmar el envío y pago (Contra entrega o BaridiMob). 🇩🇿`;
    return msg;
  }

  // FRENCH / STANDARD TEMPLATE
  if (intent === 'wholesale') {
    let msg = `Bonjour l'équipe ${storeName} 👋\n\n`;
    msg += `Je vous contacte pour un achat en *GROS / B2B* pour le modèle suivant :\n`;
    msg += `🏢 *${product.name}*\n`;
    msg += `• Référence : DBC-${product.id.toUpperCase()}\n`;
    msg += `• Tarif estimé de gros : ${wholesalePriceFormatted} / pièce\n`;
    msg += `• Quantité souhaitée : ${qty >= 6 ? `${qty} pièces` : 'À partir de 6 pièces (lot)'}\n`;
    msg += `• Couleur(s) : ${color}\n`;
    msg += `• Grammage & Confection : ${product.fabricWeight || 'Heavyweight'} - ${product.fabric}\n`;
    if (wilayaInfo) {
      msg += `• Ville / Wilaya : ${wilayaInfo}\n`;
    }
    if (options.customNote) {
      msg += `• Précisions : ${options.customNote}\n`;
    }
    msg += `\nPouvez-vous me confirmer la disponibilité du stock atelier et les modalités d'expédition professionnelle ? Merci !`;
    return msg;
  }

  if (intent === 'inquiry') {
    let msg = `Bonjour ${storeName} 👋\n\n`;
    msg += `J'ai une question concernant l'article que je consulte actuellement :\n`;
    msg += `🔍 *${product.name}*\n`;
    msg += `• Couleur : ${color}\n`;
    msg += `• Taille : ${size}\n`;
    msg += `• Prix unitaire : ${unitPriceFormatted}\n`;
    if (wilayaInfo) {
      msg += `• Wilaya de livraison envisagée : ${wilayaInfo}\n`;
    }
    if (options.customNote) {
      msg += `• Ma question : ${options.customNote}\n`;
    } else {
      msg += `• Pouvez-vous me confirmer si ce modèle est en stock pour une expédition rapide ?\n`;
    }
    msg += `\nMerci pour votre assistance !`;
    return msg;
  }

  if (intent === 'custom') {
    let msg = `Bonjour ${storeName} 👋\n\n`;
    msg += `Je souhaite des informations pour une confection sur-mesure / personnalisation (broderie/marquage) sur ce modèle :\n`;
    msg += `✂️ *${product.name}*\n`;
    msg += `• Taille souhaitée : ${size}\n`;
    msg += `• Couleur de base : ${color}\n`;
    msg += `• Matière : ${product.fabric}\n`;
    if (options.customNote) {
      msg += `• Détails du projet / logo : ${options.customNote}\n`;
    }
    msg += `\nQuels sont vos délais en atelier et vos tarifs pour cette réalisation ? Merci !`;
    return msg;
  }

  // Default: Direct Order ('order')
  let msg = `Bonjour ${storeName} 👋\n\n`;
  msg += `Je souhaite passer commande pour le produit suivant :\n`;
  msg += `🛍️ *${product.name}*\n`;
  msg += `• Taille : ${size}\n`;
  msg += `• Couleur : ${color}\n`;
  msg += `• Quantité : ${qty}\n`;
  msg += `• Prix : ${unitPriceFormatted}\n`;
  msg += `• Matière : ${product.fabric} (${product.fabricWeight || 'Heavyweight'})\n`;
  if (wilayaInfo) {
    msg += `• Livraison vers : ${wilayaInfo} (Domicile ou StopDesk)\n`;
  }
  if (options.customNote) {
    msg += `• Note : ${options.customNote}\n`;
  }
  msg += `\nMerci de me donner la marche à suivre pour confirmer l'expédition et le paiement (Cash à la livraison ou BaridiMob). 🇩🇿`;
  return msg;
}

/**
 * Returns the fully qualified, clickable WhatsApp URL (wa.me)
 */
export function generateProductWhatsAppUrl(
  product: Product,
  storeSettings?: StoreSettings,
  options: WhatsAppGreetingOptions = {}
): string {
  const cleanNumber = cleanWhatsAppNumber(storeSettings?.whatsappNumber);
  const message = generateProductWhatsAppMessage(product, storeSettings, options);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a general WhatsApp link for non-product queries
 */
export function generateGeneralWhatsAppUrl(
  storeSettings?: StoreSettings,
  language: Language = 'fr',
  topic?: string
): string {
  const cleanNumber = cleanWhatsAppNumber(storeSettings?.whatsappNumber);
  const storeName = storeSettings?.storeName || 'DBC Workshop Algérie';

  let message = '';
  if (language === 'ar') {
    message = `السلام عليكم ورشة ${storeName} 👋\nأود الاستفسار عن منتجاتكم وخدمة التوصيل لكافة الولايات.`;
  } else if (language === 'en') {
    message = `Hello ${storeName} team 👋\nI would like information about your apparel collection and express delivery across Algeria.`;
  } else if (language === 'es') {
    message = `Hola equipo de ${storeName} 👋\nDeseo consultar sobre su colección de ropa y los envíos exprés en Argelia.`;
  } else {
    message = `Bonjour l'équipe ${storeName} 👋\nJe souhaite obtenir des informations sur vos confections textiles et les délais de livraison en Algérie.`;
  }

  if (topic) {
    if (language === 'ar') message += `\nالموضوع: ${topic}`;
    else if (language === 'en') message += `\nSubject: ${topic}`;
    else if (language === 'es') message += `\nTema: ${topic}`;
    else message += `\nSujet : ${topic}`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
