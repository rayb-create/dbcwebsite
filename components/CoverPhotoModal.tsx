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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (customUrlInput.trim()) {
      setSelectedUrl(customUrlInput.trim());
    }
  };

  const handleConfirmSave = () => {
    onSaveCover(selectedUrl, focalPosition, overlayStrength);
    onClose();
  };

  const handleRemoveCover = () => {
    onSaveCover('');
    setSelectedUrl('');
    setShowRemoveConfirm(false);
    onClose();
  };

  const filteredLibrary = mediaAssets.filter((asset) => 
    asset.name.toLowerCase().includes(libraryFilter.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className={`bg-white rounded-xl border border-[#DDD4C5] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isArabic ? 'text-right' : 'text-left'
        }`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE3D5] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F2EDE4] border border-[#DDD4C5] flex items-center justify-center text-[#8C6D3B]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {isArabic ? 'تعديل أو إضافة أو إزالة صورة الواجهة' : 'Modifier, Ajouter ou Supprimer la Couverture'}
              </h3>
              <p className="text-[11px] text-[#7C756B] font-mono">
                {isArabic 
                  ? 'الصورة المعروضة في أعلى واجهة المتجر والبانر الرئيسي' 
                  : 'Image principale du haut de page de votre boutique DBC'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7C756B] hover:bg-[#EAE3D5] hover:text-[#1F1C19] transition-colors cursor-pointer"
            title={isArabic ? 'إغلاق' : 'Fermer'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Current / Selected Preview Card */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E1D5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#5A5247] uppercase font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span>{isArabic ? 'المعاينة المباشرة' : 'Aperçu actuel'}</span>
              </span>

              {selectedUrl ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded">
                  <Check className="w-3 h-3" />
                  <span>{isArabic ? 'صورة محددة' : 'Image prête'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-[#EAE3D5] text-[#7C756B] rounded">
                  {isArabic ? 'لا توجد صورة واجهة' : 'Aucune photo'}
                </span>
              )}
            </div>

            {selectedUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-lg overflow-hidden border border-[#DDD4C5] bg-[#1E1B18] shadow-inner group flex items-center justify-center">
                  <img
                    src={selectedUrl}
                    alt="Aperçu de la couverture"
                    style={{ objectPosition: focalPosition }}
                    className="w-full h-full object-cover select-none transition-all duration-300"
                  />
                  {/* Dynamic overlay scrim simulation */}
                  {overlayStrength === 'subtle' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/15 pointer-events-none" />
                  )}
                  {overlayStrength === 'medium' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 pointer-events-none" />
                  )}
                  {overlayStrength === 'dark' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40 pointer-events-none" />
                  )}

                  {/* Sample typography simulation on preview */}
                  <div className="absolute bottom-3 left-4 text-left pointer-events-none">
                    <span className="text-[10px] font-mono tracking-wider text-[#C9A96E] uppercase font-bold drop-shadow">
                      DBC Workshop Algérie
                    </span>
                    <h4 className="font-serif text-sm sm:text-base font-bold text-white drop-shadow">
                      Aperçu Plein Écran
                    </h4>
                  </div>

                  {/* Floating controls over the preview */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRemoveConfirm(true)}
                      className="px-2.5 py-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded text-[11px] font-mono flex items-center gap-1 shadow cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'إزالة' : 'Retirer'}</span>
                    </button>
                  </div>
                </div>

                {/* Focal Position & Overlay Strength Configuration Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Focal Position */}
                  <div className="bg-white p-3 rounded-lg border border-[#E8E1D5] space-y-2">
                    <label className="text-xs font-mono font-bold text-[#5A5247] flex items-center justify-between">
                      <span>{isArabic ? 'موضع التركيز (Focal Point)' : 'Point de focalisation'}</span>
                      <span className="text-[11px] font-normal text-[#8C6D3B]">{focalPosition}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
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
                          onClick={() => setFocalPosition(pos.id)}
                          className={`py-1 px-1.5 rounded text-center border transition-all cursor-pointer ${
                            focalPosition === pos.id
                              ? 'bg-[#1F1D1A] text-[#FAF8F5] border-[#1F1D1A] font-bold shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5247] border-[#DDD4C5] hover:border-[#8C6D3B]'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Overlay Strength */}
                  <div className="bg-white p-3 rounded-lg border border-[#E8E1D5] space-y-2">
                    <label className="text-xs font-mono font-bold text-[#5A5247] flex items-center justify-between">
                      <span>{isArabic ? 'قوة التعتيم (Overlay)' : 'Voile de contraste'}</span>
                      <span className="text-[11px] font-normal text-[#8C6D3B]">{overlayStrength}</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                      {[
                        { id: 'subtle', label: isArabic ? 'خفيف' : 'Léger' },
                        { id: 'medium', label: isArabic ? 'متوسط' : 'Moyen' },
                        { id: 'dark', label: isArabic ? 'داكن' : 'Sombre' },
                      ].map((str) => (
                        <button
                          key={str.id}
                          type="button"
                          onClick={() => setOverlayStrength(str.id as 'subtle' | 'medium' | 'dark')}
                          className={`py-1 px-1.5 rounded text-center border transition-all cursor-pointer ${
                            overlayStrength === str.id
                              ? 'bg-[#1F1D1A] text-[#FAF8F5] border-[#1F1D1A] font-bold shadow-xs'
                              : 'bg-[#FAF8F5] text-[#5A5247] border-[#DDD4C5] hover:border-[#8C6D3B]'
                          }`}
                        >
                          {str.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 border-2 border-dashed border-[#DDD4C5] rounded-lg text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-[#A8A196] mx-auto" />
                <p className="text-xs text-[#7C756B] font-mono">
                  {isArabic 
                    ? 'لم يتم تحديد أي صورة واجهة حتى الآن. اختر خياراً من الخيارات بالأسفل.' 
                    : 'Aucune photo de couverture active. Choisissez une méthode ci-dessous.'}
                </p>
              </div>
            )}

            {/* Remove Confirmation Alert */}
            {showRemoveConfirm && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-900 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{isArabic ? 'هل تريد بالتأكيد إزالة صورة الواجهة من الموقع؟' : 'Confirmer le retrait de la couverture ?'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRemoveConfirm(false)}
                    className="px-2.5 py-1 bg-white border border-rose-300 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    {isArabic ? 'إلغاء' : 'Annuler'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors cursor-pointer font-bold"
                  >
                    {isArabic ? 'نعم، إزالة' : 'Confirmer'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Source Tabs */}
          <div>
            <div className="flex items-center border-b border-[#DDD4C5] gap-2 pb-px overflow-x-auto text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveSourceTab('upload')}
                className={`pb-2 px-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeSourceTab === 'upload'
                    ? 'border-[#8C6D3B] text-[#8C6D3B] font-bold'
                    : 'border-transparent text-[#7C756B] hover:text-[#1F1C19]'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{isArabic ? 'رفع من الجهاز' : 'Depuis l’appareil'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceTab('url')}
                className={`pb-2 px-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeSourceTab === 'url'
                    ? 'border-[#8C6D3B] text-[#8C6D3B] font-bold'
                    : 'border-transparent text-[#7C756B] hover:text-[#1F1C19]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{isArabic ? 'رابط ويب (URL)' : 'Lien URL'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceTab('library')}
                className={`pb-2 px-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeSourceTab === 'library'
                    ? 'border-[#8C6D3B] text-[#8C6D3B] font-bold'
                    : 'border-transparent text-[#7C756B] hover:text-[#1F1C19]'
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>
                  {isArabic ? 'مكتبة صور الورشة' : 'Médiathèque'} ({mediaAssets.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSourceTab('presets')}
                className={`pb-2 px-3 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  activeSourceTab === 'presets'
                    ? 'border-[#8C6D3B] text-[#8C6D3B] font-bold'
                    : 'border-transparent text-[#7C756B] hover:text-[#1F1C19]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isArabic ? 'نماذج جاهزة' : 'Photos suggérées'}</span>
              </button>
            </div>

            {/* Tab 1: Upload from Device */}
            {activeSourceTab === 'upload' && (
              <div className="pt-4 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#8C6D3B] bg-[#F4EFE6]'
                      : 'border-[#DDD4C5] bg-[#FAF8F5] hover:border-[#8C6D3B] hover:bg-[#F2EDE4]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white border border-[#DDD4C5] flex items-center justify-center text-[#8C6D3B] mb-2.5 shadow-2xs">
                    {isProcessing ? (
                      <div className="w-5 h-5 border-2 border-[#8C6D3B] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <h4 className="font-serif text-sm font-bold text-[#1F1C19] mb-1">
                    {isProcessing 
                      ? (isArabic ? 'جاري ضغط وتحسين الصورة للسحابة...' : 'Optimisation et compression pour le cloud...')
                      : (isArabic ? 'انقر لاختيار صورة من هاتفك أو حاسوبك' : 'Cliquez ou glissez-déposez une photo ici')}
                  </h4>
                  <p className="text-xs text-[#7C756B] font-mono max-w-sm leading-relaxed">
                    {isArabic 
                      ? 'يدعم صور JPG, PNG, WEBP (يتم تحسين الحجم تلقائياً لتوافق السحابة)' 
                      : 'Formats acceptés : JPG, PNG, WEBP (compression automatique < 400 Ko)'}
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Web Image URL */}
            {activeSourceTab === 'url' && (
              <div className="pt-4 space-y-3">
                <label className="block text-xs font-mono text-[#7C756B] uppercase">
                  {isArabic ? 'أدخل رابط صورة مباشر من الإنترنت' : 'Saisir l’URL directe d’une image'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
                  >
                    {isArabic ? 'معاينة' : 'Appliquer'}
                  </button>
                </div>
                <p className="text-[11px] text-[#8C8377] font-mono">
                  {isArabic 
                    ? 'مثال: رابط صورة من استضافة سحابية، Unsplash، أو موقعك الخارجي.' 
                    : 'Astuce : Vous pouvez coller un lien Unsplash ou toute image hébergée en ligne.'}
                </p>
              </div>
            )}

            {/* Tab 3: Media Library */}
            {activeSourceTab === 'library' && (
              <div className="pt-4 space-y-3">
                <input
                  type="text"
                  value={libraryFilter}
                  onChange={(e) => setLibraryFilter(e.target.value)}
                  placeholder={isArabic ? 'البحث في مكتبة الصور...' : 'Filtrer les médias par nom...'}
                  className="w-full px-3 py-1.5 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                />

                {filteredLibrary.length === 0 ? (
                  <div className="p-6 border border-dashed border-[#DDD4C5] rounded-lg text-center text-xs font-mono text-[#7C756B]">
                    {isArabic 
                      ? 'لا توجد صور في مكتبة الورشة حالياً. يمكنك رفع صور من تبويب "رفع من الجهاز".' 
                      : 'Aucun média disponible dans la bibliothèque. Téléversez-en un depuis l’onglet précédent.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
                    {filteredLibrary.map((asset) => {
                      const isSelected = selectedUrl === asset.url;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => setSelectedUrl(asset.url)}
                          className={`relative aspect-video rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                            isSelected
                              ? 'border-[#8C6D3B] ring-2 ring-[#8C6D3B]'
                              : 'border-[#DDD4C5] hover:border-[#8C6D3B]'
                          }`}
                        >
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] font-mono text-white truncate w-full">
                              {asset.name}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#8C6D3B] text-white rounded-full flex items-center justify-center shadow">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Curated Workshop Samples */}
            {activeSourceTab === 'presets' && (
              <div className="pt-4 space-y-3">
                <p className="text-xs text-[#7C756B] font-mono">
                  {isArabic 
                    ? 'اختر صورة من النماذج الحرفية الاحترافية المختارة خصيصاً لورشة الملابس DBC:' 
                    : 'Sélectionnez une photo professionnelle de confection textile prête à l’emploi :'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_COVERS.map((preset, idx) => {
                    const isSelected = selectedUrl === preset.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedUrl(preset.url)}
                        className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#8C6D3B] bg-[#F2EDE4] ring-1 ring-[#8C6D3B]'
                            : 'border-[#DDD4C5] bg-white hover:border-[#8C6D3B] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="w-16 h-12 rounded overflow-hidden bg-[#EAE4D8] shrink-0">
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-serif text-xs font-bold text-[#1F1C19] truncate">
                            {isArabic ? preset.titleAr : preset.title}
                          </h5>
                          <span className="text-[10px] text-[#8C6D3B] font-mono block">
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
