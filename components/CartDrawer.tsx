import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Truck,
  MessageCircle
} from 'lucide-react';
import { CartItem, Currency, StoreSettings } from '../types';
import { formatPrice } from '../utils/format';
import { Language, TRANSLATIONS } from '../data/i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  discountCode: string;
  onApplyDiscountCode: (code: string) => boolean;
  appliedDiscountPct: number;
  orderNotes: string;
  onOrderNotesChange: (notes: string) => void;
  currentLanguage: Language;
  storeSettings?: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  discountCode,
  onApplyDiscountCode,
  appliedDiscountPct,
  orderNotes,
  onOrderNotesChange,
  currentLanguage,
  storeSettings,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const [promoInput, setPromoInput] = useState(discountCode || '');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(appliedDiscountPct > 0);

  const subtotalDzd = items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  const discountAmountDzd = Math.round((subtotalDzd * appliedDiscountPct) / 100);
  const totalDzd = subtotalDzd - discountAmountDzd;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = onApplyDiscountCode(promoInput.trim().toUpperCase());
    if (ok) {
      setPromoSuccess(true);
      setPromoError('');
    } else {
      setPromoError(isArabic ? 'كود غير صالح. جرب DBC2026 للحصول على تخفيض 10%' : 'Code promo invalide. Essayez DBC2026 pour -10%');
      setPromoSuccess(false);
    }
  };

  const handleWhatsAppOrder = () => {
    const cleanNum = (storeSettings?.whatsappNumber || '213550458812').replace(/[^0-9]/g, '');
    const itemsList = items
      .map(
        (i) =>
          `• ${i.product.name} (Taille: ${i.size}, Couleur: ${i.color.name}, Qté: ${i.quantity}) - ${formatPrice(
            i.pricePerUnit * i.quantity,
            currency,
            isArabic
          )}`
      )
      .join('\n');

    const msg = isArabic
      ? `مرحباً ورشة DBC 👋\nأود طلب السلة التالية وتأكيد الشحن إلى ولايتي:\n\n${itemsList}\n\n*المجموع:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\nيرجى التواصل معي لتأكيد التوصيل والدفع عند الاستلام.`
      : `Bonjour DBC Workshop 👋\nJe souhaite commander le contenu de mon panier :\n\n${itemsList}\n\n*Total:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\nMerci de me contacter pour la livraison (Paiement à la livraison).`;

    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-2xl flex flex-col justify-between border-l border-[#DCD4C7] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#F2EDE4] border-b border-[#E0D7C9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1F1C19]" />
            <h2 className="font-serif text-lg font-semibold text-[#1F1C19]">
              {t.cartTitle}
            </h2>
            <span className="text-xs font-mono bg-[#1F1D1A] text-white px-2 py-0.5 rounded-full">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={onClose}
            className="p-1 text-[#6A6357] hover:text-black rounded-full hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 58 Wilayas Notice Bar */}
        <div className="px-5 py-2.5 bg-[#EAE3D6] border-b border-[#DDD4C5] text-xs font-mono flex items-center gap-2 text-[#4A4338]">
          <Truck className="w-4 h-4 text-[#8C6D3B] flex-shrink-0" />
          <span>{t.delivery58Wilayas}</span>
        </div>

        {/* Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-[#B3AAA0] mx-auto stroke-1" />
              <p className="font-serif text-base text-[#5C554B]">{t.cartEmpty}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] cursor-pointer"
              >
                {t.continueShopping || (isArabic ? 'تصفح تشكيلة الملابس' : 'Découvrir la Collection')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.cartItemId}
                className="flex gap-3 pb-4 border-b border-[#E8E1D5] group"
              >
                <img
                  src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'}
                  alt={item.product.name}
                  className="w-20 h-24 object-cover rounded border border-[#DDD4C5] flex-shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-sm font-semibold text-[#1F1C19] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-[#9C9286] hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-[#6E6659] space-y-0.5 mt-0.5">
                      <p>Taille : <span className="font-bold text-[#1F1C19]">{item.size}</span></p>
                      <p className="flex items-center gap-1.5">
                        Couleur : 
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-black/20 inline-block"
                          style={{ backgroundColor: item.color.hex }}
                        />
                        <span className="font-medium text-[#1F1C19]">{item.color.name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-[#DDD4C5] rounded bg-white font-mono text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-2 py-0.5 text-[#5C554B] hover:bg-[#F2EDE4] cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-2 py-0.5 text-[#5C554B] hover:bg-[#F2EDE4] cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-[#1F1C19]">
                      {formatPrice(item.pricePerUnit * item.quantity, currency, isArabic)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout & Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#DDD4C5] space-y-3">
            {/* Promo code */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Code Promo (ex: DBC2026)"
                className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs uppercase"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#F2EDE4] hover:bg-[#1F1D1A] hover:text-white border border-[#DDD4C5] font-mono text-xs rounded transition-colors cursor-pointer"
              >
                Appliquer
              </button>
            </form>

            {promoSuccess && (
              <p className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Code DBC appliqué : -{appliedDiscountPct}%</span>
              </p>
            )}

            {promoError && (
              <p className="text-[11px] font-mono text-red-600">
                {promoError}
              </p>
            )}

            {/* Subtotal */}
            <div className="space-y-1.5 font-mono text-xs pt-1">
              <div className="flex justify-between text-[#5C554B]">
                <span>{t.cartSubtotal}</span>
                <span>{formatPrice(subtotalDzd, currency, isArabic)}</span>
              </div>
              {discountAmountDzd > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Remise Promo</span>
                  <span>-{formatPrice(discountAmountDzd, currency, isArabic)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#1F1C19] pt-1.5 border-t border-[#E8E1D5]">
                <span>Total Estimé</span>
                <span>{formatPrice(totalDzd, currency, isArabic)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                id="cart-proceed-checkout-btn"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3 bg-[#1F1D1A] hover:bg-[#3D3730] text-white font-mono text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <span>{t.checkoutBtn}</span>
                <ArrowRight className="w-4 h-4 text-[#C9A96E]" />
              </button>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-semibold rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.orderViaWhatsApp}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
