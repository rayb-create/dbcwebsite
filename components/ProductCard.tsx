import React, { useState } from 'react';
import { 
  Heart, 
  Eye, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Layers, 
  MessageCircle 
} from 'lucide-react';
import { Product, Currency, StoreSettings } from '../types';
import { formatPrice } from '../utils/format';
import { Language, TRANSLATIONS } from '../data/i18n';
import { generateProductWhatsAppUrl } from '../utils/whatsapp';
import { getProductSubtitle } from '../data/products';

// Safe self-contained helper function for category translations
export const getCategoryLabel = (
  categoryId: string, 
  lang: Language = 'fr', 
  customCategories?: { id: string; name: string; nameAr?: string; nameEn?: string; nameEs?: string }[]
): string => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  switch (categoryId) {
    case 'all': return t?.navAll || 'Toutes les collections';
    case 'hoodies': return t?.navHoodies || 'Hoodies & Sweats';
    case 'joggers': return t?.navJoggers || 'Pantalons & Joggers';
    case 'tracksuits': return t?.navTracksuits || 'Ensembles & Survêtements';
    case 'longsleeves': return t?.navLongSleeves || 'T-shirts Manches Longues';
    case 'tees': return t?.navTees || 'T-shirts Oversize';
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

// Safe self-contained helper function for color translations
export const formatColorName = (rawColorName: string, lang: Language): string => {
  if (!rawColorName) return '';
  if (lang === 'ar') return rawColorName;
  if (lang === 'es') {
    const map: Record<string, string> = {
      'Noir Profond / Black': 'Negro Profundo / Black',
      'Noir / Black': 'Negro / Black',
      'Noir Intégral / All Black': 'Negro Total / All Black',
      'Noir Intense / Jet Black': 'Negro Intenso',
      'Noir Carbone / Carbon Black': 'Negro Carbón',
      'Noir Charbon / Coal Black': 'Negro Carbón',
      'Noir Mat / Matte Black': 'Negro Mate',
      'Noir': 'Negro',
      'Gris Chiné / Heather Grey': 'Gris Jaspeado / Heather Grey',
      'Gris Souris / Ash Grey': 'Gris Ceniza',
      'Gris Ardoise / Slate Grey': 'Gris Pizarra',
      'Gris Anthracite / Charcoal': 'Gris Antracita',
      'Gris Chiné': 'Gris Jaspeado',
      'Gris': 'Gris',
      'Beige Sable / Sand': 'Beige Arena / Sand',
      'Beige Sable / Sand Dune': 'Beige Arena',
      'Beige': 'Beige',
      'Blanc Pur / Clean White': 'Blanco Puro',
      'Blanc Cassé / Off-White': 'Blanco Roto / Off-White',
      'Blanc': 'Blanco',
      'Vert Forêt / Forest Green': 'Verde Bosque',
      'Kaki Olive / Olive Khaki': 'Verde Oliva',
      'Kaki Militaire / Military Khaki': 'Verde Militar',
      'Kaki Fumé / Smoked Olive': 'Verde Oliva Ahumado',
      'Marron Moka / Mocha': 'Marrón Moka',
      'Moka Chaud / Warm Mocha': 'Marrón Moka Cálido',
      'Brun Tabac / Tobacco Brown': 'Marrón Tabaco',
      'Bleu Nuit / Deep Navy': 'Azul Marino Noche',
      'Bleu Marine / Navy': 'Azul Marino',
      'Bleu Pétrole / Petrol Blue': 'Azul Petróleo',
      'Bleu Marine Sombre / Dark Navy': 'Azul Marino Oscuro',
    };
    return map[rawColorName] || rawColorName;
  }
  return rawColorName;
};

interface ProductCardProps {
  product: Product;
  currency: Currency;
  language: Language;
  storeSettings: StoreSettings;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onOpenQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  language,
  storeSettings,
  isWishlisted,
  onToggleWishlist,
  onOpenQuickView,
  onAddToCart,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.fr;

  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || 'M');
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  const currentColor = product.colors?.[selectedColorIndex] || {
    name: 'Noir Profond',
    hex: '#111111',
    image: product.image,
  };

  const currentDisplayImage =
    isHovered && currentColor.secondaryImage
      ? currentColor.secondaryImage
      : currentColor.image || product.image;

  const isB2B = product.category === 'b2b';
  const displaySubtitle = getProductSubtitle(product, language);

  const getLocalizedName = (): string => {
    if (language === 'ar' && product.nameAr) return product.nameAr;
    if (language === 'en' && product.nameEn) return product.nameEn;
    if (language === 'es' && product.nameEs) return product.nameEs;
    return product.name;
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize, currentColor.name, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateProductWhatsAppUrl(
      product,
      selectedSize,
      currentColor.name,
      storeSettings.whatsappNumber
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="group relative bg-[#0D0D0D] border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col h-full rounded-sm overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Image Header */}
      <div 
        className="relative aspect-3/4 w-full bg-[#141414] overflow-hidden cursor-pointer"
        onClick={() => onOpenQuickView(product)}
      >
        <img
          src={currentDisplayImage}
          alt={getLocalizedName()}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="bg-white text-black text-[10px] font-mono tracking-wider font-bold px-2 py-0.5 uppercase shadow-sm">
              {product.badge}
            </span>
          )}
          {isB2B && (
            <span className="bg-amber-400 text-black text-[10px] font-mono font-bold px-2 py-0.5 uppercase flex items-center gap-1 shadow-sm">
              <Building2 className="w-3 h-3" />
              B2B / Gros
            </span>
          )}
          {product.isMadeInAlgeria && (
            <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-medium px-1.5 py-0.5 backdrop-blur-sm">
              🇩🇿 Atelier Blida
            </span>
          )}
        </div>

        {/* Action Buttons Top Right */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label="Ajouter aux favoris"
            className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
              isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-black/40 text-white/80 hover:bg-black/70 hover:text-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenQuickView(product);
            }}
            aria-label="Aperçu rapide"
            className="p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/70 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick View Strip on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden sm:flex items-center justify-center">
          <span className="text-[11px] font-mono text-white/90 tracking-wider uppercase font-semibold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            {t.quickView || 'Aperçu Rapide'}
          </span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Weight Indicator */}
          <div className="flex items-center justify-between text-[11px] text-white/40 font-mono mb-1">
            <span>{getCategoryLabel(product.category, language, storeSettings.customCategories)}</span>
            {product.weight && (
              <span className="flex items-center gap-1 text-white/50">
                <Layers className="w-3 h-3" />
                {product.weight}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onOpenQuickView(product)}
            className="text-sm font-semibold tracking-wide text-white hover:text-white/80 transition-colors line-clamp-1 cursor-pointer"
          >
            {getLocalizedName()}
          </h3>

          {/* Subtitle / Description */}
          {displaySubtitle && (
            <p className="text-xs text-white/50 line-clamp-1 mt-0.5 mb-2 font-light">
              {displaySubtitle}
            </p>
          )}

          {/* Color Switcher */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-2.5 mb-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {product.colors.map((color, idx) => (
                  <button
                    key={`${color.name}-${idx}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColorIndex(idx);
                    }}
                    title={formatColorName(color.name, language)}
                    className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                      selectedColorIndex === idx
                        ? 'border-white scale-125 shadow-sm shadow-white/30'
                        : 'border-white/20 hover:border-white/60'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-white/40 font-mono block mt-1 line-clamp-1">
                {formatColorName(currentColor.name, language)}
              </span>
            </div>
          )}

          {/* Size Pills */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mb-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  className={`px-1.5 py-0.5 text-[10px] font-mono border rounded transition-colors cursor-pointer ${
                    selectedSize === size
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
          {/* Price Block */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-mono font-bold text-white">
                {formatPrice(product.price, currency)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs font-mono text-white/40 line-through">
                  {formatPrice(product.originalPrice, currency)}
                </span>
              )}
            </div>

            {isB2B && product.minimumOrderQuantity && (
              <span className="text-[10px] font-mono text-amber-300">
                Min: {product.minimumOrderQuantity} pcs
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`py-2 px-2 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 rounded transition-all cursor-pointer ${
                justAdded
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white hover:bg-neutral-200 text-black'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{justAdded ? (t.added || 'Ajouté !') : (t.addToCart || 'Ajouter')}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              aria-label="Commander via WhatsApp"
              className="py-2 px-2 text-xs font-mono font-semibold bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center gap-1.5 rounded transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="truncate">{t.orderViaWhatsApp || 'WhatsApp'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
