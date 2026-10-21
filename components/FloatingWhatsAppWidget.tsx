import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Product, Currency, StoreSettings } from '../types';
import { Language } from '../data/i18n';
import { generateProductWhatsAppUrl, cleanWhatsAppNumber } from '../utils/whatsapp';
import { formatPrice } from '../utils/format';

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

  // If viewing a product, generate product-specific template URL
  const productUrl = currentlyViewedProduct
    ? generateProductWhatsAppUrl(currentlyViewedProduct, storeSettings, {
        language: currentLanguage,
        currency,
        intent: 'order',
      })
    : `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        isArabic 
          ? 'السلام عليكم ورشة DBC، أود الاستفسار عن التوصيل والمنتجات.' 
          : currentLanguage === 'en'
          ? 'Hello DBC Workshop, I would like to inquire about your apparel collection and express delivery across Algeria.'
          : currentLanguage === 'es'
          ? 'Hola DBC Workshop, deseo consultar sobre sus prendas y envíos en Argelia.'
          : 'Bonjour DBC Workshop, je souhaite des informations sur vos confections.'
      )}`;

  const handleClick = () => {
    if (currentlyViewedProduct && onOpenCustomWhatsAppModal) {
      onOpenCustomWhatsAppModal(currentlyViewedProduct);
    } else {
      window.open(productUrl, '_blank');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none">
      {/* Main Floating Action Button */}
      <div className="relative group">
        <button
          onClick={handleClick}
          id="floating-whatsapp-trigger-btn"
          className="flex items-center gap-2.5 px-4 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 group-hover:shadow-[0_0_20px_rgba(37,211,102,0.45)]"
          title={
            currentlyViewedProduct 
              ? `Commander ${currentlyViewedProduct.name} sur WhatsApp` 
              : 'Service Client WhatsApp'
          }
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="font-mono text-xs font-bold tracking-wide hidden sm:inline">
            {currentlyViewedProduct 
              ? (isArabic ? 'طلب هذا المنتج عبر واتساب' : 'Commander ce produit') 
              : (isArabic ? 'تواصل عبر واتساب' : 'WhatsApp Atelier')}
          </span>
        </button>
      </div>
    </div>
  );
};
