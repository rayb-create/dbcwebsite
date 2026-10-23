import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Check, 
  Phone, 
  MessageCircle, 
  Globe,
  ArrowRight
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';
import { ALGERIAN_WILAYAS } from '../data/wilayas';

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
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [wilaya, setWilaya] = useState('16 - Alger');
  const [estimatedQuantity, setEstimatedQuantity] = useState('15-30 pièces / style');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const cleanWhatsapp = (storeSettings.whatsappNumber || '0550458812').replace(/[^0-9]/g, '');

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Save inquiry to localStorage cache and allow direct WhatsApp review dispatch
    try {
      const existingInquiries = JSON.parse(localStorage.getItem('renasc_wholesale_inquiries') || '[]');
      existingInquiries.push({
        id: 'REQ-' + Date.now(),
        date: new Date().toISOString(),
        storeName,
        contactName,
        email,
        phone,
        storeUrl,
        wilaya,
        estimatedQuantity,
        notes,
      });
      localStorage.setItem('renasc_wholesale_inquiries', JSON.stringify(existingInquiries));
    } catch (err) {
      console.warn('Could not cache inquiry:', err);
    }

    const msg = isArabic
      ? `طلب اعتماد شريك تجزئة وتوزيع (RENASC Wholesale Partner):\n• اسم المتجر: ${storeName}\n• المسؤول: ${contactName}\n• الهاتف: ${phone}\n• البريد: ${email || '---'}\n• الموقع / إنستغرام: ${storeUrl || '---'}\n• الولاية: ${wilaya}\n• الكمية المقدرة: ${estimatedQuantity}\n• ملاحظات: ${notes || '---'}`
      : `Candidature Partenaire Revendeur (RENASC Retail Partners):\n• Boutique: ${storeName}\n• Contact: ${contactName}\n• Téléphone: ${phone}\n• Email: ${email || '---'}\n• Site web / Profil: ${storeUrl || '---'}\n• Wilaya: ${wilaya}\n• Volume estimé: ${estimatedQuantity}\n• Notes: ${notes || '---'}`;

    setTimeout(() => {
      window.open(`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" 
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div 
        className="relative w-full max-w-2xl bg-white border border-[#E6E6E6] shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111111] text-white border-b border-black">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-white" />
            <div>
              <h2 className="font-serif text-lg font-normal tracking-wider uppercase text-white">
                {isArabic ? 'شركاء التجزئة والجملة' : currentLanguage === 'en' ? 'Wholesale & Retail Partners' : currentLanguage === 'es' ? 'Socios Mayoristas' : 'Partenariats Revendeurs'}
              </h2>
              <span className="text-[10px] font-sans tracking-widest text-[#A3A3A3] uppercase block">
                RENASC • Retail Partners
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-xs text-[#111111] space-y-6">
          {!submitted ? (
            <div className="space-y-6">
              {/* Editorial Intro */}
              <div className="space-y-2 border-b border-[#E6E6E6] pb-5">
                <span className="text-[11px] font-sans uppercase tracking-widest text-[#737373] font-semibold">
                  {isArabic ? 'برنامج شركاء RENASC' : 'Programme Partenaires Détaillants'}
                </span>
                <p className="text-xs text-[#525252] leading-relaxed font-sans">
                  {isArabic
                    ? 'تتعاون دار RENASC مع متاجر التجزئة المستقلة وبوتيكات الأزياء المختارة في الجزائر ودولياً. نوفر تصنيعاً بأقمشة عالية الكثافة مع خط إنتاج دقيق، وشروط توزيع مرنة تبدأ من 15 قطعة.'
                    : currentLanguage === 'en'
                    ? 'RENASC collaborates with select independent boutiques and retail partners across Algeria and internationally. We provide precision garment construction, heavyweight textiles, and dedicated retail support.'
                    : currentLanguage === 'es'
                    ? 'RENASC colabora con selectas boutiques y tiendas minoristas en Argelia e internacionalmente, ofreciendo confección de alta precisión y distribución exclusiva.'
                    : 'La maison RENASC collabore avec des boutiques indépendantes et distributeurs sélectionnés à travers l’Algérie et à l’international. Confection haut de gamme, matières denses et conditions réservées aux professionnels.'}
                </p>
              </div>

              {/* Application Form */}
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-sans uppercase text-[#737373] mb-1 font-semibold">
                      {isArabic ? 'اسم المتجر أو البوتيك *' : currentLanguage === 'en' ? 'Store / Boutique Name *' : currentLanguage === 'es' ? 'Nombre de la Tienda *' : 'Nom de la Boutique / Enseigne *'}
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ex: Maison Minimaliste Alger"
                      className="w-full px-3 py-2 bg-[#F8F8F7] border border-[#E6E6E6] text-xs focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase text-[#737373] mb-1 font-semibold">
                      {isArabic ? 'اسم المسؤول أو المالك *' : currentLanguage === 'en' ? 'Contact / Owner Name *' : currentLanguage === 'es' ? 'Contacto / Propietario *' : 'Nom du Responsable / Acheteur *'}
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Nom & Prénom"
                      className="w-full px-3 py-2 bg-[#F8F8F7] border border-[#E6E6E6] text-xs focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase text-[#737373] mb-1 font-semibold">
                      {isArabic ? 'رقم الهاتف (واتساب) *' : currentLanguage === 'en' ? 'Phone / WhatsApp *' : currentLanguage === 'es' ? 'Teléfono / WhatsApp *' : 'Téléphone / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05 / 06 / 07 XX XX XX"
                      className="w-full px-3 py-2 bg-[#F8F8F7] border border-[#E6E6E6] text-xs font-mono focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase text-[#737373] mb-1 font-semibold">
                      {isArabic ? 'البريد الإلكتروني' : currentLanguage === 'en' ? 'Business Email' : currentLanguage === 'es' ? 'Correo Electrónico' : 'Email Professionnel'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@boutique.dz"
                      className="w-full px-3 py-2 bg-[#F8F8F7] border border-[#E6E6E6] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase text-[#737373] mb-1 font-semibold">
                      {isArabic ? 'الموقع الإلكتروني أو صفحة إنستغرام' : currentLanguage === 'en' ? 'Store Website or Social Profile' : currentLanguage === 'es' ? 'Sitio Web o Instagram' : 'Site Web ou Profil Instagram'}
                    </label>
                    <input
                      type="text"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder="instagram.com/votre_boutique"
                      className="w-full px-3 py-2 bg-[#F8F8F7] border border-[#E6E6E6] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase text-[#737373] mb-1 font-semibold">
                      {isArabic ? 'الولاية / المدينة *' : currentLanguage === 'en' ? 'Province / City *' : currentLanguage === 'es' ? 'Wilaya / Ciudad *' : 'Wilaya / Ville *'}
                    </label>
                    <select
                      value={wilaya}
                      onChange={(e) => setWilaya(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F8F7] border border-[#E6E6E6] text-xs focus:outline-none focus:border-[#111111] cursor-pointer"
                    >
                      {ALGERIAN_WILAYAS.map((w) => (
                        <option key={w.code} value={`${w.code} - ${w.nameEn}`}>
                          {w.code} - {w.nameEn} ({w.nameAr})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-sans uppercase text-[#737373] mb-1 font-semibold">
                      {isArabic ? 'الكمية التقديرية للطلبية الأولى' : currentLanguage === 'en' ? 'Estimated Initial Order Volume' : currentLanguage === 'es' ? 'Volumen Estimado de Pedido' : 'Volume Estimé de Première Commande'}
                    </label>
                    <select
                      value={estimatedQuantity}
                      onChange={(e) => setEstimatedQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8F8F7] border border-[#E6E6E6] text-xs focus:outline-none focus:border-[#111111] cursor-pointer"
                    >
                      <option value="15-30 pièces / style">15 – 30 pièces (Pack Sélection)</option>
                      <option value="30-60 pièces / style">30 – 60 pièces (Approvisionnement Rayon)</option>
                      <option value="60-150 pièces / style">60 – 150 pièces (Volume Boutique)</option>
                      <option value="+150 pièces / style">150+ pièces (Distribution Multi-points)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-sans uppercase text-[#737373] mb-1 font-semibold">
                      {isArabic ? 'ملاحظات حول المتجر والعلامات المعروضة' : currentLanguage === 'en' ? 'Store Profile & Current Brands' : currentLanguage === 'es' ? 'Notas del Negocio' : 'Présentation du Point de Vente & Marques Représentées'}
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isArabic ? 'وصف مختصر لنشاطكم وموقع المتجر...' : 'Quelques mots sur le positionnement de votre boutique...'}
                      className="w-full px-3 py-2 bg-[#F8F8F7] border border-[#E6E6E6] text-xs focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#111111] hover:bg-black text-white text-xs font-sans uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isArabic ? 'إرسال طلب الاعتماد' : currentLanguage === 'en' ? 'Submit Retailer Application' : currentLanguage === 'es' ? 'Enviar Solicitud' : 'Envoyer la Candidature'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="py-8 px-4 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 bg-[#F8F8F7] border border-[#E6E6E6] mx-auto flex items-center justify-center text-[#111111]">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#111111]">
                {isArabic ? 'تم استلام طلبكم بنجاح' : currentLanguage === 'en' ? 'Application Received' : currentLanguage === 'es' ? 'Solicitud Recibida' : 'Candidature Transmise'}
              </h3>
              <p className="text-xs text-[#525252] max-w-md mx-auto leading-relaxed font-sans">
                {isArabic
                  ? 'شكراً لاهتمامكم بالتعاون مع RENASC. يدرس فريق التوزيع ملفات المتاجر لضمان التوافق مع معايير الدار، وسيتم التواصل معكم بالكتالوج وسجل الأسعار الخاص في أقرب وقت.'
                  : currentLanguage === 'en'
                  ? 'Thank you for your interest in RENASC. Our wholesale team reviews retailer profiles to ensure brand alignment. We will reach out with our private line sheet upon review.'
                  : currentLanguage === 'es'
                  ? 'Gracias por su solicitud. Nuestro equipo evalúa cada perfil para garantizar la exclusividad. Nos comunicaremos con el catálogo privado en breve.'
                  : 'Merci pour votre intérêt envers la maison RENASC. Notre équipe examine attentivement les dossiers revendeurs afin d’assurer une cohérence de marque. Nous reviendrons vers vous avec le catalogue confidentiel.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#111111] text-white text-xs font-sans uppercase tracking-wider cursor-pointer hover:bg-black"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default B2BWholesaleModal;
