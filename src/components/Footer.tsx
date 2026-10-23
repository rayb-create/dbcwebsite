import React, { useState } from 'react';
import { 
  Truck, 
  Mail, 
  Check, 
  MessageCircle, 
  Instagram,
  Facebook,
  HelpCircle,
  Scissors
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';

interface FooterProps {
  onOpenSizeGuide: () => void;
  onOpenContact: () => void;
  onOpenB2B: () => void;
  onOpenStory?: () => void;
  onOpenFaq?: () => void;
  onOpenOrderLookup?: () => void;
  onSelectCategory: (cat: string) => void;
  storeSettings: StoreSettings;
  currentLanguage: Language;
}

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9a8.17 8.17 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
  onOpenContact,
  onOpenB2B,
  onOpenStory,
  onOpenFaq,
  onOpenOrderLookup,
  onSelectCategory,
  storeSettings,
  currentLanguage,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const cleanWhatsapp = (storeSettings.whatsappNumber || '0550458812').replace(/[^0-9]/g, '');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  // Social accounts detection - ONLY show configured links from Manager Panel
  const socialLinks: { id: string; name: string; url: string; icon: React.ReactNode }[] = [];

  if (storeSettings.instagram && storeSettings.instagram.trim().length > 0) {
    const raw = storeSettings.instagram.trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    socialLinks.push({
      id: 'instagram',
      name: 'Instagram',
      url,
      icon: <Instagram className="w-4 h-4" />
    });
  }

  if (storeSettings.facebook && storeSettings.facebook.trim().length > 0) {
    const raw = storeSettings.facebook.trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    socialLinks.push({
      id: 'facebook',
      name: 'Facebook',
      url,
      icon: <Facebook className="w-4 h-4" />
    });
  }

  if (storeSettings.tiktok && storeSettings.tiktok.trim().length > 0) {
    const raw = storeSettings.tiktok.trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    socialLinks.push({
      id: 'tiktok',
      name: 'TikTok',
      url,
      icon: <TikTokIcon className="w-4 h-4" />
    });
  }

  if (cleanWhatsapp.length > 5) {
    socialLinks.push({
      id: 'whatsapp',
      name: 'WhatsApp',
      url: `https://wa.me/${cleanWhatsapp}`,
      icon: <MessageCircle className="w-4 h-4" />
    });
  }

  if (storeSettings.email && storeSettings.email.trim().length > 0) {
    socialLinks.push({
      id: 'email',
      name: 'Email',
      url: `mailto:${storeSettings.email.trim()}`,
      icon: <Mail className="w-4 h-4" />
    });
  }

  return (
    <footer className="bg-[#111111] text-[#FFFFFF] border-t border-black pt-16 pb-12 font-sans" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter & Brand Note */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-[#262626]">
          <div className="lg:col-span-5 space-y-3">
            <span className="font-serif text-2xl tracking-[0.25em] font-normal text-white uppercase block">
              RENASC
            </span>
            <p className="text-xs text-[#8A8A8A] font-light leading-relaxed max-w-md">
              {isArabic 
                ? 'دار أزياء وتصميم معاصر. قطع استثنائية مصممة بحرفية دقيقة وأقمشة عالية الجودة.'
                : 'Contemporary fashion house & atelier. Considered garments engineered with heavyweight textiles and architectural precision.'}
            </p>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-end">
            <div className="max-w-md lg:ml-auto rtl:lg:mr-auto w-full">
              <span className="text-[11px] font-sans uppercase tracking-widest text-[#8A8A8A] font-medium block mb-2.5">
                {isArabic ? 'النشرة البريدية الحصرية' : currentLanguage === 'en' ? 'Exclusive Atelier Journal' : currentLanguage === 'es' ? 'Boletín Exclusivo' : 'Journal de l’Atelier'}
              </span>
              {subscribed ? (
                <div className="p-3 bg-[#1A1A1A] border border-[#333333] text-white text-xs font-mono flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                  <span>{isArabic ? 'شكراً لاشتراكك في نشرة RENASC.' : currentLanguage === 'en' ? 'Thank you for subscribing to RENASC updates.' : currentLanguage === 'es' ? 'Gracias por suscribirse a RENASC.' : 'Merci pour votre inscription à RENASC.'}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني...' : currentLanguage === 'en' ? 'Enter your email...' : currentLanguage === 'es' ? 'Su correo electrónico...' : 'Votre adresse email...'}
                    required
                    className="flex-1 px-3.5 py-2.5 text-xs bg-[#1A1A1A] border border-[#333333] text-white placeholder-[#737373] focus:outline-none focus:border-white font-sans"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white hover:bg-[#E5E5E5] text-[#111111] font-sans text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
                  >
                    OK
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 4 Main Columns: Customer Care, For Professionals, Brand, Connect */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-[#262626]">
          
          {/* 1. Customer Care */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-sans uppercase tracking-[0.18em] text-white font-medium">
              {isArabic ? 'خدمة العملاء' : currentLanguage === 'en' ? 'Customer Care' : currentLanguage === 'es' ? 'Atención al Cliente' : 'Service Client'}
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-[#A3A3A3]">
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {isArabic ? 'التواصل والاستفسارات' : currentLanguage === 'en' ? 'Contact & Assistance' : currentLanguage === 'es' ? 'Contacto' : 'Contact & Assistance'}
                </button>
              </li>
              {onOpenOrderLookup && (
                <li>
                  <button
                    onClick={onOpenOrderLookup}
                    className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5 shrink-0 text-white" />
                    <span>{t.navOrderLookup}</span>
                  </button>
                </li>
              )}
              {onOpenFaq && (
                <li>
                  <button
                    onClick={onOpenFaq}
                    className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 shrink-0 text-white" />
                    <span>{isArabic ? 'الأسئلة الشائعة' : currentLanguage === 'en' ? 'Frequently Asked Questions' : currentLanguage === 'es' ? 'Preguntas Frecuentes' : 'Questions Fréquentes'}</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.footerSizeGuideLink}
                </button>
              </li>
            </ul>
          </div>

          {/* 2. For Professionals */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-sans uppercase tracking-[0.18em] text-white font-medium">
              {isArabic ? 'للمحترفين والشركاء' : currentLanguage === 'en' ? 'For Professionals' : currentLanguage === 'es' ? 'Para Profesionales' : 'Professionnels'}
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-[#A3A3A3]">
              <li>
                <button
                  onClick={onOpenB2B}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right font-medium text-white"
                >
                  {isArabic ? 'طلب شراكة وتوزيع بالجملة' : currentLanguage === 'en' ? 'Wholesale & Retail Partners' : currentLanguage === 'es' ? 'Venta Mayorista' : 'Vente en Gros & Partenaires'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenB2B}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right text-[#8A8A8A]"
                >
                  {isArabic ? 'تصنيع أزياء خاص' : currentLanguage === 'en' ? 'Bespoke Manufacturing' : currentLanguage === 'es' ? 'Confección a Medida' : 'Production Spéciale Atelier'}
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Brand & Collection */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-sans uppercase tracking-[0.18em] text-white font-medium">
              {isArabic ? 'الدار والمجموعة' : currentLanguage === 'en' ? 'Brand & Atelier' : currentLanguage === 'es' ? 'La Marca' : 'La Maison'}
            </h4>
            <ul className="space-y-2.5 text-xs font-sans text-[#A3A3A3]">
              {onOpenStory && (
                <li>
                  <button
                    onClick={onOpenStory}
                    className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right flex items-center gap-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5 shrink-0 text-white" />
                    <span>{isArabic ? 'بيان الورشة وفلسفة التصميم' : currentLanguage === 'en' ? 'The Atelier Manifesto' : currentLanguage === 'es' ? 'El Manifiesto del Taller' : 'Le Manifeste de l’Atelier'}</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navAll}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('hoodies')}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navHoodies}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('outerwear')}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navOuterwear}
                </button>
              </li>
            </ul>
          </div>

          {/* 4. Social & Connect */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-sans uppercase tracking-[0.18em] text-white font-medium">
              {isArabic ? 'التواصل والمتابعة' : currentLanguage === 'en' ? 'Connect' : currentLanguage === 'es' ? 'Conectar' : 'Connexion'}
            </h4>
            <div className="space-y-3 text-xs font-sans text-[#A3A3A3]">
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {socialLinks.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-[#333333] text-[#A3A3A3] hover:text-white hover:border-white transition-colors cursor-pointer"
                      title={item.name}
                      aria-label={item.name}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              )}
              {cleanWhatsapp.length > 5 && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-sans text-white hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp: {storeSettings.whatsappNumber || '0550 45 88 12'}</span>
                </a>
              )}
              {storeSettings.email && (
                <div className="text-[11px] text-[#737373]">
                  {storeSettings.email}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Single Discreet Copyright Line */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-[#737373] gap-4">
          <div>
            <span>© {new Date().getFullYear()} RENASC. {t.footerAllRightsReserved}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
