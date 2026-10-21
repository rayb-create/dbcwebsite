import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Building2, 
  Camera, 
  Trash2, 
  Check, 
  ChevronDown,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/i18n';
import { StoreSettings, MediaAsset } from '../types';
import { CoverPhotoModal } from './CoverPhotoModal';
import { useAuth } from '../context/AuthContext';
import { isBannedHeroPhrase } from '../services/db';

interface HeroBannerProps {
  onExploreCollection: () => void;
  onOpenB2B: () => void;
  onOpenContact: () => void;
  onOpenOrderLookup?: () => void;
  onOpenAdminHero?: () => void;
  onUpdateHeroImage?: (imageUrl: string) => void;
  onUpdateHeroSettings?: (settings: Partial<StoreSettings>) => void;
  currentLanguage: Language;
  storeSettings: StoreSettings;
  mediaAssets?: MediaAsset[];
  isAdmin?: boolean;
  isSettingsLoaded?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCollection,
  onOpenB2B,
  onOpenContact,
  onOpenOrderLookup,
  onUpdateHeroImage,
  onUpdateHeroSettings,
  currentLanguage,
  storeSettings,
  mediaAssets = [],
  isAdmin: propIsAdmin,
  isSettingsLoaded = false,
}) => {
  const { isAdmin: authIsAdmin, currentUser, loading: authLoading } = useAuth();
  
  // Strict verified admin authorization check:
  // Public visitors must NEVER see or use cover management controls.
  const isAdmin = Boolean(
    !authLoading &&
    currentUser &&
    authIsAdmin === true &&
    propIsAdmin !== false
  );

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const [justUploadedToast, setJustUploadedToast] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [toastText, setToastText] = useState('');

  // Fallback high-fashion campaign photography for DBC Workshop:
  // Minimalist, studio-lit editorial model composition with architectural silhouette & generous presence.
  // Hero image is intentionally blank unless explicitly uploaded by the store owner in the Manager Panel
  const fallbackHeroImage = '';

  // Safety timeout if Firestore takes long, ensuring the hero doesn't remain blank indefinitely
  const [settingsTimeout, setSettingsTimeout] = useState(false);
  useEffect(() => {
    if (isSettingsLoaded) return;
    const timer = setTimeout(() => {
      setSettingsTimeout(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [isSettingsLoaded]);

  const isCoverDetermined = Boolean(
    (storeSettings.heroImage && storeSettings.heroImage.trim().length > 0) ||
    isSettingsLoaded ||
    settingsTimeout
  );

  const heroImageSrc = (storeSettings.heroImage && storeSettings.heroImage.trim().length > 0)
    ? storeSettings.heroImage
    : '';

  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && heroImageSrc) {
      setIsImgLoaded(true);
    } else if (!heroImageSrc) {
      setIsImgLoaded(false);
    }
  }, [heroImageSrc]);

  // Focal point positioning (configurable via admin / modal)
  const focalPosition = storeSettings.heroFocalPosition || 'center';

  const handleRemoveHeroImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    if (onUpdateHeroSettings) {
      onUpdateHeroSettings({ heroImage: '', heroImages: [] });
    } else if (onUpdateHeroImage) {
      onUpdateHeroImage('');
    }
    setToastText(isArabic ? 'تمت استعادة الصورة الافتراضية' : 'Photo de couverture réinitialisée');
    setJustUploadedToast(true);
    setTimeout(() => setJustUploadedToast(false), 3000);
  };

  const scrollToWrittenInfo = () => {
    const el = document.getElementById('hero-written-info');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onExploreCollection();
    }
  };

  const isBannedPhrase = (text?: string) => {
    return isBannedHeroPhrase(text);
  };

  const getSafeText = (customText?: string, defaultText: string = ''): string => {
    if (customText && !isBannedPhrase(customText)) return customText;
    return !isBannedPhrase(defaultText) ? defaultText : '';
  };

  // Dynamic Content Resolution with fallback to editorial brand positioning
  const displayBrandName = storeSettings.storeName || 'DBC WORKSHOP';
  
  const displayHeadline = currentLanguage === 'ar'
    ? 'اثبت حضورك الخاص.'
    : currentLanguage === 'es'
    ? 'DEFINE TU PRESENCIA.'
    : currentLanguage === 'fr'
    ? 'IMPOSEZ VOTRE PRÉSENCE.'
    : 'OWN YOUR PRESENCE.';



  const displayTagline = currentLanguage === 'es'
    ? getSafeText(storeSettings.taglineEs, 'Atelier de Confección & Marca Textil Argelina')
    : currentLanguage === 'ar'
    ? getSafeText(storeSettings.taglineAr, 'ورشة تصنيع ملابس فاخرة • جودة جزائرية معتمدة')
    : currentLanguage === 'en'
    ? getSafeText(storeSettings.taglineEn, 'Apparel Atelier & Luxury Garment Production')
    : getSafeText(storeSettings.tagline, 'Atelier de Confection & Marque Textile');

  // Focal point mapping for responsive devices
  const desktopFocal = focalPosition || 'center';
  let mobileFocal = 'center 28%';
  let tabletFocal = 'center 35%';

  if (desktopFocal === 'top' || desktopFocal === 'center top') {
    mobileFocal = 'center 12%';
    tabletFocal = 'center 20%';
  } else if (desktopFocal === 'bottom' || desktopFocal === 'center bottom') {
    mobileFocal = 'center 75%';
    tabletFocal = 'center 70%';
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
    <div id="hero-cover-section" className="w-full flex flex-col bg-[#FFFFFF] overflow-x-hidden text-[#111111]">
      <style>{`
        #hero-campaign-visual .hero-campaign-img {
          object-position: var(--hero-mobile-focal, center 28%) !important;
        }
        @media (min-width: 640px) {
          #hero-campaign-visual .hero-campaign-img {
            object-position: var(--hero-tablet-focal, center 35%) !important;
          }
        }
        @media (min-width: 1024px) {
          #hero-campaign-visual .hero-campaign-img {
            object-position: var(--hero-desktop-focal, center) !important;
          }
        }
      `}</style>

      {/* 1. IMMERSIVE EDITORIAL FASHION CAMPAIGN HERO */}
      <section 
        id="hero-campaign-visual"
        className="relative w-full min-h-[75vh] sm:min-h-[82vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden bg-[#111111] select-none"
        style={{
          width: '100%',
          ['--hero-mobile-focal' as string]: mobileFocal,
          ['--hero-tablet-focal' as string]: tabletFocal,
          ['--hero-desktop-focal' as string]: desktopFocal,
        } as React.CSSProperties}
      >
        {/* Full-Bleed Campaign Image */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#111111]">
          {heroImageSrc ? (
            <img
              ref={imgRef}
              src={heroImageSrc}
              alt={displayBrandName}
              className={`hero-campaign-img w-full h-full object-cover select-none transition-opacity duration-1000 ease-out ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsImgLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-[#111111] animate-pulse" />
          )}

          {/* Architectural Fashion Scrim: Subtle, high-contrast monochrome gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/50 pointer-events-none" />
        </div>

        {/* Top Floating Utility: Atelier Badge & Admin Cover Controls */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>{displayBrandName} • {isArabic ? 'صناعة جزائرية' : 'Algérie'}</span>
          </div>

          {/* Admin-only cover photo customizer trigger */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className="px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-sans flex items-center gap-1.5 border border-white/25 transition-colors cursor-pointer backdrop-blur-md shadow-md"
                title={isArabic ? 'تعديل صورة الواجهة وموضع التركيز' : 'Modifier la photo de couverture'}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isArabic ? 'صورة الواجهة' : 'Photo de couverture'}</span>
              </button>
              {storeSettings.heroImage && (
                <button
                  type="button"
                  onClick={handleRemoveHeroImage}
                  className="p-1.5 bg-black/75 hover:bg-rose-900 text-white text-xs font-sans border border-white/25 transition-colors cursor-pointer backdrop-blur-md shadow-md"
                  title={isArabic ? 'استعادة الصورة الافتراضية' : 'Réinitialiser la photo'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Editorial Content Overlay: Typographic Presence with Generous Whitespace */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 lg:pb-20 pt-24 flex flex-col justify-end">
          <div className="max-w-3xl space-y-4 sm:space-y-6">
            
            {/* Atelier Brand Label */}
            <div className="text-white/80 text-xs sm:text-sm font-sans tracking-[0.3em] uppercase font-semibold">
              {displayBrandName}
            </div>

            {/* Editorial Headline: Cormorant Garamond */}
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-white leading-[1.05] drop-shadow-sm">
              {displayHeadline}
            </h1>



            {/* Two Primary Action Pathways: Explore Collection & Wholesale / Manufacturing */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                id="hero-explore-collection-btn"
                onClick={onExploreCollection}
                className="px-8 py-4 sm:py-4.5 bg-white text-[#111111] hover:bg-[#F3F3F1] text-xs font-sans uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 cursor-pointer transition-all duration-200 shadow-xl"
              >
                <span>{isArabic ? 'استكشف التشكيلة' : (currentLanguage === 'en' ? 'EXPLORE COLLECTION' : currentLanguage === 'es' ? 'EXPLORAR COLECCIÓN' : 'EXPLORER LA COLLECTION')}</span>
                <ArrowRight className="w-4 h-4 text-[#111111]" />
              </button>

              <button
                id="hero-b2b-inquiry-btn"
                onClick={onOpenB2B}
                className="px-8 py-4 sm:py-4.5 bg-black/60 hover:bg-black/85 text-white text-xs font-sans uppercase tracking-[0.2em] font-bold border border-white/40 hover:border-white flex items-center justify-center gap-3 cursor-pointer transition-all duration-200 backdrop-blur-md shadow-xl"
              >
                <Building2 className="w-4 h-4 text-white" />
                <span>{isArabic ? 'خدمات الجملة والتصنيع (B2B)' : (currentLanguage === 'en' ? 'WHOLESALE & MANUFACTURING' : currentLanguage === 'es' ? 'VENTA MAYORISTA Y CONFECCIÓN' : 'VENTE EN GROS & CONFECTION')}</span>
              </button>
            </div>

          </div>

          {/* Smooth scroll cue to workshop details */}
          <div className="pt-8 sm:pt-12 flex justify-start">
            <button
              onClick={scrollToWrittenInfo}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-sans uppercase tracking-[0.15em] transition-colors cursor-pointer"
            >
              <span>{isArabic ? 'تفاصيل الورشة والإنتاج' : 'Atelier & Savoir-Faire'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURAL WORKSHOP SPECIFICATIONS & CREDENTIALS SECTION */}
      <section 
        id="hero-written-info"
        className="w-full bg-[#FFFFFF] border-b border-[#E6E6E6] py-12 sm:py-20 lg:py-24 text-[#111111] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Atelier Philosophy */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="text-xs font-sans tracking-[0.25em] text-[#737373] uppercase font-semibold">
                {displayTagline}
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#111111] leading-[1.15]">
                {isArabic 
                  ? 'حياكة أزياء جزائرية بمواصفات عالمية للأفراد والمتاجر.'
                  : currentLanguage === 'en'
                  ? 'High-density garment construction crafted with precision in Algeria.'
                  : currentLanguage === 'es'
                  ? 'Confección textil de alta densidad diseñada y producida en Argelia.'
                  : 'Confection textile haute densité réalisée avec exigence en Algérie.'}
              </h2>

              <p className="text-sm sm:text-base text-[#737373] font-sans leading-relaxed max-w-2xl">
                {storeSettings.heroSubtitle || t.heroSubtitle || (
                  isArabic 
                    ? 'من خامات القطن الثقيلة (Heavyweight Fleece 380 GSM) إلى أدق تفاصيل الحياكة والتطريز، تجمع ورشتنا بين خطوط الموضة الراقية والقدرة الإنتاجية لتلبية طلبات التجزئة والتوزيع بالجملة عبر كافة الولايات.'
                    : 'De la sélection de molletons épais (380 GSM) aux finitions d’assemblage soignées, DBC Workshop conjugue allure contemporaine et rigueur manufacturière pour les particuliers et les revendeurs à travers les 69 wilayas.'
                )}
              </p>
            </div>

            {/* Right Column: Key Manufacturing Credentials */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-4 pt-2">
              <div className="p-6 bg-[#F8F8F7] border border-[#E6E6E6] space-y-2">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-[#111111]" />
                  <span className="font-serif text-lg font-normal text-[#111111]">
                    {t.metricB2B}
                  </span>
                </div>
                <p className="text-xs text-[#737373] font-sans leading-relaxed">
                  {t.metricB2BSub}
                </p>
              </div>

              <div 
                onClick={onOpenOrderLookup} 
                className={`p-6 bg-[#F8F8F7] border border-[#E6E6E6] space-y-2 transition-colors ${onOpenOrderLookup ? "cursor-pointer hover:border-[#111111]" : ""}`}
                title="Suivi de commande & Délais des 69 Wilayas"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#111111]" />
                    <span className="font-serif text-lg font-normal text-[#111111]">
                      {t.metricWilayas}
                    </span>
                  </div>
                  {onOpenOrderLookup && (
                    <span className="text-xs font-sans font-bold text-[#111111] underline">
                      {isArabic ? 'تتبع الطلبية' : 'Suivi'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#737373] font-sans leading-relaxed">
                  {t.metricWilayasSub}
                </p>
              </div>

              <div className="p-6 bg-[#F8F8F7] border border-[#E6E6E6] space-y-2">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#111111]" />
                  <span className="font-serif text-lg font-normal text-[#111111]">
                    {t.metricQuality}
                  </span>
                </div>
                <p className="text-xs text-[#737373] font-sans leading-relaxed">
                  {t.metricQualitySub}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Toast Notification for Direct Actions */}
      {justUploadedToast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#111111] text-white font-sans text-xs flex items-center justify-center gap-2 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-white" />
          <span>{toastText || (isArabic ? 'تم تحديث الصورة بنجاح !' : 'Photo mise à jour avec succès !')}</span>
        </div>
      )}

      {/* 4. Interactive Hero Cover Customizer Modal for Administrator */}
      {isAdmin && isCoverModalOpen && (
        <CoverPhotoModal
          isOpen={isCoverModalOpen}
          onClose={() => setIsCoverModalOpen(false)}
          currentImage={storeSettings.heroImage || ''}
          currentFocalPosition={focalPosition}
          currentOverlayStrength={storeSettings.heroOverlayStrength || 'medium'}
          onSaveCover={(newImage, newFocal, newOverlay) => {
            if (onUpdateHeroSettings) {
              onUpdateHeroSettings({
                heroImage: newImage,
                heroImages: newImage ? [newImage] : [],
                heroFocalPosition: newFocal,
                heroOverlayStrength: newOverlay,
              });
            } else if (onUpdateHeroImage) {
              onUpdateHeroImage(newImage);
            }
            setIsCoverModalOpen(false);
            setToastText(isArabic ? 'تم حفظ التعديلات بنجاح !' : 'Paramètres enregistrés avec succès !');
            setJustUploadedToast(true);
            setTimeout(() => setJustUploadedToast(false), 3500);
          }}
          mediaAssets={mediaAssets}
          currentLanguage={currentLanguage}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default HeroBanner;
