import React, { useState, useEffect } from 'react';
import { 
  X, 
  Ruler, 
  Check, 
  Truck, 
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ShoppingBag
} from 'lucide-react';
import { Product, Currency, CustomMeasurements, StoreSettings } from '../types';
import { formatPrice } from '../utils/format';
import { Language, TRANSLATIONS, getCategoryLabel, formatColorName } from '../data/i18n';
import { getProductSubtitle, getProductDescription, getProductFabric, getProductMillOrigin } from '../data/products';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';
import { useAuth } from '../context/AuthContext';

interface ProductDetailModalProps {
  product: Product | null;
  currency: Currency;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    size: string,
    colorIndex: number,
    isMadeToMeasure: boolean,
    measurements?: CustomMeasurements,
    monogram?: any,
    customPrice?: number,
    quantity?: number
  ) => void;
  onOpenSizeGuide: () => void;
  currentLanguage: Language;
  storeSettings?: StoreSettings;
  onDeleteProduct?: (productId: string) => void;
  onEditProduct?: (product: Product) => void;
  isAdmin?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currency,
  isOpen,
  onClose,
  onAddToCart,
  onOpenSizeGuide,
  currentLanguage,
  storeSettings,
  onDeleteProduct,
  onEditProduct,
  isAdmin: propIsAdmin,
}) => {
  const { isAdmin: authIsAdmin, currentUser, loading: authLoading } = useAuth();
  const isAdmin = Boolean(
    !authLoading &&
    currentUser &&
    authIsAdmin === true &&
    propIsAdmin !== false
  );

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Initialize selected size when product changes
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[1] || product.sizes[0]);
    }
    setSelectedImageIdx(0);
    setQuantity(1);
    setAddedSuccess(false);
  }, [product?.id]);

  const images = Array.isArray(product?.images) && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'];

  // Keyboard navigation for image slider
  useEffect(() => {
    if (!isOpen || !product || images.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, product, images.length, onClose]);

  const handlePrevImage = () => {
    setSelectedImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || images.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    if (diffX > 40) {
      handleNextImage();
    } else if (diffX < -40) {
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  if (!isOpen || !product) return null;

  const unitPrice = product.price;

  const handleAdd = () => {
    onAddToCart(
      product,
      selectedSize,
      selectedColorIdx,
      false,
      undefined,
      undefined,
      unitPrice,
      quantity
    );
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2400);
  };

  const handleWhatsAppInquiry = () => {
    const selectedColor = product.colors[selectedColorIdx] || product.colors[0];
    const url = generateProductWhatsAppUrl(product, storeSettings, {
      language: currentLanguage,
      currency,
      selectedColor: selectedColor?.name,
      selectedSize,
      intent: 'inquiry',
    });
    window.open(url, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div 
        className="relative w-full max-w-4xl bg-white border border-[#E6E6E6] shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111111] text-white border-b border-black">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg tracking-[0.2em] font-normal uppercase">
              RENASC
            </span>
            <span className="text-[#666666]">•</span>
            <span className="text-[11px] font-sans uppercase tracking-widest text-[#A3A3A3]">
              {getCategoryLabel(product.category, currentLanguage, storeSettings?.customCategories)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 font-sans">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Editorial Image Gallery (6 cols on tablet & desktop) */}
            <div className="md:col-span-6 space-y-4">
              <div 
                className="relative aspect-[4/5] bg-[#FBFBFA] border border-[#E6E6E6] overflow-hidden select-none group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  key={selectedImageIdx}
                  src={images[selectedImageIdx] || images[0]}
                  alt={`${product.name} - Vue ${selectedImageIdx + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {/* Left / Right Nav Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Photo précédente"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 hover:bg-white text-[#111111] border border-[#E6E6E6] flex items-center justify-center transition-colors cursor-pointer shadow-sm z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Photo suivante"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/95 hover:bg-white text-[#111111] border border-[#E6E6E6] flex items-center justify-center transition-colors cursor-pointer shadow-sm z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#111111]/85 text-white text-[10px] tracking-widest font-mono uppercase z-10">
                      {selectedImageIdx + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Fabric Weight Badge */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 bg-[#111111] text-white text-[10px] font-sans tracking-widest uppercase font-medium">
                    {product.fabricWeight || 'Heavyweight'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-16 h-20 overflow-hidden border transition-all flex-shrink-0 cursor-pointer ${
                        selectedImageIdx === idx ? 'border-[#111111] ring-1 ring-[#111111]' : 'border-[#E6E6E6] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Discreet Logistics Line */}
              <div className="pt-2 text-xs text-[#737373] space-y-1.5 font-light">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                  <span>{t.delivery58Wilayas} • {t.footerCodText}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                  <span>Confection soignée • Finitions haute précision</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Specifications & Actions (6 cols on tablet & desktop) */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                
                {/* Admin Manager Actions (Only if authenticated administrator) */}
                {isAdmin && (onDeleteProduct || onEditProduct) && (
                  <div className="p-3 bg-[#FBFBFA] border border-[#E6E6E6] flex items-center justify-between text-xs">
                    <span className="text-[#111111] font-medium uppercase tracking-wider text-[11px]">
                      Gestion Atelier
                    </span>
                    <div className="flex items-center gap-2">
                      {onEditProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onEditProduct(product);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-[#F3F3F1] text-[#111111] border border-[#E6E6E6] text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{isArabic ? 'تعديل' : 'Modifier'}</span>
                        </button>
                      )}
                      {onDeleteProduct && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isArabic ? 'حذف' : 'Supprimer'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Title & Subtitle */}
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#737373] font-medium block mb-1">
                    {getCategoryLabel(product.category, currentLanguage, storeSettings?.customCategories)}
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#111111] leading-tight">
                    {product.name}
                  </h1>
                  {getProductSubtitle(product, currentLanguage) && (
                    <p className="text-xs text-[#737373] mt-1.5 font-light">
                      {getProductSubtitle(product, currentLanguage)}
                    </p>
                  )}
                </div>

                {/* Retail Price Display */}
                <div className="pb-4 border-b border-[#E6E6E6]">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-medium text-[#111111]">
                      {formatPrice(unitPrice, currency, isArabic)}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="text-sm text-[#737373] line-through">
                        {formatPrice(product.compareAtPrice, currency, isArabic)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-medium mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                    <span>{isArabic ? 'متوفر وجاهز للشحن خلال 24-48 ساعة' : 'En stock • Expédition rapide sous 24 à 48h'}</span>
                  </div>
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="uppercase tracking-widest text-[#737373] text-[11px] font-medium">
                        {t.selectColor} :
                      </span>
                      <span className="text-[#111111] font-medium">
                        {formatColorName(product.colors[selectedColorIdx]?.name, currentLanguage)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIdx(idx)}
                          className={`flex items-center gap-2 px-3 py-1.5 border text-xs transition-colors cursor-pointer ${
                            selectedColorIdx === idx
                              ? 'bg-[#111111] text-white border-black font-medium'
                              : 'bg-white text-[#525252] border-[#E6E6E6] hover:border-[#111111]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/20"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{formatColorName(color.name, currentLanguage)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="uppercase tracking-widest text-[#737373] text-[11px] font-medium">
                        {t.selectSize} :
                      </span>
                      <button
                        type="button"
                        onClick={onOpenSizeGuide}
                        className="text-[#737373] hover:text-[#111111] underline underline-offset-2 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Ruler className="w-3 h-3" />
                        <span>{t.sizeGuideTitle}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[46px] py-2 px-3.5 text-xs font-sans uppercase tracking-wider border transition-colors cursor-pointer ${
                            selectedSize === size
                              ? 'bg-[#111111] text-white border-black font-semibold'
                              : 'bg-white text-[#525252] border-[#E6E6E6] hover:border-[#111111]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="space-y-2">
                  <span className="uppercase tracking-widest text-[#737373] text-[11px] font-medium block">
                    {t.quantityLabel}
                  </span>
                  <div className="inline-flex items-center border border-[#E6E6E6] bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-sm font-medium text-[#111111] hover:bg-[#F3F3F1] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer select-none"
                    >
                      -
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center font-medium text-xs text-[#111111] border-x border-[#E6E6E6] select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                      className="w-10 h-10 flex items-center justify-center text-sm font-medium text-[#111111] hover:bg-[#F3F3F1] cursor-pointer select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Editorial Description & Tailoring Specs */}
                <div className="pt-3 border-t border-[#E6E6E6] space-y-3">
                  <p className="text-xs text-[#525252] font-light leading-relaxed">
                    {getProductDescription(product, currentLanguage)}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-[#FBFBFA] border border-[#E6E6E6]">
                      <span className="text-[10px] uppercase tracking-widest text-[#737373] block mb-0.5">
                        {t.fabricLabel}
                      </span>
                      <span className="text-xs font-medium text-[#111111]">
                        {getProductFabric(product, currentLanguage)}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FBFBFA] border border-[#E6E6E6]">
                      <span className="text-[10px] uppercase tracking-widest text-[#737373] block mb-0.5">
                        {t.tailoringLabel}
                      </span>
                      <span className="text-xs font-medium text-[#111111]">
                        {getProductMillOrigin(product, currentLanguage)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-[#E6E6E6] space-y-3">
                <button
                  type="button"
                  id="product-detail-add-to-cart-btn"
                  onClick={handleAdd}
                  className="w-full py-4 bg-[#111111] hover:bg-black text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <span>
                    {addedSuccess
                      ? (isArabic ? 'تمت الإضافة إلى الحقيبة ✓' : 'Ajouté à la sélection ✓')
                      : `${t.addToCart} • ${formatPrice(unitPrice * quantity, currency, isArabic)}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="w-full py-3 bg-white hover:bg-[#FBFBFA] text-[#111111] border border-[#E6E6E6] hover:border-[#111111] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#111111]" />
                  <span>{isArabic ? 'استفسار عبر واتساب' : 'Conseil & Question via WhatsApp'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal for Admin */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75">
          <div className="bg-white border border-[#E6E6E6] p-6 max-w-sm w-full space-y-4">
            <h3 className="font-serif text-lg font-medium text-[#111111]">
              {isArabic ? 'تأكيد حذف المنتج' : 'Confirmer la suppression'}
            </h3>
            <p className="text-xs text-[#525252] leading-relaxed">
              {isArabic 
                ? 'هل أنت متأكد من حذف هذا المنتج نهائياً من الكتالوج؟'
                : 'Voulez-vous supprimer définitivement ce produit du catalogue ?'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-[#E6E6E6] text-xs font-medium text-[#111111] hover:bg-[#F3F3F1] cursor-pointer"
              >
                {isArabic ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProduct) onDeleteProduct(product.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium cursor-pointer"
              >
                {isArabic ? 'حذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailModal;
