import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Save, 
  Store, 
  Phone, 
  Share2, 
  Check, 
  CreditCard,
  Image as ImageIcon,
  Upload,
  Trash2,
  Sparkles,
  Library,
  Link as LinkIcon,
  Eye,
  AlertCircle
} from 'lucide-react';
import { StoreSettings, MediaAsset } from '../../types';
import { saveStoreSettingsToDb } from '../../services/db';
import { useAdminLanguage } from '../../context/AdminLanguageContext';
import { compressImageFile } from '../../utils/imageCompressor';

interface ContentManagerTabProps {
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (newSettings: StoreSettings) => void;
  media?: MediaAsset[];
  onOpenMediaTab?: () => void;
}

const PRESET_COVERS = [
  {
    title: 'Atelier Confection',
    titleAr: 'مشغل خياطة وحياكة نسيج',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Streetwear & Hoodies',
    titleAr: 'ستوديو ستريتوير وهوديز',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Molleton Lourd & Tissus',
    titleAr: 'أقمشة ومولتون قطني فاخر',
    url: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Confection Minimaliste',
    titleAr: 'تفصيل وتصميم ملابس مينيمال',
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ContentManagerTab: React.FC<ContentManagerTabProps> = ({
  storeSettings,
  onUpdateStoreSettings,
  media = [],
  onOpenMediaTab,
}) => {
  const { t, adminLang, isRtl } = useAdminLanguage();
  const isArabic = adminLang === 'ar';
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<StoreSettings>({ ...storeSettings });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showRemoveCoverConfirm, setShowRemoveCoverConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    try {
      const optimizedUrl = await compressImageFile(file, 1400, 0.82);
      handleChange('heroImage', optimizedUrl);
      triggerToast(isArabic ? 'تم تحسين ومعاينة الصورة بنجاح' : 'Photo optimisée et chargée avec succès !');
    } catch (err) {
      console.error('Error processing uploaded cover image:', err);
      triggerToast(isArabic ? 'حدث خطأ أثناء معالجة الصورة' : 'Erreur lors du traitement de l’image');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveCoverPhoto = () => {
    handleChange('heroImage', '');
    setShowRemoveCoverConfirm(false);
    triggerToast(isArabic ? 'تمت إزالة صورة الواجهة' : 'Photo de couverture retirée');
  };

  const handleSelectMediaForCover = (url: string) => {
    handleChange('heroImage', url);
    setShowMediaPicker(false);
    triggerToast(isArabic ? 'تم اختيار صورة الواجهة من المكتبة' : 'Image sélectionnée depuis la médiathèque !');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveStoreSettingsToDb(formData);
      onUpdateStoreSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving content:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Toast Alert */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-5 py-3 rounded-lg shadow-2xl border border-[#C9A96E] text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t.contentSavedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5]">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#1F1C19] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#8C6D3B]" />
            <span>{t.contentTitle}</span>
          </h2>
          <p className="text-xs text-[#7C756B] font-mono mt-0.5">
            {t.contentSubtitle}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono flex items-center gap-2 cursor-pointer shadow-md transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#C9A96E]" />
          <span>{isSaving ? t.contentSavingBtn : t.contentSaveBtn}</span>
        </button>
      </div>

      {/* 1. Identity & Texts */}
      <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1F1C19] flex items-center gap-2 border-b border-[#F0EBE1] pb-2">
          <Store className="w-4 h-4 text-[#8C6D3B]" />
          <span>{t.contentWorkshopIdentity}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.contentStoreNameLabel}
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.contentTaglineLabel}
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Website Picture Cover Section */}
        <div className="pt-4 border-t border-[#F0EBE1] space-y-3">
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverFileUpload}
            className="hidden"
          />

          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-mono text-[#1F1C19] font-bold uppercase flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#8C6D3B]" />
                <span>{isArabic ? 'صورة واجهة الموقع الرئيسية (Website Picture Cover)' : 'Photo de Couverture du Site (Hero Picture)'}</span>
              </label>
              <p className="text-[11px] text-[#7C756B] font-mono mt-0.5">
                {isArabic 
                  ? 'الصورة الكبرى التي تظهر في أعلى واجهة المتجر الرئيسية' 
                  : 'Image mise en valeur sur le bandeau d’accueil principal de la boutique'}
              </p>
            </div>

            {formData.heroImage ? (
              <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{isArabic ? 'صورة مفعلة' : 'Couverture active'}</span>
              </span>
            ) : (
              <span className="text-[11px] font-mono px-2 py-0.5 bg-[#EAE3D5] text-[#7C756B] rounded">
                {isArabic ? 'غير محددة' : 'Aucune image'}
              </span>
            )}
          </div>

          {/* Visual Preview & Quick Actions */}
          {formData.heroImage ? (
            <div className="relative rounded-xl overflow-hidden border border-[#DDD4C5] bg-[#1E1B18] shadow-inner max-w-xl group flex items-center justify-center">
              <div className="aspect-[16/9] w-full relative overflow-hidden">
                <img
                  src={formData.heroImage}
                  alt="Aperçu couverture"
                  style={{ objectPosition: formData.heroFocalPosition || 'center' }}
                  className="w-full h-full object-cover select-none transition-all duration-300"
                />
                {/* Dynamic overlay scrim simulation */}
                {formData.heroOverlayStrength === 'subtle' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/15 pointer-events-none" />
                )}
                {(formData.heroOverlayStrength === 'medium' || !formData.heroOverlayStrength) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 pointer-events-none" />
                )}
                {formData.heroOverlayStrength === 'dark' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40 pointer-events-none" />
                )}

                {/* Simulated Fashion Hero Text */}
                <div className="absolute bottom-12 left-4 right-4 text-left pointer-events-none">
                  <span className="text-[10px] font-mono tracking-wider text-[#C9A96E] uppercase font-bold drop-shadow">
                    {formData.tagline || 'B2B & B2C • 69 WILAYAS'}
                  </span>
                  <h4 className="font-serif text-sm sm:text-base font-bold text-white drop-shadow truncate">
                    {formData.heroTitle || 'CONFECTION TEXTILE HAUT DE GAMME'}
                  </h4>
                </div>
              </div>

              {/* Action Bar overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/95 hover:bg-white text-[#1F1C19] text-xs font-mono rounded shadow cursor-pointer flex items-center gap-1.5 transition-all font-bold"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#8C6D3B]" />
                    <span>{isArabic ? 'تغيير الصورة' : 'Changer l’image'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                    className="px-3 py-1.5 bg-[#1F1D1A]/90 hover:bg-[#1F1D1A] text-white text-xs font-mono rounded shadow cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Library className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{isArabic ? 'من المكتبة' : 'Médiathèque'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRemoveCoverConfirm(true)}
                  className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-mono rounded shadow cursor-pointer flex items-center gap-1.5 transition-all"
                  title={isArabic ? 'إزالة صورة الواجهة' : 'Supprimer la couverture'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'إزالة' : 'Supprimer'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-[#DDD4C5] rounded-xl bg-[#FAF8F5] max-w-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white border border-[#DDD4C5] flex items-center justify-center text-[#8C6D3B] mx-auto shadow-2xs">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-[#1F1C19]">
                  {isArabic ? 'لم يتم تحديد صورة واجهة للموقع' : 'Aucune photo de couverture active'}
                </h4>
                <p className="text-xs text-[#7C756B] font-mono mt-0.5">
                  {isArabic 
                    ? 'يمكنك رفع صورة من جهازك، أو اختيارها من مكتبة الوسائط، أو إدخال رابط مباشر.' 
                    : 'Téléversez une image, choisissez dans votre médiathèque ou collez un lien.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs font-bold"
                >
                  <Upload className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{isArabic ? 'رفع صورة من الجهاز' : 'Téléverser une image'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMediaPicker(!showMediaPicker)}
                  className="px-4 py-2 bg-white hover:bg-[#F2EDE4] text-[#1F1C19] border border-[#DDD4C5] rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Library className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>{isArabic ? 'اختيار من المكتبة' : 'Choisir depuis la médiathèque'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Remove Confirmation */}
          {showRemoveCoverConfirm && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-900 flex items-center justify-between gap-3 max-w-xl animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{isArabic ? 'تأكيد إزالة صورة الواجهة من المتجر؟' : 'Confirmer la suppression de la photo de couverture ?'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRemoveCoverConfirm(false)}
                  className="px-2.5 py-1 bg-white border border-rose-300 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCoverPhoto}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors cursor-pointer font-bold"
                >
                  {isArabic ? 'نعم، إزالة' : 'Confirmer'}
                </button>
              </div>
            </div>
          )}

          {/* Media Library Selector Drawer */}
          {showMediaPicker && (
            <div className="p-4 bg-[#FAF8F5] border border-[#DDD4C5] rounded-xl max-w-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-2">
                <span className="text-xs font-mono font-bold text-[#1F1C19] flex items-center gap-1.5">
                  <Library className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>{isArabic ? 'اختر صورة من مكتبة الوسائط' : 'Choisir une image de la médiathèque'} ({media.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(false)}
                  className="text-xs font-mono text-[#7C756B] hover:text-[#1F1C19] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {media.length === 0 ? (
                <div className="py-4 text-center text-xs font-mono text-[#7C756B]">
                  {isArabic 
                    ? 'لا توجد وسائط بعد. قم برفع صورة جديدة من زر الرفع.' 
                    : 'Aucun média disponible. Téléversez une photo directement.'}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {media.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectMediaForCover(asset.url)}
                      className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                        formData.heroImage === asset.url
                          ? 'border-[#8C6D3B] ring-2 ring-[#8C6D3B]'
                          : 'border-[#DDD4C5] hover:border-[#8C6D3B]'
                      }`}
                    >
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                        <span className="text-[10px] font-mono text-white text-center font-bold">
                          {isArabic ? 'تحديد' : 'Sélectionner'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Direct URL input fallback */}
          <div className="max-w-xl space-y-1.5 pt-1">
            <label className="block text-[11px] font-mono text-[#7C756B] uppercase flex items-center gap-1">
              <LinkIcon className="w-3 h-3 text-[#8C6D3B]" />
              <span>{isArabic ? 'أو إدخال رابط صورة ويب مباشر (URL)' : 'Ou saisie directe d’un lien d’image (URL)'}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.heroImage || ''}
                onChange={(e) => handleChange('heroImage', e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black bg-white"
              />
              {formData.heroImage && (
                <button
                  type="button"
                  onClick={handleRemoveCoverPhoto}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  title={isArabic ? 'حذف' : 'Effacer'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="max-w-xl pt-2">
            <span className="text-[11px] font-mono text-[#8C8377] uppercase block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C9A96E]" />
              <span>{isArabic ? 'نماذج ورشة DBC الجاهزة' : 'Photos de confection suggérées'}</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleChange('heroImage', preset.url);
                    triggerToast(isArabic ? 'تم تطبيق نموذج الواجهة' : 'Modèle appliqué !');
                  }}
                  className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    formData.heroImage === preset.url
                      ? 'border-[#8C6D3B] bg-[#F2EDE4] ring-1 ring-[#8C6D3B]'
                      : 'border-[#DDD4C5] bg-white hover:border-[#8C6D3B]'
                  }`}
                >
                  <div className="aspect-[16/10] w-full rounded overflow-hidden bg-[#EAE4D8]">
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-mono text-[#1F1C19] truncate font-semibold">
                    {isArabic ? preset.titleAr : preset.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Focal Position & Overlay Strength */}
          <div className="max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#F0EBE1]">
            <div>
              <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1.5 font-bold flex items-center justify-between">
                <span>{isArabic ? 'موضع التركيز (Focal Point)' : 'Point de Focalisation'}</span>
                <span className="text-[11px] font-normal text-[#8C6D3B]">{formData.heroFocalPosition || 'center'}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {[
                  { id: 'center', label: isArabic ? 'الوسط' : 'Centre' },
                  { id: 'top', label: isArabic ? 'أعلى' : 'Haut' },
                  { id: 'bottom', label: isArabic ? 'أسفل' : 'Bas' },
                  { id: 'center top', label: isArabic ? 'وسط-أعلى' : 'Centre-Haut' },
                  { id: 'left', label: isArabic ? 'يسار' : 'Gauche' },
                  { id: 'right', label: isArabic ? 'يمين' : 'Droite' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => handleChange('heroFocalPosition', pos.id)}
                    className={`py-1.5 px-2 rounded-lg text-center border transition-all cursor-pointer ${
                      (formData.heroFocalPosition || 'center') === pos.id
                        ? 'bg-[#1F1D1A] text-white border-[#1F1D1A] font-bold shadow-xs'
                        : 'bg-[#FAF8F5] text-[#5A5247] border-[#DDD4C5] hover:border-[#8C6D3B]'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#8C8377] font-mono mt-1">
                {isArabic ? 'يحدد الجزء الظاهر من الصورة عند اختلاف أبعاد الشاشات' : 'Ajuste la zone visible de l’image sur les différents écrans'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1.5 font-bold flex items-center justify-between">
                <span>{isArabic ? 'قوة التعتيم (Overlay)' : 'Intensité du Voile'}</span>
                <span className="text-[11px] font-normal text-[#8C6D3B]">{formData.heroOverlayStrength || 'medium'}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {[
                  { id: 'subtle', label: isArabic ? 'خفيف' : 'Léger (30%)' },
                  { id: 'medium', label: isArabic ? 'متوسط' : 'Moyen (50%)' },
                  { id: 'dark', label: isArabic ? 'داكن' : 'Sombre (70%)' },
                ].map((str) => (
                  <button
                    key={str.id}
                    type="button"
                    onClick={() => handleChange('heroOverlayStrength', str.id)}
                    className={`py-1.5 px-2 rounded-lg text-center border transition-all cursor-pointer ${
                      (formData.heroOverlayStrength || 'medium') === str.id
                        ? 'bg-[#1F1D1A] text-white border-[#1F1D1A] font-bold shadow-xs'
                        : 'bg-[#FAF8F5] text-[#5A5247] border-[#DDD4C5] hover:border-[#8C6D3B]'
                    }`}
                  >
                    {str.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#8C8377] font-mono mt-1">
                {isArabic ? 'يضمن وضوح وقراءة النصوص والأزرار فوق الصورة' : 'Garantit la parfaite lisibilité des textes et boutons sur la photo'}
              </p>
            </div>
          </div>

          {/* Hero Typography & CTA Text Controls */}
          <div className="max-w-xl space-y-3 pt-3 border-t border-[#F0EBE1]">
            <span className="text-xs font-mono text-[#1F1C19] uppercase font-bold block">
              {isArabic ? 'نصوص وزر الواجهة الرئيسية (Hero Texts & CTA)' : 'Textes & Bouton d’Action de la Couverture'}
            </span>

            <div>
              <label className="block text-[11px] font-mono text-[#7C756B] uppercase mb-1">
                {isArabic ? 'عنوان الواجهة الرئيسي (Hero Title)' : 'Titre principal (Hero Title)'}
              </label>
              <input
                type="text"
                value={formData.heroTitle || ''}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                placeholder="CONFECTION TEXTILE HAUT DE GAMME ALGÉRIE"
                className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#7C756B] uppercase mb-1">
                {isArabic ? 'النص الوصفي للواجهة (Hero Subtitle)' : 'Sous-titre descriptif (Hero Subtitle)'}
              </label>
              <textarea
                rows={2}
                value={formData.heroSubtitle || ''}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                placeholder="Atelier de confection textile en Algérie spécialisé dans les hoodies lourds, joggings, t-shirts épais..."
                className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#7C756B] uppercase mb-1">
                {isArabic ? 'نص زر الاستكشاف الرئيسي (Hero CTA Text)' : 'Texte du Bouton CTA Principal'}
              </label>
              <input
                type="text"
                value={formData.heroCtaText || ''}
                onChange={(e) => handleChange('heroCtaText', e.target.value)}
                placeholder="EXPLORER LA COLLECTION"
                className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-4 py-2.5 rounded-lg shadow-xl border border-[#C9A96E] text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2. Contact & Physical Workshop Coordinates */}
      <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1F1C19] flex items-center gap-2 border-b border-[#F0EBE1] pb-2">
          <Phone className="w-4 h-4 text-[#8C6D3B]" />
          <span>{t.contentPhoneLabel} & WhatsApp</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.contentPhoneLabel}
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.contentWhatsAppLabel}
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => handleChange('whatsappNumber', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.contentEmailLabel}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.contentAddressLabel}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.orderCustomerCity}
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
            Google Maps URL
          </label>
          <input
            type="url"
            value={formData.mapsUrl || ''}
            onChange={(e) => handleChange('mapsUrl', e.target.value)}
            className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* 3. Social Media Channels */}
      <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1F1C19] flex items-center gap-2 border-b border-[#F0EBE1] pb-2">
          <Share2 className="w-4 h-4 text-[#8C6D3B]" />
          <span>{t.contentSocialLinks}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.contentInstagramLabel}
            </label>
            <input
              type="url"
              value={formData.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              {t.contentFacebookLabel}
            </label>
            <input
              type="url"
              value={formData.facebook}
              onChange={(e) => handleChange('facebook', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* 4. Payment & BaridiMob */}
      <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#1F1C19] flex items-center gap-2 border-b border-[#F0EBE1] pb-2">
          <CreditCard className="w-4 h-4 text-[#8C6D3B]" />
          <span>{t.dashBaridiMobPayment}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              RIP BaridiMob (20 Chiffres)
            </label>
            <input
              type="text"
              value={formData.baridiMobRip}
              onChange={(e) => handleChange('baridiMobRip', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
              Compte CCP + Clé
            </label>
            <input
              type="text"
              value={formData.ccpAccount}
              onChange={(e) => handleChange('ccpAccount', e.target.value)}
              className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-[#C9A96E]" />
          <span>{isSaving ? t.contentSavingBtn : t.contentSaveBtn}</span>
        </button>
      </div>
    </form>
  );
};
