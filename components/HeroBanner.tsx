import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  Phone, 
  Camera, 
  Trash2, 
  Check, 
  Sliders, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';
import { CoverPhotoModal } from './CoverPhotoModal';
import { useAuth } from '../context/AuthContext';

interface HeroBannerProps {
  onExploreCollection: () => void;
  onOpenB2B: () => void;
  onOpenContact: () => void;
  onOpenOrderLookup?: () => void;
  onUpdateHeroImage?: (imageUrl: string) => void;
  onUpdateHeroSettings?: (heroUpdates: Partial<StoreSettings>) => void;
  storeSettings: StoreSettings;
  currentLanguage: Language;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCollection,
  onOpenB2B,
  onOpenContact,
  onOpenOrderLookup,
  onUpdateHeroImage,
  onUpdateHeroSettings,
  storeSettings,
  currentLanguage,
}) => {
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [justUploadedToast, setJustUploadedToast] = useState(false);
  const [toastText, setToastText] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  const { isAdmin: authIsAdmin, currentUser, loading: authLoading } = useAuth();
  // Strictly verified admin flag: public/logged-out visitors are ALWAYS false
  const isAdmin = Boolean(!authLoading && currentUser && authIsAdmin === true);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const scrollToWrittenInfo = () => {
    const el = document.getElementById('hero-written-info');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Direct removal / reset of cover photo
  const handleRemoveHeroImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(isArabic ? 'هل تريد استعادة صورة الواجهة الافتراضية؟' : 'Voulez-vous réinitialiser la photo de couverture ?')) {
      if (onUpdateHeroImage) {
        onUpdateHeroImage('');
      }
      setToastText(isArabic ? 'تمت استعادة الصورة الافتراضية' : 'Photo de couverture réinitialisée');
      setJustUploadedToast(true);
      setTimeout(() => setJustUploadedToast(false), 3000);
    }
  };

  // Dynamic Content Resolution with fallback hierarchy
  const displayTitle = (
    currentLanguage === 'ar'
      ? (storeSettings.heroTitleAr || storeSettings.heroTitle)
      : currentLanguage === 'es'
      ? (storeSettings.heroTitleEs || storeSettings.heroTitle)
      : currentLanguage === 'en'
      ? (storeSettings.heroTitleEn || storeSettings.heroTitle)
      : storeSettings.heroTitle
  ) || t.heroHeadline;

  const displaySubtitle = (
    currentLanguage === 'ar'
      ? (storeSettings.heroSubtitleAr || storeSettings.heroSubtitle)
      : currentLanguage === 'es'
      ? (storeSettings.heroSubtitleEs || storeSettings.heroSubtitle)
      : currentLanguage === 'en'
      ? (storeSettings.heroSubtitleEn || storeSettings.heroSubtitle)
      : storeSettings.heroSubtitle
  ) || t.heroSubheadline;

  const displayBadge = (
    currentLanguage === 'ar'
      ? (storeSettings.heroBadgeAr || storeSettings.heroBadge)
      : currentLanguage === 'es'
      ? (storeSettings.heroBadgeEs || storeSettings.heroBadge)
      : currentLanguage === 'en'
      ? (storeSettings.heroBadgeEn || storeSettings.heroBadge)
      : storeSettings.heroBadge
  ) || (isArabic ? 'تصنيع محلي وتوصيل سريع' : 'Confection Atelier & Vente Directe');

  const displayTagline = (
    currentLanguage === 'ar'
      ? (storeSettings.taglineAr || storeSettings.tagline)
      : currentLanguage === 'es'
      ? (storeSettings.taglineEs || storeSettings.tagline)
      : currentLanguage === 'en'
      ? (storeSettings.taglineEn || storeSettings.tagline)
      : storeSettings.tagline
  ) || t.tagline;

  // Primary cover image fallback
  const heroImageSrc = storeSettings.heroImage || 
    (storeSettings.heroImages && storeSettings.heroImages.length > 0 ? storeSettings.heroImages[0] : null) || 
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1920&q=85';

  // Mobile and Desktop focal point configuration
  const desktopFocal = storeSettings.heroFocalPoint || 'center';
  let mobileFocal = 'center 28%';
  let tabletFocal = 'center 35%';
  if (desktopFocal === 'top') {
    mobileFocal = 'center 15%';
    tabletFocal = 'center 20%';
  } else if (desktopFocal === 'bottom') {
    mobileFocal = 'center 85%';
    tabletFocal = 'center 80%';
  } else if (desktopFocal === 'left') {
    mobileFocal = 'left 28%';
    tabletFocal = 'left 35%';
  } else if (desktopFocal === 'right') {
    mobileFocal = 'right 28%';
    tabletFocal = 'right 35%';
  } else if (desktopFocal !== 'center') {
    mobileFocal = desktopFocal;
    tabletFocal = desktopFocal;
  }

  return (
    <div id="hero-cover-section" className="w-full flex flex-col bg-[#FAF8F5] overflow-x-hidden">
      {/* Scoped responsive focal rules */}
      <style>{`
        #hero-cover-visual .hero-campaign-img {
          object-position: var(--hero-mobile-focal, center 28%) !important;
        }
        @media (min-width: 640px) {
          #hero-cover-visual .hero-campaign-img {
            object-position: var(--hero-tablet-focal, center 35%) !important;
          }
        }
        @media (min-width: 1024px) {
          #hero-cover-visual .hero-campaign-img {
            object-position: var(--hero-desktop-focal, center) !important;
          }
        }
      `}</style>

      {/* 1. HERO CAMPAIGN VISUAL */}
      <section 
        id="hero-cover-visual"
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/9] lg:aspect-auto lg:h-[78vh] min-h-[220px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[460px] max-h-[360px] sm:max-h-[500px] md:max-h-[580px] lg:max-h-[820px] overflow-hidden bg-[#1E1B18] select-none"
        style={{
          width: '100%',
          ['--hero-mobile-focal' as string]: mobileFocal,
          ['--hero-tablet-focal' as string]: tabletFocal,
          ['--hero-desktop-focal' as string]: desktopFocal,
        } as React.CSSProperties}
      >
        {/* Campaign Photography */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#1E1B18]">
          {heroImageSrc ? (
            <img
              ref={imgRef}
              src={heroImageSrc}
              alt={storeSettings.storeName || 'DBC Clothing Workshop'}
              className={`hero-campaign-img w-full h-full object-cover select-none transition-opacity duration-500 ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsImgLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-[#1E1B18] animate-pulse" />
          )}

          {/* Clean cinematic tone mapping */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-black/35 pointer-events-none" />
        </div>

        {/* Floating Controls & Non-Intrusive Indicators */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-3 sm:py-5 lg:py-6">
          
          {/* Top Bar: Category Pill & Discrete Admin Cover Edit Tool */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-black/45 backdrop-blur-md border border-white/20 rounded-full text-[10px] sm:text-xs font-mono text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span className="font-semibold tracking-wider uppercase">{displayBadge}</span>
            </div>

            {/* Quick Cover Adjustment Trigger for owner/admin ONLY */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCoverModalOpen(true)}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-black/45 hover:bg-black/75 text-white/90 hover:text-white rounded-full text-[10px] sm:text-[11px] font-mono flex items-center gap-1.5 shadow-md backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                  title={isArabic ? 'تعديل صورة الواجهة، وتحديد موضع التركيز' : 'Modifier la photo de couverture et le cadrage'}
                >
                  <Camera className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span className="hidden sm:inline">{isArabic ? 'تعديل صورة الواجهة' : 'Photo de couverture'}</span>
                </button>
                {storeSettings.heroImage && (
                  <button
                    type="button"
                    onClick={handleRemoveHeroImage}
                    className="p-1 sm:p-1.5 bg-black/45 hover:bg-rose-700/80 text-white/80 hover:text-white rounded-full text-[10px] sm:text-[11px] font-mono shadow-md backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                    title={isArabic ? 'استعادة الصورة الافتراضية' : 'Réinitialiser la photo'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar: Brand Cue & Smooth Scroll to Written Info */}
          <div className="flex items-center justify-between pb-0.5 sm:pb-2">
            <div className="hidden sm:block">
              <span className="text-[11px] font-mono tracking-widest text-white/85 uppercase px-3.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15">
                {storeSettings.storeName || 'DBC CLOTHING WORKSHOP'}
              </span>
            </div>

            <button
              onClick={scrollToWrittenInfo}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/95 hover:bg-white text-[#1F1D1A] rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold shadow-lg backdrop-blur-md transition-colors cursor-pointer mx-auto sm:mx-0"
              aria-label="Voir les informations de la marque"
            >
              <span>{isArabic ? 'معلومات الورشة والأسعار' : (currentLanguage === 'en' ? 'Workshop Info & Pricing' : currentLanguage === 'es' ? 'Información y Colección' : 'Informations & Collection')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C6D3B]" />
            </button>
          </div>

        </div>
      </section>

      {/* 2. DEDICATED SEPARATED WRITTEN INFORMATION SECTION */}
      <section 
        id="hero-written-info"
        className="w-full bg-[#FAF8F5] border-b border-[#E8E1D5] py-7 sm:py-14 lg:py-20 text-[#1F1D1A] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-3.5 sm:space-y-6 lg:space-y-7">
            
            {/* Atelier Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 bg-[#EDE6DB] text-[#785E32] rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase border border-[#DDD3C4] max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
              <span className="truncate">{displayTagline}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#1F1D1A] leading-[1.2] sm:leading-[1.12] break-words">
              {displayTitle}
            </h1>

            {/* Subtitle Description */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#5A5247] font-sans leading-relaxed max-w-3xl">
              {displaySubtitle}
            </p>

            {/* Action CTA Buttons - Clear & Focused Hierarchy */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-4">
              <button
                id="hero-explore-collection-btn"
                onClick={onExploreCollection}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 min-h-[44px] bg-[#1F1D1A] text-white hover:bg-black text-xs font-mono uppercase tracking-widest rounded-xs shadow-md flex items-center justify-center gap-2.5 cursor-pointer font-bold transition-colors"
              >
                <span>{storeSettings.heroCtaText || t.heroExploreBtn}</span>
                <ArrowRight className="w-4 h-4 text-[#C9A96E]" />
              </button>

              <button
                id="hero-b2b-inquiry-btn"
                onClick={onOpenB2B}
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 min-h-[44px] bg-white hover:bg-[#F3EFE9] text-[#1F1D1A] text-xs font-mono uppercase tracking-widest rounded-xs border border-[#DDD4C5] flex items-center justify-center gap-2 cursor-pointer shadow-xs font-semibold transition-colors"
              >
                <Building2 className="w-4 h-4 text-[#8C6D3B]" />
                <span>{t.heroB2BBtn}</span>
              </button>
            </div>

          </div>

          {/* Trust & Capability Metrics Grid */}
          <div className="mt-8 sm:mt-14 lg:mt-16 pt-6 sm:pt-10 border-t border-[#E8E1D5] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
            
            <div className="bg-white p-5 rounded-lg border border-[#E8E1D5] shadow-xs hover:border-[#C9A96E] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#DDD4C5]">
                  <Building2 className="w-4 h-4 text-[#8C6D3B]" />
                </div>
                <strong className="block text-base text-[#1F1D1A] font-serif font-bold">
                  {t.metricB2B}
                </strong>
              </div>
              <p className="text-xs text-[#6B6357] font-mono leading-relaxed">{t.metricB2BSub}</p>
            </div>

            <div 
              onClick={onOpenOrderLookup} 
              className={`bg-white p-5 rounded-lg border border-[#E8E1D5] shadow-xs hover:border-[#C9A96E] transition-colors ${onOpenOrderLookup ? "cursor-pointer group" : ""}`}
              title="Suivi de commande & Délais des 69 Wilayas"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#DDD4C5] group-hover:border-[#C9A96E] transition-colors">
                  <Truck className="w-4 h-4 text-[#8C6D3B]" />
                </div>
                <strong className="block text-base text-[#1F1D1A] font-serif font-bold group-hover:text-[#8C6D3B] transition-colors">
                  {t.metricWilayas}
                </strong>
              </div>
              <p className="text-xs text-[#6B6357] font-mono leading-relaxed flex items-center justify-between">
                <span>{t.metricWilayasSub}</span>
                {onOpenOrderLookup && (
                  <span className="text-[11px] text-[#8C6D3B] font-semibold underline">
                    {isArabic ? 'تتبع' : (currentLanguage === 'en' ? 'Track' : currentLanguage === 'es' ? 'Seguimiento' : 'Suivi')}
                  </span>
                )}
              </p>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E8E1D5] shadow-xs hover:border-[#C9A96E] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#DDD4C5]">
                  <ShieldCheck className="w-4 h-4 text-[#8C6D3B]" />
                </div>
                <strong className="block text-base text-[#1F1D1A] font-serif font-bold">
                  {t.metricQuality}
                </strong>
              </div>
              <p className="text-xs text-[#6B6357] font-mono leading-relaxed">{t.metricQualitySub}</p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Toast Notification for Direct Actions */}
      {justUploadedToast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#1F1D1A]/95 text-white rounded-md font-mono text-xs flex items-center justify-center gap-2 shadow-2xl border border-[#C9A96E] animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-[#C9A96E]" />
          <span>{toastText || (isArabic ? 'تم تحديث الصورة بنجاح !' : 'Photo mise à jour avec succès !')}</span>
        </div>
      )}

      {/* 4. Interactive Hero Cover Customizer Modal for Administrator */}
      {isAdmin && isCoverModalOpen && (
        <CoverPhotoModal
          isOpen={isCoverModalOpen}
          onClose={() => setIsCoverModalOpen(false)}
          currentImage={heroImageSrc}
          currentSettings={storeSettings}
          currentLanguage={currentLanguage}
          onSave={async (updates) => {
            if (onUpdateHeroSettings) {
              onUpdateHeroSettings(updates);
            }
            setIsCoverModalOpen(false);
            setToastText(isArabic ? 'تم حفظ التعديلات بنجاح !' : 'Paramètres enregistrés avec succès !');
            setJustUploadedToast(true);
            setTimeout(() => setJustUploadedToast(false), 3500);
          }}
        />
      )}
    </div>
  );
};

export default HeroBanner;
