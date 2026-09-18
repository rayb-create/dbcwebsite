import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, ShoppingBag, ExternalLink, ArrowRight } from 'lucide-react';
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
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);
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
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none">
      
      {/* Contextual Product Banner / Tooltip if viewing a product */}
      {!isTooltipDismissed && (
        <div 
          className="bg-[#1F1D1A] text-white p-2.5 sm:p-3 rounded-lg shadow-xl border border-[#C9A96E]/50 max-w-xs sm:max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-start gap-2.5"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {currentlyViewedProduct ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={currentlyViewedProduct.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'} 
                alt="" 
                className="w-10 h-12 object-cover rounded border border-[#C9A96E]/40 shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                  <span className="text-[10px] font-mono text-[#C9A96E] uppercase font-bold tracking-wider">
                    {isArabic ? 'طلب المنتج الحالي' : 'Produit en consultation'}
                  </span>
                </div>
                <h5 className="text-xs font-serif font-semibold text-white truncate mt-0.5">
                  {currentlyViewedProduct.name}
                </h5>
                <p className="text-[11px] font-mono text-[#D5CEBF]">
                  {formatPrice(currentlyViewedProduct.price, currency, isArabic)} • WhatsApp 🇩🇿
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                <span className="text-[10px] font-mono text-[#C9A96E] uppercase font-bold tracking-wider">
                  {isArabic ? 'خدمة الزبائن السريعة' : 'Atelier DBC en Direct'}
                </span>
              </div>
              <p className="text-xs text-[#EAE3D5] font-sans mt-0.5">
                {isArabic ? 'اطلب أو استفسر عبر واتساب (69 ولاية)' : 'Commandes rapides & B2B via WhatsApp'}
              </p>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsTooltipDismissed(true);
            }}
            className="p-1 text-[#8C8377] hover:text-white rounded-full hover:bg-white/10 transition-colors"
            title="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
          <div className="relative">
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-ping"></span>
            </span>
          </div>

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
