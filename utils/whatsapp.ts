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
 * '+213 550 45 88 12' -> '213550458812'
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
  const isArabic = language === 'ar';
  const storeName = storeSettings?.storeName || 'DBC Workshop Algérie';

  let message = isArabic
    ? `السلام عليكم ورشة ${storeName} 👋\nأود الاستفسار عن منتجاتكم وخدمة التوصيل لكافة الولايات.`
    : `Bonjour l'équipe ${storeName} 👋\nJe souhaite obtenir des informations sur vos confections textiles et les délais de livraison en Algérie.`;

  if (topic) {
    message += isArabic ? `\nالموضوع: ${topic}` : `\nSujet : ${topic}`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
