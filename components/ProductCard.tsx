import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Eye, 
  Plus, 
  Check, 
  MessageCircle, 
  Building2, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, Currency, StoreSettings } from '../types';
import { formatPrice } from '../utils/format';
import { Language, TRANSLATIONS, getCategoryLabel, formatColorName } from '../data/i18n';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';
import { getProductSubtitle } from '../data/products';

// Re-export helpers from i18n for backwards compatibility across imports
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
  const [isHovered, setIsHovered] = useState(false);
  const [quickSizeSelectOpen, setQuickSizeSelectOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'];

  const colors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : ['#1A1A1A'];

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['S', 'M', 'L', 'XL'];

  const currentPrice = typeof product.price === 'number' ? product.price : 0;
  const originalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : undefined;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    setTouchStartX(null);
  };

  const handleSizeClick = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    onQuickAdd(product, size, selectedColorIndex);
    setJustAdded(true);
    setQuickSizeSelectOpen(false);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const whatsAppUrl = generateProductWhatsAppUrl(
    product,
    storeSettings?.whatsappNumber || '+212600000000',
    colors[selectedColorIndex] || 'Standard',
    sizes[0] || 'Standard',
    currentLanguage
  );

  return (
    <div 
      className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setQuickSizeSelectOpen(false);
      }}
    >
      {/* Image Container */}
      <div 
        className="relative aspect-[3/4] w-full bg-gray-50 overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentImageIndex] || images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10">
          <div className="flex flex-col gap-1.5">
            {product.isNew && (
              <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-black text-white rounded-md shadow-sm">
                {t.newArrival || 'NEW'}
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-red-600 text-white rounded-md shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.isFeatured && !product.isNew && (
              <span className="px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase bg-amber-500 text-white rounded-md shadow-sm">
                HOT
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`pointer-events-auto p-2 rounded-full transition-transform active:scale-90 shadow-sm ${
              isWishlisted
                ? 'bg-red-50 text-red-500'
                : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:text-red-500 hover:bg-white'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Carousel Arrows (Desktop Hover) */}
        {images.length > 1 && (
          <div className="hidden sm:flex items-center justify-between absolute inset-x-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePrevImage}
              className="p-1.5 rounded-full bg-white/90 text-gray-800 shadow-md hover:bg-white transition-all active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="p-1.5 rounded-full bg-white/90 text-gray-800 shadow-md hover:bg-white transition-all active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex ? 'w-4 bg-black' : 'w-1.5 bg-black/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick Add Overlay on Hover / Click */}
        {quickSizeSelectOpen && (
          <div 
            className="absolute inset-x-0 bottom-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-100 z-20 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
              {t.selectSize || 'Select Size'}
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleSizeClick(e, size)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-black hover:text-white transition-colors active:scale-95"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Color indicators */}
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">
            <span>{getCategoryLabel(product.category, currentLanguage)}</span>
            {colors.length > 1 && (
              <span>{colors.length} {t.colors || 'colors'}</span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-semibold text-gray-900 text-sm hover:text-black transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Subtitle / Description excerpt */}
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {getProductSubtitle(product, currentLanguage)}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-base text-gray-900">
                {formatPrice(currentPrice, currency)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(originalPrice, currency)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* WhatsApp Direct Order Button */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
              title={t.orderViaWhatsApp || 'Order via WhatsApp'}
              aria-label="Order via WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {/* Quick Add Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (sizes.length === 1) {
                  handleSizeClick(e, sizes[0]);
                } else {
                  setQuickSizeSelectOpen(!quickSizeSelectOpen);
                }
              }}
              className={`p-2 rounded-xl font-medium text-xs flex items-center gap-1 transition-all active:scale-95 ${
                justAdded 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              aria-label="Add to cart"
            >
              {justAdded ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
