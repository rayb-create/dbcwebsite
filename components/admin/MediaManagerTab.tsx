import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Plus, 
  Search, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { MediaAsset, StoreSettings } from '../../types';
import { saveMediaToDb, deleteMediaFromDb } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { useAdminLanguage } from '../../context/AdminLanguageContext';
import { compressImageFile } from '../../utils/imageCompressor';

interface MediaManagerTabProps {
  media: MediaAsset[];
  onSelectMediaUrl?: (url: string) => void;
  storeSettings?: StoreSettings;
  onSetHeroImage?: (url: string) => Promise<void> | void;
}

export const MediaManagerTab: React.FC<MediaManagerTabProps> = ({ 
  media, 
  onSelectMediaUrl,
  storeSettings,
  onSetHeroImage,
}) => {
  const { currentUser } = useAuth();
  const { t, adminLang, isRtl } = useAdminLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter] = useState<string>('all');
  const [externalUrl, setExternalUrl] = useState('');
  const [externalTitle, setExternalTitle] = useState('');
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to compress and convert file to optimized JPEG dataUrl safe for Firestore (< 350 KB)
  const processImageFile = async (file: File): Promise<{ dataUrl: string; sizeBytes: number }> => {
    try {
      const compressedDataUrl = await compressImageFile(file, 1400, 0.82);
      return {
        dataUrl: compressedDataUrl,
        sizeBytes: Math.round(compressedDataUrl.length * 0.75),
      };
    } catch {
      // Fallback
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: reader.result as string, sizeBytes: file.size });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { dataUrl, sizeBytes } = await processImageFile(file);
        
        const newAsset: MediaAsset = {
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: dataUrl,
          mimeType: file.type || 'image/jpeg',
          sizeBytes,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser?.email || 'admin',
          category: 'product',
        };

        await saveMediaToDb(newAsset);
      }
      showToast(
        adminLang === 'ar' ? `تم رفع ${files.length} ملف بنجاح` :
        adminLang === 'es' ? `Se han subido ${files.length} archivo(s)` :
        adminLang === 'en' ? `Uploaded ${files.length} file(s) successfully` :
        `${files.length} fichier(s) téléversé(s) avec succès`
      );
    } catch (err) {
      console.error('Upload error:', err);
      showToast(
        adminLang === 'ar' ? 'حدث خطأ في عملية الرفع' :
        adminLang === 'es' ? 'Error en la subida' :
        adminLang === 'en' ? 'Error uploading media' :
        'Erreur lors du traitement du média'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddExternalUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;

    const newAsset: MediaAsset = {
      id: `media-url-${Date.now()}`,
      name: externalTitle.trim() || `Image-${Date.now()}`,
      url: externalUrl.trim(),
      mimeType: 'image/url',
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.email || 'admin',
      category: 'general',
    };

    try {
      await saveMediaToDb(newAsset);
      setExternalUrl('');
      setExternalTitle('');
      setShowAddUrlModal(false);
      showToast(
        adminLang === 'ar' ? 'تمت إضافة الرابط بنجاح' :
        adminLang === 'es' ? 'URL añadida con éxito' :
        adminLang === 'en' ? 'URL added successfully' :
        'URL ajoutée avec succès'
      );
    } catch (err) {
      console.error('Error adding external image:', err);
      showToast(
        adminLang === 'ar' ? 'حدث خطأ في إضافة الرابط' :
        adminLang === 'es' ? 'Error al añadir URL' :
        adminLang === 'en' ? 'Error adding external URL' :
        'Erreur lors de l’ajout du lien'
      );
    }
  };

  const handleDeleteAsset = async (asset: MediaAsset) => {
    try {
      await deleteMediaFromDb(asset.id);
      setAssetToDelete(null);
      showToast(
        adminLang === 'ar' ? 'تم حذف الملف بنجاح' :
        adminLang === 'es' ? 'Archivo eliminado' :
        adminLang === 'en' ? 'Asset deleted successfully' :
        'Fichier supprimé avec succès'
      );
    } catch (err) {
      console.error('Delete media error:', err);
      showToast(
        adminLang === 'ar' ? 'حدث خطأ في الحذف' :
        adminLang === 'es' ? 'Error al eliminar' :
        adminLang === 'en' ? 'Error deleting media' :
        'Erreur lors de la suppression'
      );
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(t.mediaCopied);
  };

  const filteredMedia = media.filter((m) => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDateLocale = (isoStr: string) => {
    const localeMap: Record<string, string> = {
      ar: 'ar-DZ',
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES',
    };
    try {
      return new Date(isoStr).toLocaleDateString(localeMap[adminLang] || 'fr-FR');
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-4 py-2.5 rounded-lg shadow-xl border border-[#C9A96E]/40 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#C9A96E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5]">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#1F1C19] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#8C6D3B]" />
            <span>{t.mediaTitle}</span>
          </h2>
          <p className="text-xs text-[#7C756B] font-mono mt-0.5">
            {t.mediaSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setShowAddUrlModal(true)}
            className="px-3 py-2 bg-white hover:bg-[#F2EDE4] text-[#1F1C19] border border-[#DDD4C5] rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.mediaAddUrlBtn}</span>
          </button>

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono flex items-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-[#C9A96E]" />
            <span>{isUploading ? t.mediaProcessing : t.mediaUploadBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D5]">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#7C756B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.mediaSearchPlaceholder}
            className="w-full bg-transparent text-xs font-mono placeholder-[#8C8377] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#7C756B]">
            {adminLang === 'ar' ? 'إجمالي الملفات' : adminLang === 'es' ? 'Total archivos' : adminLang === 'en' ? 'Total files' : 'Total fichiers'}:
          </span>
          <span className="font-bold text-[#1F1C19]">{media.length}</span>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-[#DDD4C5] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#8C6D3B]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-base font-bold text-[#1F1C19]">
            {t.mediaNoMediaTitle}
          </h4>
          <p className="text-xs text-[#7C756B] max-w-sm mx-auto font-mono">
            {t.mediaNoMediaDesc}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#8C6D3B] text-white text-xs font-mono rounded-lg hover:bg-[#72572D] transition-colors"
          >
            {t.mediaUploadPrompt}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-[#E2DAD0] rounded-lg overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div className="relative aspect-square bg-[#191715] overflow-hidden">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Active Website Cover Badge */}
                {storeSettings?.heroImage === item.url && (
                  <div className="absolute top-1.5 left-1.5 z-10 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-[#C9A96E] rounded text-[9px] font-mono font-bold flex items-center gap-1 shadow border border-[#C9A96E]/40">
                    <Sparkles className="w-2.5 h-2.5 text-[#C9A96E]" />
                    <span>{adminLang === 'ar' ? 'صورة الواجهة' : 'Couverture'}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="p-2 bg-white/90 hover:bg-white text-[#191715] rounded-full shadow cursor-pointer transition-colors"
                    title={t.mediaCopyUrl}
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetToDelete(item)}
                    className="p-2 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full shadow cursor-pointer transition-colors"
                    title={adminLang === 'ar' ? 'حذف' : adminLang === 'es' ? 'Eliminar' : adminLang === 'en' ? 'Delete' : 'Supprimer'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="p-2.5 space-y-1">
                <h5 className="font-mono text-xs font-semibold text-[#1F1C19] truncate" title={item.name}>
                  {item.name}
                </h5>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#7C756B]">
                  <span>{item.sizeBytes ? `${Math.round(item.sizeBytes / 1024)} KB` : 'Cloud'}</span>
                  <span>{formatDateLocale(item.uploadedAt)}</span>
                </div>

                {/* Option to set as website cover */}
                {onSetHeroImage && (
                  <button
                    type="button"
                    onClick={async () => {
                      await onSetHeroImage(item.url);
                      showToast(
                        adminLang === 'ar'
                          ? 'تم تعيين هذه الصورة كواجهة رئيسية للموقع بنجاح !'
                          : 'Photo définie comme couverture du site avec succès !'
                      );
                    }}
                    className={`w-full mt-1.5 py-1 px-2 border rounded text-[10px] font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      storeSettings?.heroImage === item.url
                        ? 'bg-[#F2EDE4] border-[#C9A96E] text-[#8C6D3B] font-bold'
                        : 'bg-[#FAF8F5] hover:bg-[#8C6D3B] hover:text-white text-[#1F1C19] border-[#DDD4C5]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#C9A96E]" />
                    <span>
                      {storeSettings?.heroImage === item.url
                        ? (adminLang === 'ar' ? '★ صورة الواجهة الحالية' : '★ Couverture active')
                        : (adminLang === 'ar' ? 'تعيين كواجهة للموقع' : 'Définir comme couverture')}
                    </span>
                  </button>
                )}

                {onSelectMediaUrl && (
                  <button
                    type="button"
                    onClick={() => onSelectMediaUrl(item.url)}
                    className="w-full mt-1 py-1 bg-[#FAF8F5] hover:bg-[#8C6D3B] hover:text-white text-[#1F1C19] border border-[#DDD4C5] rounded text-[10px] font-mono transition-colors"
                  >
                    {adminLang === 'ar' ? 'استخدام هذه الصورة' : adminLang === 'es' ? 'Usar esta imagen' : adminLang === 'en' ? 'Use this image' : 'Utiliser cette image'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add External URL Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#DDD4C5] shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1F1C19]">
              {t.mediaAddUrlBtn}
            </h3>
            <form onSubmit={handleAddExternalUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {adminLang === 'ar' ? 'اسم الصورة' : adminLang === 'es' ? 'Nombre de la imagen' : adminLang === 'en' ? 'Image Name' : 'Nom du média'}
                </label>
                <input
                  type="text"
                  value={externalTitle}
                  onChange={(e) => setExternalTitle(e.target.value)}
                  placeholder="Ex: Hoodie Noir Face Avant"
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#7C756B] uppercase mb-1">
                  {adminLang === 'ar' ? 'رابط الويب (URL)' : adminLang === 'es' ? 'Enlace Web (URL)' : adminLang === 'en' ? 'Web URL' : 'Lien Web (URL)'}
                </label>
                <input
                  type="url"
                  required
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black"
                />
              </div>

              <div className={`flex items-center ${isRtl ? 'justify-start' : 'justify-end'} gap-2 pt-2`}>
                <button
                  type="button"
                  onClick={() => setShowAddUrlModal(false)}
                  className="px-4 py-2 border border-[#DDD4C5] rounded-lg text-xs font-mono hover:bg-[#F2EDE4]"
                >
                  {adminLang === 'ar' ? 'إلغاء' : adminLang === 'es' ? 'Cancelar' : adminLang === 'en' ? 'Cancel' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1F1D1A] text-white rounded-lg text-xs font-mono hover:bg-[#3D3730]"
                >
                  {adminLang === 'ar' ? 'إضافة' : adminLang === 'es' ? 'Añadir' : adminLang === 'en' ? 'Add' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#DDD4C5] shadow-2xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-serif text-base font-bold text-[#1F1C19]">
                {t.mediaDeleteConfirmTitle}
              </h4>
            </div>
            <p className="text-xs text-[#7C756B] font-mono leading-relaxed">
              {t.mediaDeleteConfirmDesc}
            </p>
            <div className={`flex items-center ${isRtl ? 'justify-start' : 'justify-end'} gap-2 pt-2`}>
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="px-3 py-1.5 border border-[#DDD4C5] rounded text-xs font-mono hover:bg-[#F2EDE4]"
              >
                {adminLang === 'ar' ? 'إلغاء' : adminLang === 'es' ? 'Cancelar' : adminLang === 'en' ? 'Cancel' : 'Annuler'}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAsset(assetToDelete)}
                className="px-4 py-1.5 bg-rose-600 text-white rounded text-xs font-mono hover:bg-rose-700"
              >
                {adminLang === 'ar' ? 'حذف' : adminLang === 'es' ? 'Eliminar' : adminLang === 'en' ? 'Delete' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
