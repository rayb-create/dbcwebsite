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
  const safeMedia = Array.isArray(media) ? media : [];

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
        reader.onload = () => {
          const res = reader.result as string;
          resolve({ dataUrl: res, sizeBytes: file.size });
        };
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
        if (!file.type.startsWith('image/')) continue;

        const { dataUrl, sizeBytes } = await processImageFile(file);
        const newAsset: MediaAsset = {
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          url: dataUrl,
          name: file.name.replace(/\.[^/.]+$/, ''),
          category: 'products',
          createdAt: new Date().toISOString(),
          sizeBytes,
          fileType: file.type || 'image/jpeg',
          uploadedBy: currentUser?.email || 'admin',
        };

        await saveMediaToDb(newAsset);
      }

      showToast(
        adminLang === 'ar' ? `تم رفع ${files.length} ملف بنجاح` :
        adminLang === 'es' ? `Se han subido ${files.length} archivo(s)` :
        adminLang === 'en' ? `Uploaded ${files.length} file(s) successfully` :
        `${files.length} fichier(s) téléversé(s) avec succès`
      );
    } catch (err: any) {
      console.error('[Media] Upload error:', err);
      showToast(err?.message || t.mediaDeleteError);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddExternalUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrl.trim()) return;

    try {
      const newAsset: MediaAsset = {
        id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        url: externalUrl.trim(),
        name: externalTitle.trim() || 'Photo DBC',
        category: 'banner',
        createdAt: new Date().toISOString(),
        sizeBytes: 0,
        fileType: 'image/url',
        uploadedBy: currentUser?.email || 'admin',
      };

      await saveMediaToDb(newAsset);
      setExternalUrl('');
      setExternalTitle('');
      setShowAddUrlModal(false);
      showToast(t.mediaCopied);
    } catch (err: any) {
      showToast(err?.message || 'Erreur lors de l’ajout du lien.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;

    try {
      await deleteMediaFromDb(assetToDelete.id);
      showToast(t.mediaDeleted);
      setAssetToDelete(null);
    } catch (err: any) {
      showToast(err?.message || t.mediaDeleteError);
    }
  };

  const handleSetCover = async (asset: MediaAsset) => {
    if (onSetHeroImage) {
      try {
        await onSetHeroImage(asset.url);
        showToast(
          adminLang === 'ar' ? 'تم تعيين الصورة كغلاف رئيسي للمتجر بنجاح' :
          adminLang === 'es' ? 'Imagen establecida como portada principal' :
          adminLang === 'en' ? 'Image set as main store banner' :
          'Photo définie comme couverture principale de la boutique'
        );
      } catch (err: any) {
        showToast(err?.message || 'Erreur de mise à jour du bandeau.');
      }
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(t.mediaCopied);
  };

  const filteredMedia = safeMedia.filter((m) => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-4 py-2.5 rounded-lg shadow-xl border border-[#C9A96E]/40 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#C9A96E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
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
          {/* File Upload Button */}
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
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-[#8C6D3B] hover:bg-[#72572D] text-white rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? t.mediaUploading : t.mediaUploadBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddUrlModal(true)}
            className="px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#1F1C19] border border-[#DDD4C5] rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.mediaAddUrlBtn}</span>
          </button>
        </div>
      </div>

      {/* Cloud & Resizing Storage Notice */}
      <div className="p-4 bg-amber-500/10 border border-amber-600/30 rounded-xl flex items-start gap-3 text-xs font-mono text-[#7A5B28]">
        <Sparkles className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">{t.mediaAutoCompressNotice}</span>
          <p className="text-[11px] text-[#8C6D3B] leading-relaxed">
            {t.mediaAutoCompressDesc}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D5]">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
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
          <span className="font-bold text-[#1F1C19]">{safeMedia.length}</span>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white border border-[#E2DAD0] rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#8C6D3B]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-base font-bold text-[#1F1C19]">
            {t.mediaNoAssetsFound}
          </h4>
          <p className="text-xs text-[#7C756B] max-w-sm mx-auto font-mono">
            {t.mediaNoAssetsDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((asset) => {
            const isHeroImage = storeSettings?.heroImage === asset.url;
            return (
              <div
                key={asset.id}
                className="bg-white border border-[#E2DAD0] rounded-xl overflow-hidden group shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-[#FAF8F5] overflow-hidden">
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Active Hero Banner Badge */}
                  {isHeroImage && (
                    <div className="absolute top-2 left-2 z-10 bg-[#1F1D1A] text-[#C9A96E] text-[10px] font-mono px-2 py-0.5 rounded border border-[#C9A96E]/40 font-bold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3 text-[#C9A96E]" />
                      <span>{t.mediaActiveCoverBadge}</span>
                    </div>
                  )}

                  {/* Hover Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(asset.url, asset.id)}
                      className="p-2 bg-white hover:bg-[#FAF8F5] text-[#1F1C19] rounded-lg shadow-md transition-colors cursor-pointer"
                      title={t.mediaCopyUrl}
                    >
                      {copiedId === asset.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {onSelectMediaUrl && (
                      <button
                        type="button"
                        onClick={() => onSelectMediaUrl(asset.url)}
                        className="px-2.5 py-2 bg-[#8C6D3B] hover:bg-[#72572D] text-white rounded-lg text-xs font-mono font-bold shadow-md cursor-pointer"
                        title={t.mediaSelectForProduct}
                      >
                        {t.mediaSelectForProduct}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setAssetToDelete(asset)}
                      className="p-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg shadow-md transition-colors cursor-pointer"
                      title={t.mediaDeleteAsset}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 border-t border-[#F0EBE1] space-y-1.5 bg-white">
                  <div className="font-semibold text-xs font-mono text-[#1F1C19] truncate" title={asset.name}>
                    {asset.name}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#7C756B]">
                    <span>{asset.category || 'Atelier'}</span>
                    <span>{asset.sizeBytes ? `${Math.round(asset.sizeBytes / 1024)} KB` : 'URL Web'}</span>
                  </div>

                  {/* Quick Action: Set as Hero Banner */}
                  {onSetHeroImage && !isHeroImage && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(asset)}
                      className="w-full mt-1 py-1.5 bg-[#FAF8F5] hover:bg-[#8C6D3B] text-[#8C6D3B] hover:text-white border border-[#DDD4C5] rounded text-[10px] font-mono transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{t.mediaSetAsCover}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add External URL */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#DDD4C5] shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#1F1C19]">
              {t.mediaAddUrlModalTitle}
            </h3>

            <form onSubmit={handleAddExternalUrl} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#7C756B] uppercase mb-1">
                  {t.mediaPhotoNameLabel}
                </label>
                <input
                  type="text"
                  value={externalTitle}
                  onChange={(e) => setExternalTitle(e.target.value)}
                  placeholder="ex: Hoodie Noir Atelier Confection"
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg focus:outline-none focus:border-[#8C6D3B]"
                />
              </div>

              <div>
                <label className="block text-[#7C756B] uppercase mb-1">
                  {t.mediaExternalUrlLabel}
                </label>
                <input
                  type="url"
                  required
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-[#DDD4C5] rounded-lg focus:outline-none focus:border-[#8C6D3B]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUrlModal(false)}
                  className="flex-1 py-2.5 bg-[#FAF8F5] text-[#1F1C19] border border-[#DDD4C5] rounded-lg cursor-pointer hover:bg-[#F2EDE4]"
                >
                  {t.mediaCancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#8C6D3B] text-white rounded-lg cursor-pointer hover:bg-[#72572D] font-bold"
                >
                  {t.mediaSaveLinkBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#DDD4C5] shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {t.mediaDeleteConfirmTitle}
              </h3>
              <p className="text-xs text-[#7C756B] font-mono">
                {t.mediaDeleteConfirmDesc}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="flex-1 py-2 bg-[#FAF8F5] text-[#1F1C19] border border-[#DDD4C5] rounded-lg cursor-pointer hover:bg-[#F2EDE4]"
              >
                {t.mediaCancelBtn}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-rose-700 text-white rounded-lg cursor-pointer hover:bg-rose-800 font-bold"
              >
                {t.mediaDeleteAsset}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
