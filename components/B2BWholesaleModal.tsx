import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Check, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  Package, 
  Sliders
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';

interface B2BWholesaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
  currentLanguage: Language;
}

export const B2BWholesaleModal: React.FC<B2BWholesaleModalProps> = ({
  isOpen,
  onClose,
  storeSettings,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const [storeName, setStoreName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [targetQuantity, setTargetQuantity] = useState('15-30 pièces');
  const [productInterest, setProductInterest] = useState('Hoodies Épais & Joggings');
  const [submitted, setSubmitted] = useState(false);

  const cleanWhatsapp = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Prepare WhatsApp message
    const msg = isArabic
      ? `مرحباً ورشة DBC 👋\nطلب تسعيرة جملة لمحل (B2B):\n• اسم المحل: ${storeName || 'محل ملابس'}\n• المسؤول: ${managerName || '---'}\n• الهاتف: ${phone}\n• الولاية: ${wilaya}\n• الكمية المرغوبة: ${targetQuantity}\n• المنتجات المطلوبة: ${productInterest}\nيرجى تزويدي بالكتالوج وأسعار الجملة المتاحة.`
      : `Bonjour DBC Workshop 👋\nDemande de devis et catalogue de gros (B2B) :\n• Boutique : ${storeName || 'Magasin de vêtements'}\n• Contact : ${managerName || '---'}\n• Téléphone : ${phone}\n• Wilaya : ${wilaya}\n• Quantité estimée : ${targetQuantity}\n• Produits : ${productInterest}\nMerci de m'envoyer le catalogue des prix de gros.`;

    setTimeout(() => {
      window.open(`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F1D1A] text-white border-b border-[#3B352E]">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#C9A96E]" />
            <div>
              <h2 className="font-serif text-lg font-medium tracking-wide">
                {t.b2bSectionTitle}
              </h2>
              <p className="text-[11px] font-mono text-[#B3AAA0]">
                Vente en gros pour magasins de vêtements & revendeurs à travers l'Algérie
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs text-[#2C2825] space-y-6">
          {/* B2B Advantages 3-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-1.5">
              <span className="w-8 h-8 rounded bg-[#F2EDE4] flex items-center justify-center font-bold text-[#8C6D3B] font-mono text-xs">
                -30%
              </span>
              <h4 className="font-serif text-sm font-bold text-[#1F1C19]">Prix Usine Directs</h4>
              <p className="text-[11px] text-[#6E6659]">
                Tarifs de gros dégressifs applicables à partir de 6 pièces par modèle.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-1.5">
              <span className="w-8 h-8 rounded bg-[#F2EDE4] flex items-center justify-center font-bold text-[#8C6D3B] font-mono text-xs">
                TEXTILE
              </span>
              <h4 className="font-serif text-sm font-bold text-[#1F1C19]">Qualité Textile Supérieure</h4>
              <p className="text-[11px] text-[#6E6659]">
                Coton brossé de haute qualité, finitions résistantes et coupes modernes.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-1.5">
              <span className="w-8 h-8 rounded bg-[#F2EDE4] flex items-center justify-center font-bold text-[#8C6D3B] font-mono text-xs">
                69W
              </span>
              <h4 className="font-serif text-sm font-bold text-[#1F1C19]">Expédition Palette & Colis</h4>
              <p className="text-[11px] text-[#6E6659]">
                Acheminement rapide de vos cartons dans toutes les 69 wilayas d'Algérie.
              </p>
            </div>
          </div>

          {/* Form */}
          {!submitted ? (
            <form onSubmit={handleSubmitInquiry} className="p-5 bg-white border border-[#E2DAD0] rounded space-y-4">
              <div className="space-y-1 border-b border-[#F0EAE1] pb-3">
                <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                  Demander le Catalogue & Grille Tarifaire B2B
                </h3>
                <p className="text-[11px] text-[#6E6659]">
                  Remplissez ce formulaire rapide pour recevoir instantanément notre catalogue de prix de gros sur WhatsApp ou par téléphone.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1 font-bold">
                    Nom du Magasin / Boutique *
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Boutique Urban DZ / Store Constantine"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1 font-bold">
                    Nom du Gérant / Responsable *
                  </label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#25D366] uppercase mb-1 font-bold">
                    Numéro Téléphone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05 / 06 / 07 XX XX XX"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-emerald-300 rounded font-mono text-xs font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1 font-bold">
                    Wilaya du Magasin *
                  </label>
                  <input
                    type="text"
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    placeholder="Ex: 16 - Alger / 31 - Oran / 19 - Sétif"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Quantité Estimée
                  </label>
                  <select
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs"
                  >
                    <option value="6-15 pièces (Pack Test)">6-15 pièces (Pack Test)</option>
                    <option value="15-50 pièces (Approvisionnement Rayon)">15-50 pièces (Approvisionnement Rayon)</option>
                    <option value="50-200 pièces (Gros Volume)">50-200 pièces (Gros Volume)</option>
                    <option value="+200 pièces (Production Spéciale)">+200 pièces (Production Spéciale)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#5C554B] uppercase mb-1">
                    Articles d'intérêt
                  </label>
                  <select
                    value={productInterest}
                    onChange={(e) => setProductInterest(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs"
                  >
                    <option value="Hoodies Épais & Joggings">Hoodies Épais & Joggings</option>
                    <option value="Ensembles Complets Tracksuits">Ensembles Complets Tracksuits</option>
                    <option value="Manches Longues & Tees Épais">Manches Longues & Tees Épais</option>
                    <option value="Gamme Textile Complète">Gamme Textile Complète (Mixte)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-bold rounded flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Envoyer la demande sur WhatsApp</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded text-center space-y-3">
              <Check className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-serif text-base font-bold text-emerald-950">
                Demande transmise avec succès !
              </h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Notre service commercial B2B prendra contact avec vous dans les plus brefs délais pour vous transmettre le catalogue et les conditions d'expédition vers votre wilaya.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#1F1D1A] text-white font-mono text-xs rounded"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
