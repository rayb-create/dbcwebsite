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

  const displayImage = images[currentImageIndex] || images[0];

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
    const diffX = touchStartX - touchEndX;
    if (diffX > 35 && images.length > 1) {
      // Swiped left -> next picture
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    } else if (diffX < -35 && images.length > 1) {
      // Swiped right -> previous picture
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
    setTouchStartX(null);
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
              aria-label="Photo précédente"
              title="Photo précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1F1D1A] shadow-md border border-[#E0D7C9] flex items-center justify-center backdrop-blur-xs transition-all duration-200 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer z-20"
            >
              <ChevronLeft className="w-4 h-4 text-[#1F1D1A]" />
            </button>

            <button
              type="button"
              id={`product-card-${product.id}-next-btn`}
              onClick={handleNextImage}
              aria-label="Photo suivante"
              title="Photo suivante"
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
                  aria-label={`Afficher la photo ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentImageIndex === idx 
                      ? 'w-4 h-1.5 bg-white shadow-xs' 
                      : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge: Grammage & B2B/B2C */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#1F1D1A]/90 text-white backdrop-blur-xs rounded">
            {product.fabricWeight || 'Heavyweight Fleece'}
          </span>
          {product.isB2BAvailable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono tracking-wider bg-white/90 text-[#8C6D3B] backdrop-blur-xs border border-[#DDD4C5] rounded font-bold">
              <Building2 className="w-2.5 h-2.5" />
              B2B & B2C
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/85 hover:bg-white text-[#2C2825] backdrop-blur-xs rounded-full transition-colors shadow-xs cursor-pointer z-10"
          title="Ajouter aux favoris"
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-[#8C6D3B] text-[#8C6D3B]' : 'text-[#4A4338]'}`} 
          />
        </button>

        {/* Quick WhatsApp & Details Overlay on Hover */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={() => onSelectProduct(product)}
            className="flex-1 py-2 bg-[#1F1D1A]/95 hover:bg-black text-white text-xs font-mono rounded flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>Voir Détails</span>
          </button>
          <button
            onClick={handleWhatsAppQuickOrder}
            className="p-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded shadow-md transition-colors cursor-pointer"
            title="Commander sur WhatsApp"
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
            <span>{product.category}</span>
            <span>Algérie</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-serif text-sm sm:text-base font-semibold text-[#1F1C19] line-clamp-1 hover:text-[#8C6D3B] cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Subtitle / Arabic translation */}
          {product.subtitle && (
            <p className="text-[11px] text-[#6E6659] line-clamp-1 font-sans">
              {product.subtitle}
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
                title={color.name}
              />
            ))}
            <span className="text-[10px] font-mono text-[#7C756B] ml-1">
              {product.colors[selectedColorIndex]?.name}
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart Area */}
        <div className="pt-3 border-t border-[#F0EAE1] mt-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-mono text-sm font-bold text-[#1F1C19]">
                {formatPrice(product.price, currency, isArabic)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs font-mono text-[#9E9589] line-through ml-2">
                  {formatPrice(product.compareAtPrice, currency, isArabic)}
                </span>
              )}
            </div>

            {/* B2B Wholesale Indicator */}
            {product.wholesalePriceDzd && (
              <span className="text-[10px] font-mono text-[#8C6D3B] bg-[#FAF3E8] px-1.5 py-0.5 rounded border border-[#EADCC7]" title="Tarif de gros pour les magasins dès 6 pièces">
                Gros: {formatPrice(product.wholesalePriceDzd, currency, isArabic)}
              </span>
            )}
          </div>

          {/* Quick Add Sizes or Button */}
          {!quickSizeSelectOpen ? (
            <button
              id={`quick-add-btn-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setQuickSizeSelectOpen(true);
              }}
              className={`w-full py-2 px-3 text-xs font-mono tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                justAdded 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-[#F2EDE4] hover:bg-[#1F1D1A] text-[#1F1C19] hover:text-white border border-[#DDD4C5]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouté !</span>
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
              <span className="text-[10px] font-mono text-[#7C756B] block">
                {t.selectSize} :
              </span>
              <div className="flex flex-wrap gap-1">
                {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleQuickAddClick(size, e)}
                    className="flex-1 min-w-[34px] py-1 px-1 bg-white hover:bg-[#1F1D1A] hover:text-white border border-[#DDD4C5] rounded text-[11px] font-mono text-center cursor-pointer transition-colors"
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
