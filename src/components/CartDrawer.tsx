import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  MessageCircle 
} from 'lucide-react';
import { CartItem, Currency, StoreSettings } from '../types';
import { formatPrice, parseNumericPrice } from '../utils/format';
import { Language, TRANSLATIONS, formatColorName } from '../data/i18n';

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

  // Promo code starts empty
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(appliedDiscountPct > 0);

  // Calculations in DZD
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
  const totalItemCount = items.reduce((s, i) => s + (parseNumericPrice(i.quantity) ?? 1), 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = onApplyDiscountCode(promoInput.trim().toUpperCase());
    if (ok) {
      setPromoSuccess(true);
      setPromoError('');
    } else {
      setPromoError(
        t.promoInvalidMsg || 
        (isArabic ? 'كود غير صالح' : currentLanguage === 'es' ? 'Código no válido' : currentLanguage === 'en' ? 'Invalid promo code' : 'Code promo non valide')
      );
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
      ? `مرحباً RENASC 👋\nأود تأكيد طلب القطع التالية من حقيبة التسوق:\n\n${itemsList}\n\n*المجموع:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\nيرجى التواصل معي لتأكيد التوصيل (الدفع عند الاستلام).`
      : currentLanguage === 'es'
      ? `Hola RENASC 👋\nDeseo realizar un pedido con los artículos de mi bolsa:\n\n${itemsList}\n\n*Total:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\nPor favor contáctenme para coordinar el envío (Pago contra entrega).`
      : currentLanguage === 'en'
      ? `Hello RENASC team 👋\nI would like to place an order for my bag items:\n\n${itemsList}\n\n*Total:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\nPlease contact me to confirm delivery (Cash on delivery).`
      : `Bonjour RENASC 👋\nJe souhaite commander les pièces de mon panier :\n\n${itemsList}\n\n*Total :* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\nMerci de me contacter pour la livraison (Paiement à la livraison).`;

    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const cartHeading = isArabic 
    ? 'حقيبة التسوق' 
    : currentLanguage === 'en' 
    ? 'Your Bag' 
    : currentLanguage === 'es' 
    ? 'Su Bolsa' 
    : 'Votre Panier';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div 
        className="relative w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E6E6E6] overflow-hidden font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editorial Drawer Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-[#E6E6E6] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="font-serif text-lg sm:text-xl font-normal text-[#111111] uppercase tracking-[0.15em]">
              {cartHeading}
            </h2>
            <span className="text-xs font-sans text-[#737373] font-light">
              ({totalItemCount})
            </span>
          </div>

          <button
            id="close-cart-drawer-btn"
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
            aria-label="Close Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Contents List */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto flex-1 divide-y divide-[#E6E6E6]">
          {items.length === 0 ? (
            /* Refined Empty Cart State */
            <div className="text-center py-20 px-4 space-y-4">
              <span className="font-serif text-xl sm:text-2xl font-normal text-[#111111] block">
                {isArabic 
                  ? 'حقيبة التسوق فارغة' 
                  : currentLanguage === 'en' 
                  ? 'Your Bag is Empty' 
                  : currentLanguage === 'es' 
                  ? 'Su Bolsa está Vacía' 
                  : 'Votre Panier est Vide'}
              </span>
              <p className="text-xs text-[#737373] font-light max-w-xs mx-auto leading-relaxed">
                {isArabic 
                  ? 'استكشف تشكيلتنا الحصرية من الأزياء المعاصرة والمصممة بحرفية دقيقة.' 
                  : currentLanguage === 'en'
                  ? 'Explore our seasonal collection of considered, heavyweight apparel.'
                  : currentLanguage === 'es'
                  ? 'Descubra nuestra colección de prendas exclusivas y duraderas.'
                  : 'Découvrez notre collection de confections soignées et durables.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    const el = document.getElementById('collection-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-[#111111] hover:bg-black text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer"
                >
                  {isArabic 
                    ? 'استكشف التشكيلة' 
                    : currentLanguage === 'en' 
                    ? 'Explore the Collection' 
                    : currentLanguage === 'es' 
                    ? 'Explorar la Colección' 
                    : 'Explorer la Collection'}
                </button>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.cartItemId}
                className="py-4 flex gap-3.5 sm:gap-4 items-start group"
              >
                {/* Product Image Frame */}
                <div className="w-20 sm:w-24 aspect-[3/4] bg-[#FBFBFA] border border-[#E6E6E6] overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=400&q=80'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Item Specifications */}
                <div className="flex-1 flex flex-col justify-between self-stretch">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif text-sm sm:text-base font-normal text-[#111111] line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-[#A3A3A3] hover:text-[#111111] transition-colors p-1 cursor-pointer shrink-0"
                        title={isArabic ? 'حذف' : 'Supprimer'}
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] font-sans text-[#737373] space-y-0.5 mt-1 font-light">
                      <p>
                        <span>{isArabic ? 'المقاس:' : currentLanguage === 'es' ? 'Talla:' : currentLanguage === 'en' ? 'Size:' : 'Taille :'} </span>
                        <span className="font-medium text-[#111111]">{item.size}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>{isArabic ? 'اللون:' : currentLanguage === 'es' ? 'Color:' : currentLanguage === 'en' ? 'Color:' : 'Couleur :'} </span>
                        <span 
                          className="w-2.5 h-2.5 rounded-full border border-black/20 inline-block shrink-0"
                          style={{ backgroundColor: item.color.hex }}
                        />
                        <span className="font-medium text-[#111111]">
                          {formatColorName(item.color.name, currentLanguage)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Discreet Stepper */}
                    <div className="flex items-center border border-[#E6E6E6] bg-white text-xs font-sans">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-2.5 py-1 text-[#737373] hover:text-[#111111] hover:bg-[#F3F3F1] cursor-pointer transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-medium text-[#111111] select-none text-[11px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-2.5 py-1 text-[#737373] hover:text-[#111111] hover:bg-[#F3F3F1] cursor-pointer transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Price and Total */}
                    <span className="font-sans text-xs sm:text-sm font-semibold text-[#111111]">
                      {formatPrice(item.pricePerUnit * item.quantity, currency, isArabic)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Order Summary & Primary Actions */}
        {items.length > 0 && (
          <div className="px-5 sm:px-6 py-5 bg-[#FBFBFA] border-t border-[#E6E6E6] space-y-4">
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder={t.promoCodePlaceholder || (isArabic ? 'كود الخصم...' : 'Code promotionnel...')}
                className="flex-1 px-3 py-2 bg-white border border-[#E6E6E6] text-xs font-sans uppercase placeholder-[#A3A3A3] focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white hover:bg-[#111111] hover:text-white border border-[#E6E6E6] text-xs font-sans uppercase tracking-widest font-medium transition-colors cursor-pointer"
              >
                {t.applyPromoBtn || (isArabic ? 'تطبيق' : 'Appliquer')}
              </button>
            </form>

            {promoSuccess && (
              <p className="text-[11px] font-sans text-emerald-800 flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {isArabic 
                    ? `تم تطبيق كود التخفيض: -${appliedDiscountPct}%` 
                    : `Code promo appliqué : -${appliedDiscountPct}%`}
                </span>
              </p>
            )}

            {promoError && (
              <p className="text-[11px] font-sans text-rose-700">
                {promoError}
              </p>
            )}

            {/* Subtotal & Line Breakdown */}
            <div className="space-y-1.5 text-xs font-sans pt-1">
              <div className="flex justify-between text-[#737373]">
                <span>{t.cartSubtotal}</span>
                <span>{formatPrice(subtotalDzd, currency, isArabic)}</span>
              </div>
              
              {discountAmountDzd > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>{isArabic ? 'الخصم الترويجي' : 'Remise'}</span>
                  <span>-{formatPrice(discountAmountDzd, currency, isArabic)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-semibold text-[#111111] pt-2 border-t border-[#E6E6E6]">
                <span>{t.netTotalToPay}</span>
                <span>{formatPrice(totalDzd, currency, isArabic)}</span>
              </div>

              {/* Discreet delivery disclaimer */}
              <p className="text-[11px] text-[#737373] font-light pt-0.5">
                {isArabic 
                  ? 'تكلفة الشحن تُحسب عند تأكيد الطلب حسب الولاية المختارة.' 
                  : currentLanguage === 'en'
                  ? 'Delivery fees are calculated at checkout based on destination.'
                  : currentLanguage === 'es'
                  ? 'Los gastos de envío se calculan en la pantalla de pago.'
                  : 'Frais de livraison calculés lors de la commande selon la wilaya.'}
              </p>
            </div>

            {/* Primary & Secondary Actions */}
            <div className="space-y-2 pt-1">
              <button
                id="cart-proceed-checkout-btn"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 sm:py-4 bg-[#111111] hover:bg-black text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <span>{t.checkoutBtn || (isArabic ? 'متابعة الطلب' : 'Commander')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-sans uppercase tracking-widest text-[#737373] hover:text-[#111111] transition-colors text-center cursor-pointer font-medium"
              >
                {isArabic 
                  ? 'مواصلة التسوق' 
                  : currentLanguage === 'en' 
                  ? 'Continue Shopping' 
                  : currentLanguage === 'es' 
                  ? 'Continuar Comprando' 
                  : 'Poursuivre les achats'}
              </button>

              {/* Discreet WhatsApp order link */}
              <div className="pt-1 text-center">
                <button
                  onClick={handleWhatsAppOrder}
                  className="inline-flex items-center gap-1.5 text-[11px] font-sans text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#111111]" />
                  <span>{isArabic ? 'أو اطلب مباشرة عبر واتساب' : 'Ou commander directement par WhatsApp'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
