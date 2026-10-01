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
import { formatPrice, parseNumericPrice } from '../utils/format';
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

  const subtotalDzd = items.reduce((sum, item) => {
    const rawPrice = 
      parseNumericPrice(item.pricePerUnit) ?? 
      parseNumericPrice((item as any).price) ?? 
      parseNumericPrice(item.product?.price) ?? 
      parseNumericPrice((item.product as any)?.b2bPrice) ?? 
      parseNumericPrice(item.product?.wholesalePriceDzd);
    const itemPrice = rawPrice !== null ? rawPrice : 0;
    const itemQty = Math.max(1, parseNumericPrice(item.quantity) ?? 1);
    return sum + (itemPrice * itemQty);
  }, 0);
  const safeDiscountPct = Math.max(0, Math.min(100, parseNumericPrice(appliedDiscountPct) ?? 0));
  const discountAmountDzd = Math.round((subtotalDzd * safeDiscountPct) / 100);
  const totalDzd = Math.max(0, subtotalDzd - discountAmountDzd);

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
    const rawNumber = storeSettings?.whatsappNumber || '213550458812';
    const cleanNum = rawNumber.replace(/[^0-9]/g, '') || '213550458812';

    const itemsSummary = items
      .map(
        (i) =>
          `• ${i.product.name} (Taille: ${i.size}, Couleur: ${i.color.name}, Qté: ${i.quantity}) - ${formatPrice(
            i.pricePerUnit * i.quantity,
            currency,
            isArabic
          )}`
      )
      .join('\n');

    const message = isArabic
      ? `مرحباً ورشة DBC 👋\nأود تأكيد طلبي مباشرة عبر واتساب:\n\n${itemsSummary}\n\n*المجموع:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\n\nيرجى تزويدي بإجراءات تأكيد التوصيل.`
      : `Bonjour DBC Workshop 👋\nJe souhaite valider ma commande par WhatsApp :\n\n${itemsSummary}\n\n*Total Estimé:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\n\nMerci de m'indiquer la confirmation pour livraison.`;

    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#DCD4C7] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#DDD4C5] flex items-center justify-between bg-[#1F1D1A] text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C9A96E]" />
              <h2 className="font-serif text-lg font-bold tracking-wide">
                {t.cartTitle}
              </h2>
              <span className="px-2 py-0.5 bg-[#3D3730] text-[#E0D7C9] text-xs font-mono rounded-full font-bold">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#B3AAA0] hover:text-white rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Promise Badge */}
          <div className="px-4 py-2 bg-[#F2EDE4] border-b border-[#DDD4C5] text-xs font-mono text-[#5C554B] flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-[#8C6D3B]" />
            <span>{t.delivery58Wilayas}</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#EAE3D6] flex items-center justify-center text-[#7C756B]">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="font-serif text-base font-semibold text-[#1F1C19]">
                  {t.emptyCart}
                </h3>
                <p className="text-xs font-mono text-[#7C756B] max-w-xs">
                  {t.emptyCartDesc}
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2 bg-[#1F1D1A] text-white text-xs font-mono rounded hover:bg-[#3D3730] transition-colors cursor-pointer"
                >
                  Découvrir la Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex gap-3 p-3 bg-white border border-[#DDD4C5] rounded relative group"
                >
                  <img
                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                    alt={item.product.name}
                    className="w-16 h-20 object-cover rounded border border-[#DDD4C5] flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif text-xs font-bold text-[#1F1C19] truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-[#9E9589] hover:text-red-700 p-0.5 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-[#7C756B] space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span>Taille: <strong className="text-[#1F1C19]">{item.size}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          <span>{item.color.name}</span>
                        </span>
                      </div>
                      
                      {item.isMadeToMeasure && (
                        <span className="inline-block text-[10px] text-[#8C6D3B] bg-[#F2EDE4] px-1.5 py-0.5 rounded">
                          Sur-Mesure (M2M)
                        </span>
                      )}
                    </div>

                    {/* Quantity & Item Total */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-[#DDD4C5] rounded bg-[#FAF8F5] text-xs font-mono">
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
    </div>
  );
};
