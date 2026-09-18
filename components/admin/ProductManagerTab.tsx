import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Search, 
  Check, 
  X, 
  Upload, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, ProductColor, Currency } from '../../types';
import { formatPrice } from '../../utils/format';
import { saveProductToDb, deleteProductFromDb } from '../../services/db';
import { useAdminLanguage } from '../../context/AdminLanguageContext';
import { compressImageFile } from '../../utils/imageCompressor';

interface ProductManagerTabProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  currency: Currency;
  onOpenMediaTab?: () => void;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const PRESET_SAMPLE_IMAGES = [
  { label: 'Hoodie Noir Molleton', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Hoodie Beige Sable', url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Hoodie Gris Chiné', url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Jogger Molleton Noir', url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Tracksuit Ensemble', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Long Sleeve Waffle', url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Heavyweight Tee Drop', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80' },
];

export const ProductManagerTab: React.FC<ProductManagerTabProps> = ({
  products,
  onUpdateProduct,
  onDeleteProduct,
  currency,
  onOpenMediaTab,
}) => {
  const { t, isRtl, adminLang } = useAdminLanguage();
  const isArabic = adminLang === 'ar';

  // Navigation / View State: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [activeEditingProduct, setActiveEditingProduct] = useState<Product | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields for active editing / create
  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<'hoodies' | 'joggers' | 'longsleeves' | 'tees' | 'tracksuits' | 'outerwear'>('hoodies');
  const [formPrice, setFormPrice] = useState<number>(6500);
  const [formWholesalePrice, setFormWholesalePrice] = useState<number>(4500);
  const [formFabric, setFormFabric] = useState('100% Coton Molleton Lourd');
  const [formFabricWeight, setFormFabricWeight] = useState('420 GSM Molleton Gratté');
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formSizes, setFormSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [formColors, setFormColors] = useState<ProductColor[]>([
    { name: 'Noir / Black', hex: '#1C1C1C' },
    { name: 'Gris Chiné', hex: '#8F9398' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2A3E30');
  const [formInStock, setFormInStock] = useState(true);
  const [formStock, setFormStock] = useState<number>(50);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startCreate = () => {
    setActiveEditingProduct(null);
    setFormName('');
    setFormSubtitle('');
    setFormCategory('hoodies');
    setFormPrice(6500);
    setFormWholesalePrice(4500);
    setFormFabric('100% Coton Molleton Premium');
    setFormFabricWeight('420 GSM Molleton Gratté');
    setFormDescription('Confectionné dans notre atelier DBC en Algérie. Finitions renforcées et coupe contemporaine.');
    setFormImages([PRESET_SAMPLE_IMAGES[0].url]);
    setFormSizes(['S', 'M', 'L', 'XL', 'XXL']);
    setFormColors([
      { name: 'Noir / Black', hex: '#1C1C1C' },
      { name: 'Gris Chiné', hex: '#8F9398' },
    ]);
    setFormInStock(true);
    setFormStock(50);
    setFormIsPublished(true);
    setFormIsFeatured(false);
    setFormIsNew(true);
    setViewMode('create');
  };

  const startEdit = (product: Product) => {
    setActiveEditingProduct(product);
    setFormName(product.name);
    setFormSubtitle(product.subtitle || '');
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormWholesalePrice(product.wholesalePriceDzd || Math.round(product.price * 0.7));
    setFormFabric(product.fabric);
    setFormFabricWeight(product.fabricWeight || '380-450 GSM');
    setFormDescription(product.description);
    setFormImages(product.images && product.images.length > 0 ? [...product.images] : [PRESET_SAMPLE_IMAGES[0].url]);
    setFormSizes(product.sizes && product.sizes.length > 0 ? [...product.sizes] : ['M', 'L', 'XL']);
    setFormColors(product.colors && product.colors.length > 0 ? [...product.colors] : [{ name: 'Noir', hex: '#1C1C1C' }]);
    setFormInStock(product.inStock !== false);
    setFormStock(typeof product.stock === 'number' ? product.stock : 50);
    setFormIsPublished(product.isPublished !== false);
    setFormIsFeatured(!!product.isFeatured);
    setFormIsNew(!!product.isNew);
    setViewMode('edit');
  };

  const handleToggleSize = (size: string) => {
    setFormSizes((prev) => 
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setFormColors((prev) => [...prev, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const handleRemoveColor = (idx: number) => {
    setFormColors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (idx: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSlideImage = (idx: number, direction: -1 | 1) => {
    setFormImages((prev) => {
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsCompressingImage(true);
    try {
      // Compress to optimal web dimensions and < 180 KB for Firestore & LocalStorage safety
      const compressedDataUrl = await compressImageFile(file, 1200, 0.8);
      setFormImages((prev) => [...prev, compressedDataUrl]);
      showToast(isArabic ? 'تم ضغط وإضافة الصورة بنجاح' : 'Image optimisée et ajoutée avec succès');
    } catch (err) {
      console.warn('[ProductForm] Compression notice, falling back:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormImages((prev) => [...prev, event.target!.result as string]);
          showToast(t.prodToastSaved);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast(isArabic ? 'اسم المنتج مطلوب' : 'Le nom du produit est requis');
      return;
    }

    setIsSaving(true);
    try {
      const id = activeEditingProduct ? activeEditingProduct.id : `prod-${Date.now()}`;
      const finalImages = formImages.length > 0 ? formImages : [PRESET_SAMPLE_IMAGES[0].url];

      const productPayload: Product = {
        id,
        name: formName.trim(),
        subtitle: formSubtitle.trim(),
        category: formCategory,
        price: Number(formPrice) || 6000,
        wholesalePriceDzd: Number(formWholesalePrice) || 4500,
        minWholesaleQty: 6,
        description: formDescription.trim(),
        story: activeEditingProduct?.story || 'Confectionné par l’atelier DBC en Algérie.',
        fabric: formFabric.trim() || '100% Coton Premium',
        fabricWeight: formFabricWeight.trim() || '420 GSM Molleton',
        millOrigin: 'Atelier DBC Confection — Algérie',
        images: finalImages,
        sizes: formSizes.length > 0 ? formSizes : ['M', 'L', 'XL'],
        colors: formColors.length > 0 ? formColors : [{ name: 'Noir', hex: '#1C1C1C' }],
        details: activeEditingProduct?.details || [
          { label: 'Grammage', value: formFabricWeight.trim() || '420 GSM' },
          { label: 'Origine', value: 'Confection Algérie' },
        ],
        allowsMadeToMeasure: true,
        batchNumber: activeEditingProduct?.batchNumber || `DZ-${Date.now().toString().slice(-4)}`,
        readyInDays: '24-48h',
        careInstructions: activeEditingProduct?.careInstructions || ['Lavage à 30°C', 'Séchage à l’air libre'],
        inStock: formInStock,
        stock: Math.max(0, Number(formStock) || 0),
        isPublished: formIsPublished,
        isFeatured: formIsFeatured,
        isNew: formIsNew,
        isB2BAvailable: true,
      };

      await saveProductToDb(productPayload);
      onUpdateProduct(productPayload);
      showToast(t.prodToastSaved);
      setViewMode('list');
    } catch (err: any) {
      console.error('Error saving product:', err);
      const errMsg = err?.message || String(err);
      if (errMsg.includes('permission') || errMsg.includes('insufficient')) {
        showToast(isArabic ? 'صلاحيات غير كافية لحفظ المنتج في قاعدة البيانات' : 'Permissions insuffisantes pour enregistrer.');
      } else {
        showToast(isArabic ? 'حدث خطأ أثناء الحفظ. تأكد من صحة البيانات' : 'Erreur lors de l’enregistrement du produit.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!productToDelete) return;
    try {
      await deleteProductFromDb(productToDelete.id);
      onDeleteProduct(productToDelete.id);
      showToast(t.prodToastDeleted);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast(isArabic ? 'حدث خطأ أثناء الحذف' : 'Erreur lors de la suppression');
    }
  };

  const handleQuickTogglePublish = async (p: Product) => {
    const nextPublished = p.isPublished === false;
    const updated: Product = { ...p, isPublished: nextPublished };
    onUpdateProduct(updated);
    await saveProductToDb(updated);
    showToast(t.prodToastSaved);
  };

  const handleQuickToggleStock = async (p: Product) => {
    const nextInStock = p.inStock === false;
    const updated: Product = { ...p, inStock: nextInStock, stock: nextInStock && (p.stock ?? 0) === 0 ? 30 : p.stock };
    onUpdateProduct(updated);
    await saveProductToDb(updated);
    showToast(t.prodToastSaved);
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (publishFilter === 'published' && p.isPublished === false) return false;
    if (publishFilter === 'unpublished' && p.isPublished !== false) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-5 py-3 rounded-lg shadow-2xl border border-[#C9A96E] text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW: CREATE OR EDIT FORM */}
      {viewMode !== 'list' ? (
        <form onSubmit={handleSaveForm} className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D5]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 text-xs font-mono text-[#7C756B] hover:text-black cursor-pointer"
            >
              <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              <span>{t.prodBackToList}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono hover:bg-[#F2EDE4] cursor-pointer"
              >
                {t.prodFormCancelBtn}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono flex items-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#C9A96E]" />
                <span>{isSaving ? t.prodFormSavingBtn : t.prodFormSaveBtn}</span>
              </button>
            </div>
          </div>

          <h3 className="font-serif text-xl font-bold text-[#1F1C19]">
            {viewMode === 'create' ? t.prodCreateTitle : `${t.prodEditTitle} "${formName}"`}
          </h3>

          {/* General Information */}
          <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#1F1C19] border-b border-[#F0EBE1] pb-2">
              {isArabic ? 'المعلومات الأساسية' : 'Informations Générales'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {t.prodFormName} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Hoodie Lourd Molleton 450 GSM"
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {t.prodFormSubtitle}
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Ex: Coupe Boxy Oversize • Molleton Gratté"
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {t.prodFormCategory}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black bg-white"
                >
                  <option value="hoodies">Hoodies</option>
                  <option value="joggers">Joggers</option>
                  <option value="tracksuits">Tracksuits</option>
                  <option value="longsleeves">Longsleeves</option>
                  <option value="tees">T-shirts</option>
                  <option value="outerwear">Outerwear</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {t.prodFormB2CPrice} (DZD) *
                </label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {t.prodFormB2BPrice} (DZD)
                </label>
                <input
                  type="number"
                  value={formWholesalePrice}
                  onChange={(e) => setFormWholesalePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono text-[#8C6D3B] font-bold focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {t.prodFormFabric}
                </label>
                <input
                  type="text"
                  value={formFabric}
                  onChange={(e) => setFormFabric(e.target.value)}
                  placeholder="Ex: 100% Coton Peigné Molleton Lourd"
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {t.prodFormFabricWeight}
                </label>
                <input
                  type="text"
                  value={formFabricWeight}
                  onChange={(e) => setFormFabricWeight(e.target.value)}
                  placeholder="Ex: 420 GSM Molleton Gratté"
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                {t.prodFormDescription}
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Détails de confection, poches, cordons, confort..."
                className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-sans focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Stock & Publication Availability */}
          <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#1F1C19] border-b border-[#F0EBE1] pb-2">
              {t.prodFormVisibility}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {t.prodFormStockQuantity}
                </label>
                <input
                  type="number"
                  value={formStock}
                  onChange={(e) => setFormStock(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={formInStock}
                  onChange={(e) => setFormInStock(e.target.checked)}
                  className="w-4 h-4 text-black rounded"
                />
                <label htmlFor="inStockCheck" className="text-xs font-mono font-semibold cursor-pointer">
                  {t.prodFormInStockToggle}
                </label>
              </div>

              <div className="flex items-center gap-3 pt-5">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-4 h-4 text-black rounded"
                />
                <label htmlFor="publishedCheck" className="text-xs font-mono font-semibold cursor-pointer">
                  {t.prodFormPublishOnline}
                </label>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2 border-t border-[#F0EBE1]">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-black"
                />
                <span>{t.prodFormMarkFeatured}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
                <input
                  type="checkbox"
                  checked={formIsNew}
                  onChange={(e) => setFormIsNew(e.target.checked)}
                  className="w-4 h-4 rounded text-black"
                />
                <span>{t.prodFormMarkNew}</span>
              </label>
            </div>
          </div>

          {/* Sizes & Colors */}
          <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs space-y-4">
            <h4 className="font-serif text-sm font-bold text-[#1F1C19] border-b border-[#F0EBE1] pb-2">
              {isArabic ? 'المقاسات والألوان' : 'Tailles & Coloris'}
            </h4>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-mono text-[#7C756B] uppercase mb-2">
                {t.prodFormSizes}
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const isSelected = formSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleToggleSize(size)}
                      className={`px-3 py-1.5 rounded text-xs font-mono font-bold cursor-pointer transition-colors border ${
                        isSelected
                          ? 'bg-[#1F1D1A] text-white border-black'
                          : 'bg-white text-[#7C756B] border-[#DDD4C5] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {size} {isSelected ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div className="pt-2 border-t border-[#F0EBE1]">
              <label className="block text-xs font-mono text-[#7C756B] uppercase mb-2">
                {t.prodFormColors}
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {formColors.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF8F5] border border-[#DDD4C5] rounded-full text-xs font-mono"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(i)}
                      className="text-rose-500 hover:text-rose-700 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Nom couleur (ex: Noir, Vert Kaki...)"
                  className="px-3 py-1.5 border border-[#DDD4C5] rounded text-xs font-mono"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-9 h-8 p-0.5 border border-[#DDD4C5] rounded cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EAE3D5] text-[#1F1C19] border border-[#DDD4C5] rounded text-xs font-mono"
                >
                  {t.prodFormAddColorBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
              <h4 className="font-serif text-sm font-bold text-[#1F1C19]">
                {t.prodFormImages}
              </h4>
              {onOpenMediaTab && (
                <button
                  type="button"
                  onClick={onOpenMediaTab}
                  className="text-xs font-mono text-[#8C6D3B] hover:underline"
                >
                  {t.dashShortcutMedia} →
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formImages.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#DDD4C5] group bg-[#191715]">
                  <img src={imgUrl} alt={`Prod ${idx}`} className="w-full h-full object-cover" />
                  
                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 cursor-pointer shadow-xs"
                    title={t.prodDeleteBtn}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Primary / Cover Image Badge */}
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/75 text-white text-[9px] font-mono rounded backdrop-blur-xs z-10">
                      ★ {isArabic ? 'صورة الغلاف' : 'Image principale'}
                    </span>
                  )}

                  {/* Sliding Reorder Buttons (Move Left / Move Right) */}
                  <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between pointer-events-none z-10">
                    {idx > 0 ? (
                      <button
                        type="button"
                        onClick={() => handleSlideImage(idx, -1)}
                        className="p-1 bg-black/80 hover:bg-black text-white rounded pointer-events-auto backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
                        title={isArabic ? 'انزلاق لليسار (تقديم الترتيب)' : 'Glisser vers la gauche'}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    ) : <div />}

                    {idx < formImages.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => handleSlideImage(idx, 1)}
                        className="p-1 bg-black/80 hover:bg-black text-white rounded pointer-events-auto backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
                        title={isArabic ? 'انزلاق لليمين (تأخير الترتيب)' : 'Glisser vers la droite'}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : <div />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                disabled={isCompressingImage}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#DDD4C5] rounded text-xs font-mono flex items-center gap-1.5 disabled:opacity-50"
              >
                {isCompressingImage ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1F1C19]" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>
                  {isCompressingImage 
                    ? (isArabic ? 'جاري ضغط وتحسين الصورة...' : 'Compression & optimisation...') 
                    : t.prodFormAddImagePrompt}
                </span>
              </button>

              <div className="flex-1 flex gap-2 min-w-[240px]">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-1.5 border border-[#DDD4C5] rounded text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 bg-[#1F1D1A] text-white rounded text-xs font-mono"
                >
                  {t.prodFormAddUrlBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-5 py-2.5 border border-[#DDD4C5] rounded-lg text-xs font-mono hover:bg-[#F2EDE4]"
            >
              {t.prodFormCancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-2.5 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#C9A96E]" />
              <span>{isSaving ? t.prodFormSavingBtn : t.prodFormSaveBtn}</span>
            </button>
          </div>
        </form>
      ) : (
        /* VIEW: PRODUCT LIST */
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5]">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1F1C19] flex items-center gap-2">
                <span>{t.prodManagerTitle}</span>
              </h2>
              <p className="text-xs text-[#7C756B] font-mono mt-0.5">
                {t.prodManagerSubtitle} ({products.length})
              </p>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="px-4 py-2 bg-[#8C6D3B] hover:bg-[#72572D] text-white rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.prodNewProductBtn}</span>
            </button>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D5]">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#7C756B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.prodSearchPlaceholder}
                className="w-full bg-transparent text-xs font-mono placeholder-[#8C8377] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-[#DDD4C5] rounded px-2.5 py-1.5 text-xs text-[#1F1C19] focus:outline-none"
              >
                <option value="all">{t.prodCategoryFilterAll}</option>
                <option value="hoodies">Hoodies</option>
                <option value="joggers">Joggers</option>
                <option value="tracksuits">Tracksuits</option>
                <option value="longsleeves">Longsleeves</option>
                <option value="tees">T-shirts</option>
                <option value="outerwear">Outerwear</option>
              </select>

              <select
                value={publishFilter}
                onChange={(e) => setPublishFilter(e.target.value as any)}
                className="bg-white border border-[#DDD4C5] rounded px-2.5 py-1.5 text-xs text-[#1F1C19] focus:outline-none"
              >
                <option value="all">{t.prodStatusFilterAll}</option>
                <option value="published">{t.prodStatusFilterPublished}</option>
                <option value="unpublished">{t.prodStatusFilterUnpublished}</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-[#E2DAD0] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs font-mono`}>
                <thead className="bg-[#FAF8F5] border-b border-[#EAE3D5] text-[#7C756B] uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{t.prodTableProduct}</th>
                    <th className="py-3 px-4">{t.prodTableCategory}</th>
                    <th className="py-3 px-4">{t.prodTablePriceB2C}</th>
                    <th className="py-3 px-4">{t.prodTablePriceB2B}</th>
                    <th className="py-3 px-4 text-center">{t.prodTableStock}</th>
                    <th className="py-3 px-4 text-center">{t.prodTableStatus}</th>
                    <th className="py-3 px-4 text-center">{isArabic ? 'النشر' : 'Publication'}</th>
                    <th className={`py-3 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>{t.prodTableActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE3D5]">
                  {filteredProducts.map((p) => {
                    const isOutOfStock = p.inStock === false || (p.stock ?? 50) === 0;
                    const isPublished = p.isPublished !== false;

                    return (
                      <tr key={p.id} className="hover:bg-[#FCFAF8] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                              alt={p.name}
                              className="w-10 h-12 object-cover rounded border border-[#DDD4C5]"
                            />
                            <div>
                              <div className="font-semibold text-[#1F1C19] text-xs font-sans">{p.name}</div>
                              <div className="text-[10px] text-[#7C756B] mt-0.5">{p.fabric}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 uppercase text-[#8C6D3B] font-bold text-[10px]">
                          {p.category}
                        </td>

                        <td className="py-3 px-4 font-bold text-[#1F1C19]">
                          {formatPrice(p.price, currency)}
                        </td>

                        <td className="py-3 px-4 text-[#7C756B]">
                          {p.wholesalePriceDzd ? formatPrice(p.wholesalePriceDzd, currency) : '—'}
                        </td>

                        <td className="py-3 px-4 text-center font-bold">
                          {p.stock ?? 50}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleQuickToggleStock(p)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              isOutOfStock
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                            title={isOutOfStock ? t.invMarkInStock : t.invMarkOutOfStock}
                          >
                            {isOutOfStock ? t.prodOutOfStock : t.prodInStock}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleQuickTogglePublish(p)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                              isPublished
                                ? 'bg-[#FAF8F5] text-black border border-[#DDD4C5]'
                                : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                            }`}
                            title={isPublished ? t.prodPublished : t.prodDraft}
                          >
                            {isPublished ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-zinc-400" />}
                            <span>{isPublished ? t.prodPublished : t.prodDraft}</span>
                          </button>
                        </td>

                        <td className={`py-3 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                          <div className={`flex items-center ${isRtl ? 'justify-start' : 'justify-end'} gap-1.5`}>
                            <button
                              type="button"
                              onClick={() => startEdit(p)}
                              className="p-1.5 text-[#1F1C19] hover:bg-[#F2EDE4] rounded transition-colors"
                              title={t.prodEditBtn}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title={t.prodDeleteBtn}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#DDD4C5] shadow-2xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-serif text-base font-bold text-[#1F1C19]">
                {t.prodDeleteConfirmTitle}
              </h4>
            </div>
            <p className="text-xs text-[#7C756B] font-mono leading-relaxed">
              {t.prodDeleteConfirmDesc(productToDelete.name)}
            </p>
            <div className={`flex items-center ${isRtl ? 'justify-start' : 'justify-end'} gap-2 pt-2`}>
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-3 py-1.5 border border-[#DDD4C5] rounded text-xs font-mono hover:bg-[#F2EDE4]"
              >
                {t.prodDeleteCancelBtn}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-mono hover:bg-rose-700"
              >
                {t.prodDeleteActionBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
