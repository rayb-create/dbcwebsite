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
import { Language, TRANSLATIONS } from '../data/i18n';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';
import { getProductSubtitle } from '../data/products';

// Helper: safe localized category label with custom category support
export const getCategoryLabel = (
  categoryId: string, 
  lang: Language = 'fr', 
  customCategories?: { id: string; name: string; nameAr?: string; nameEn?: string; nameEs?: string }[]
): string => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  switch (categoryId) {
    case 'all': return t?.navAll || 'Tous';
    case 'hoodies': return t?.navHoodies || 'Hoodies';
    case 'joggers': return t?.navJoggers || 'Joggers';
    case 'tracksuits': return t?.navTracksuits || 'Ensembles';
    case 'longsleeves': return t?.navLongSleeves || 'Manches Longues';
    case 'tees': return t?.navTees || 'T-shirts';
    case 'outerwear': return t?.navOuterwear || (lang === 'ar' ? 'سترات ومعاطف' : lang === 'es' ? 'Chaquetas y Abrigos' : lang === 'en' ? 'Outerwear' : 'Vestes & Manteaux');
    case 'b2b': return t?.navB2B || 'B2B / Gros';
    default: {
      if (customCategories && customCategories.length > 0) {
        const found = customCategories.find(c => c.id === categoryId);
        if (found) {
          if (lang === 'ar' && found.nameAr) return found.nameAr;
          if (lang === 'en' && found.nameEn) return found.nameEn;
          if (lang === 'es' && found.nameEs) return found.nameEs;
          return found.name;
        }
      }
      return categoryId;
    }
  }
};

export const formatColorName = (rawName?: string, lang: Language = 'fr'): string => {
  if (!rawName) return '';
  const parts = rawName.split('/').map(s => s.trim());
  if (parts.length <= 1) return rawName;
  if (lang === 'en') return parts[1] || parts[0];
  return parts[0];
};

interface ProductCardProps {
  product: Product;
  currency: Currency;
  currentLanguage: Language;
  storeSettings?: StoreSettings;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: string, colorIndex: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  currentLanguage,
  storeSettings,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [quickSizeSelectOpen, setQuickSizeSelectOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.fr;
  const isArabic = currentLanguage === 'ar';

  const images = (product.images && product.images.length > 0) 
    ? product.images 
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'];

  const displayImage = images[currentImageIndex] || images[0];

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product.id]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product.id);
  };

  const handleQuickAddClick = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd(product, size, selectedColorIndex);
    setJustAdded(true);
    setQuickSizeSelectOpen(false);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWhatsAppQuickOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const selectedColor = product.colors[selectedColorIndex]?.name || 'Standard';
    const url = generateProductWhatsAppUrl(product, storeSettings, {
      selectedColor,
      currency,
      language: currentLanguage,
      intent: 'order',
    });
    window.open(url, '_blank');
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group flex flex-col bg-white border border-[#E8E1D5] hover:border-[#1F1D1A] transition-all duration-300 rounded overflow-hidden shadow-xs hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setQuickSizeSelectOpen(false);
      }}
    >
      {/* Image Container with Sliding Buttons & Controls */}
      <div 
        className="relative w-full aspect-[3/4] bg-[#F2EDE4] overflow-hidden cursor-pointer select-none"
        onClick={() => onSelectProduct(product)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={currentImageIndex}
          src={displayImage}
          alt={`${product.name} - ${currentImageIndex + 1}`}
          className="w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Sliding Buttons (Previous / Next) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              id={`product-card-${product.id}-prev-btn`}
              onClick={handlePrevImage}
              aria-label={isArabic ? 'الصورة السابقة' : currentLanguage === 'es' ? 'Foto anterior' : currentLanguage === 'en' ? 'Previous photo' : 'Photo précédente'}
              title={isArabic ? 'الصورة السابقة' : currentLanguage === 'es' ? 'Foto anterior' : currentLanguage === 'en' ? 'Previous photo' : 'Photo précédente'}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1F1D1A] shadow-md border border-[#E0D7C9] flex items-center justify-center backdrop-blur-xs transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-20"
            >
              <ChevronLeft className="w-4 h-4 text-[#1F1D1A]" />
            </button>

            <button
              type="button"
              id={`product-card-${product.id}-next-btn`}
              onClick={handleNextImage}
              aria-label={isArabic ? 'الصورة التالية' : currentLanguage === 'es' ? 'Foto siguiente' : currentLanguage === 'en' ? 'Next photo' : 'Photo suivante'}
              title={isArabic ? 'الصورة التالية' : currentLanguage === 'es' ? 'Foto siguiente' : currentLanguage === 'en' ? 'Next photo' : 'Photo suivante'}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1F1D1A] shadow-md border border-[#E0D7C9] flex items-center justify-center backdrop-blur-xs transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-20"
            >
              <ChevronRight className="w-4 h-4 text-[#1F1D1A]" />
            </button>

            {/* Slide Counter Badge */}
            <span className="absolute top-3 right-12 px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider bg-black/60 text-white/95 backdrop-blur-xs rounded pointer-events-none z-10 shadow-xs">
              {currentImageIndex + 1}/{images.length}
            </span>

            {/* Slide Indicator Dots / Pills */}
            <div 
              className="absolute bottom-3 group-hover:bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 bg-black/40 backdrop-blur-xs rounded-full pointer-events-auto z-20 transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  aria-label={isArabic ? `عرض الصورة ${idx + 1}` : currentLanguage === 'es' ? `Mostrar foto ${idx + 1}` : currentLanguage === 'en' ? `Show photo ${idx + 1}` : `Afficher la photo ${idx + 1}`}
                  className={`transition-all duration-200 rounded-full ${
                    currentImageIndex === idx 
                      ? 'w-4 h-1.5 bg-white' 
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges: New, Made in Algeria, B2B wholesale */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10 pointer-events-none">
          {product.isNew && (
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#1F1D1A] text-white rounded">
              {t.badgeNew}
            </span>
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#8C2A2A] text-white rounded">
              -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
            </span>
          )}
          {product.isB2BAvailable && (
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider bg-[#4A3728] text-[#F3EFE6] rounded flex items-center gap-1 shadow-xs">
              <Building2 className="w-3 h-3" />
              <span>B2B {t.wholesale}</span>
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? t.removeFromFavorites : t.addToFavorites}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-all z-20 cursor-pointer ${
            isFavorite 
              ? 'bg-red-50 text-red-600 shadow-sm' 
              : 'bg-white/80 text-[#595247] hover:text-[#1F1D1A] hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-600' : ''}`} />
        </button>

        {/* Action Overlay Bar */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex-1 py-2 px-3 bg-[#1F1D1A] hover:bg-black text-white text-xs font-mono uppercase tracking-wider rounded shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.viewDetails}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppQuickOrder}
            className="p-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded shadow-md transition-colors cursor-pointer"
            title={t.orderViaWhatsApp}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div className="space-y-1.5">
          {/* Category & Origin */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8377] uppercase tracking-wider">
            <span>{getCategoryLabel(product.category, currentLanguage, storeSettings?.customCategories)}</span>
            <span>{t.algeriaMade}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-serif text-sm sm:text-base font-semibold text-[#1F1C19] line-clamp-1 hover:text-[#8C6D3B] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Subtitle / Multilingual translation */}
          {getProductSubtitle(product, currentLanguage) && (
            <p className="text-[11px] text-[#6E6659] line-clamp-1 font-sans">
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
                    ? 'ring-2 ring-[#1F1D1A] ring-offset-1 scale-110' 
                    : 'border-black/20 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={formatColorName(color.name, currentLanguage)}
              />
            ))}
            <span className="text-[10px] font-mono text-[#7C756B] ml-1">
              {formatColorName(product.colors[selectedColorIndex]?.name, currentLanguage)}
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart Area */}
        <div className="pt-3 border-t border-[#F0EAE1] mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-serif font-bold text-base text-[#1F1D1A]">
                {formatPrice(product.price, currency)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="ml-2 text-xs text-[#8C8377] line-through font-mono">
                  {formatPrice(product.compareAtPrice, currency)}
                </span>
              )}
            </div>

            {product.wholesalePriceDzd && (
              <div className="text-[10px] font-mono text-[#4A3728] text-right" title="Tarif grossiste à partir de 6 pièces">
                <span className="block font-semibold">Gros: {formatPrice(product.wholesalePriceDzd, currency)}</span>
                <span className="text-[9px] text-[#8C8377]">dès {product.minWholesaleQty || 6} pcs</span>
              </div>
            )}
          </div>

          {/* Quick Add Button / Dropdown Trigger */}
          <div className="relative pt-1">
            {quickSizeSelectOpen ? (
              <div className="bg-[#FAF7F2] p-2 rounded border border-[#E0D7C9] animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-[#5C5549] uppercase tracking-wider">{t.selectSize}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickSizeSelectOpen(false);
                    }}
                    className="text-[10px] text-[#8C8377] hover:text-black cursor-pointer font-mono"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => handleQuickAddClick(size, e)}
                      className="py-1 px-1.5 text-xs font-mono bg-white hover:bg-[#1F1D1A] hover:text-white border border-[#DDD5C7] rounded text-center transition-colors cursor-pointer"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickSizeSelectOpen(true);
                }}
                disabled={justAdded}
                className={`w-full py-1.5 px-3 rounded text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  justAdded
                    ? 'bg-[#1EBE5D] text-white'
                    : 'bg-[#F2EDE4] hover:bg-[#1F1D1A] text-[#1F1D1A] hover:text-white border border-[#E0D7C9]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.addedToCart}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.quickAdd}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
