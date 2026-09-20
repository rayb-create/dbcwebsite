import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Link as LinkIcon, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Library, 
  Layers, 
  AlertCircle
} from 'lucide-react';
import { MediaAsset } from '../types';
import { Language } from '../data/i18n';
import { compressImageFile } from '../utils/imageCompressor';

interface CoverPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
  currentFocalPosition?: string;
  currentOverlayStrength?: 'subtle' | 'medium' | 'dark';
  onSaveCover: (imageUrl: string, focalPosition?: string, overlayStrength?: 'subtle' | 'medium' | 'dark') => void;
  mediaAssets?: MediaAsset[];
  currentLanguage: Language;
  isAdmin?: boolean;
}

const PRESET_COVERS = [
  {
    title: 'Atelier Confection Textile',
    titleAr: 'مشغل خياطة وحياكة نسيج',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Streetwear & Hoodies Studio',
    titleAr: 'ستوديو ستريتوير وهوديز',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Étoffes & Molleton Lourd',
    titleAr: 'أقمشة ومولتون قطني فاخر',
    url: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Confection & Mannequin Minimaliste',
    titleAr: 'تفصيل وتصميم ملابس مينيمال',
    url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CoverPhotoModal: React.FC<CoverPhotoModalProps> = ({
  isOpen,
  onClose,
  currentImage = '',
  currentFocalPosition = 'center',
  currentOverlayStrength = 'medium',
  onSaveCover,
  mediaAssets = [],
  currentLanguage,
  isAdmin = true,
}) => {
  const isArabic = currentLanguage === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSourceTab, setActiveSourceTab] = useState<'upload' | 'url' | 'library' | 'presets'>('upload');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImage);
  const [focalPosition, setFocalPosition] = useState<string>(currentFocalPosition);
  const [overlayStrength, setOverlayStrength] = useState<'subtle' | 'medium' | 'dark'>(currentOverlayStrength);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep selectedUrl synced when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentImage);
      setFocalPosition(currentFocalPosition || 'center');
      setOverlayStrength(currentOverlayStrength || 'medium');
      setCustomUrlInput(currentImage && !currentImage.startsWith('data:') ? currentImage : '');
      setShowRemoveConfirm(false);
      setErrorMessage(null);
    }
  }, [isOpen, currentImage, currentFocalPosition, currentOverlayStrength]);

  // If not admin, the modal cannot be rendered
  if (!isAdmin || !isOpen) {
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const optimizedDataUrl = await compressImageFile(file, 1400, 0.82);
      setSelectedUrl(optimizedDataUrl);
    } catch (err) {
      console.error('Error compressing image:', err);
      setErrorMessage(isArabic ? 'فشل معالجة الصورة. يرجى تجربة ملف آخر.' : 'Échec du traitement de l’image.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const optimizedDataUrl = await compressImageFile(file, 1400, 0.82);
      setSelectedUrl(optimizedDataUrl);
    } catch (err) {
      console.error('Error compressing dropped image:', err);
      setErrorMessage(isArabic ? 'فشل معالجة الصورة. يرجى تجربة ملف آخر.' : 'Échec du traitement de l’image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyUrl = () => {
    if (!isAdmin) return;
    if (customUrlInput.trim()) {
      setSelectedUrl(customUrlInput.trim());
    }
  };

  const handleConfirmSave = () => {
    if (!isAdmin) return;
    onSaveCover(selectedUrl, focalPosition, overlayStrength);
    onClose();
  };

  const handleRemoveCover = () => {
    if (!isAdmin) return;
    onSaveCover('');
    setSelectedUrl('');
    setShowRemoveConfirm(false);
    onClose();
  };

  // Filter media library to images
  const availableMedia = mediaAssets.filter(
    (m) => m.type === 'image' && (!libraryFilter || m.title.toLowerCase().includes(libraryFilter.toLowerCase()))
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FAF8F5] border border-[#DDD4C5] rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE3D5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#DDD4C5] flex items-center justify-center text-[#8C6D3B]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#1F1D1A]">
                {isArabic ? 'تعديل صورة غلاف واجهة المتجر' : 'Photo de Couverture du Site'}
              </h2>
              <p className="text-[11px] font-mono text-[#787167]">
                {isArabic ? 'صورة الحملة الإعلانية الرئيسية لواجهة DBC Workshop' : 'Image de campagne principale du Hero Banner'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#787167] hover:text-black hover:bg-[#F2EDE4] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Real-time Live Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-[#4A4338] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
                {isArabic ? 'معاينة الغلاف' : 'Aperçu Direct'}
              </span>
              {selectedUrl && (
                <span className="text-[11px] font-mono text-[#8C6D3B] bg-[#F2EDE4] px-2 py-0.5 rounded">
                  {selectedUrl.startsWith('data:') ? 'Image importée (optimisée)' : 'Image URL'}
                </span>
              )}
            </div>

            <div 
              className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-[#DDD4C5] bg-[#1F1D1A] shadow-inner flex items-center justify-center"
            >
              {selectedUrl ? (
                <>
                  <img
                    src={selectedUrl}
                    alt="Preview"
                    className="w-full h-full object-cover transition-all"
                    style={{ objectPosition: focalPosition }}
                  />
                  {/* Applied Overlay Preview */}
                  <div 
                    className={`absolute inset-0 pointer-events-none transition-opacity ${
                      overlayStrength === 'subtle' 
                        ? 'bg-gradient-to-t from-black/35 via-black/10 to-black/20'
                        : overlayStrength === 'dark'
                        ? 'bg-gradient-to-t from-black/70 via-black/30 to-black/55'
                        : 'bg-gradient-to-t from-black/50 via-black/15 to-black/35'
                    }`}
                  />
                  {/* Subtle mock overlay text */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between pointer-events-none text-white/90">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9A96E] block">
                        DBC WORKSHOP
                      </span>
                      <span className="text-xs font-serif font-bold block truncate">
                        {isArabic ? 'مشغل الخياطة والستريتوير' : 'Atelier de Confection Algérie'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded border border-white/20">
                      {focalPosition}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-white/40">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-mono">
                    {isArabic ? 'سيتم استخدام الصورة الافتراضية للموقع' : 'La photo par défaut sera utilisée'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Focal Position & Overlay Tuning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3.5 rounded-lg border border-[#EAE3D5]">
            {/* Focal Position */}
            <div>
              <label className="text-xs font-mono font-bold text-[#4A4338] block mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>{isArabic ? 'نقطة تركيز الصورة (Focal)' : 'Cadrage / Point Focal'}</span>
              </label>
              <select
                value={focalPosition}
                onChange={(e) => setFocalPosition(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="center">{isArabic ? 'الوسط (تلقائي)' : 'Centre (Par défaut)'}</option>
                <option value="top">{isArabic ? 'أعلى الصورة' : 'Haut'}</option>
                <option value="bottom">{isArabic ? 'أسفل الصورة' : 'Bas'}</option>
                <option value="center 30%">{isArabic ? 'أعلى الوسط (ملابس وجسم)' : 'Haut centré (30%)'}</option>
                <option value="left">{isArabic ? 'يسار' : 'Gauche'}</option>
                <option value="right">{isArabic ? 'يمين' : 'Droite'}</option>
              </select>
            </div>

            {/* Overlay Strength */}
            <div>
              <label className="text-xs font-mono font-bold text-[#4A4338] block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>{isArabic ? 'شدة التعتيم السينمائي' : 'Intensité du Dégradé'}</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['subtle', 'medium', 'dark'] as const).map((strength) => (
                  <button
                    key={strength}
                    type="button"
                    onClick={() => setOverlayStrength(strength)}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono text-center border cursor-pointer transition-colors ${
                      overlayStrength === strength
                        ? 'bg-[#1F1D1A] text-white border-black font-bold'
                        : 'bg-[#FAF8F5] text-[#5A5247] border-[#DDD4C5] hover:bg-[#F2EDE4]'
                    }`}
                  >
                    {strength === 'subtle' 
                      ? (isArabic ? 'خفيف' : 'Subtil') 
                      : strength === 'medium' 
                      ? (isArabic ? 'متوسط' : 'Moyen') 
                      : (isArabic ? 'داكن' : 'Foncé')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Remove Cover Alert Confirm */}
          {showRemoveConfirm && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {isArabic
                    ? 'هل أنت متأكد من رغبتك في إزالة صورة الواجهة والعودة للصورة الافتراضية؟'
                    : 'Confirmer la suppression de la photo personnalisée ?'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRemoveConfirm(false)}
                  className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 rounded text-xs hover:bg-rose-100 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 cursor-pointer"
                >
                  {isArabic ? 'نعم، إزالة' : 'Supprimer'}
                </button>
              </div>
            </div>
          )}

          {/* Source Tabs */}
          <div>
            <div className="flex items-center gap-1 border-b border-[#EAE3D5] mb-4">
              <button
                type="button"
                onClick={() => setActiveSourceTab('upload')}
                className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                  activeSourceTab === 'upload'
                    ? 'border-black text-black'
                    : 'border-transparent text-[#787167] hover:text-black'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isArabic ? 'رفع صورة من جهازك' : 'Télécharger'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceTab('url')}
                className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                  activeSourceTab === 'url'
                    ? 'border-black text-black'
                    : 'border-transparent text-[#787167] hover:text-black'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{isArabic ? 'رابط مباشر' : 'Lien URL'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceTab('presets')}
                className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                  activeSourceTab === 'presets'
                    ? 'border-black text-black'
                    : 'border-transparent text-[#787167] hover:text-black'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isArabic ? 'اقتراحات الأتيليه' : 'Modèles Studio'}</span>
              </button>

              {mediaAssets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveSourceTab('library')}
                  className={`px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                    activeSourceTab === 'library'
                      ? 'border-black text-black'
                      : 'border-transparent text-[#787167] hover:text-black'
                  }`}
                >
                  <Library className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'مكتبة الوسائط' : 'Médiathèque'}</span>
                  <span className="text-[10px] bg-[#EAE3D5] px-1.5 py-0.2 rounded-full">
                    {availableMedia.length}
                  </span>
                </button>
              )}
            </div>

            {/* TAB 1: File Upload (Drag & Drop + Native input) */}
            {activeSourceTab === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp, image/jpg"
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-black bg-[#F2EDE4]'
                      : 'border-[#DDD4C5] bg-white hover:border-[#8C6D3B] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FAF8F5] border border-[#DDD4C5] flex items-center justify-center text-[#8C6D3B]">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-mono font-bold text-[#1F1D1A] mb-1">
                    {isProcessing
                      ? (isArabic ? 'جاري ضغط وتحسين الصورة...' : 'Traitement et compression en cours...')
                      : isArabic
                      ? 'انقر هنا لاختيار صورة، أو اسحب الملف وأفلته'
                      : 'Glissez-déposez une photo ou cliquez pour parcourir'}
                  </p>
                  <p className="text-[11px] font-mono text-[#787167]">
                    JPG, PNG, WebP • {isArabic ? 'يتم ضغط الصورة تلقائياً لسرعة تحميل فائقة' : 'Compression automatique pour performance mobile rapide'}
                  </p>
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-600 font-mono">{errorMessage}</p>
                )}
              </div>
            )}

            {/* TAB 2: Direct URL input */}
            {activeSourceTab === 'url' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 bg-white border border-[#DDD4C5] rounded text-xs font-mono focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-[#1F1D1A] hover:bg-black text-white rounded text-xs font-mono font-bold cursor-pointer"
                  >
                    {isArabic ? 'معاينة' : 'Appliquer'}
                  </button>
                </div>
                <p className="text-[11px] font-mono text-[#787167]">
                  {isArabic 
                    ? 'أدخل رابط مباشر لصورة عالية الدقة (Unsplash, Cloudinary, إلخ)' 
                    : 'Entrez une URL directe d’image haute définition hébergée en ligne.'}
                </p>
              </div>
            )}

            {/* TAB 3: Atelier Presets */}
            {activeSourceTab === 'presets' && (
              <div className="grid grid-cols-2 gap-3">
                {PRESET_COVERS.map((preset, idx) => {
                  const isSelected = selectedUrl === preset.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedUrl(preset.url)}
                      className={`group relative aspect-[16/10] rounded-lg overflow-hidden border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-black ring-2 ring-black'
                          : 'border-[#DDD4C5] hover:border-[#8C6D3B]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-2.5 flex flex-col justify-end text-white">
                        <span className="text-[11px] font-serif font-bold leading-tight truncate">
                          {isArabic ? preset.titleAr : preset.title}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-mono text-[#C9A96E] flex items-center gap-0.5 mt-0.5">
                            <Check className="w-3 h-3" />
                            {isArabic ? 'محددة' : 'Sélectionnée'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 4: Media Library */}
            {activeSourceTab === 'library' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={libraryFilter}
                  onChange={(e) => setLibraryFilter(e.target.value)}
                  placeholder={isArabic ? 'بحث في وسائط المتجر...' : 'Filtrer les médias...'}
                  className="w-full px-3 py-1.5 bg-white border border-[#DDD4C5] rounded text-xs font-mono focus:outline-none"
                />

                <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {availableMedia.map((media) => {
                    const isSelected = selectedUrl === media.url;
                    return (
                      <div
                        key={media.id}
                        onClick={() => setSelectedUrl(media.url)}
                        className={`group relative aspect-video rounded border overflow-hidden cursor-pointer ${
                          isSelected
                            ? 'border-black ring-2 ring-black'
                            : 'border-[#DDD4C5] hover:border-[#8C6D3B]'
                        }`}
                      >
                        <img
                          src={media.url}
                          alt={media.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono">
                          <span>
                            {isSelected ? (isArabic ? '✓ محددة حالياً' : '✓ Sélectionnée') : (isArabic ? 'انقر للتحديد' : 'Cliquer pour choisir')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#EAE3D5] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            {currentImage && (
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(true)}
                className="text-xs font-mono text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إزالة صورة الواجهة' : 'Supprimer la couverture'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono text-[#5A5247] hover:bg-[#EAE3D5] transition-colors cursor-pointer"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
            <button
              type="button"
              onClick={handleConfirmSave}
              className="px-5 py-2 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#C9A96E]" />
              <span>{isArabic ? 'حفظ وتطبيق الواجهة' : 'Enregistrer la Couverture'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
