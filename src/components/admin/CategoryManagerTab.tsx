import React, { useState } from 'react';
import { 
  Layers, 
  Tag, 
  CheckCircle2, 
  ArrowRight, 
  Info,
  Plus,
  Trash2,
  X,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Product, StoreSettings, CustomCategory } from '../../types';
import { DEFAULT_STORE_SETTINGS } from '../../data/storeSettings';
import { useAdminLanguage } from '../../context/AdminLanguageContext';
import { saveStoreSettingsToDb } from '../../services/db';

interface CategoryManagerTabProps {
  products: Product[];
  onSelectCategoryFilter?: (category: string) => void;
  storeSettings?: StoreSettings;
  onUpdateStoreSettings?: (settings: StoreSettings) => void;
}

interface LocalizedCatDef {
  id: string;
  labels: Record<string, string>;
  descriptions: Record<string, string>;
  targetAudiences: Record<string, string>;
  isBuiltIn?: boolean;
}

const CATEGORY_DEFINITIONS: LocalizedCatDef[] = [
  {
    id: 'hoodies',
    isBuiltIn: true,
    labels: {
      ar: 'هوديز صوف شتوي ثقيل',
      fr: 'Hoodies Épais Molleton',
      en: 'Heavyweight Fleece Hoodies',
      es: 'Sudaderas con Capucha Gruesas',
    },
    descriptions: {
      ar: 'سويت شيرت بقلنسوة خامة 400-450 GSM قطن مصقول مع أربطة حياكة يدوية متينة.',
      fr: 'Sweat-shirts à capuche lourds 400-450 GSM molleton gratté avec cordons artisanaux.',
      en: 'Heavyweight 400-450 GSM brushed fleece hoodies with artisanal drawstrings.',
      es: 'Sudaderas pesadas de 400-450 GSM en felpa perchada con cordones artesanales.',
    },
    targetAudiences: {
      ar: 'الزبائن ومحلات ملابس ستريت وير',
      fr: 'Particuliers & Boutiques Streetwear',
      en: 'Individuals & Streetwear Boutiques',
      es: 'Particulares y Tiendas Streetwear',
    },
  },
  {
    id: 'joggers',
    isBuiltIn: true,
    labels: {
      ar: 'سراويل تدريب قطنية (Joggers)',
      fr: 'Pantalons Jogging Molleton',
      en: 'Fleece Jogger Pants',
      es: 'Pantalones Jogger de Felpa',
    },
    descriptions: {
      ar: 'سراويل رياضية دافئة مع جيوب بسحاب، نهايات كاحل مضلعة ومطاط خصر مريح.',
      fr: 'Pantalons de survêtement avec poches zippées, chevilles côtelées et cordons de serrage.',
      en: 'Sweatpants featuring zippered pockets, ribbed cuffs, and reinforced waistbands.',
      es: 'Pantalones de chándal con bolsillos de cremallera, puños elásticos y cordón ajustable.',
    },
    targetAudiences: {
      ar: 'الملابس الرياضية والاستخدام اليومي',
      fr: 'Sportswear & Casual Quotidien',
      en: 'Sportswear & Daily Casual',
      es: 'Ropa Deportiva y Diario Informal',
    },
  },
  {
    id: 'tracksuits',
    isBuiltIn: true,
    labels: {
      ar: 'أطقم بدلات رياضية كاملة (Tracksuits)',
      fr: 'Ensembles Tracksuits Complets',
      en: 'Complete Tracksuit Sets',
      es: 'Conjuntos Completos de Chándal',
    },
    descriptions: {
      ar: 'أطقم متناسقة قطعة علوية وسفلية مصبوغة ومفصلة في نفس ورشة الخياطة.',
      fr: 'Packs coordonnés haut et bas confectionnés dans les mêmes bains de teinture.',
      en: 'Matching top and bottom sets crafted from identically dyed premium fleece batches.',
      es: 'Conjuntos coordinados de chaqueta y pantalón confeccionados con el mismo tinte textil.',
    },
    targetAudiences: {
      ar: 'المجموعات والأطقم الكاملة',
      fr: 'Collections coordonnées',
      en: 'Coordinated collections',
      es: 'Colecciones coordinadas',
    },
  },
  {
    id: 'longsleeves',
    isBuiltIn: true,
    labels: {
      ar: 'أكمام طويلة حرارية (Waffle)',
      fr: 'Manches Longues Thermal Waffle',
      en: 'Thermal Waffle Long Sleeves',
      es: 'Camisetas Térmicas Manga Larga',
    },
    descriptions: {
      ar: 'قمصان شتوية سميكة بنسيج وافل عازل ومسامي مخصص للأجواء الباردة.',
      fr: 'T-shirts épais à manches longues en maille gaufrée respirante et chaude pour l’hiver.',
      en: 'Thick waffle-knit thermal tops providing superior winter warmth and breathability.',
      es: 'Camisetas gruesas de punto gofrado térmico, transpirables y abrigadas para invierno.',
    },
    targetAudiences: {
      ar: 'طبقات شتوية دافئة',
      fr: 'Sous-couches thermiques & mi-saison',
      en: 'Thermal base layers & mid-season',
      es: 'Capas térmicas y entretiempo',
    },
  },
  {
    id: 'tees',
    isBuiltIn: true,
    labels: {
      ar: 'تيشيرتات قطنية ثقيلة (Heavyweight)',
      fr: 'T-shirts Épais Heavyweight',
      en: 'Heavyweight Oversized Tees',
      es: 'Camisetas Gruesas Heavyweight',
    },
    descriptions: {
      ar: 'تيشيرتات 240-280 GSM قطن مشط 100% مع ياقة متينة مقاومة للتلف مع الغسيل.',
      fr: 'T-shirts 240-280 GSM coton peigné 100% avec col renforcé anti-déformation.',
      en: '240-280 GSM combed 100% cotton t-shirts with reinforced non-sagging collars.',
      es: 'Camisetas de 240-280 GSM 100% algodón peinado con cuello reforzado indeformable.',
    },
    targetAudiences: {
      ar: 'القطع الأساسية الفاخرة',
      fr: 'Basiques premium intemporels',
      en: 'Timeless premium essentials',
      es: 'Básicos premium atemporales',
    },
  },
  {
    id: 'outerwear',
    isBuiltIn: true,
    labels: {
      ar: 'سترات وجواكت الورشة',
      fr: 'Vestes & Surchemises',
      en: 'Jackets & Overshirts',
      es: 'Chaquetas y Sobrecamisas',
    },
    descriptions: {
      ar: 'قطع شتوية خارجية، قمصان صوفية سميكة وسترات بسحاب متينة الصنع.',
      fr: 'Pièces d’extérieur, surchemises en laine polaire et vestes zippées de confection.',
      en: 'Outdoor outerwear, polar fleece overshirts, and tailored zip jackets.',
      es: 'Prendas exteriores, sobrecamisas polares y chaquetas con cremallera de confección.',
    },
    targetAudiences: {
      ar: 'الملابس الشتوية المقاومة للبرد',
      fr: 'Outdoor & Hiver rigoureux',
      en: 'Outdoor & Harsh Winter',
      es: 'Ropa de Abrigo e Invierno',
    },
  },
  {
    id: 'b2b',
    isBuiltIn: true,
    labels: {
      ar: 'البيع بالجملة وتفصيل الشركات (B2B)',
      fr: 'Vente en Gros & Confection B2B',
      en: 'Wholesale & B2B Manufacturing',
      es: 'Venta Mayorista y Confección B2B',
    },
    descriptions: {
      ar: 'طلبيات التجار والمحلات بأسعار تفضيلية مع خدمات التطريز وطباعة العلامة الخاصة.',
      fr: 'Packs revendeurs avec remises volume, personnalisation de broderie et étiquetage privé.',
      en: 'Reseller packs with bulk discounts, custom embroidery, and private labeling.',
      es: 'Packs para distribuidores con descuentos por volumen, bordados y etiquetas privadas.',
    },
    targetAudiences: {
      ar: 'تجار الجملة، محلات الـ 69 ولاية والشركات',
      fr: 'Grossistes, Commerçants 69 Wilayas & Entreprises',
      en: 'Wholesalers, 69 Wilaya Merchants & Corporate',
      es: 'Mayoristas, Comercios de 69 Wilayas y Empresas',
    },
  },
];

export const CategoryManagerTab: React.FC<CategoryManagerTabProps> = ({ 
  products, 
  onSelectCategoryFilter,
  storeSettings,
  onUpdateStoreSettings
}) => {
  const { adminLang, isRtl, t } = useAdminLanguage();
  const safeProducts = Array.isArray(products) ? products : [];
  const customCategories = storeSettings?.customCategories || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameEs, setNewCatNameEs] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatAudience, setNewCatAudience] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [catToDelete, setCatToDelete] = useState<CustomCategory | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      setFormError(
        adminLang === 'ar' ? 'يرجى إدخال اسم التصنيف' :
        adminLang === 'es' ? 'Por favor ingrese el nombre de la categoría' :
        adminLang === 'en' ? 'Please enter a category name' :
        'Veuillez renseigner le nom de la catégorie'
      );
      return;
    }

    let slug = generateSlug(trimmedName);

    // Prevent duplicate category names (case-insensitive across custom & default)
    const normalizedName = trimmedName.toLowerCase();
    const isDuplicateName = customCategories.some(
      (c) => c.name.toLowerCase() === normalizedName ||
             (c.nameAr && c.nameAr.toLowerCase() === normalizedName) ||
             (c.nameEn && c.nameEn.toLowerCase() === normalizedName) ||
             (c.nameEs && c.nameEs.toLowerCase() === normalizedName)
    ) || CATEGORY_DEFINITIONS.some(
      (c) => Object.values(c.labels).some(l => l.toLowerCase() === normalizedName) || c.id === normalizedName
    );

    if (isDuplicateName) {
      setFormError(
        adminLang === 'ar' ? `التصنيف "${trimmedName}" موجود مسبقاً` :
        adminLang === 'es' ? `La categoría "${trimmedName}" ya existe` :
        adminLang === 'en' ? `The category "${trimmedName}" already exists` :
        `La catégorie "${trimmedName}" existe déjà`
      );
      return;
    }

    // Prevent collision with existing built-in or custom categories
    const allExistingIds = [
      ...CATEGORY_DEFINITIONS.map(c => c.id),
      ...customCategories.map(c => c.id)
    ];

    if (allExistingIds.includes(slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const newCategory: CustomCategory = {
      id: slug,
      name: trimmedName,
      nameAr: newCatNameAr.trim() || trimmedName,
      nameEn: newCatNameEn.trim() || trimmedName,
      nameEs: newCatNameEs.trim() || trimmedName,
      description: newCatDesc.trim() || undefined,
      targetAudience: newCatAudience.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      const baseSettings = storeSettings || DEFAULT_STORE_SETTINGS;
      const updatedCategories = [...customCategories, newCategory];
      const updatedSettings: StoreSettings = {
        ...baseSettings,
        customCategories: updatedCategories,
      };

      if (onUpdateStoreSettings) {
        onUpdateStoreSettings(updatedSettings);
      }
      await saveStoreSettingsToDb(updatedSettings);

      showToast(
        adminLang === 'ar' ? `تمت إضافة التصنيف "${trimmedName}" بنجاح!` :
        adminLang === 'es' ? `¡Categoría "${trimmedName}" añadida con éxito!` :
        adminLang === 'en' ? `Category "${trimmedName}" created successfully!` :
        `Catégorie "${trimmedName}" ajoutée avec succès !`
      );

      // Reset and close
      setNewCatName('');
      setNewCatNameAr('');
      setNewCatNameEn('');
      setNewCatNameEs('');
      setNewCatDesc('');
      setNewCatAudience('');
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setFormError(
        adminLang === 'ar' ? 'فشل حفظ التصنيف، يرجى المحاولة مرة أخرى' :
        adminLang === 'es' ? 'Error al guardar la categoría' :
        adminLang === 'en' ? 'Failed to save category, please try again' :
        'Erreur lors de l’enregistrement de la catégorie'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: CustomCategory) => {
    setIsSaving(true);
    try {
      const baseSettings = storeSettings || DEFAULT_STORE_SETTINGS;
      const updatedCategories = customCategories.filter(c => c.id !== cat.id);
      const updatedSettings: StoreSettings = {
        ...baseSettings,
        customCategories: updatedCategories,
      };

      if (onUpdateStoreSettings) {
        onUpdateStoreSettings(updatedSettings);
      }
      await saveStoreSettingsToDb(updatedSettings);

      showToast(
        adminLang === 'ar' ? `تم حذف التصنيف "${cat.name}"` :
        adminLang === 'es' ? `Categoría "${cat.name}" eliminada` :
        adminLang === 'en' ? `Category "${cat.name}" deleted` :
        `Catégorie "${cat.name}" supprimée`
      );
      setCatToDelete(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Convert customCategories into localized cards
  const customCatDefs: LocalizedCatDef[] = customCategories.map((c) => ({
    id: c.id,
    isBuiltIn: false,
    labels: {
      ar: c.nameAr || c.name,
      en: c.nameEn || c.name,
      es: c.nameEs || c.name,
      fr: c.name,
    },
    descriptions: {
      ar: c.description || 'تصنيف مخصص للقطع المصنعة في الورشة',
      en: c.description || 'Custom apparel category for workshop garments',
      es: c.description || 'Categoría personalizada de prendas del taller',
      fr: c.description || 'Catégorie personnalisée pour les confections de l’atelier',
    },
    targetAudiences: {
      ar: c.targetAudience || 'الزبائن ومحلات الملابس',
      en: c.targetAudience || 'Retail customers & boutiques',
      es: c.targetAudience || 'Clientes particulares y tiendas',
      fr: c.targetAudience || 'Particuliers & Boutiques',
    },
  }));

  const allDisplayCategories = [...CATEGORY_DEFINITIONS, ...customCatDefs];

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-5 py-3 rounded-lg shadow-2xl border border-[#C9A96E] text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5]">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#1F1C19] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8C6D3B]" />
            <span>{t.catManagerTitle}</span>
          </h2>
          <p className="text-xs text-[#7C756B] font-mono mt-0.5">
            {t.catManagerSubtitle}
          </p>
        </div>

        {/* Action: Add Category Button */}
        <button
          type="button"
          id="btn-add-category"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#C9A96E]" />
          <span>
            {adminLang === 'ar' ? 'إضافة تصنيف جديد' :
             adminLang === 'es' ? 'Añadir Categoría' :
             adminLang === 'en' ? 'Add Category' :
             'Ajouter une catégorie'}
          </span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allDisplayCategories.map((cat) => {
          const label = cat.labels[adminLang] || cat.labels.fr;
          const desc = cat.descriptions[adminLang] || cat.descriptions.fr;
          const target = cat.targetAudiences[adminLang] || cat.targetAudiences.fr;

          const matchingProducts = safeProducts.filter((p) => {
            if (cat.id === 'b2b') return p.isB2BAvailable !== false;
            return p.category === cat.id;
          });
          const inStockCount = matchingProducts.filter((p) => p.inStock !== false && (p.stock ?? 50) > 0).length;

          const customCategoryRecord = customCategories.find(c => c.id === cat.id);

          return (
            <div
              key={cat.id}
              className={`bg-white border rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                cat.isBuiltIn ? 'border-[#E2DAD0]' : 'border-[#C9A96E]/50 ring-1 ring-[#C9A96E]/20'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF8F5] text-[#8C6D3B] font-bold border border-[#EAE3D5]">
                      {cat.id}
                    </span>
                    {!cat.isBuiltIn && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                        {adminLang === 'ar' ? 'مخصص' : adminLang === 'es' ? 'Personalizada' : adminLang === 'en' ? 'Custom' : 'Personnalisée'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1F1C19]">
                    {t.catItemsCount(matchingProducts.length)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                    {label}
                  </h3>

                  {!cat.isBuiltIn && customCategoryRecord && (
                    <button
                      type="button"
                      onClick={() => setCatToDelete(customCategoryRecord)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer transition-colors"
                      title={adminLang === 'ar' ? 'حذف هذا التصنيف' : adminLang === 'es' ? 'Eliminar categoría' : adminLang === 'en' ? 'Delete category' : 'Supprimer cette catégorie'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#6E6659] leading-relaxed font-sans">
                  {desc}
                </p>

                <div className="pt-2 text-[11px] font-mono text-[#8C6D3B] flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{t.catAudienceLabel} {target}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-700 flex items-center gap-1 font-medium text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{inStockCount} {t.invTableStockQty}</span>
                </span>

                {onSelectCategoryFilter && (
                  <button
                    type="button"
                    onClick={() => onSelectCategoryFilter(cat.id)}
                    className="text-[#1F1C19] hover:text-[#8C6D3B] flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                  >
                    <span>{t.catFilterProductsBtn}</span>
                    <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Notice Bar */}
      <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D5] rounded-lg text-xs font-mono text-[#7C756B] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {adminLang === 'ar'
            ? 'تتم مزامنة جميع التصنيفات (الأساسية والجديدة المضافة) تلقائياً مع قوائم المتجر وقائمة الهاتف (Hamburger Menu) وفلاتر المنتجات.'
            : adminLang === 'es'
            ? 'Todas las categorías (básicas y nuevas creadas) se sincronizan automáticamente con el menú hamburguesa, la navegación y los filtros de la tienda.'
            : adminLang === 'en'
            ? 'All categories (standard and newly added) synchronize automatically with the hamburger menu, public navigation, and product filters.'
            : "Toutes les catégories (standards et nouvelles ajoutées) sont automatiquement synchronisées avec le menu hamburger, la navigation publique et les filtres de la boutique."}
        </p>
      </div>

      {/* MODAL: ADD CATEGORY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#DDD4C5] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE3D5] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F2EDE4] border border-[#DDD4C5] flex items-center justify-center text-[#8C6D3B]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                    {adminLang === 'ar' ? 'إضافة تصنيف جديد للملابس' :
                     adminLang === 'es' ? 'Crear Nueva Categoría' :
                     adminLang === 'en' ? 'Create New Category' :
                     'Ajouter une Nouvelle Catégorie'}
                  </h3>
                  <p className="text-[11px] text-[#7C756B] font-mono">
                    {adminLang === 'ar' ? 'سيظهر التصنيف في قائمة المتجر وخيارات إضافة المنتجات' :
                     adminLang === 'es' ? 'Aparecerá en el menú del sitio y en la asignación de productos' :
                     adminLang === 'en' ? 'Will appear in navigation menus and product assignment' :
                     'S’affichera dans le menu du site et l’attribution des produits'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#7C756B] hover:bg-[#EAE3D5] hover:text-[#1F1C19] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCategory} className="p-6 space-y-4 text-xs font-mono">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-[#1F1C19] font-bold uppercase mb-1">
                  {adminLang === 'ar' ? 'اسم التصنيف الرئيسي *' :
                   adminLang === 'es' ? 'Nombre de la Categoría *' :
                   adminLang === 'en' ? 'Category Name *' :
                   'Nom de la Catégorie *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={
                    adminLang === 'ar' ? 'مثال: أوشحة وإكسسوارات صوفية' :
                    adminLang === 'es' ? 'Ej: Chaquetas de Invierno, Accesorios...' :
                    adminLang === 'en' ? 'e.g. Winter Jackets, Accessories...' :
                    'Ex : Vestes d’Hiver, Accessoires...'
                  }
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                />
              </div>

              {/* Multilingual Name Inputs (Collapsible / Optional) */}
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D5] rounded-lg space-y-2.5">
                <span className="text-[11px] text-[#8C6D3B] font-bold block">
                  {adminLang === 'ar' ? 'الترجمات الاختيارية للغات المتجر الأخرى :' :
                   adminLang === 'es' ? 'Traducciones opcionales para otros idiomas :' :
                   adminLang === 'en' ? 'Optional translations for other languages :' :
                   'Traductions optionnelles (autres langues) :'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-[#7C756B] block mb-0.5">العربية (AR)</span>
                    <input
                      type="text"
                      dir="rtl"
                      value={newCatNameAr}
                      onChange={(e) => setNewCatNameAr(e.target.value)}
                      placeholder="الاسم بالعربية"
                      className="w-full px-2 py-1.5 border border-[#DDD4C5] rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7C756B] block mb-0.5">English (EN)</span>
                    <input
                      type="text"
                      value={newCatNameEn}
                      onChange={(e) => setNewCatNameEn(e.target.value)}
                      placeholder="Name in English"
                      className="w-full px-2 py-1.5 border border-[#DDD4C5] rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7C756B] block mb-0.5">Español (ES)</span>
                    <input
                      type="text"
                      value={newCatNameEs}
                      onChange={(e) => setNewCatNameEs(e.target.value)}
                      placeholder="Nombre en Español"
                      className="w-full px-2 py-1.5 border border-[#DDD4C5] rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#5C554B] uppercase mb-1">
                  {adminLang === 'ar' ? 'الوصف التوضيحي للتصنيف (اختياري)' :
                   adminLang === 'es' ? 'Descripción de la categoría (opcional)' :
                   adminLang === 'en' ? 'Category Description (optional)' :
                   'Description de la catégorie (optionnel)'}
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder={
                    adminLang === 'ar' ? 'تفاصيل خامة وتفصيل قطع هذا التصنيف...' :
                    adminLang === 'es' ? 'Detalles sobre las prendas de esta categoría...' :
                    adminLang === 'en' ? 'Details about garments in this category...' :
                    'Détails sur les confections de cette catégorie...'
                  }
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                />
              </div>

              <div>
                <label className="block text-[#5C554B] uppercase mb-1">
                  {adminLang === 'ar' ? 'الفئة المستهدفة / الجمهور (اختياري)' :
                   adminLang === 'es' ? 'Público objetivo (opcional)' :
                   adminLang === 'en' ? 'Target Audience (optional)' :
                   'Public cible (optionnel)'}
                </label>
                <input
                  type="text"
                  value={newCatAudience}
                  onChange={(e) => setNewCatAudience(e.target.value)}
                  placeholder={
                    adminLang === 'ar' ? 'مثال: عشاق الموضة والستريت وير' :
                    adminLang === 'es' ? 'Ej: Streetwear y uso diario' :
                    adminLang === 'en' ? 'e.g. Casual & Daily Wear' :
                    'Ex : Casual & Quotidien'
                  }
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs focus:outline-none focus:border-black bg-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#EAE3D5] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#DDD4C5] rounded-lg text-xs hover:bg-[#F2EDE4] cursor-pointer"
                >
                  {adminLang === 'ar' ? 'إلغاء' :
                   adminLang === 'es' ? 'Cancelar' :
                   adminLang === 'en' ? 'Cancel' :
                   'Annuler'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-[#C9A96E]" />
                  <span>
                    {isSaving
                      ? (adminLang === 'ar' ? 'جاري الحفظ...' : adminLang === 'es' ? 'Guardando...' : adminLang === 'en' ? 'Saving...' : 'Enregistrement...')
                      : (adminLang === 'ar' ? 'حفظ التصنيف' : adminLang === 'es' ? 'Guardar Categoría' : adminLang === 'en' ? 'Save Category' : 'Enregistrer la catégorie')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL FOR CUSTOM CATEGORY */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-[#DDD4C5] shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#1F1C19]">
                  {adminLang === 'ar' ? 'تأكيد حذف التصنيف' :
                   adminLang === 'es' ? '¿Eliminar categoría?' :
                   adminLang === 'en' ? 'Delete Category?' :
                   'Supprimer la catégorie ?'}
                </h4>
                <p className="text-[11px] font-mono text-[#7C756B]">
                  {catToDelete.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5C554B] leading-relaxed">
              {adminLang === 'ar'
                ? 'هل تريد بالتأكيد إزالة هذا التصنيف من قوائم المتجر؟ المنتجات المرتبطة به ستبقى في الكتالوج.'
                : adminLang === 'es'
                ? '¿Está seguro de que desea eliminar esta categoría? Los productos existentes permanecerán en el catálogo.'
                : adminLang === 'en'
                ? 'Are you sure you want to delete this category? Existing products will remain in the catalog.'
                : "Voulez-vous vraiment supprimer cette catégorie ? Les produits existants resteront dans le catalogue."}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0EBE1]">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-3 py-1.5 border border-[#DDD4C5] rounded text-xs font-mono hover:bg-[#F2EDE4] cursor-pointer"
              >
                {adminLang === 'ar' ? 'إلغاء' : adminLang === 'es' ? 'Cancelar' : adminLang === 'en' ? 'Cancel' : 'Annuler'}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteCategory(catToDelete)}
                disabled={isSaving}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-mono font-bold cursor-pointer transition-colors shadow-xs"
              >
                {adminLang === 'ar' ? 'نعم، حذف' : adminLang === 'es' ? 'Sí, Eliminar' : adminLang === 'en' ? 'Yes, Delete' : 'Oui, Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
