import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Building2, 
  Camera, 
  Trash2, 
  Check, 
  ChevronDown 
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

  // Hero image is intentionally blank unless explicitly uploaded by the store owner in the Manager Panel
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

  const isBannedPhrase = (text?: string) => {
    return isBannedHeroPhrase(text);
  };

  const getSafeText = (customText?: string, defaultText: string = ''): string => {
    if (customText && !isBannedPhrase(customText)) return customText;
    return !isBannedPhrase(defaultText) ? defaultText : '';
  };

  const displayBrandName = storeSettings.storeName || 'DBC WORKSHOP';
  
  // Short, carefully typeset editorial headline
  const displayHeadline = currentLanguage === 'ar'
    ? 'اثبت حضورك الخاص.'
    : currentLanguage === 'es'
    ? 'DEFINE TU PRESENCIA.'
    : currentLanguage === 'fr'
    ? 'IMPOSEZ VOTRE PRÉSENCE.'
    : 'OWN YOUR PRESENCE.';

  // One concise supporting sentence
  const displaySubtitle = currentLanguage === 'ar'
    ? (getSafeText(storeSettings.heroSubtitleAr, 'تصميم وحياكة أرقى الملابس والأطقم في الجزائر بمقاييس عالمية للأفراد والمتاجر.'))
    : currentLanguage === 'es'
    ? (getSafeText(storeSettings.heroSubtitleEs, 'Diseño y confección de prendas premium en Argelia para clientes y tiendas.'))
    : currentLanguage === 'en'
    ? (getSafeText(storeSettings.heroSubtitleEn, 'Design and garment manufacturing in Algeria crafted for individuals and wholesale partners.'))
    : (getSafeText(storeSettings.heroSubtitle, 'Conception et confection de vêtements haut de gamme en Algérie pour particuliers et boutiques revendeurs.'));

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

      {/* REFINED EDITORIAL HERO: Calm, beautiful, intentional */}
      <section 
        id="hero-campaign-visual"
        className={`relative w-full flex flex-col justify-between overflow-hidden select-none transition-colors ${
          heroImageSrc 
            ? 'min-h-[75vh] sm:min-h-[82vh] lg:min-h-[88vh] bg-[#111111]' 
            : 'min-h-[55vh] sm:min-h-[64vh] lg:min-h-[72vh] bg-[#FBFBFA] border-b border-[#E6E6E6]'
        }`}
        style={{
          width: '100%',
          ['--hero-mobile-focal' as string]: mobileFocal,
          ['--hero-tablet-focal' as string]: tabletFocal,
          ['--hero-desktop-focal' as string]: desktopFocal,
        } as React.CSSProperties}
      >
        {/* Large, spacious image area (Displays user's photo when uploaded, otherwise remains clean neutral background) */}
        {heroImageSrc ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#111111]">
            <img
              ref={imgRef}
              src={heroImageSrc}
              alt={displayBrandName}
              className={`hero-campaign-img w-full h-full object-cover select-none transition-opacity duration-1000 ease-out ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsImgLoaded(true)}
            />
            {/* Subtle editorial scrim for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />
          </div>
        ) : null}

        {/* Top Header Eyebrow & Admin Cover Controls */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 text-[11px] font-sans uppercase tracking-[0.25em] font-medium ${
            heroImageSrc ? 'text-white/80' : 'text-[#737373]'
          }`}>
            <span>{displayBrandName}</span>
            <span>•</span>
            <span>{isArabic ? 'ورشة أزياء جزائرية' : 'Atelier de Confection'}</span>
          </div>

          {/* Admin-only cover photo customizer trigger (Strictly hidden for public visitors) */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className={`px-3 py-1.5 text-xs font-sans flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  heroImageSrc
                    ? 'bg-black/75 hover:bg-black text-white border-white/25 backdrop-blur-md'
                    : 'bg-white hover:bg-[#F3F3F1] text-[#111111] border-[#E6E6E6]'
                }`}
                title={isArabic ? 'رفع صورة الواجهة وتحديد موضع التركيز' : 'Ajouter une photo de couverture'}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isArabic ? 'صورة الواجهة' : 'Photo de couverture'}</span>
              </button>
              {storeSettings.heroImage && (
                <button
                  type="button"
                  onClick={handleRemoveHeroImage}
                  className="p-1.5 bg-black/75 hover:bg-rose-900 text-white text-xs font-sans border border-white/25 transition-colors cursor-pointer backdrop-blur-md"
                  title={isArabic ? 'إزالة الصورة' : 'Retirer la photo'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Hero Content: Short Headline, One Concise Sentence, One Primary CTA & One Subtle Secondary Link */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-24 pt-16 sm:pt-24 flex flex-col justify-end">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            
            {/* Carefully typeset headline */}
            <h1 className={`font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-[1.05] ${
              heroImageSrc ? 'text-white drop-shadow-sm' : 'text-[#111111]'
            }`}>
              {displayHeadline}
            </h1>

            {/* One concise supporting sentence */}
            <p className={`text-sm sm:text-base md:text-lg font-sans leading-relaxed max-w-xl font-light ${
              heroImageSrc ? 'text-white/85' : 'text-[#737373]'
            }`}>
              {displaySubtitle}
            </p>

            {/* Action Pathways: 1 Primary CTA + 1 Subtle Secondary Link */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3 sm:pt-5">
              <button
                id="hero-explore-collection-btn"
                onClick={onExploreCollection}
                className={`px-8 py-3.5 sm:py-4 text-xs font-sans uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                  heroImageSrc
                    ? 'bg-white text-[#111111] hover:bg-[#F3F3F1] shadow-lg'
                    : 'bg-[#111111] text-white hover:bg-black shadow-sm'
                }`}
              >
                <span>{isArabic ? 'استكشف التشكيلة' : (currentLanguage === 'en' ? 'Explore the Collection' : currentLanguage === 'es' ? 'Explorar la Colección' : 'Explorer la Collection')}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${heroImageSrc ? 'text-[#111111]' : 'text-white'}`} />
              </button>

              <button
                id="hero-b2b-inquiry-btn"
                onClick={onOpenB2B}
                className={`px-6 py-3.5 sm:py-4 text-xs font-sans uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 underline underline-offset-4 ${
                  heroImageSrc
                    ? 'text-white/90 hover:text-white decoration-white/50'
                    : 'text-[#111111] hover:text-[#737373] decoration-[#111111]/40'
                }`}
              >
                <span>{isArabic ? 'اكتشف الورشة والإنتاج' : (currentLanguage === 'en' ? 'Discover the Atelier' : currentLanguage === 'es' ? 'Descubrir el Atelier' : 'Découvrir l’Atelier')}</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Toast Notification for Direct Actions */}
      {justUploadedToast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#111111] text-white font-sans text-xs flex items-center justify-center gap-2 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-white" />
          <span>{toastText || (isArabic ? 'تم تحديث الصورة بنجاح !' : 'Photo mise à jour avec succès !')}</span>
        </div>
      )}

      {/* Interactive Hero Cover Customizer Modal for Administrator */}
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
