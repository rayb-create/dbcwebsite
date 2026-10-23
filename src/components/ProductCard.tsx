import React, { useState } from 'react';
import { 
  Heart, 
  Eye, 
  Plus, 
  Check, 
  MessageCircle, 
  Building2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { Product, Currency, StoreSettings } from '../types';
import { formatPrice } from '../utils/format';
import { Language, TRANSLATIONS, getCategoryLabel, formatColorName } from '../data/i18n';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';
import { getProductSubtitle } from '../data/products';

export { getCategoryLabel, formatColorName };

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: string, colorIndex: number) => void;
  currentLanguage: Language;
  storeSettings?: StoreSettings;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
  currentLanguage,
  storeSettings,
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [quickSizeSelectOpen, setQuickSizeSelectOpen] = useState(false);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'];

  const displayImage = images[currentImageIndex] || images[0];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleQuickAddClick = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd(product, size, selectedColorIndex);
    setJustAdded(true);
    setQuickSizeSelectOpen(false);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleWhatsAppQuickOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateProductWhatsAppUrl(product, storeSettings, {
      language: currentLanguage,
      currency,
      intent: 'order',
      selectedColor: product.colors[selectedColorIndex]?.name,
    });
    window.open(url, '_blank');
  };

  return (
    <div 
      className="group bg-white border border-[#E6E6E6] hover:border-[#111111] flex flex-col justify-between transition-all duration-300 relative select-none"
    >
      {/* Editorial Aspect Ratio Frame */}
      <div 
        className="relative w-full aspect-[3/4] bg-[#F3F3F1] overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          key={currentImageIndex}
          src={displayImage}
          alt={`${product.name} - ${currentImageIndex + 1}`}
          className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Previous / Next Slides */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              id={`product-card-${product.id}-prev-btn`}
              onClick={handlePrevImage}
              aria-label={isArabic ? 'الصورة السابقة' : 'Photo précédente'}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white text-[#111111] border border-[#E6E6E6] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id={`product-card-${product.id}-next-btn`}
              onClick={handleNextImage}
              aria-label={isArabic ? 'الصورة التالية' : 'Photo suivante'}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white text-[#111111] border border-[#E6E6E6] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Slide Count */}
            <span className="absolute top-3 right-11 px-1.5 py-0.5 text-[9px] font-mono tracking-wider bg-black/75 text-white z-10">
              {currentImageIndex + 1}/{images.length}
            </span>
          </>
        )}

        {/* Minimalist Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-[#111111] text-white">
            {product.fabricWeight || 'Heavyweight'}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white text-[#111111] border border-[#E6E6E6] transition-colors cursor-pointer z-10"
          title={isWishlisted ? t.wishlistTitle : t.wishlistSelectBtn}
        >
          <Heart 
            className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#111111] text-[#111111]' : 'text-[#737373]'}`} 
          />
        </button>

        {/* Quick Actions Bar on Hover */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={() => onSelectProduct(product)}
            className="flex-1 py-2 bg-[#111111] hover:bg-black text-white text-[11px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>{t.viewDetails}</span>
          </button>
          <button
            onClick={handleWhatsAppQuickOrder}
            className="p-2 bg-white hover:bg-[#F3F3F1] text-[#111111] border border-[#E6E6E6] cursor-pointer"
            title={t.orderViaWhatsApp}
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white border-t border-[#E6E6E6]">
        <div className="space-y-1.5">
          {/* Category & Origin */}
          <div className="flex items-center justify-between text-[10px] font-sans text-[#737373] uppercase tracking-widest font-semibold">
            <span>{getCategoryLabel(product.category, currentLanguage, storeSettings?.customCategories)}</span>
            <span>{t.algeriaMade}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-serif text-sm sm:text-base font-normal text-[#111111] line-clamp-1 hover:underline cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Subtitle */}
          {getProductSubtitle(product, currentLanguage) && (
            <p className="text-[11px] text-[#737373] line-clamp-1 font-sans">
              {getProductSubtitle(product, currentLanguage)}
            </p>
          )}

          {/* Color Swatches */}
          <div className="flex items-center gap-1.5 pt-1">
            {product.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColorIndex(idx);
                }}
                className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                  selectedColorIndex === idx 
                    ? 'ring-1 ring-[#111111] ring-offset-1 scale-110' 
                    : 'border-black/20 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={formatColorName(color.name, currentLanguage)}
              />
            ))}
            <span className="text-[10px] font-sans text-[#737373] ml-1">
              {formatColorName(product.colors[selectedColorIndex]?.name, currentLanguage)}
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart Area */}
        <div className="pt-3 border-t border-[#E6E6E6] mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-sans text-xs sm:text-sm font-bold text-[#111111]">
                {formatPrice(product.price, currency, isArabic)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[11px] font-sans text-[#737373] line-through ml-2">
                  {formatPrice(product.compareAtPrice, currency, isArabic)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Add Sizes or Trigger */}
          {!quickSizeSelectOpen ? (
            <button
              id={`quick-add-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setQuickSizeSelectOpen(true);
              }}
              className={`w-full py-2 px-3 text-xs font-sans tracking-widest uppercase font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                justAdded 
                  ? 'bg-black text-white' 
                  : 'bg-[#F3F3F1] hover:bg-[#111111] text-[#111111] hover:text-white border border-[#E6E6E6]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.addedSuccess}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addToCart}</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-1 animate-in fade-in duration-150">
              <span className="text-[10px] font-mono text-[#737373] block">
                {t.selectSize} :
              </span>
              <div className="flex flex-wrap gap-1">
                {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleQuickAddClick(size, e)}
                    className="flex-1 min-w-[32px] py-1 px-1 bg-white hover:bg-[#111111] hover:text-white border border-[#E6E6E6] text-[11px] font-sans text-center cursor-pointer font-medium transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
