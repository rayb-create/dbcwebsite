import React from 'react';
import { 
  Layers, 
  Tag, 
  CheckCircle2, 
  ArrowRight, 
  Info
} from 'lucide-react';
import { Product } from '../../types';
import { useAdminLanguage } from '../../context/AdminLanguageContext';

interface CategoryManagerTabProps {
  products: Product[];
  onSelectCategoryFilter?: (category: string) => void;
}

interface LocalizedCatDef {
  id: string;
  labels: Record<string, string>;
  descriptions: Record<string, string>;
  targetAudiences: Record<string, string>;
}

const CATEGORY_DEFINITIONS: LocalizedCatDef[] = [
  {
    id: 'hoodies',
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

export const CategoryManagerTab: React.FC<CategoryManagerTabProps> = ({ products, onSelectCategoryFilter }) => {
  const { adminLang, isRtl, t } = useAdminLanguage();

  return (
    <div className="space-y-6">
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
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORY_DEFINITIONS.map((cat) => {
          const label = cat.labels[adminLang] || cat.labels.fr;
          const desc = cat.descriptions[adminLang] || cat.descriptions.fr;
          const target = cat.targetAudiences[adminLang] || cat.targetAudiences.fr;

          const matchingProducts = products.filter((p) => {
            if (cat.id === 'b2b') return p.isB2BAvailable !== false;
            return p.category === cat.id;
          });
          const inStockCount = matchingProducts.filter((p) => p.inStock !== false && (p.stock ?? 50) > 0).length;

          return (
            <div
              key={cat.id}
              className="bg-white border border-[#E2DAD0] rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF8F5] text-[#8C6D3B] font-bold border border-[#EAE3D5]">
                    {cat.id}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1F1C19]">
                    {t.catItemsCount(matchingProducts.length)}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                  {label}
                </h3>

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

      <div className="p-4 bg-[#FAF8F5] border border-[#EAE3D5] rounded-lg text-xs font-mono text-[#7C756B] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {adminLang === 'ar'
            ? 'تتم مزامنة هذه التصنيفات تلقائياً مع خيارات الفرز وقوائم المتجر العام للزبائن.'
            : adminLang === 'en'
            ? 'These categories sync automatically with public store filters and navigation.'
            : adminLang === 'es'
            ? 'Estas categorías se sincronizan automáticamente con los filtros de la tienda pública.'
            : "Les catégories sont automatiquement synchronisées avec le menu de navigation et les filtres de recherche de la boutique publique."}
        </p>
      </div>
    </div>
  );
};
