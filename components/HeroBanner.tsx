import React, { useState } from 'react';
import { 
  ArrowRight, 
  MessageCircle, 
  Building2, 
  Camera, 
  Trash2, 
  Check, 
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/i18n';
import { StoreSettings, MediaAsset } from '../types';
import { CoverPhotoModal } from './CoverPhotoModal';
import { useAuth } from '../context/AuthContext';

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
}) => {
  const { isAdmin: authIsAdmin } = useAuth();
  const isAdmin = propIsAdmin ?? authIsAdmin;
  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';
  const [justUploadedToast, setJustUploadedToast] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [toastText, setToastText] = useState('');

  // Clean WhatsApp phone number for Algeria
  const cleanWhatsapp = (storeSettings.whatsappNumber || '+213550458812').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    isArabic
      ? 'مرحباً ورشة DBC، أود الاستفسار عن كوليكشن الملابس (هوديز، جوجينج) والأسعار.'
      : 'Bonjour DBC Workshop, je souhaite avoir des informations sur votre collection de vêtements (hoodies, joggings).'
  )}`;

  // Fallback fashion campaign visual for DBC Workshop if no custom photo uploaded yet
  const fallbackHeroImage = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=2400&q=85';
  const heroImageSrc = storeSettings.heroImage || fallbackHeroImage;

  // Focal point positioning (configurable via admin / modal)
  const focalPosition = storeSettings.heroFocalPosition || 'center';

  // Configurable overlay scrim gradient strength
  const overlayStrength = storeSettings.heroOverlayStrength || 'medium';

  const handleRemoveHeroImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  return (
    <div id="hero-cover-section" className="w-full flex flex-col bg-[#FAF8F5]">
      {/* 1. HERO CAMPAIGN VISUAL (Pure static photography, clean and 100% unobstructed) */}
      <section 
        id="hero-cover-visual"
        className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[78vh] min-h-[460px] max-h-[820px] overflow-hidden bg-[#1E1B18] select-none"
        style={{ width: '100%' }}
      >
        {/* Campaign Photography */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <img
            src={heroImageSrc}
            alt={storeSettings.storeName || 'DBC Clothing Workshop'}
            style={{
              objectPosition: focalPosition,
            }}
            className="w-full h-full object-cover select-none"
          />

          {/* Clean, subtle cinematic tone mapping */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />
        </div>

        {/* Floating Controls & Non-Intrusive Indicators */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-5 sm:py-6">
          {/* Top Bar: Category Pill & Discrete Admin Cover Edit Tool */}
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/45 backdrop-blur-md border border-white/20 rounded-full text-xs font-mono text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span className="font-semibold tracking-wider uppercase">{t.b2bB2cBadge}</span>
            </div>

            {/* Quick Cover Adjustment Trigger for owner/admin ONLY */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCoverModalOpen(true)}
                  className="px-3 py-1.5 bg-black/45 hover:bg-black/75 text-white/90 hover:text-white rounded-full text-[11px] font-mono flex items-center gap-1.5 shadow-md backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                  title={isArabic ? 'تعديل صورة الواجهة، وتحديد موضع التركيز' : 'Modifier la photo de couverture et le cadrage'}
                >
                  <Camera className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span className="hidden sm:inline">{isArabic ? 'تعديل صورة الواجهة' : 'Photo de couverture'}</span>
                </button>

                {storeSettings.heroImage && (
                  <button
                    type="button"
                    onClick={handleRemoveHeroImage}
                    className="p-1.5 bg-black/45 hover:bg-rose-700/80 text-white/80 hover:text-white rounded-full text-[11px] font-mono shadow-md backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                    title={isArabic ? 'استعادة الصورة الافتراضية' : 'Réinitialiser la photo'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar: Discrete Campaign Brand Cue & Smooth Scroll to Written Info */}
          <div className="flex items-center justify-between pb-2">
            <div className="hidden sm:block">
              <span className="text-[11px] font-mono tracking-widest text-white/85 uppercase px-3.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/15">
                {storeSettings.storeName || 'DBC CLOTHING WORKSHOP'}
              </span>
            </div>

            <button
              onClick={scrollToWrittenInfo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white text-[#1F1D1A] rounded-full text-xs font-mono uppercase tracking-wider font-bold shadow-lg backdrop-blur-md transition-colors cursor-pointer mx-auto sm:mx-0"
              aria-label="Voir les informations de la marque"
            >
              <span>{isArabic ? 'معلومات الورشة والأسعار' : 'Informations & Collection'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C6D3B]" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED SEPARATED WRITTEN INFORMATION SECTION */}
      <section 
        id="hero-written-info"
        className="w-full bg-[#FAF8F5] border-b border-[#E8E1D5] py-12 sm:py-16 lg:py-20 text-[#1F1D1A]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-5 sm:space-y-7">
            {/* Atelier Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EDE6DB] text-[#785E32] rounded-full text-xs font-mono font-bold tracking-wider uppercase border border-[#DDD3C4]">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>{storeSettings.tagline || 'Atelier de Confection Algérie • B2B & B2C'}</span>
            </div>

            {/* Main Headline with high contrast */}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#1F1D1A] leading-[1.12]">
              {storeSettings.heroTitle || t.heroTitle}
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg md:text-xl text-[#5A5247] font-sans leading-relaxed max-w-3xl">
              {storeSettings.heroSubtitle || t.heroSubtitle}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 sm:pt-4">
              <button
                id="hero-explore-collection-btn"
                onClick={onExploreCollection}
                className="px-6 sm:px-8 py-3.5 sm:py-4 bg-[#1F1D1A] text-white hover:bg-black text-xs font-mono uppercase tracking-widest rounded-xs shadow-md flex items-center gap-2.5 cursor-pointer font-bold transition-colors"
              >
                <span>{storeSettings.heroCtaText || t.heroExploreBtn}</span>
                <ArrowRight className="w-4 h-4 text-[#C9A96E]" />
              </button>

              <button
                id="hero-b2b-inquiry-btn"
                onClick={onOpenB2B}
                className="px-5 sm:px-6 py-3.5 sm:py-4 bg-white hover:bg-[#F3EFE9] text-[#1F1D1A] text-xs font-mono uppercase tracking-widest rounded-xs border border-[#DDD4C5] flex items-center gap-2 cursor-pointer shadow-xs font-semibold transition-colors"
              >
                <Building2 className="w-4 h-4 text-[#8C6D3B]" />
                <span>{t.heroB2BBtn}</span>
              </button>

              <a
                id="hero-whatsapp-direct-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-mono tracking-wider rounded-xs flex items-center gap-2 cursor-pointer shadow-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>{t.heroContactBtn}</span>
              </a>
            </div>
          </div>

          {/* Trust & Capability Metrics Grid */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-[#E8E1D5] grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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
                    {isArabic ? 'تتبع' : 'Suivi'}
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

      {/* 4. Website Picture Cover Management Modal (Admin Only) */}
      {isAdmin && (
        <CoverPhotoModal
          isOpen={isCoverModalOpen}
          onClose={() => setIsCoverModalOpen(false)}
          currentImage={storeSettings.heroImage || ''}
          currentFocalPosition={focalPosition}
          currentOverlayStrength={overlayStrength}
          onSaveCover={(url, newFocalPos, newOverlayStr) => {
            const updates: Partial<StoreSettings> = {
              heroImage: url,
              heroImages: url ? [url] : [],
            };
            if (newFocalPos) updates.heroFocalPosition = newFocalPos;
            if (newOverlayStr) updates.heroOverlayStrength = newOverlayStr;

            if (onUpdateHeroSettings) {
              onUpdateHeroSettings(updates);
            } else if (onUpdateHeroImage) {
              onUpdateHeroImage(url);
            }

            setToastText(
              url 
                ? (isArabic ? 'تم حفظ وتحديث صورة الواجهة بنجاح !' : 'Photo de couverture mise à jour avec succès !')
                : (isArabic ? 'تمت استعادة الصورة الافتراضية' : 'Photo de couverture réinitialisée !')
            );
            setJustUploadedToast(true);
            setTimeout(() => setJustUploadedToast(false), 3500);
          }}
          mediaAssets={mediaAssets}
          currentLanguage={currentLanguage}
        />
      )}
    </div>
  );
};
