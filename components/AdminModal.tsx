import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Image as ImageIcon, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  Check, 
  Layers, 
  RotateCcw,
  Sliders,
  DollarSign,
  Upload,
  HelpCircle,
  ExternalLink,
  Info,
  CheckCircle2,
  ImagePlus,
  PackagePlus,
  Search,
  Globe,
  Share2,
  Tag,
  Eye,
  AlertCircle,
  Truck,
  AlertTriangle,
  CheckSquare,
  Square
} from 'lucide-react';
import { Product, StoreSettings, ProductColor, Order, Currency } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';
import { formatPrice } from '../utils/format';
import { OrderManagerTab } from './admin/OrderManagerTab';
import { DeliveryManagerTab } from './admin/DeliveryManagerTab';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProducts?: (products: Product[]) => void;
  onSaveProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onClearProducts?: () => void;
  onLoadSamples?: () => void;
  storeSettings: StoreSettings;
  onSaveSettings?: (settings: StoreSettings) => void;
  onUpdateStoreSettings?: (settings: Partial<StoreSettings>) => void;
  onResetToDefaults?: () => void;
  onResetDefaults?: () => void;
  currentLanguage: Language;
  currency?: Currency;
  initialTab?: 'products' | 'orders' | 'delivery' | 'contact' | 'hero' | 'seo';
  initialProductToEdit?: Product | null;
  orders?: Order[];
  onUpdateOrder?: (updatedOrder: Order) => void;
  onUpdateOrders?: (allOrders: Order[]) => void;
  onOpenCustomerTracking?: (orderNumber: string) => void;
}

const POPULAR_SEO_TAGS = [
  'confection textile algérie',
  'atelier vêtements alger',
  'grossiste hoodie algérie',
  'survêtement sur mesure',
  'b2b textile algérie',
  'livraison 69 wilayas',
  'vêtements gros alger',
  'streetwear algérie',
  'jogging molleton algerie',
  't-shirt oversize alger',
  'baridimob livraison',
  'atelier dbc alger',
];

const PRESET_SAMPLE_IMAGES = [
  { label: 'Hoodie Noir Molleton', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Hoodie Beige Sable', url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Hoodie Gris Chiné', url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Jogger Molleton Noir', url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Jogger Cargo Gris', url: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Tracksuit Ensemble', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Long Sleeve Waffle', url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Heavyweight Tee Drop', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80' },
];

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProducts,
  onSaveProduct,
  onDeleteProduct,
  onClearProducts,
  onLoadSamples,
  storeSettings,
  onSaveSettings,
  onUpdateStoreSettings,
  onResetToDefaults,
  onResetDefaults,
  currentLanguage,
  currency = 'DZD',
  initialTab = 'products',
  initialProductToEdit = null,
  orders = [],
  onUpdateOrder,
  onUpdateOrders,
  onOpenCustomerTracking,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'delivery' | 'contact' | 'hero' | 'seo'>(initialTab);
  const [showHowToGuide, setShowHowToGuide] = useState(false);

  // File upload ref & state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingHero, setIsDraggingHero] = useState(false);

  // Contact & SEO settings state
  const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...storeSettings });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [heroSavedToast, setHeroSavedToast] = useState(false);
  const [seoSavedToast, setSeoSavedToast] = useState(false);

  // Product Deletion State & Confirmation Dialogs (No window.confirm!)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTempSettings({ ...storeSettings });
      setActiveTab(initialTab);
      if (initialProductToEdit) {
        startEditProduct(initialProductToEdit);
      }
    }
  }, [isOpen, initialTab, initialProductToEdit]);

  // Product editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form fields for product
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodCategory, setProdCategory] = useState<'hoodies' | 'joggers' | 'longsleeves' | 'tees' | 'tracksuits' | 'outerwear'>('hoodies');
  const [prodPrice, setProdPrice] = useState<number>(6500);
  const [prodWholesalePrice, setProdWholesalePrice] = useState<number>(4500);
  const [prodFabric, setProdFabric] = useState('100% Coton Molleton Lourd');
  const [prodFabricWeight, setProdFabricWeight] = useState('Heavyweight Fleece');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [prodSizes, setProdSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [prodColors, setProdColors] = useState<ProductColor[]>([
    { name: 'Noir / Black', hex: '#1C1C1C' },
    { name: 'Gris Chiné / Heather Grey', hex: '#8F9398' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2A3E30');

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const startEditProduct = (prod: Product) => {
    setIsCreatingNew(false);
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdSubtitle(prod.subtitle || '');
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdWholesalePrice(prod.wholesalePriceDzd || Math.round(prod.price * 0.7));
    setProdFabric(prod.fabric);
    setProdFabricWeight(prod.fabricWeight);
    setProdDescription(prod.description);
    setProdImages([...prod.images]);
    setProdSizes([...prod.sizes]);
    setProdColors([...prod.colors]);
  };

  const startCreateNewProduct = () => {
    setIsCreatingNew(true);
    setEditingProduct(null);
    setProdName('');
    setProdSubtitle('');
    setProdCategory('hoodies');
    setProdPrice(6500);
    setProdWholesalePrice(4500);
    setProdFabric('100% Coton Brossé de Qualité Supérieure');
    setProdFabricWeight('Premium Fleece');
    setProdDescription('Confectionné dans notre atelier DBC en Algérie. Coupe soignée, tissu durable et finitions de haute qualité.');
    setProdImages([PRESET_SAMPLE_IMAGES[0].url]);
    setProdSizes(['S', 'M', 'L', 'XL', 'XXL']);
    setProdColors([
      { name: 'Noir / Black', hex: '#1C1C1C' },
      { name: 'Gris Chiné / Heather Grey', hex: '#8F9398' },
    ]);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    if (isCreatingNew) {
      const newProd: Product = {
        id: `custom-prod-${Date.now()}`,
        name: prodName,
        subtitle: prodSubtitle,
        category: prodCategory,
        price: Number(prodPrice) || 6000,
        wholesalePriceDzd: Number(prodWholesalePrice) || 4000,
        minWholesaleQty: 6,
        description: prodDescription,
        story: 'Confectionné par l’atelier DBC en Algérie avec du tissu certifié.',
        fabric: prodFabric,
        fabricWeight: prodFabricWeight,
        millOrigin: 'Atelier DBC Confection — Algérie',
        images: prodImages.length > 0 ? prodImages : [PRESET_SAMPLE_IMAGES[0].url],
        sizes: prodSizes.length > 0 ? prodSizes : ['M', 'L', 'XL'],
        colors: prodColors.length > 0 ? prodColors : [{ name: 'Noir', hex: '#1A1A1A' }],
        details: [
          { label: 'Grammage', value: prodFabricWeight },
          { label: 'Type de vente', value: 'Disponible au détail et en gros (B2B & B2C)' },
        ],
        allowsMadeToMeasure: true,
        batchNumber: `DZ-${Date.now().toString().slice(-4)}`,
        readyInDays: '24-48h',
        careInstructions: ['Lavage à 30°C', 'Séchage à l’air libre'],
        isFeatured: true,
        isNew: true,
        isWinterFocus: false,
        isB2BAvailable: true,
      };
      if (onSaveProduct) {
        onSaveProduct(newProd);
      } else if (onSaveProducts) {
        onSaveProducts([newProd, ...products]);
      }
    } else if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: prodName,
        subtitle: prodSubtitle,
        category: prodCategory,
        price: Number(prodPrice),
        wholesalePriceDzd: Number(prodWholesalePrice),
        fabric: prodFabric,
        fabricWeight: prodFabricWeight,
        description: prodDescription,
        images: prodImages.length > 0 ? prodImages : editingProduct.images,
        sizes: prodSizes,
        colors: prodColors,
      };

      if (onSaveProduct) {
        onSaveProduct(updatedProduct);
      } else if (onSaveProducts) {
        onSaveProducts(products.map((p) => (p.id === editingProduct.id ? updatedProduct : p)));
      }
    }

    setEditingProduct(null);
    setIsCreatingNew(false);
  };

  const handleDeleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setProductToDelete(prod);
    } else {
      executeDeleteProduct(id);
    }
  };

  const executeDeleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id) || productToDelete;
    const targetName = target ? target.name : 'Produit';

    if (onDeleteProduct) {
      onDeleteProduct(id);
    } else if (onSaveProducts) {
      onSaveProducts(products.filter((p) => p.id !== id));
    }

    if (editingProduct?.id === id) {
      setEditingProduct(null);
      setIsCreatingNew(false);
    }

    setSelectedProductIds((prev) => prev.filter((item) => item !== id));
    setProductToDelete(null);

    setDeleteSuccessToast(
      isArabic
        ? `تم حذف "${targetName}" بنجاح من الكتالوج.`
        : `Le modèle "${targetName}" a été retiré du catalogue.`
    );
    setTimeout(() => setDeleteSuccessToast(null), 3500);
  };

  const executeBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    const count = selectedProductIds.length;

    if (onSaveProducts) {
      onSaveProducts(products.filter((p) => !selectedProductIds.includes(p.id)));
    } else if (onDeleteProduct) {
      selectedProductIds.forEach((id) => onDeleteProduct(id));
    }

    if (editingProduct && selectedProductIds.includes(editingProduct.id)) {
      setEditingProduct(null);
      setIsCreatingNew(false);
    }

    setSelectedProductIds([]);
    setShowBulkDeleteConfirm(false);

    setDeleteSuccessToast(
      isArabic
        ? `تم حذف ${count} منتج بنجاح من الكتالوج.`
        : `${count} produits ont été supprimés avec succès.`
    );
    setTimeout(() => setDeleteSuccessToast(null), 3500);
  };

  const handleResetCatalog = () => {
    setShowResetConfirm(true);
  };

  const toggleSize = (size: string) => {
    if (prodSizes.includes(size)) {
      setProdSizes(prodSizes.filter((s) => s !== size));
    } else {
      setProdSizes([...prodSizes, size]);
    }
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    setProdColors([...prodColors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName('');
  };

  const removeColor = (idx: number) => {
    setProdColors(prodColors.filter((_, i) => i !== idx));
  };

  const addImageUrl = (url?: string) => {
    const toAdd = url || newImageUrl;
    if (!toAdd.trim()) return;
    setProdImages([...prodImages, toAdd.trim()]);
    setNewImageUrl('');
  };

  const removeImageUrl = (idx: number) => {
    setProdImages(prodImages.filter((_, i) => i !== idx));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setProdImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setProdImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveContactSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings(tempSettings);
    } else if (onSaveSettings) {
      onSaveSettings(tempSettings);
    }
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const newUrl = event.target.result as string;
        setTempSettings((prev) => ({ ...prev, heroImage: newUrl }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleHeroDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingHero(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        const newUrl = event.target.result as string;
        setTempSettings((prev) => ({ ...prev, heroImage: newUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveHeroImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings(tempSettings);
    } else if (onSaveSettings) {
      onSaveSettings(tempSettings);
    }
    setHeroSavedToast(true);
    setTimeout(() => setHeroSavedToast(false), 2500);
  };

  const handleSaveSeoSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onUpdateStoreSettings) {
      onUpdateStoreSettings(tempSettings);
    } else if (onSaveSettings) {
      onSaveSettings(tempSettings);
    }
    setSeoSavedToast(true);
    setTimeout(() => setSeoSavedToast(false), 3000);
  };

  const handleApplyRecommendedSeo = () => {
    setTempSettings((prev) => ({
      ...prev,
      seoTitle: `${prev.storeName || 'DBC Workshop'} | Atelier de Confection Textile & Vêtements Algérie`,
      seoDescription: 'Atelier de confection textile en Algérie spécialisé dans les hoodies lourds, joggings, t-shirts épais et confection sur-mesure. Vente en gros B2B & détail B2C avec livraison dans les 69 wilayas.',
      seoKeywords: 'confection textile algérie, atelier vêtements alger, grossiste hoodie algérie, survêtement sur mesure, b2b textile algerie, livraison 69 wilayas, vêtements gros alger, streetwear algérie, atelier dbc',
      seoAuthor: prev.storeName || 'DBC Workshop Algérie',
      ogImage: prev.ogImage || prev.heroImage || PRESET_SAMPLE_IMAGES[0].url,
      canonicalUrl: prev.canonicalUrl || 'https://dbcworkshop.dz',
    }));
  };

  const handleToggleKeyword = (keyword: string) => {
    const current = (tempSettings.seoKeywords || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const exists = current.some((k) => k.toLowerCase() === keyword.toLowerCase());
    let updated: string[];
    if (exists) {
      updated = current.filter((k) => k.toLowerCase() !== keyword.toLowerCase());
    } else {
      updated = [...current, keyword];
    }
    setTempSettings((prev) => ({
      ...prev,
      seoKeywords: updated.join(', '),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F1D1A] text-white border-b border-[#3B352E]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#C9A96E]" />
            <div>
              <h2 className="font-serif text-lg font-medium tracking-wide">
                {t.adminTitle}
              </h2>
              <p className="text-[11px] font-mono text-[#B3AAA0]">
                {isArabic ? 'إدارة كتالوج المنتجات، الصور، الأسعار، المقاسات والألوان' : 'Gestion du catalogue, photos, prix DZD, tailles, couleurs & coordonnées'}
              </p>
            </div>
          </div>
          <button
            id="close-admin-panel-btn"
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#F2EDE4] border-b border-[#DDD4C5]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('products');
                setEditingProduct(null);
                setIsCreatingNew(false);
              }}
              className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer ${
                activeTab === 'products' ? 'bg-[#1F1D1A] text-white' : 'bg-white text-[#4A4338] border border-[#DDD4C5]'
              }`}
            >
              📦 {isArabic ? `المنتجات (${products.length})` : `Produits (${products.length})`}
            </button>
            <button
              onClick={() => {
                setActiveTab('orders');
                setEditingProduct(null);
                setIsCreatingNew(false);
              }}
              className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'bg-[#1F1D1A] text-white' : 'bg-white text-[#4A4338] border border-[#DDD4C5]'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>{isArabic ? `تتبع الطلبيات (${orders.length})` : `Suivi Commandes (${orders.length})`}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('delivery');
                setEditingProduct(null);
                setIsCreatingNew(false);
              }}
              className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'delivery' ? 'bg-[#1F1D1A] text-white' : 'bg-white text-[#4A4338] border border-[#DDD4C5]'
              }`}
            >
              <span>🏢 {isArabic ? 'الشركات والأسعار' : 'Tarifs & Transporteurs'}</span>
            </button>
            <button
              onClick={() => setActiveTab('hero')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hero' ? 'bg-[#1F1D1A] text-white' : 'bg-white text-[#4A4338] border border-[#DDD4C5]'
              }`}
            >
              <ImagePlus className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>🖼️ {isArabic ? 'الصورة الرئيسية' : 'Hero'}</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer ${
                activeTab === 'contact' ? 'bg-[#1F1D1A] text-white' : 'bg-white text-[#4A4338] border border-[#DDD4C5]'
              }`}
            >
              📞 {isArabic ? 'معلومات الاتصال والدفع' : 'Contact & Paiement'}
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'seo' ? 'bg-[#1F1D1A] text-white' : 'bg-white text-[#4A4338] border border-[#DDD4C5]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>🔍 {isArabic ? 'إعدادات الـ SEO' : 'SEO'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHowToGuide(!showHowToGuide)}
              className="px-3 py-1 bg-white hover:bg-[#F2EDE4] text-[#8C6D3B] border border-[#DDD4C5] text-[11px] font-mono rounded flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isArabic ? 'دليل الإدارة' : 'Guide d’utilisation'}</span>
            </button>
            {onClearProducts && products.length > 0 && (
              <button
                id="admin-clear-catalog-btn"
                onClick={() => setShowClearConfirm(true)}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-[#DDD4C5] text-[11px] font-mono rounded flex items-center gap-1 cursor-pointer transition-colors"
                title="Supprimer tous les articles du catalogue"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>{isArabic ? 'تفريغ الكتالوج' : 'Vider'}</span>
              </button>
            )}
            {onLoadSamples && (
              <button
                id="admin-load-samples-btn"
                onClick={() => setShowResetConfirm(true)}
                className="px-2.5 py-1 bg-white hover:bg-[#FAF0E6] text-[#8C6D3B] border border-[#DDD4C5] text-[11px] font-mono rounded flex items-center gap-1 cursor-pointer transition-colors"
                title="Charger des modèles d'exemples"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isArabic ? 'أمثلة' : 'Exemples'}</span>
              </button>
            )}
          </div>
        </div>

        {/* How-to Guide Box (Collapsible) */}
        {showHowToGuide && (
          <div className="bg-[#FAF4EB] border-b border-[#E8DCCB] px-6 py-4 text-xs animate-in fade-in duration-150">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif font-bold text-[#1F1C19] text-sm">
                  <Info className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{isArabic ? 'دليل إدارة وتخصيص المتجر (المنتجات، الصور، ومعلومات التواصل)' : 'Comment ajouter vos propres informations, photos et produits ?'}</span>
                </div>
                <button 
                  onClick={() => setShowHowToGuide(false)}
                  className="text-[#7C756B] hover:text-black text-xs font-mono font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-[#4A4338]">
                <div className="p-3 bg-white rounded border border-[#E2DAD0] space-y-1">
                  <div className="font-bold text-[#1F1C19] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#1F1D1A] text-white flex items-center justify-center text-[10px] font-mono">1</span>
                    <span>{isArabic ? 'إضافة وتعديل المنتجات' : 'Ajouter / Modifier des Produits'}</span>
                  </div>
                  <p>
                    {isArabic 
                      ? 'اضغط على زر "+ إضافة منتج جديد" أو زر القلم على أي منتج. يمكنك كتابة الاسم، أسعار التجزئة والجملة، نوع القماش، والمقاسات والألوان.'
                      : 'Cliquez sur "+ Ajouter un Produit" ou l’icône crayon. Définissez le nom, prix détail & gros, tissu, finitions, tailles et couleurs.'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded border border-[#E2DAD0] space-y-1">
                  <div className="font-bold text-[#1F1C19] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center text-[10px] font-mono">2</span>
                    <span>{isArabic ? 'رفع الصور الخاصة بك' : 'Importer vos Propres Photos'}</span>
                  </div>
                  <p>
                    {isArabic 
                      ? 'يمكنك سحب الصور مباشرة من هاتفك أو حاسوبك أو اختيار ملفات من جهازك، أو وضع رابط URL لصورة من الإنترنت.'
                      : 'Glissez-déposez ou sélectionnez des photos depuis votre téléphone / ordinateur (galerie), ou collez un lien URL d’image web.'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded border border-[#E2DAD0] space-y-1">
                  <div className="font-bold text-[#1F1C19] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#1F1D1A] text-white flex items-center justify-center text-[10px] font-mono">3</span>
                    <span>{isArabic ? 'معلومات التواصل والمقر' : 'Coordonnées & Localisation'}</span>
                  </div>
                  <p>
                    {isArabic 
                      ? 'انتقل لتبويب "معلومات التواصل" لتعديل الهاتف، الواتساب، العنوان، الولاية، ورقم BaridiMob RIP و CCP ورابط خرائط جوجل.'
                      : 'Ouvrez l’onglet "Coordonnées" pour changer le téléphone, WhatsApp, adresse d’atelier, wilaya, BaridiMob RIP, CCP et Google Maps.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 text-xs text-[#2C2825]">
          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              {/* Product Sub-header */}
              {!editingProduct && !isCreatingNew ? (
                <div className="space-y-4">
                  {/* Header with Add Product & Counters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-[#E0D7C9] rounded shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-semibold text-[#1F1C19]">
                          {isArabic ? 'كتالوج منتجات الورشة (بيع بالتجزئة والجملة)' : 'Catalogue Produits Atelier (B2B & B2C)'}
                        </h3>
                        <span className="px-2 py-0.5 bg-[#FAF0E6] text-[#8C6D3B] border border-[#DDD4C5] rounded text-[11px] font-mono font-bold">
                          {products.length} {isArabic ? 'منتج' : 'articles'}
                        </span>
                      </div>
                      <p className="text-[#6D6559] text-[11px] mt-0.5">
                        {isArabic
                          ? 'يمكنك إضافة منتجاتك الخاصة، تعديلها، أو حذف أي موديل مباشرة من هنا.'
                          : 'Gérez vos confections : ajoutez, modifiez ou supprimez n’importe quel article en un clic.'}
                      </p>
                    </div>
                    <button
                      id="admin-add-new-product-btn"
                      onClick={startCreateNewProduct}
                      className="px-4 py-2 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] flex items-center justify-center gap-1.5 cursor-pointer shadow-sm flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-[#C9A96E]" />
                      <span>{isArabic ? '+ إضافة منتج جديد' : t.adminAddProduct}</span>
                    </button>
                  </div>

                  {/* Search and Filters Bar (when products exist) */}
                  {products.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#F8F5EE] p-3 border border-[#E2DAD0] rounded">
                      <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                          <Search className="w-3.5 h-3.5 text-[#8C6D3B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={adminProductSearch}
                            onChange={(e) => setAdminProductSearch(e.target.value)}
                            placeholder={isArabic ? 'بحث في المنتجات...' : 'Rechercher un modèle...'}
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DDD4C5] rounded text-xs focus:outline-hidden focus:border-[#1F1D1A]"
                          />
                          {adminProductSearch && (
                            <button
                              onClick={() => setAdminProductSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <select
                          value={adminCategoryFilter}
                          onChange={(e) => setAdminCategoryFilter(e.target.value)}
                          className="px-2.5 py-1.5 bg-white border border-[#DDD4C5] rounded text-xs text-[#3D3730] font-mono focus:outline-hidden focus:border-[#1F1D1A]"
                        >
                          <option value="all">{isArabic ? 'كل الفئات' : 'Toutes catégories'}</option>
                          <option value="hoodies">Hoodies</option>
                          <option value="joggers">Joggers</option>
                          <option value="tracksuits">Ensembles</option>
                          <option value="longsleeves">Long Sleeves</option>
                          <option value="tees">Tees</option>
                          <option value="outerwear">Vestes</option>
                        </select>
                      </div>

                      {/* Bulk Select All / Action */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedProductIds.length === products.length) {
                              setSelectedProductIds([]);
                            } else {
                              setSelectedProductIds(products.map((p) => p.id));
                            }
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-[#F2EDE4] border border-[#DDD4C5] rounded text-[11px] font-mono flex items-center gap-1.5 text-[#4A4338] cursor-pointer"
                        >
                          {selectedProductIds.length === products.length && products.length > 0 ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#8C6D3B]" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          <span>
                            {selectedProductIds.length === products.length && products.length > 0
                              ? (isArabic ? 'إلغاء التحديد' : 'Tout désélectionner')
                              : (isArabic ? 'تحديد الكل' : 'Tout sélectionner')}
                          </span>
                        </button>

                        {selectedProductIds.length > 0 && (
                          <button
                            id="admin-bulk-delete-btn"
                            type="button"
                            onClick={() => setShowBulkDeleteConfirm(true)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-mono font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs animate-in fade-in"
                            title="Supprimer les articles sélectionnés"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>
                              {isArabic
                                ? `حذف المحدد (${selectedProductIds.length})`
                                : `Supprimer la sélection (${selectedProductIds.length})`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Product Cards Grid or Empty State */}
                  {products.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-[#E2DAD0] rounded-lg space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF4EB] border border-[#E8DCCB] flex items-center justify-center text-[#8C6D3B]">
                        <PackagePlus className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif text-base font-semibold text-[#1F1C19]">
                        {isArabic ? 'الكتالوج فارغ — جاهز لاستقبال منتجاتك الخاصة' : 'Catalogue vide — Prêt pour vos propres confections'}
                      </h4>
                      <p className="text-xs text-[#6D6559] max-w-md mx-auto leading-relaxed">
                        {isArabic
                          ? 'تم حذف المقالات السابقة. انقر أدناه لإضافة أول مقال خاص بورشة DBC WORKSHOP مع الصور والأسعار.'
                          : 'Les articles précédents ont été retirés. Cliquez ci-dessous pour ajouter votre premier vêtement avec vos propres photos, prix de vente et détails.'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                        <button
                          onClick={startCreateNewProduct}
                          className="px-4 py-2 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-[#C9A96E]" />
                          <span>{isArabic ? '+ أضف أول مقال الآن' : '+ Ajouter un article'}</span>
                        </button>
                        {onLoadSamples && (
                          <button
                            onClick={onLoadSamples}
                            className="px-3 py-2 bg-[#F2EDE4] text-[#5C554B] border border-[#DDD4C5] font-mono text-xs rounded hover:bg-[#E8DFC9] flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'نماذج استرشادية' : 'Modèles d’exemples'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products
                        .filter((prod) => {
                          const matchesQuery = adminProductSearch === '' || 
                            prod.name.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
                            (prod.subtitle && prod.subtitle.toLowerCase().includes(adminProductSearch.toLowerCase())) ||
                            prod.category.toLowerCase().includes(adminProductSearch.toLowerCase());
                          const matchesCategory = adminCategoryFilter === 'all' || prod.category === adminCategoryFilter;
                          return matchesQuery && matchesCategory;
                        })
                        .map((prod) => {
                          const isSelected = selectedProductIds.includes(prod.id);
                          return (
                            <div
                              key={prod.id}
                              className={`p-4 bg-white border rounded flex gap-4 transition-all relative ${
                                isSelected ? 'border-rose-400 bg-rose-50/20' : 'border-[#E2DAD0] hover:border-[#8C6D3B]'
                              }`}
                            >
                              {/* Selection checkbox */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProductIds((prev) =>
                                    prev.includes(prod.id) ? prev.filter((id) => id !== prod.id) : [...prev, prod.id]
                                  );
                                }}
                                className="absolute top-2.5 left-2.5 z-10 p-1 bg-white/95 rounded border border-[#DDD4C5] hover:border-[#8C6D3B] cursor-pointer shadow-xs"
                                title={isSelected ? 'Désélectionner' : 'Sélectionner pour suppression'}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
                                )}
                              </button>

                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                                alt={prod.name}
                                className="w-20 h-24 object-cover rounded border border-[#E2DAD0] flex-shrink-0"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="pl-5 sm:pl-4">
                                    <span className="text-[10px] font-mono text-[#8C6D3B] uppercase font-bold">
                                      {prod.category}
                                    </span>
                                    <h4 className="font-serif text-sm font-semibold text-[#1F1C19] line-clamp-1">
                                      {prod.name}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      id={`admin-edit-product-${prod.id}`}
                                      onClick={() => startEditProduct(prod)}
                                      className="p-1.5 text-[#5C554B] hover:text-black hover:bg-[#F2EDE4] rounded transition-colors cursor-pointer"
                                      title={isArabic ? 'تعديل هذا المنتج' : 'Modifier ce produit'}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      id={`admin-delete-product-${prod.id}`}
                                      onClick={() => setProductToDelete(prod)}
                                      className="p-1.5 text-[#A34338] hover:text-white hover:bg-rose-600 rounded transition-colors cursor-pointer shadow-2xs border border-rose-100 hover:border-rose-600"
                                      title={isArabic ? 'حذف هذا المنتج نهائياً' : 'Supprimer définitivement ce produit'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="font-mono text-xs text-[#1F1C19] pt-1">
                                  <span className="font-bold">{formatPrice(prod.price, 'DZD')}</span>
                                  {prod.wholesalePriceDzd && (
                                    <span className="text-[#8C6D3B] ml-2 text-[11px]">
                                      (Gros B2B: {formatPrice(prod.wholesalePriceDzd, 'DZD')})
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-1 pt-1">
                                  {prod.sizes.map((s) => (
                                    <span key={s} className="px-1.5 py-0.5 bg-[#F4EFE7] border border-[#DDD4C5] rounded text-[10px] font-mono">
                                      {s}
                                    </span>
                                  ))}
                                </div>

                                <div className="flex items-center gap-1.5 pt-1">
                                  {prod.colors.map((c, i) => (
                                    <span
                                      key={i}
                                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                                      style={{ backgroundColor: c.hex }}
                                      title={c.name}
                                    />
                                  ))}
                                  <span className="text-[10px] text-[#7C756B] font-mono ml-1">
                                    ({prod.images.length} photo{prod.images.length > 1 ? 's' : ''})
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ) : (
                /* EDIT OR CREATE PRODUCT FORM */
                <form onSubmit={handleSaveProductForm} className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DDD4C5]">
                    <h3 className="font-serif text-base font-semibold text-[#1F1C19]">
                      {isCreatingNew ? (isArabic ? 'إضافة منتج جديد للورشة' : 'Ajouter un nouveau vêtement') : `Modifier : ${prodName}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setIsCreatingNew(false);
                        }}
                        className="px-3 py-1.5 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#1F1D1A] text-white rounded font-mono text-xs hover:bg-[#3D3730] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>Enregistrer le produit</span>
                      </button>
                    </div>
                  </div>

                  {/* General Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                        Nom du produit *
                      </label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Ex: Heavyweight Oversized Hoodie"
                        className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-sans text-xs focus:outline-none focus:border-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                        Sous-titre (Arabe ou Français)
                      </label>
                      <input
                        type="text"
                        value={prodSubtitle}
                        onChange={(e) => setProdSubtitle(e.target.value)}
                        placeholder="Ex: هودي قطن أوفرسايز سميك ومريح"
                        className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-sans text-xs focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                        Catégorie
                      </label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                      >
                        <option value="hoodies">Hoodies / Sweats</option>
                        <option value="joggers">Joggings / Pantalons</option>
                        <option value="tracksuits">Tracksuits / Ensembles</option>
                        <option value="longsleeves">Long Sleeves / Manches Longues</option>
                        <option value="tees">Tees / T-shirts</option>
                        <option value="outerwear">Vestes & Manteaux</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                          Prix Détail (B2C en DZD) *
                        </label>
                        <input
                          type="number"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(Number(e.target.value))}
                          placeholder="6800"
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[11px] text-[#8C6D3B] uppercase mb-1">
                          Prix Gros (B2B en DZD)
                        </label>
                        <input
                          type="number"
                          value={prodWholesalePrice}
                          onChange={(e) => setProdWholesalePrice(Number(e.target.value))}
                          placeholder="4800"
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                        Tissu & Matière
                      </label>
                      <input
                        type="text"
                        value={prodFabric}
                        onChange={(e) => setProdFabric(e.target.value)}
                        placeholder="100% Coton Molleton Brossé Lourd"
                        className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-sans text-xs focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                        Épaisseur / Finition
                      </label>
                      <input
                        type="text"
                        value={prodFabricWeight}
                        onChange={(e) => setProdFabricWeight(e.target.value)}
                        placeholder="Heavyweight Fleece / Molleton Chaud"
                        className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                      Description du produit
                    </label>
                    <textarea
                      rows={3}
                      value={prodDescription}
                      onChange={(e) => setProdDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-sans text-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Sizes Management */}
                  <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase font-bold">
                      Tailles Disponibles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((s) => {
                        const isSelected = prodSizes.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSize(s)}
                            className={`px-3 py-1.5 font-mono text-xs rounded border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#1F1D1A] text-white border-black font-bold'
                                : 'bg-[#FAF8F5] text-[#5C554B] border-[#DDD4C5] hover:bg-white'
                            }`}
                          >
                            {s} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colors Management */}
                  <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-3">
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase font-bold">
                      Couleurs Disponibles ({prodColors.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {prodColors.map((col, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-2.5 py-1 bg-[#F4EFE7] border border-[#DDD4C5] rounded"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="font-mono text-xs">{col.name}</span>
                          <button
                            type="button"
                            onClick={() => removeColor(idx)}
                            className="text-[#9C8F7F] hover:text-red-600 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-8 h-8 rounded border border-[#DDD4C5] cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Nom couleur (ex: Vert Forêt / Beige)"
                        className="px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-3 py-1.5 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] cursor-pointer"
                      >
                        + Ajouter Couleur
                      </button>
                    </div>
                  </div>

                  {/* Images Management */}
                  <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block font-mono text-[11px] text-[#5C554B] uppercase font-bold">
                        {isArabic ? `صور المنتج (${prodImages.length})` : `Photos du Produit (${prodImages.length})`}
                      </label>
                      <span className="text-[10px] text-[#8C6D3B] font-mono">
                        {isArabic ? 'الصورة الأولى هي الصورة الرئيسية' : 'La 1ère photo est l’image principale'}
                      </span>
                    </div>

                    {/* Image thumbnails */}
                    {prodImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {prodImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded border border-[#DDD4C5] overflow-hidden bg-[#F7F4EF]">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImageUrl(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                              title="Supprimer la photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/85 text-white text-[9px] font-mono rounded">
                                {isArabic ? 'رئيسية' : 'Principale'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {/* Drag and Drop / Device File Upload Area */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-5 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#8C6D3B] bg-[#F7F2EA] scale-[0.99]'
                          : 'border-[#D9CFBF] bg-[#FAF8F5] hover:bg-[#F4EFE6] hover:border-[#8C6D3B]'
                      }`}
                    >
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#EAE2D5] flex items-center justify-center text-[#8C6D3B]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-mono text-xs font-bold text-[#1F1C19]">
                        {isArabic ? 'اضغط هنا لرفع صور من هاتفك أو حاسوبك' : 'Téléverser des photos depuis votre appareil'}
                      </p>
                      <p className="text-[11px] text-[#7C756B] mt-0.5">
                        {isArabic
                          ? 'أو اسحب وأفلت الصور هنا (يدعم عدة صور JPG, PNG, WebP في آن واحد)'
                          : 'Ou glissez-déposez vos fichiers ici (sélection multiple supportée)'}
                      </p>
                    </div>

                    {/* Custom URL addition */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Ou coller une URL d'image web (https://...)"
                        className="flex-1 px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs focus:outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => addImageUrl()}
                        className="px-3 py-1.5 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] cursor-pointer shrink-0"
                      >
                        + Ajouter URL
                      </button>
                    </div>

                    {/* Quick Sample Photos Picker */}
                    <div className="pt-2 border-t border-[#EAE3D5]">
                      <span className="text-[10px] font-mono text-[#7C756B] uppercase block mb-1.5">
                        {isArabic ? 'أو اختر من صور النماذج الجاهزة:' : 'Ou choisissez rapidement parmi nos photos modèles :'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_SAMPLE_IMAGES.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addImageUrl(preset.url)}
                            className="px-2 py-1 bg-[#F2EDE4] hover:bg-[#1F1D1A] hover:text-white rounded border border-[#DDD4C5] text-[10px] font-mono transition-colors cursor-pointer"
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#DDD4C5] flex flex-wrap items-center justify-between gap-3">
                    {editingProduct ? (
                      <button
                        type="button"
                        id="admin-delete-active-product-btn"
                        onClick={() => setProductToDelete(editingProduct)}
                        className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300 rounded font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                        title={isArabic ? 'حذف هذا الموديل نهائياً من الكتالوج' : 'Supprimer définitivement ce produit du catalogue'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>{isArabic ? 'حذف هذا المنتج' : 'Supprimer ce produit'}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setIsCreatingNew(false);
                        }}
                        className="px-4 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] cursor-pointer"
                      >
                        {isArabic ? 'إلغاء' : 'Annuler'}
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#1F1D1A] text-white rounded font-mono text-xs hover:bg-[#3D3730] flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <Save className="w-4 h-4 text-[#C9A96E]" />
                        <span>{isArabic ? 'حفظ وتحديث المنتج' : 'Sauvegarder le Produit'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: HERO PICTURE (MAIN PICTURE ON HOMEPAGE) */}
          {activeTab === 'hero' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DDD4C5]">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#1F1C19] flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-[#8C6D3B]" />
                    <span>{isArabic ? 'صورة واجهة الموقع الرئيسية (Hero Picture)' : 'Image Principale du Site (Hero Picture)'}</span>
                  </h3>
                  <p className="text-[#6D6559] text-xs mt-1">
                    {isArabic 
                      ? 'تحكم بشكل كامل في الصورة المعروضة في أعلى الصفحة الرئيسية. يمكنك رفع صورة ورشتك أو تصاميمك مباشرة من جهازك.'
                      : 'Contrôlez l’image affichée dans la bannière principale en haut de votre site. Importez une photo de votre atelier, de vos sweats ou de votre showroom.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveHeroImage()}
                  className="px-5 py-2.5 bg-[#1F1D1A] text-white rounded font-mono text-xs hover:bg-[#3D3730] flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto shrink-0"
                >
                  <Save className="w-4 h-4 text-[#C9A96E]" />
                  <span>{isArabic ? 'حفظ الصورة للموقع' : 'Enregistrer pour le Site'}</span>
                </button>
              </div>

              {heroSavedToast && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{isArabic ? 'تم تحديث وحفظ الصورة الرئيسية للموقع بنجاح !' : 'Image principale du site mise à jour avec succès !'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left col: Image Upload Controls (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* File Upload Drag & Drop */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase font-semibold">
                      {isArabic ? '1. رفع صورة من جهازك (هاتف أو كمبيوتر)' : '1. Importer une photo depuis votre appareil'}
                    </label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingHero(true); }}
                      onDragLeave={() => setIsDraggingHero(false)}
                      onDrop={handleHeroDrop}
                      onClick={() => heroFileInputRef.current?.click()}
                      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                        isDraggingHero
                          ? 'border-[#8C6D3B] bg-[#F2EDE4]'
                          : 'border-[#DDD4C5] bg-white hover:border-[#8C6D3B] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <input
                        ref={heroFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleHeroFileUpload}
                        className="hidden"
                      />
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F2EDE4] flex items-center justify-center text-[#8C6D3B]">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="font-mono text-xs text-[#1F1C19] font-medium">
                        {isArabic ? 'اضغط لاختيار صورة من هاتفك أو اسحبها إلى هنا' : 'Cliquez pour choisir une photo ou glissez-la ici'}
                      </p>
                      <p className="text-[11px] text-[#8C8477] mt-1 font-mono">
                        Formats JPG, PNG, WEBP acceptés
                      </p>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase font-semibold">
                      {isArabic ? '2. أو إدخال رابط صورة مباشرة (URL)' : '2. Ou coller une adresse URL d’image'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={tempSettings.heroImage || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, heroImage: e.target.value })}
                        placeholder="https://... ou lien d'image web"
                        className="flex-1 px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                      />
                      {tempSettings.heroImage && (
                        <button
                          type="button"
                          onClick={() => setTempSettings({ ...tempSettings, heroImage: '' })}
                          className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-mono hover:bg-rose-100 flex items-center gap-1 cursor-pointer"
                          title="Effacer la photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'إزالة' : 'Effacer'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sample presets */}
                  <div className="space-y-2 pt-2">
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase font-semibold">
                      {isArabic ? 'نماذج جاهزة للاختيار السريع' : 'Exemples de photos d’ambiance atelier'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Atelier de Confection', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1400&q=85' },
                        { label: 'Hoodie Studio Noir', url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1400&q=85' },
                        { label: 'Minimalist Sweat Beige', url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1400&q=85' },
                        { label: 'Atelier Tailleur Textile', url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=85' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTempSettings({ ...tempSettings, heroImage: preset.url })}
                          className="text-left p-2 bg-white border border-[#DDD4C5] rounded hover:border-[#8C6D3B] flex items-center gap-2 group cursor-pointer transition-colors"
                        >
                          <img src={preset.url} alt="" className="w-8 h-8 rounded object-cover" />
                          <span className="text-[11px] font-mono text-[#4A4338] group-hover:text-black line-clamp-1">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right col: Real-time Hero Banner Preview (5 cols) */}
                <div className="lg:col-span-5 space-y-2">
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase font-semibold flex items-center justify-between">
                    <span>{isArabic ? 'معاينة الواجهة' : 'Aperçu sur le site'}</span>
                    {tempSettings.heroImage ? (
                      <span className="text-emerald-700 text-[10px] font-bold uppercase">● Image active</span>
                    ) : (
                      <span className="text-amber-700 text-[10px] font-bold uppercase">○ Aucune photo</span>
                    )}
                  </label>

                  <div className="border border-[#DDD4C5] rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="aspect-[4/5] relative bg-[#EFECE6] flex items-center justify-center overflow-hidden">
                      {tempSettings.heroImage ? (
                        <>
                          <img
                            src={tempSettings.heroImage}
                            alt="Aperçu Bannière"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-mono text-white">
                            Photo Atelier
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 bg-[#FAF8F5]/95 backdrop-blur-xs p-2.5 rounded border border-[#E0D7C9] text-[11px] font-mono shadow">
                            <div className="text-[9px] text-[#8C8377] uppercase">DBC Workshop Algérie</div>
                            <div className="font-semibold text-[#1F1C19]">Collection DBC Workshop</div>
                          </div>
                        </>
                      ) : (
                        <div className="p-6 text-center space-y-3">
                          <div className="w-14 h-14 mx-auto rounded-full bg-[#E5DFD5] flex items-center justify-center text-[#8C8377]">
                            <ImageIcon className="w-7 h-7" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-mono text-xs font-semibold text-[#4A4338]">
                              {isArabic ? 'لم يتم تحديد صورة رئيسية' : 'Aucune photo définie'}
                            </p>
                            <p className="text-[11px] text-[#8C8377] max-w-xs leading-relaxed">
                              {isArabic 
                                ? 'ستعرض الصفحة الرئيسية صندوقاً تفاعلياً يتيح لك رفع صورة الورشة مباشرة.'
                                : 'Le site affichera une zone interactive invitant à importer la photo de votre atelier.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => heroFileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-[#1F1D1A] text-white text-[11px] font-mono rounded cursor-pointer hover:bg-[#3D3730]"
                          >
                            {isArabic ? 'اختر صورة الآن' : 'Choisir une photo'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveHeroImage()}
                      className="w-full py-2.5 bg-[#1F1D1A] text-white rounded font-mono text-xs hover:bg-[#3D3730] flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      <Save className="w-4 h-4 text-[#C9A96E]" />
                      <span>{isArabic ? 'حفظ وتطبيق على الموقع الآن' : 'Appliquer et Enregistrer'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORE & CONTACT SETTINGS */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContactSettings} className="max-w-2xl space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-base font-semibold text-[#1F1C19]">
                  Coordonnées de l’Atelier & Modalités de Paiement
                </h3>
                <p className="text-[#6D6559] text-[11px]">
                  Ces informations s’affichent directement sur le site, sur le bouton WhatsApp et lors de la confirmation de commande.
                </p>
              </div>

              {settingsSavedToast && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded font-mono text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Coordonnées mises à jour avec succès !</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Nom de l’Atelier / Marque
                  </label>
                  <input
                    type="text"
                    value={tempSettings.storeName}
                    onChange={(e) => setTempSettings({ ...tempSettings, storeName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-sans text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Numéro Téléphone Fixe / Mobile
                  </label>
                  <input
                    type="text"
                    value={tempSettings.phone}
                    onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                    placeholder="+213 550 XX XX XX"
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#25D366] uppercase mb-1 font-bold">
                    Numéro WhatsApp (sans le +)
                  </label>
                  <input
                    type="text"
                    value={tempSettings.whatsappNumber}
                    onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                    placeholder="213550123456"
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-[#2C6E49] mt-1 bg-[#F4F9F5] p-2 rounded border border-[#CDE5D4]">
                    💬 <strong>Modèle Automatique Actif</strong> : Chaque produit génère un message WhatsApp pré-rempli (nom de l’article, référence, taille, couleur, tarif DZD et wilaya de livraison en Algérie).
                  </p>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={tempSettings.email}
                    onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-sans text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Adresse de l’Atelier
                  </label>
                  <input
                    type="text"
                    value={tempSettings.address}
                    onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                    placeholder="Zone Industrielle Dély Ibrahim"
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-sans text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Ville / Wilaya
                  </label>
                  <input
                    type="text"
                    value={tempSettings.city}
                    onChange={(e) => setTempSettings({ ...tempSettings, city: e.target.value })}
                    placeholder="Alger, Algérie"
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-sans text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#8C6D3B]" />
                      <span>{isArabic ? 'رابط الموقع على خرائط جوجل (Google Maps)' : 'Lien Google Maps de l’Atelier'}</span>
                    </label>
                    {tempSettings.mapsUrl && (
                      <a
                        href={tempSettings.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8C6D3B] hover:text-black hover:underline flex items-center gap-1 font-mono text-[10px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{isArabic ? 'معاينة الرابط' : 'Tester le lien'}</span>
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={tempSettings.mapsUrl || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, mapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/... ou https://www.google.com/maps?q=..."
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                  />
                  <p className="text-[10px] text-[#7C756B] mt-1">
                    {isArabic 
                      ? 'يمكنك وضع رابط موقع الورشة من تطبيق خرائط Google Maps ليتمكن الزبائن من الوصول إلى محلك أو ورشتك مباشرة عبر GPS.'
                      : 'Permet aux clients d’ouvrir directement l’itinéraire vers votre atelier sur Google Maps / Waze.'}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-3">
                <h4 className="font-serif text-sm font-semibold text-[#1F1C19] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#8C6D3B]" />
                  <span>Coordonnées BaridiMob & CCP pour les Clients</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                      Numéro RIP BaridiMob (20 Chiffres)
                    </label>
                    <input
                      type="text"
                      value={tempSettings.baridiMobRip}
                      onChange={(e) => setTempSettings({ ...tempSettings, baridiMobRip: e.target.value })}
                      placeholder="007 99999 0023456789 12"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                      Compte CCP & Clé
                    </label>
                    <input
                      type="text"
                      value={tempSettings.ccpAccount}
                      onChange={(e) => setTempSettings({ ...tempSettings, ccpAccount: e.target.value })}
                      placeholder="0023456789 Clé 45"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={tempSettings.instagram}
                    onChange={(e) => setTempSettings({ ...tempSettings, instagram: e.target.value })}
                    placeholder="@dbc.workshop.dz"
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Page Facebook
                  </label>
                  <input
                    type="text"
                    value={tempSettings.facebook}
                    onChange={(e) => setTempSettings({ ...tempSettings, facebook: e.target.value })}
                    placeholder="DBC Workshop Confection"
                    className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1F1D1A] text-white rounded font-mono text-xs hover:bg-[#3D3730] flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4 text-[#C9A96E]" />
                  <span>Enregistrer les Coordonnées</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SITE-WIDE SEO & SOCIAL METADATA */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Header & Description */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2DAD0]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#8C6D3B]" />
                    <h3 className="font-serif text-base font-semibold text-[#1F1C19]">
                      {isArabic ? 'إعدادات تحسين محركات البحث والظهور في جوجل (SEO)' : 'Référencement Naturel & Métadonnées SEO'}
                    </h3>
                  </div>
                  <p className="text-[#6D6559] text-xs">
                    {isArabic 
                      ? 'قم بتهيئة عنوان الموقع، وصف البحث، والكلمات المفتاحية لتحسين ظهور ورشتك في نتائج محرك البحث Google ومشاركات وسائل التواصل.'
                      : 'Optimisez la visibilité de votre atelier textile sur Google Algérie et contrôlez les aperçus lors des partages sur WhatsApp et Facebook.'}
                  </p>
                </div>

                {/* Quick Presets Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleApplyRecommendedSeo}
                    className="px-3 py-1.5 bg-[#F2EDE4] hover:bg-[#EAE3D5] text-[#1F1D1A] border border-[#D5CABB] rounded font-mono text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Remplir avec les métadonnées recommandées pour le textile en Algérie"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{isArabic ? 'نموذج مقترح للجزائر ⚡' : 'Modèle Recommandé Algérie ⚡'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTempSettings((prev) => ({
                        ...prev,
                        seoTitle: 'DBC Clothing Workshop | B2B & B2C Apparel & Heavyweight Hoodies Algeria',
                        seoDescription: 'Atelier de confection textile en Algérie spécialisé dans les hoodies lourds, joggings, t-shirts épais et confection sur-mesure. Vente en gros B2B & détail B2C avec livraison dans les 69 wilayas.',
                        seoKeywords: 'confection textile algérie, atelier vêtements alger, grossiste hoodie algérie, survêtement sur mesure, b2b textile algerie, livraison 69 wilayas, vêtements gros alger, streetwear algérie, atelier dbc',
                        seoAuthor: 'DBC Workshop Algérie',
                        ogImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
                        canonicalUrl: 'https://dbcworkshop.dz',
                      }));
                    }}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#7C756B] border border-[#D5CABB] rounded font-mono text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Réinitialiser"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isArabic ? 'إعادة تعيين' : 'Par défaut'}</span>
                  </button>
                </div>
              </div>

              {seoSavedToast && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md font-mono text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isArabic 
                      ? '✓ تم حفظ وتحديث بيانات الـ SEO بنجاح! تم تطبيق التعديلات مباشرة على العنوان (Title)، والوسوم (Meta Tags)، والبيانات المنظمة (Schema.org).'
                      : '✓ Métadonnées SEO enregistrées et appliquées en direct ! Le titre du document, les balises Meta et les données Schema.org sont actualisés.'}
                  </span>
                </div>
              )}

              {/* Main Content: 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Form Controls (7 cols) */}
                <form onSubmit={handleSaveSeoSettings} className="lg:col-span-7 space-y-5">
                  
                  {/* 1. Page Title */}
                  <div className="p-4 bg-white border border-[#E2DAD0] rounded-md space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block font-mono text-xs font-semibold text-[#1F1C19] uppercase">
                        {isArabic ? 'عنوان الصفحة لمحركات البحث (Page Title)' : 'Titre de la Page (Title Tag & Google SERP)'}
                      </label>
                      {/* Status badge */}
                      {(() => {
                        const len = (tempSettings.seoTitle || '').length;
                        if (len >= 30 && len <= 60) {
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ {isArabic ? 'طول ممتاز' : 'Idéal'} ({len}/60)
                            </span>
                          );
                        } else if (len < 30) {
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-200">
                              {isArabic ? 'قصير' : 'Court'} ({len}/60)
                            </span>
                          );
                        } else {
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-100 text-rose-800 border border-rose-200">
                              {isArabic ? 'طويل قد يُقص' : 'Trop long'} ({len}/60)
                            </span>
                          );
                        }
                      })()}
                    </div>
                    <input
                      type="text"
                      value={tempSettings.seoTitle || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, seoTitle: e.target.value })}
                      placeholder="DBC Workshop Algérie | Atelier de Confection Textile & Vêtements Haut de Gamme"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-sans text-xs focus:bg-white focus:outline-none focus:border-black transition-colors"
                    />
                    <p className="text-[11px] text-[#7C756B] leading-normal">
                      {isArabic 
                        ? 'يظهر كعنوان رئيسي في نتائج بحث جوجل وعلامة تبويب المتصفح. يُوصى بـ 30 إلى 60 حرفاً.'
                        : 'S’affiche en haut de l’onglet du navigateur et comme titre principal bleu dans les résultats Google. Recommandé : 30 à 60 caractères.'}
                    </p>
                  </div>

                  {/* 2. Meta Description */}
                  <div className="p-4 bg-white border border-[#E2DAD0] rounded-md space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block font-mono text-xs font-semibold text-[#1F1C19] uppercase">
                        {isArabic ? 'وصف الموقع لمحركات البحث (Meta Description)' : 'Description pour les Moteurs de Recherche (Meta Description)'}
                      </label>
                      {/* Status badge */}
                      {(() => {
                        const len = (tempSettings.seoDescription || '').length;
                        if (len >= 120 && len <= 160) {
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ {isArabic ? 'طول مثالي' : 'Parfait'} ({len}/160)
                            </span>
                          );
                        } else if (len < 120) {
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-200">
                              {isArabic ? 'قصير' : 'Court'} ({len}/160)
                            </span>
                          );
                        } else {
                          return (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-100 text-rose-800 border border-rose-200">
                              {isArabic ? 'طويل قد يُقص' : 'Risque de coupure'} ({len}/160)
                            </span>
                          );
                        }
                      })()}
                    </div>
                    <textarea
                      rows={3}
                      value={tempSettings.seoDescription || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, seoDescription: e.target.value })}
                      placeholder="Atelier de confection textile en Algérie spécialisé dans les hoodies lourds, joggings, t-shirts épais et confection sur-mesure..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-sans text-xs focus:bg-white focus:outline-none focus:border-black transition-colors"
                    />
                    <p className="text-[11px] text-[#7C756B] leading-normal">
                      {isArabic
                        ? 'الملخص التعريفي الذي يظهر تحت العنوان في جوجل. يُنصح بأن يكون بين 120 و 160 حرفاً ويحتوي على الكلمات الأكثر طلباً كالتوصيل والتصنيع.'
                        : 'Le texte de présentation qui incite au clic sous votre lien Google. Idéal entre 120 et 160 caractères pour ne pas être tronqué.'}
                    </p>
                  </div>

                  {/* 3. Meta Keywords */}
                  <div className="p-4 bg-white border border-[#E2DAD0] rounded-md space-y-2.5">
                    <label className="block font-mono text-xs font-semibold text-[#1F1C19] uppercase">
                      {isArabic ? 'الكلمات المفتاحية (Meta Keywords)' : 'Mots-Clés de Recherche (Keywords ciblés Algérie)'}
                    </label>
                    <textarea
                      rows={2}
                      value={tempSettings.seoKeywords || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, seoKeywords: e.target.value })}
                      placeholder="confection textile algérie, grossiste hoodie algérie, vêtements gros alger, livraison 69 wilayas..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs focus:bg-white focus:outline-none focus:border-black transition-colors"
                    />
                    
                    {/* One-click keyword suggestions */}
                    <div className="pt-1">
                      <span className="text-[11px] font-mono text-[#7C756B] uppercase block mb-1.5">
                        {isArabic ? 'انقر لإضافة / إزالة كلمات مفتاحية شائعة للجزائر:' : 'Suggestions de tags fréquents en Algérie (cliquez pour ajouter / retirer) :'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_SEO_TAGS.map((tag, idx) => {
                          const isSelected = (tempSettings.seoKeywords || '').toLowerCase().includes(tag.toLowerCase());
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleToggleKeyword(tag)}
                              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                                isSelected 
                                  ? 'bg-[#1F1D1A] text-white border-[#1F1D1A]' 
                                  : 'bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#4A4338] border-[#DDD4C5]'
                              }`}
                            >
                              <Tag className="w-2.5 h-2.5" />
                              <span>{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 4. Brand / Author & Canonical URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-[#E2DAD0] rounded-md space-y-1.5">
                      <label className="block font-mono text-xs font-semibold text-[#1F1C19] uppercase">
                        {isArabic ? 'المؤلف / اسم الورشة الرسمي' : 'Auteur / Marque Officielle'}
                      </label>
                      <input
                        type="text"
                        value={tempSettings.seoAuthor || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, seoAuthor: e.target.value })}
                        placeholder="DBC Workshop Algérie"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-sans text-xs focus:bg-white focus:outline-none focus:border-black"
                      />
                      <p className="text-[10px] text-[#7C756B]">
                        Balise meta author & copyright.
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-[#E2DAD0] rounded-md space-y-1.5">
                      <label className="block font-mono text-xs font-semibold text-[#1F1C19] uppercase">
                        {isArabic ? 'الرابط الأساسي (Canonical URL)' : 'URL Canonique (Domaine)'}
                      </label>
                      <input
                        type="text"
                        value={tempSettings.canonicalUrl || ''}
                        onChange={(e) => setTempSettings({ ...tempSettings, canonicalUrl: e.target.value })}
                        placeholder="https://dbcworkshop.dz"
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                      />
                      <p className="text-[10px] text-[#7C756B]">
                        Évite les pénalités de contenu dupliqué.
                      </p>
                    </div>
                  </div>

                  {/* 5. Social Image (og:image) */}
                  <div className="p-4 bg-white border border-[#E2DAD0] rounded-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-mono text-xs font-semibold text-[#1F1C19] uppercase">
                        {isArabic ? 'صورة المشاركة لوسائل التواصل (og:image)' : 'Image de Partage Social (Open Graph / WhatsApp / Facebook)'}
                      </label>
                      {tempSettings.heroImage && (
                        <button
                          type="button"
                          onClick={() => setTempSettings({ ...tempSettings, ogImage: tempSettings.heroImage })}
                          className="text-[11px] font-mono text-[#8C6D3B] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <ImagePlus className="w-3 h-3" />
                          <span>{isArabic ? 'نسخ من الصورة الرئيسية' : 'Copier depuis l’image d’en-tête'}</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={tempSettings.ogImage || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, ogImage: e.target.value })}
                      placeholder="https://images.unsplash.com/... ou lien photo atelier"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs focus:bg-white focus:outline-none focus:border-black"
                    />
                    
                    {/* Quick photo presets */}
                    <div className="pt-1">
                      <span className="text-[10px] font-mono text-[#7C756B] uppercase block mb-1">
                        {isArabic ? 'أو اختر صورة جاهزة:' : 'Ou sélectionnez une image d’ambiance :'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_SAMPLE_IMAGES.slice(0, 4).map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTempSettings({ ...tempSettings, ogImage: preset.url })}
                            className="px-2 py-1 bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#DDD4C5] rounded text-[10px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <img src={preset.url} alt="" className="w-4 h-4 rounded object-cover" />
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#1F1D1A] text-white rounded font-mono text-xs hover:bg-[#3D3730] flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                    >
                      <Save className="w-4 h-4 text-[#C9A96E]" />
                      <span>{isArabic ? 'حفظ وتطبيق إعدادات الـ SEO' : 'Enregistrer les Métadonnées SEO'}</span>
                    </button>
                  </div>
                </form>

                {/* Right Column: Live Interactive Previews (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  
                  {/* PREVIEW 1: Google SERP Simulation */}
                  <div className="p-4 bg-white border border-[#DDD4C5] rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
                      <div className="flex items-center gap-1.5">
                        <Search className="w-4 h-4 text-[#4285F4]" />
                        <span className="text-xs font-mono font-semibold uppercase text-[#1F1C19]">
                          {isArabic ? 'معاينة البحث في Google' : 'Aperçu Google Search'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F2EDE4] rounded text-[#6D6559]">
                        SERP Preview
                      </span>
                    </div>

                    {/* Google Result Card */}
                    <div className="p-3.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded hover:border-[#CBD5E1] transition-colors font-sans text-left space-y-1.5">
                      {/* URL Breadcrumb */}
                      <div className="flex items-center gap-1.5 text-xs text-[#202124]">
                        <div className="w-4 h-4 rounded-full bg-[#1F1D1A] text-white text-[9px] flex items-center justify-center font-serif">
                          D
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] text-[#202124] font-medium leading-none">
                            {tempSettings.storeName || 'DBC Workshop Algérie'}
                          </span>
                          <span className="text-[10px] text-[#5F6368] font-mono leading-tight">
                            {tempSettings.canonicalUrl || 'https://dbcworkshop.dz'} › atelier
                          </span>
                        </div>
                      </div>

                      {/* Clickable blue title */}
                      <div className="pt-0.5">
                        <span className="text-[#1a0dab] hover:underline text-sm sm:text-base font-normal cursor-pointer leading-snug line-clamp-2">
                          {tempSettings.seoTitle || `${tempSettings.storeName || 'DBC Workshop'} | Atelier de Confection Textile & Vêtements Algérie`}
                        </span>
                      </div>

                      {/* Snippet text */}
                      <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                        {tempSettings.seoDescription || 'Atelier de confection textile en Algérie spécialisé dans les hoodies lourds, joggings, t-shirts épais et confection sur-mesure. Vente en gros B2B & détail B2C avec livraison dans les 69 wilayas.'}
                      </p>

                      {/* Sitelinks badges */}
                      <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#F1F3F4]">
                        <span className="text-[10px] font-mono text-[#1a0dab] bg-[#F1F3F4] px-2 py-0.5 rounded">
                          📦 Gros B2B dès 6 pcs
                        </span>
                        <span className="text-[10px] font-mono text-[#1a0dab] bg-[#F1F3F4] px-2 py-0.5 rounded">
                          🚚 69 Wilayas
                        </span>
                        <span className="text-[10px] font-mono text-[#1a0dab] bg-[#F1F3F4] px-2 py-0.5 rounded">
                          🧵 Sur-mesure
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW 2: Social Share Card (Open Graph / WhatsApp / Facebook) */}
                  <div className="p-4 bg-white border border-[#DDD4C5] rounded-md shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
                      <div className="flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-[#25D366]" />
                        <span className="text-xs font-mono font-semibold uppercase text-[#1F1C19]">
                          {isArabic ? 'معاينة المشاركة في واتساب وفيسبوك' : 'Aperçu Partage WhatsApp & Réseaux'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F2EDE4] rounded text-[#6D6559]">
                        OpenGraph
                      </span>
                    </div>

                    <div className="border border-[#E2DAD0] rounded-md overflow-hidden bg-[#FAF8F5]">
                      {/* Social Image */}
                      <div className="h-32 w-full bg-[#1F1D1A] overflow-hidden relative">
                        <img 
                          src={tempSettings.ogImage || tempSettings.heroImage || PRESET_SAMPLE_IMAGES[0].url} 
                          alt="Social Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PRESET_SAMPLE_IMAGES[0].url;
                          }}
                        />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono rounded uppercase">
                          DBC Workshop DZ
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3 bg-white space-y-1">
                        <span className="text-[10px] font-mono text-[#7C756B] uppercase tracking-wider block">
                          {(tempSettings.canonicalUrl || 'dbcworkshop.dz').replace(/^https?:\/\//, '')}
                        </span>
                        <h5 className="font-sans font-semibold text-xs text-[#1F1C19] line-clamp-1">
                          {tempSettings.seoTitle || tempSettings.storeName}
                        </h5>
                        <p className="text-[11px] text-[#6D6559] line-clamp-2 leading-relaxed">
                          {tempSettings.seoDescription || tempSettings.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW 3: Schema.org Structured Data Status */}
                  <div className="p-3.5 bg-[#F7F5F0] border border-[#E2DAD0] rounded-md space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-xs font-semibold text-[#1F1C19]">
                        {isArabic ? 'بيانات Schema.org (JSON-LD) مفعلة تلقائياً' : 'Données Structurées Schema.org Actives'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6D6559] leading-relaxed">
                      {isArabic
                        ? 'يتم حقن وسم JSON-LD بنوع ClothingStore / LocalBusiness مع أرقام الهاتف، العنوان بالجزائر، وطرق الدفع عبر بريدي موب كاش تلقائياً في صفحة الويب.'
                        : 'Un balisage JSON-LD (type ClothingStore / LocalBusiness) avec vos coordonnées à Alger, devises DZD et options de livraison est synchronisé automatiquement pour les moteurs de recherche.'}
                    </p>
                    <div className="flex flex-wrap gap-1 text-[10px] font-mono text-[#7C756B]">
                      <span className="px-1.5 py-0.5 bg-white border border-[#DDD4C5] rounded">@type: ClothingStore</span>
                      <span className="px-1.5 py-0.5 bg-white border border-[#DDD4C5] rounded">Wilayas: 69</span>
                      <span className="px-1.5 py-0.5 bg-white border border-[#DDD4C5] rounded">Currency: DZD</span>
                      <span className="px-1.5 py-0.5 bg-white border border-[#DDD4C5] rounded">BaridiMob: Actif</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & SHIPMENT TRACKING ADJUSTER */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <OrderManagerTab
                orders={orders || []}
                onUpdateOrder={(updatedOrder) => {
                  if (onUpdateOrder) {
                    onUpdateOrder(updatedOrder);
                  }
                }}
                onUpdateOrders={(allOrders) => {
                  if (onUpdateOrders) {
                    onUpdateOrders(allOrders);
                  }
                }}
                storeSettings={tempSettings}
                currentLanguage={currentLanguage}
                currency={currency}
                onOpenCustomerTracking={(orderNum) => {
                  onClose();
                  if (onOpenCustomerTracking) {
                    onOpenCustomerTracking(orderNum);
                  }
                }}
              />
            </div>
          )}

          {/* TAB 6: DELIVERY COMPANIES & 69 WILAYAS RATES MANAGER */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              <DeliveryManagerTab
                storeSettings={tempSettings}
                onUpdateStoreSettings={(newSettings) => {
                  const updated = { ...tempSettings, ...newSettings };
                  setTempSettings(updated);
                  if (onUpdateStoreSettings) {
                    onUpdateStoreSettings(newSettings);
                  } else if (onSaveSettings) {
                    onSaveSettings(updated);
                  }
                }}
                currentLanguage={currentLanguage}
                currency={currency}
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CUSTOM CONFIRMATION MODALS (Replaces window.confirm for iframe safety)    */}
        {/* ========================================================================= */}

        {/* 1. SINGLE PRODUCT DELETE MODAL */}
        {productToDelete && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div 
              className="bg-white rounded-lg border border-[#DDD4C5] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-5 border-b border-[#EAE3D5] flex items-center gap-3 bg-[#FAF8F5]">
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1F1C19]">
                    {isArabic ? 'تأكيد حذف المنتج نهائياً' : 'Confirmer la suppression'}
                  </h4>
                  <p className="text-[11px] text-[#7C756B] font-mono">
                    {isArabic ? 'هذا الإجراء سيحذف المقال من الكتالوج' : 'Retirer cet article de la boutique'}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Product preview */}
                <div className="flex items-center gap-3 p-3 bg-[#F9F7F2] border border-[#E2DAD0] rounded-md">
                  <img
                    src={productToDelete.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                    alt={productToDelete.name}
                    className="w-14 h-16 object-cover rounded border border-[#DDD4C5]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-[#8C6D3B] uppercase font-bold">
                      {productToDelete.category}
                    </span>
                    <h5 className="font-serif text-sm font-semibold text-[#1F1C19] truncate">
                      {productToDelete.name}
                    </h5>
                    <div className="text-xs font-mono font-bold text-[#1F1C19] mt-0.5">
                      {formatPrice(productToDelete.price, 'DZD')}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded text-xs text-rose-900 leading-relaxed">
                  {isArabic
                    ? 'هل أنت متأكد من رغبتك في حذف هذا الموديل؟ لن يظهر هذا المنتج لزبائنك بعد الحذف، ويمكنك إضافة منتجات جديدة في أي وقت.'
                    : 'Êtes-vous sûr de vouloir supprimer définitivement ce produit du catalogue ? Il ne sera plus affiché sur votre boutique en ligne.'}
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3D5] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] text-[#3D3730] cursor-pointer transition-colors"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  id="confirm-delete-product-btn"
                  onClick={() => executeDeleteProduct(productToDelete.id)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'نعم، حذف المنتج' : 'Oui, Supprimer définitivement'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. BULK DELETE CONFIRMATION MODAL */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg border border-[#DDD4C5] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-[#EAE3D5] flex items-center gap-3 bg-[#FAF8F5]">
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1F1C19]">
                    {isArabic ? `حذف ${selectedProductIds.length} منتجات محددة` : `Supprimer ${selectedProductIds.length} articles`}
                  </h4>
                  <p className="text-[11px] text-[#7C756B] font-mono">
                    {isArabic ? 'حذف جماعي من الكتالوج' : 'Suppression groupée'}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-3 text-xs text-[#4A4338] leading-relaxed">
                <p>
                  {isArabic
                    ? `أنت على وشك حذف ${selectedProductIds.length} مقالات دفعة واحدة من الكتالوج.`
                    : `Vous êtes sur le point de retirer définitivement ${selectedProductIds.length} produits sélectionnés de votre catalogue.`}
                </p>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 font-mono text-[11px]">
                  ⚠️ {isArabic ? 'لا يمكن التراجع عن هذا الإجراء.' : 'Cette opération est irréversible.'}
                </div>
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3D5] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="px-4 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] text-[#3D3730] cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={executeBulkDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isArabic ? `حذف المحدد (${selectedProductIds.length})` : `Supprimer (${selectedProductIds.length})`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. CLEAR ALL CATALOG CONFIRMATION MODAL */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg border border-[#DDD4C5] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-[#EAE3D5] flex items-center gap-3 bg-[#FAF8F5]">
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1F1C19]">
                    {isArabic ? 'تفريغ الكتالوج بالكامل' : 'Vider tout le catalogue ?'}
                  </h4>
                  <p className="text-[11px] text-[#7C756B] font-mono">
                    {products.length} {isArabic ? 'منتج سيتم حذفها' : 'articles seront retirés'}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-3 text-xs text-[#4A4338] leading-relaxed">
                <p>
                  {isArabic
                    ? 'سيتم حذف جميع المقالات الحالية بالكامل ليصبح الكتالوج فارغاً، مما يتيح لك إضافة مقالاتك الخاصة من الصفر.'
                    : 'Tous les produits actuels seront effacés pour repartir d’un catalogue 100% vierge. Vous pourrez ensuite ajouter vos propres modèles sur mesure.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3D5] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] text-[#3D3730] cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onClearProducts) onClearProducts();
                    setShowClearConfirm(false);
                    setSelectedProductIds([]);
                    setEditingProduct(null);
                    setDeleteSuccessToast(
                      isArabic ? 'تم تفريغ الكتالوج بنجاح.' : 'Le catalogue a été vidé avec succès.'
                    );
                    setTimeout(() => setDeleteSuccessToast(null), 3000);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'نعم، تفريغ الكتالوج' : 'Oui, Vider le catalogue'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. RESET TO SAMPLES CONFIRMATION MODAL */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg border border-[#DDD4C5] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="p-5 border-b border-[#EAE3D5] flex items-center gap-3 bg-[#FAF8F5]">
                <div className="w-10 h-10 rounded-full bg-[#FAF0E6] border border-[#DDD4C5] flex items-center justify-center text-[#8C6D3B] flex-shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#1F1C19]">
                    {isArabic ? 'استعادة نماذج المنتجات التجريبية' : 'Recharger les modèles d’exemples ?'}
                  </h4>
                  <p className="text-[11px] text-[#7C756B] font-mono">
                    DBC WORKSHOP Catalog Reset
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-3 text-xs text-[#4A4338] leading-relaxed">
                <p>
                  {isArabic
                    ? 'سيتم إعادة تحميل النماذج والأصناف الاسترشادية الافتراضية للورشة (هوديات، أطقم، ملابس شتوية).'
                    : 'Les créations d’exemples de référence pour la confection textile (hoodies, ensembles, sur-mesure) seront réinjectées dans le catalogue.'}
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3D5] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] text-[#3D3730] cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onLoadSamples) onLoadSamples();
                    else if (onResetDefaults) onResetDefaults();
                    else if (onResetToDefaults) onResetToDefaults();
                    setShowResetConfirm(false);
                    setDeleteSuccessToast(
                      isArabic ? 'تم تحميل النماذج بنجاح.' : 'Modèles d’exemples chargés.'
                    );
                    setTimeout(() => setDeleteSuccessToast(null), 3000);
                  }}
                  className="px-5 py-2 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{isArabic ? 'تأكيد التحميل' : 'Recharger les modèles'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. SUCCESS TOAST NOTIFICATION */}
        {deleteSuccessToast && (
          <div className="fixed bottom-6 right-6 z-70 bg-[#1F1D1A] text-white px-4 py-3 rounded-lg shadow-xl border border-[#C9A96E]/40 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#C9A96E] flex-shrink-0" />
            <span className="text-xs font-mono font-medium">{deleteSuccessToast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
