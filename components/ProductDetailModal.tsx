import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scissors, 
  Ruler, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  MessageCircle,
  Building2,
  Layers, 
  Info, 
  Phone,
  SlidersHorizontal,
  Share2,
  ExternalLink,
  Trash2,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, Currency, CustomMeasurements, StoreSettings } from '../types';
import { formatPrice } from '../utils/format';
import { Language, TRANSLATIONS } from '../data/i18n';
import { REVIEWS } from '../data/products';
import { ProductWhatsAppModal } from './ProductWhatsAppModal';
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
    customPrice?: number
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

  // Strict multi-factor verified admin check:
  // Public/logged-out customers must NEVER be treated as admin.
  // Requires:
  // 1. Auth loading finished (!authLoading)
  // 2. Verified active Firebase user exists (currentUser)
  // 3. User holds confirmed admin permissions (authIsAdmin === true)
  // 4. If an explicit prop was supplied, it must not be false (propIsAdmin !== false)
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
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[1] || product?.sizes?.[0] || 'L');
  const [isMadeToMeasure, setIsMadeToMeasure] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'story' | 'b2b' | 'reviews'>('specs');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isCustomWhatsAppOpen, setIsCustomWhatsAppOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const images = Array.isArray(product?.images) && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'];

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIdx(0);
  }, [product?.id]);

  // Keyboard navigation for image slider
  useEffect(() => {
    if (!isOpen || !product || images.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, product, images.length]);

  // Handle touch swipes for image carousel on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && selectedImageIdx < images.length - 1) {
        setSelectedImageIdx((prev) => prev + 1);
      } else if (diff < 0 && selectedImageIdx > 0) {
        setSelectedImageIdx((prev) => prev - 1);
      }
    }
    setTouchStartX(null);
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: `${product.name} - DBC Clothing Workshop`,
      text: `${product.name} (${product.category}) - Confection artisanale algérienne.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert(isArabic ? 'تم نسخ الرابط إلى الحافظة' : 'Lien copié dans le presse-papiers !');
    }
  };

  if (!isOpen || !product) return null;

  const currentPrice = product.price;

  const handleAddToCartClick = () => {
    onAddToCart(
      product,
      selectedSize,
      selectedColorIdx,
      isMadeToMeasure,
      undefined,
      undefined,
      currentPrice
    );
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 900);
  };

  const directWhatsAppUrl = generateProductWhatsAppUrl({
    product,
    selectedColor: product.colors[selectedColorIdx]?.name,
    selectedSize,
    currentLanguage,
    whatsappNumber: storeSettings?.whatsappNumber || '+213550458812',
    isMadeToMeasure,
  });

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF8F5] border border-[#DDD4C5] rounded-lg max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E8E1D5] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#8C6D3B] font-semibold">
              {product.category} • DBC Atelier
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-1.5 hover:bg-[#F2EDE4] rounded-full text-[#6E6659] hover:text-[#1F1C19] transition-colors cursor-pointer"
              title={isArabic ? 'مشاركة هذا الموديل' : 'Partager cet article'}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="product-detail-close-btn"
              onClick={onClose}
              className="p-1.5 hover:bg-[#F2EDE4] rounded-full text-[#6E6659] hover:text-[#1F1C19] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Image Gallery & Badges (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              {/* Main Image View with aspect ratio & touch slider */}
              <div 
                className="relative aspect-4/5 w-full bg-[#EDE7DD] rounded-lg overflow-hidden border border-[#E2DAD0] select-none group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={images[selectedImageIdx] || images[0]}
                  alt={`${product.name} - Vue ${selectedImageIdx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />

                {/* Arrow navigators */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1F1C19] flex items-center justify-center shadow-md backdrop-blur-xs transition-opacity opacity-80 hover:opacity-100 cursor-pointer"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1F1C19] flex items-center justify-center shadow-md backdrop-blur-xs transition-opacity opacity-80 hover:opacity-100 cursor-pointer"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Badges on top of image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.gsm && (
                    <span className="px-2.5 py-1 bg-[#1F1C19]/85 text-[#EFE9DF] text-[10px] font-mono tracking-wider uppercase rounded-xs backdrop-blur-xs">
                      {product.gsm}
                    </span>
                  )}
                  {product.madeToMeasure && (
                    <span className="px-2 py-0.5 bg-[#C9A96E] text-[#1F1C19] text-[10px] font-mono font-bold tracking-wider uppercase rounded-xs shadow-xs">
                      Sur-Mesure
                    </span>
                  )}
                </div>

                {/* Image counter indicator */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-white text-[10px] font-mono rounded-full backdrop-blur-xs">
                    {selectedImageIdx + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails list */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`relative w-16 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                        selectedImageIdx === idx 
                          ? 'border-[#8C6D3B] scale-102 ring-1 ring-[#8C6D3B]/40' 
                          : 'border-[#E2DAD0] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Vignette ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Atelier Quality Highlights Card */}
              <div className="p-3.5 bg-white border border-[#E4DCCE] rounded text-xs space-y-2 text-[#544D42]">
                <div className="flex items-center gap-2 font-serif font-bold text-[#1F1C19]">
                  <ShieldCheck className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{t.atelierQuality}</span>
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-[#6E6659] list-disc list-inside">
                  <li>{t.craftsmanshipPromise}</li>
                  <li>{product.composition || '100% Coton peigné haut de gamme'}</li>
                  <li>{t.sewingDetails}</li>
                </ul>
              </div>

              {/* 58 Wilayas Fast Delivery Guarantee */}
              <div className="p-3 bg-[#FAF4EB] border border-[#E0D3BE] rounded text-xs text-[#6B5838] flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#8C6D3B] flex-shrink-0" />
                <div>
                  <span className="font-bold block">{t.delivery58Wilayas}</span>
                  <span className="text-[11px] text-amber-800">
                    Paiement en espèces à la livraison (Cash) ou par BaridiMob / CCP.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Customization & Purchasing (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Workshop Manager Actions (Edit / Delete this product) - Strictly Admin Only */}
                {isAdmin && (onDeleteProduct || onEditProduct) && (
                  <div className="p-2.5 bg-[#FAF7F2] border border-[#E4DCCE] rounded flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[#8C6D3B] font-semibold flex items-center gap-1.5">
                      <span>⚙️ {isArabic ? 'إدارة الموديل:' : 'Atelier DBC :'}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onEditProduct && (
                        <button
                          type="button"
                          id="product-detail-edit-btn"
                          onClick={() => {
                            if (!isAdmin) return;
                            onClose();
                            onEditProduct(product);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-[#F2EDE4] text-[#3D3730] border border-[#DDD4C5] rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs text-[11px]"
                          title="Modifier ce produit dans le gestionnaire"
                        >
                          <Edit2 className="w-3 h-3 text-[#8C6D3B]" />
                          <span>{isArabic ? 'تعديل' : 'Modifier'}</span>
                        </button>
                      )}
                      {onDeleteProduct && (
                        <button
                          type="button"
                          id="product-detail-delete-btn"
                          onClick={() => {
                            if (!isAdmin) return;
                            setShowDeleteConfirm(true);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs text-[11px]"
                          title={isArabic ? 'حذف هذا المنتج من الكتالوج' : 'Supprimer définitivement ce produit'}
                        >
                          <Trash2 className="w-3 h-3 text-rose-600" />
                          <span>{isArabic ? 'حذف المنتج' : 'Supprimer'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Header */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#8C6D3B] uppercase font-bold">
                    <span>{product.category}</span>
                    <span>{product.readyInDays || '24-48h pour envoi'}</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1C19] mt-1">
                    {product.name}
                  </h2>
                  {product.subtitle && (
                    <p className="text-xs text-[#6E6659] mt-0.5 font-sans">
                      {product.subtitle}
                    </p>
                  )}
                </div>

                {/* Price Display */}
                <div className="p-3.5 bg-white border border-[#E2DAD0] rounded space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#7C756B] block">
                        {t.atelierPrice}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-serif font-bold text-[#1F1C19]">
                          {formatPrice(currentPrice, currency)}
                        </span>
                        {product.b2bMinQty && (
                          <span className="text-xs font-mono text-[#8C6D3B]">
                            (Tarifs dégressifs dès {product.b2bMinQty} pièces)
                          </span>
                        )}
                      </div>
                    </div>
                    {product.madeToMeasure && (
                      <span className="text-[10px] font-mono text-[#8C6D3B] bg-[#FAF4EB] px-2 py-1 rounded border border-[#E8DCCB]">
                        Standard & Sur-Mesure
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#6E6659] font-sans flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Confection locale en Algérie avec finitions manuelles vérifiées</span>
                  </div>
                </div>

                {/* Color Selection */}
                {Array.isArray(product.colors) && product.colors.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#4A4338] font-bold block">
                      {t.colorSelect}: <span className="font-sans normal-case text-[#1F1C19]">{product.colors[selectedColorIdx]?.name}</span>
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((col, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedColorIdx(idx)}
                          className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                            selectedColorIdx === idx 
                              ? 'border-[#1F1C19] bg-[#1F1C19] text-white shadow-xs' 
                              : 'border-[#DDD4C5] bg-white text-[#3D3730] hover:border-[#8C6D3B]'
                          }`}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-black/20 flex-shrink-0"
                            style={{ backgroundColor: col.hex }} 
                          />
                          <span>{col.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-[#4A4338] font-bold">
                      {t.sizeSelect}: <span className="text-[#8C6D3B]">{selectedSize}</span>
                    </label>
                    <button
                      type="button"
                      onClick={onOpenSizeGuide}
                      className="text-xs font-mono text-[#8C6D3B] hover:text-[#5E4723] underline flex items-center gap-1 cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>{t.sizeGuideBtn}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {(product.sizes || ['S', 'M', 'L', 'XL', '2XL']).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setSelectedSize(sz);
                          setIsMadeToMeasure(false);
                        }}
                        className={`py-2 px-1 text-center font-mono text-xs rounded border transition-all cursor-pointer font-bold ${
                          selectedSize === sz && !isMadeToMeasure
                            ? 'bg-[#1F1C19] text-white border-[#1F1C19] shadow-xs'
                            : 'bg-white text-[#3D3730] border-[#DDD4C5] hover:border-[#8C6D3B]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Made to Measure Toggle (if available) */}
                {product.madeToMeasure && (
                  <div className="p-3 bg-[#FAF7F2] border border-[#E2DAD0] rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-[#8C6D3B]" />
                        <span className="text-xs font-mono uppercase font-bold text-[#1F1C19]">
                          {t.madeToMeasure}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        id="mtm-checkbox"
                        checked={isMadeToMeasure}
                        onChange={(e) => setIsMadeToMeasure(e.target.checked)}
                        className="w-4 h-4 accent-[#8C6D3B] cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-[#6E6659] leading-relaxed">
                      {t.madeToMeasureDesc}
                    </p>
                    {isMadeToMeasure && (
                      <div className="text-[11px] font-mono text-[#8C6D3B] bg-white p-2 rounded border border-[#E8DCCB]">
                        ✂️ {t.measurementsNotice}
                      </div>
                    )}
                  </div>
                )}

                {/* Tabs: Specifications / Atelier Story / B2B */}
                <div className="border-t border-[#E8E1D5] pt-3 space-y-2.5">
                  <div className="flex border-b border-[#E8E1D5] text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setActiveTab('specs')}
                      className={`pb-1.5 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                        activeTab === 'specs' 
                          ? 'border-[#8C6D3B] text-[#1F1C19]' 
                          : 'border-transparent text-[#7C756B] hover:text-[#1F1C19]'
                      }`}
                    >
                      {t.tabSpecs}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('story')}
                      className={`pb-1.5 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                        activeTab === 'story' 
                          ? 'border-[#8C6D3B] text-[#1F1C19]' 
                          : 'border-transparent text-[#7C756B] hover:text-[#1F1C19]'
                      }`}
                    >
                      {t.tabStory}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('b2b')}
                      className={`pb-1.5 px-3 border-b-2 font-semibold transition-colors cursor-pointer ${
                        activeTab === 'b2b' 
                          ? 'border-[#8C6D3B] text-[#1F1C19]' 
                          : 'border-transparent text-[#7C756B] hover:text-[#1F1C19]'
                      }`}
                    >
                      {t.tabB2B}
                    </button>
                  </div>

                  <div className="text-xs text-[#544D42] leading-relaxed font-sans min-h-[70px]">
                    {activeTab === 'specs' && (
                      <div className="space-y-1.5">
                        <p>{product.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-[#6E6659]">
                          <div>• Grammage: {product.gsm || 'Lourd 350-450 GSM'}</div>
                          <div>• Coupe: {product.cut || 'Oversize Streetwear'}</div>
                          <div>• Matière: {product.composition || '100% Coton peigné'}</div>
                          <div>• Confection: Algérie (Atelier DBC)</div>
                        </div>
                      </div>
                    )}
                    {activeTab === 'story' && (
                      <div className="space-y-1.5">
                        <p>{product.atelierStory || 'Chaque pièce est découpée, assemblée et vérifiée manuellement par nos artisans dans notre atelier en Algérie avec des coutures renforcées et une tenue de lavage irréprochable.'}</p>
                      </div>
                    )}
                    {activeTab === 'b2b' && (
                      <div className="space-y-1.5 bg-[#FAF4EB] p-2.5 rounded border border-[#E8DCCB]">
                        <div className="flex items-center gap-1.5 font-serif font-bold text-[#1F1C19]">
                          <Building2 className="w-4 h-4 text-[#8C6D3B]" />
                          <span>{t.b2bHeading}</span>
                        </div>
                        <p className="text-[11px]">{t.b2bNotice}</p>
                        <p className="text-[11px] font-mono text-[#8C6D3B]">
                          Quantité minimale: dès {product.b2bMinQty || 10} pièces. Sérigraphie & broderie sur demande.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Buttons: Add to Cart + WhatsApp Atelier Direct */}
              <div className="pt-3 border-t border-[#E8E1D5] space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    id="product-detail-add-to-cart-btn"
                    onClick={handleAddToCartClick}
                    className={`w-full py-3 px-4 font-mono text-xs uppercase tracking-wider rounded font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      addedSuccess 
                        ? 'bg-[#25D366] text-white' 
                        : 'bg-[#1F1C19] hover:bg-black text-white'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t.itemAdded}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                        <span>{t.addToCart}</span>
                      </>
                    )}
                  </button>

                  <a
                    id="product-detail-whatsapp-direct-btn"
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-mono text-xs tracking-wider rounded font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.orderViaWhatsApp}</span>
                  </a>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#7C756B] px-1">
                  <span>Paiement à la livraison • 58 Wilayas</span>
                  <button
                    type="button"
                    onClick={() => setIsCustomWhatsAppOpen(true)}
                    className="text-[#8C6D3B] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Personnaliser message WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Custom In-Modal Delete Confirmation - Strictly Admin Only */}
        {isAdmin && showDeleteConfirm && (
          <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg border border-[#DDD4C5] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-[#EAE3D5] flex items-center gap-3 bg-[#FAF8F5]">
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#1F1C19]">
                    {isArabic ? 'تأكيد حذف المنتج' : 'Supprimer ce produit ?'}
                  </h4>
                  <p className="text-[11px] text-[#7C756B] font-mono">
                    {product.name}
                  </p>
                </div>
              </div>

              <div className="p-4 text-xs text-[#4A4338] leading-relaxed space-y-2">
                <p>
                  {isArabic
                    ? 'هل أنت متأكد من رغبتك في حذف هذا المنتج من الكتالوج نهائياً؟'
                    : 'Voulez-vous vraiment retirer définitivement cet article du catalogue et de la boutique ?'}
                </p>
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-900 font-mono">
                  ⚠️ {isArabic ? 'سيتم حذف المنتج فوراً.' : 'Action immédiate et irréversible.'}
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] border-t border-[#EAE3D5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] text-[#3D3730] cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  id="confirm-detail-delete-btn"
                  onClick={() => {
                    if (!isAdmin) {
                      setShowDeleteConfirm(false);
                      return;
                    }
                    if (onDeleteProduct) {
                      onDeleteProduct(product.id);
                    }
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'نعم، حذف' : 'Oui, Supprimer'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom WhatsApp Greeting Modal for this viewed product */}
        <ProductWhatsAppModal
          product={product}
          isOpen={isCustomWhatsAppOpen}
          onClose={() => setIsCustomWhatsAppOpen(false)}
          selectedColor={product.colors[selectedColorIdx]?.name}
          selectedSize={selectedSize}
          isMadeToMeasure={isMadeToMeasure}
          storeSettings={storeSettings}
          currentLanguage={currentLanguage}
        />
      </div>
    </div>
  );
};
