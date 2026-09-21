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

  // Strict verified admin check: public/logged-out visitors are ALWAYS false
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
  const [quantity, setQuantity] = useState<number>(1);
  const [isMadeToMeasure, setIsMadeToMeasure] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'story' | 'b2b' | 'reviews'>('specs');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isCustomWhatsAppOpen, setIsCustomWhatsAppOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const images = Array.isArray(product?.images) && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80'];

  // Reset selected image and quantity when product changes
  useEffect(() => {
    setSelectedImageIdx(0);
    setQuantity(1);
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
    if (diffX > 35) {
      handleNextImage();
    } else if (diffX < -35) {
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  // Custom measurements state
  const [measurements, setMeasurements] = useState<CustomMeasurements>({
    chest: 104,
    waist: 86,
    sleeve: 64,
    inseam: 80,
    fitPreference: 'tailored',
    specialNotes: '',
  });

  if (!isOpen || !product) return null;

  const unitPrice = product.price;
  const productReviews = REVIEWS.filter((r) => r.productId === product.id);

  const handleAdd = () => {
    onAddToCart(
      product,
      isMadeToMeasure ? 'Sur-Mesure (M2M)' : selectedSize,
      selectedColorIdx,
      isMadeToMeasure,
      isMadeToMeasure ? measurements : undefined,
      undefined,
      unitPrice,
      quantity
    );

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 700);
  };

  const handleWhatsAppOrder = () => {
    const selectedColor = product.colors[selectedColorIdx]?.name || 'Standard';
    const url = generateProductWhatsAppUrl(product, storeSettings, {
      selectedColor,
      selectedSize,
      quantity,
      isMadeToMeasure,
      currency,
      language: currentLanguage,
      intent: 'order',
    });
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-[#FAF8F5] rounded border border-[#DCD4C7] shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#1F1D1A] text-white border-b border-[#3B352E]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#C9A96E] uppercase font-bold">
              DBC Workshop Confection Algérie
            </span>
            <span className="text-[#68625B]">•</span>
            <span className="text-xs font-mono text-[#B3AAA0]">
              {product.fabricWeight || 'Heavyweight Fleece'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Left Column: Product Gallery (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Main Photo Gallery with Sliding Buttons & Gestures */}
              <div 
                className="relative aspect-[4/5] bg-[#F2EDE4] rounded overflow-hidden border border-[#E0D7C9] select-none group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  key={selectedImageIdx}
                  src={images[selectedImageIdx] || images[0]}
                  alt={`${product.name} - Photo ${selectedImageIdx + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Sliding Buttons (Left & Right) */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      id="product-detail-modal-prev-btn"
                      onClick={handlePrevImage}
                      aria-label="Image précédente"
                      title="Image précédente (Touche flèche gauche)"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1F1D1A] shadow-lg border border-[#DDD4C5] flex items-center justify-center backdrop-blur-xs transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-20"
                    >
                      <ChevronLeft className="w-5 h-5 text-[#1F1D1A]" />
                    </button>

                    <button
                      type="button"
                      id="product-detail-modal-next-btn"
                      onClick={handleNextImage}
                      aria-label="Image suivante"
                      title="Image suivante (Touche flèche droite)"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1F1D1A] shadow-lg border border-[#DDD4C5] flex items-center justify-center backdrop-blur-xs transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-20"
                    >
                      <ChevronRight className="w-5 h-5 text-[#1F1D1A]" />
                    </button>

                    {/* Image Counter Badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#1F1D1A]/85 text-white font-mono text-xs rounded backdrop-blur-xs flex items-center gap-1.5 z-10 shadow-xs">
                      <span>{selectedImageIdx + 1} / {images.length}</span>
                    </div>

                    {/* Slide Indicator Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-black/45 backdrop-blur-xs rounded-full z-20">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIdx(idx)}
                          aria-label={`Aller à la photo ${idx + 1}`}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            selectedImageIdx === idx 
                              ? 'w-5 h-1.5 bg-white shadow-xs' 
                              : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Tags */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 bg-[#1F1D1A]/90 text-white font-mono text-[10px] rounded uppercase font-bold">
                    {product.fabricWeight || 'Heavyweight Fleece'}
                  </span>
                  {product.isB2BAvailable && (
                    <span className="px-2.5 py-1 bg-white/90 text-[#8C6D3B] font-mono text-[10px] rounded uppercase font-bold border border-[#DDD4C5]">
                      Vente B2B & B2C
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`w-16 h-20 rounded overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                        selectedImageIdx === idx ? 'border-[#1F1D1A] scale-105' : 'border-[#DDD4C5] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* 58 Wilayas Delivery Banner */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded flex items-center gap-3 text-xs text-amber-900">
                <Truck className="w-5 h-5 text-amber-700 flex-shrink-0" />
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
                {/* Workshop Manager Actions (Edit / Delete this product) - Admin Only */}
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
                        {t.b2cPrice} (Détail)
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-bold text-[#1F1C19]">
                        {formatPrice(unitPrice, currency, isArabic)}
                      </span>
                    </div>

                    {product.wholesalePriceDzd && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-[#8C6D3B] block font-bold">
                          {t.b2bWholesalePrice}
                        </span>
                        <span className="font-mono text-lg font-bold text-[#8C6D3B]">
                          {formatPrice(product.wholesalePriceDzd, currency, isArabic)}
                        </span>
                        <span className="text-[10px] font-mono text-[#7C756B] block">
                          {t.minWholesaleQty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="uppercase text-[#615A4F] font-bold">{t.selectColor} :</span>
                    <span className="text-[#1F1C19] font-semibold">
                      {product.colors[selectedColorIdx]?.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColorIdx(idx)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono transition-all cursor-pointer ${
                          selectedColorIdx === idx
                            ? 'bg-[#1F1D1A] text-white border-black font-bold shadow-xs'
                            : 'bg-white text-[#4A4338] border-[#DDD4C5] hover:bg-[#F2EDE4]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="uppercase text-[#615A4F] font-bold">{t.selectSize} :</span>
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-[#8C6D3B] underline hover:text-black flex items-center gap-1 cursor-pointer text-[11px]"
                    >
                      <Ruler className="w-3 h-3" />
                      <span>Guide des tailles</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setIsMadeToMeasure(false);
                        }}
                        className={`min-w-[48px] py-2 px-3 text-xs font-mono rounded border transition-colors cursor-pointer ${
                          selectedSize === size && !isMadeToMeasure
                            ? 'bg-[#1F1D1A] text-white border-black font-bold'
                            : 'bg-white text-[#4A4338] border-[#DDD4C5] hover:bg-[#F2EDE4]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="uppercase text-[#615A4F] font-bold">
                      {isArabic ? 'الكمية :' : 'Quantité :'}
                    </span>
                    <span className="text-[#8C6D3B] font-semibold">
                      {quantity} {quantity > 1 ? (isArabic ? 'قطع' : 'pièces') : (isArabic ? 'قطعة' : 'pièce')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center border border-[#DDD4C5] rounded bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        id="product-detail-qty-minus"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-base font-bold text-[#1F1C19] hover:bg-[#F2EDE4] active:bg-[#E8DFD1] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed select-none"
                        aria-label="Diminuer la quantité"
                      >
                        -
                      </button>
                      <span className="w-12 h-9 flex items-center justify-center font-mono font-bold text-sm text-[#1F1C19] border-x border-[#DDD4C5] select-none">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        id="product-detail-qty-plus"
                        onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                        className="w-9 h-9 flex items-center justify-center text-base font-bold text-[#1F1C19] hover:bg-[#F2EDE4] active:bg-[#E8DFD1] transition-colors cursor-pointer select-none"
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                    {quantity > 1 && (
                      <span className="text-xs font-mono text-[#6E6659]">
                        Total : <strong className="text-[#1F1C19]">{formatPrice(unitPrice * quantity, currency, isArabic)}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabs: Specifications & Wholesale */}
                <div className="pt-2">
                  <div className="flex border-b border-[#E2DAD0] text-xs font-mono">
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`pb-2 px-3 uppercase tracking-wider cursor-pointer ${
                        activeTab === 'specs' ? 'border-b-2 border-black font-bold text-black' : 'text-[#7C756B]'
                      }`}
                    >
                      Fiche Technique
                    </button>
                    <button
                      onClick={() => setActiveTab('b2b')}
                      className={`pb-2 px-3 uppercase tracking-wider cursor-pointer ${
                        activeTab === 'b2b' ? 'border-b-2 border-black font-bold text-[#8C6D3B]' : 'text-[#7C756B]'
                      }`}
                    >
                      Tarifs Gros B2B
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`pb-2 px-3 uppercase tracking-wider cursor-pointer ${
                        activeTab === 'reviews' ? 'border-b-2 border-black font-bold text-black' : 'text-[#7C756B]'
                      }`}
                    >
                      Avis ({productReviews.length})
                    </button>
                  </div>

                  <div className="pt-3 text-xs text-[#5C554B]">
                    {activeTab === 'specs' && (
                      <div className="space-y-2">
                        <p className="leading-relaxed font-sans">{product.description}</p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="p-2 bg-white rounded border border-[#E2DAD0]">
                            <span className="text-[10px] font-mono text-[#7C756B] block">Matière :</span>
                            <span className="font-semibold text-[#1F1C19]">{product.fabric}</span>
                          </div>
                          <div className="p-2 bg-white rounded border border-[#E2DAD0]">
                            <span className="text-[10px] font-mono text-[#7C756B] block">Confection :</span>
                            <span className="font-semibold text-[#1F1C19]">{product.millOrigin}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'b2b' && (
                      <div className="space-y-2 p-3 bg-amber-50/60 rounded border border-amber-200/70">
                        <div className="flex items-center gap-2 font-bold text-amber-950 font-serif">
                          <Building2 className="w-4 h-4 text-[#8C6D3B]" />
                          <span>Offre Spéciale Magasins & Boutiques (B2B)</span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          • Tarif préférentiel de <strong>{formatPrice(product.wholesalePriceDzd || Math.round(product.price * 0.7), currency, isArabic)}</strong> par pièce dès 6 unités.
                        </p>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          • Possibilité de mixer les tailles (S à 3XL) et couleurs selon vos stocks.
                        </p>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          • Personnalisation avec étiquettes ou broderie sur commande industrielle.
                        </p>
                      </div>
                    )}

                    {activeTab === 'reviews' && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {productReviews.length > 0 ? (
                          productReviews.map((rev) => (
                            <div key={rev.id} className="p-2.5 bg-white border border-[#E2DAD0] rounded space-y-1">
                              <div className="flex justify-between font-mono text-[11px]">
                                <span className="font-bold text-[#1F1C19]">{rev.author} - {rev.location}</span>
                                <span className="text-amber-600">★★★★★</span>
                              </div>
                              <p className="font-serif text-xs font-semibold text-[#1F1C19]">{rev.title}</p>
                              <p className="text-[11px] text-[#6E6659]">{rev.comment}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[#7C756B] text-[11px]">Aucun avis pour le moment.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#DDD4C5] space-y-2.5">
                <div className="flex items-center gap-2">
                  <button
                    id="product-detail-add-cart-btn"
                    onClick={handleAdd}
                    className={`flex-1 py-3 px-4 font-mono text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      addedSuccess ? 'bg-emerald-700 text-white' : 'bg-[#1F1D1A] hover:bg-[#3D3730] text-white'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Ajouté au panier !</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                        <span>{t.addToCart} • {formatPrice(unitPrice * quantity, currency, isArabic)}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-semibold rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95"
                    title="Commander directement via WhatsApp avec ce modèle"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>

                {/* Custom WhatsApp Greeting Link Bar */}
                <div className="p-2.5 bg-[#F4F9F5] border border-[#CDE5D4] rounded-md flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="truncate">
                      <span className="text-[11px] font-mono font-bold text-[#14532D] block truncate">
                        {isArabic ? 'رابط واتساب ذكي ومجهز للمنتج' : 'Lien WhatsApp personnalisé'}
                      </span>
                      <span className="text-[10px] text-[#2C6E49] hidden sm:block">
                        {isArabic 
                          ? 'رسالة جاهزة بالموديل، المقاس، اللون وسعر الدينار' 
                          : 'Modèle auto-rempli avec taille, couleur, réf et wilaya'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCustomWhatsAppOpen(true)}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#EAF5EE] text-[#14532D] border border-[#B1D8BD] rounded text-[11px] font-mono font-semibold flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs transition-colors"
                  >
                    <SlidersHorizontal className="w-3 h-3 text-[#25D366]" />
                    <span>{isArabic ? 'تخصيص الرسالة' : 'Personnaliser'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom In-Modal Delete Confirmation - Admin Only */}
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
          currency={currency}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
        />
      </div>
    </div>
  );
};
