import React, { useState } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  Mail, 
  ArrowRight, 
  Check, 
  Heart, 
  Building2, 
  Phone, 
  MessageCircle, 
  CreditCard, 
  Instagram,
  Facebook,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';

interface FooterProps {
  onOpenSizeGuide: () => void;
  onOpenContact: () => void;
  onOpenB2B: () => void;
  onOpenOrderLookup?: () => void;
  onSelectCategory: (cat: string) => void;
  storeSettings: StoreSettings;
  currentLanguage: Language;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
  onOpenContact,
  onOpenB2B,
  onOpenOrderLookup,
  onSelectCategory,
  storeSettings,
  currentLanguage,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const navCategories = [
    { id: 'hoodies', label: t.navHoodies },
    { id: 'joggers', label: t.navJoggers },
    { id: 'long-sleeves', label: t.navLongSleeves },
    { id: 'tees', label: t.navTees },
    { id: 'tracksuits', label: t.navTracksuits },
    { id: 'outerwear', label: t.navOuterwear },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      url: storeSettings.socialInstagram || 'https://instagram.com',
      icon: <Instagram className="w-4 h-4" />,
    },
    {
      name: 'Facebook',
      url: storeSettings.socialFacebook || 'https://facebook.com',
      icon: <Facebook className="w-4 h-4" />,
    },
    {
      name: 'WhatsApp Atelier',
      url: `https://wa.me/${storeSettings.whatsappNumber?.replace(/[^0-9]/g, '') || '213550458812'}`,
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      name: 'TikTok',
      url: storeSettings.socialTiktok || 'https://tiktok.com',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ];

  return (
    <footer 
      className="bg-[#191715] text-[#ECE7DF] pt-14 pb-12 border-t border-[#36302A] relative overflow-hidden"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#C9A96E] blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#8C6D3B] blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#2C2723]">
          
          {/* Col 1 & 2: Workshop Identity & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-[#C9A96E] uppercase font-bold">
                {t.tagline}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-white uppercase">
                {storeSettings.storeName || 'DBC CLOTHING WORKSHOP'}
              </h3>
              <p className="text-xs sm:text-sm text-[#A8A196] font-sans leading-relaxed max-w-md">
                {storeSettings.storeDescription || t.footerDesc}
              </p>
            </div>

            {/* Newsletter */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#ECE7DF] font-semibold">
                {t.newsletterTitle}
              </h4>
              <p className="text-xs text-[#8C8377]">
                {t.newsletterDesc}
              </p>
              {subscribed ? (
                <div className="p-3 bg-[#24211E] border border-[#C9A96E]/40 text-[#C9A96E] text-xs font-mono rounded flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{t.newsletterSuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.newsletterPlaceholder}
                    required
                    className="flex-1 px-3.5 py-2.5 bg-[#24211E] border border-[#38322B] text-xs text-white placeholder-[#787167] rounded-none focus:outline-none focus:border-[#C9A96E] transition-colors font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#C9A96E] hover:bg-[#B89657] text-[#191715] text-xs font-mono uppercase tracking-wider font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t.newsletterBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 3: Collection Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-bold">
              {t.footerColCollection}
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-[#A8A196]">
              {navCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      const el = document.getElementById('collection-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Wholesale & Customer Service */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-bold">
              {t.footerColService}
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-[#A8A196]">
              <li>
                <button
                  onClick={onOpenB2B}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right flex items-center gap-1.5 text-[#C9A96E]"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.navB2B}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.footerLinkSizeGuide}
                </button>
              </li>
              {onOpenOrderLookup && (
                <li>
                  <button
                    onClick={onOpenOrderLookup}
                    className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5 shrink-0 text-[#C9A96E]" />
                    <span>{t.navOrderLookup}</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navContact}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Workshop Contact & Delivery info */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] font-bold">
              {t.footerColAtelier}
            </h4>
            <div className="space-y-3 text-xs font-mono text-[#A8A196]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {storeSettings.address || 'Zone d’Activité Artisanale, Alger'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C9A96E] shrink-0" />
                <a
                  href={`tel:${storeSettings.phone || '0550458812'}`}
                  className="hover:text-white transition-colors"
                >
                  {storeSettings.phone || '0550 45 88 12'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <a
                  href={`https://wa.me/${storeSettings.whatsappNumber?.replace(/[^0-9]/g, '') || '213550458812'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white text-[#EAE3D5] transition-colors"
                >
                  {storeSettings.whatsappNumber || '+213 550 45 88 12'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C9A96E] shrink-0" />
                <a
                  href={`mailto:${storeSettings.email || 'dbcworkshop.co@gmail.com'}`}
                  className="hover:text-white transition-colors truncate"
                >
                  {storeSettings.email || 'dbcworkshop.co@gmail.com'}
                </a>
              </div>
            </div>

            {/* Delivery highlights */}
            <div className="pt-2">
              <div className="p-2.5 bg-[#24211E] border border-[#38322B] rounded text-[11px] font-mono text-[#D5CEBF] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C9A96E] shrink-0" />
                <span>{t.footerDeliveryHighlight}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Clean Brand Statement */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8C8377]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} {storeSettings.storeName || 'DBC WORKSHOP ALGÉRIE'}.</span>
            <span>{t.footerRights}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            {/* Social Icons */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pr-2 border-r border-[#36302A] rtl:border-r-0 rtl:border-l rtl:pl-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[#A8A196] hover:text-white transition-colors p-1`}
                    title={item.name}
                    aria-label={item.name}
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}

            <span>{t.footerAlgerianCraft}</span>
            <span>•</span>
            <span>{t.footerWilayasExpress}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
