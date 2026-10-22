import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Product, Currency, StoreSettings } from '../types';
import { Language } from '../data/i18n';
import { generateProductWhatsAppUrl, cleanWhatsAppNumber } from '../utils/whatsapp';

interface FloatingWhatsAppWidgetProps {
  currentlyViewedProduct: Product | null;
  currency: Currency;
  currentLanguage: Language;
  storeSettings?: StoreSettings;
  onOpenCustomWhatsAppModal?: (product: Product) => void;
}

export const FloatingWhatsAppWidget: React.FC<FloatingWhatsAppWidgetProps> = ({
  currentlyViewedProduct,
  currency,
  currentLanguage,
  storeSettings,
  onOpenCustomWhatsAppModal,
}) => {
  const isArabic = currentLanguage === 'ar';
  const whatsappNumber = cleanWhatsAppNumber(storeSettings?.whatsappNumber);

  const productUrl = currentlyViewedProduct
    ? generateProductWhatsAppUrl(currentlyViewedProduct, storeSettings, {
        language: currentLanguage,
        currency,
        intent: 'order',
      })
    : `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        isArabic 
          ? 'السلام عليكم ورشة DBC، أود الاستفسار عن كوليكشن الملابس والتوصيل.' 
          : currentLanguage === 'en'
          ? 'Hello DBC Workshop, I would like to inquire about your apparel collection and express delivery across Algeria.'
          : currentLanguage === 'es'
          ? 'Hola DBC Workshop, deseo consultar sobre sus prendas y envíos en Argelia.'
          : 'Bonjour DBC Workshop, je souhaite des informations sur votre collection et la confection.'
      )}`;

  const handleClick = () => {
    if (currentlyViewedProduct && onOpenCustomWhatsAppModal) {
      onOpenCustomWhatsAppModal(currentlyViewedProduct);
    } else {
      window.open(productUrl, '_blank');
    }
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none">
      <div className="relative group">
        <button
          onClick={handleClick}
          id="floating-whatsapp-trigger-btn"
          className="flex items-center gap-2.5 px-4 py-3 bg-[#111111] hover:bg-black text-white border border-white/20 shadow-xl transition-all duration-200 cursor-pointer active:scale-95"
          title={
            currentlyViewedProduct 
              ? `Commander ${currentlyViewedProduct.name} sur WhatsApp` 
              : 'Service Client WhatsApp'
          }
        >
          <MessageCircle className="w-4 h-4 text-white shrink-0" />
          <span className="font-sans text-xs tracking-wider uppercase font-semibold hidden sm:inline">
            {currentlyViewedProduct
              ? (isArabic ? 'طلب المنتج عبر واتساب' : 'Commander via WhatsApp')
              : (isArabic ? 'تواصل واتساب' : 'WhatsApp Atelier')}
          </span>
        </button>
      </div>
    </div>
  );
};
