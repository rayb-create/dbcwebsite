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

  const cleanWhatsapp = (storeSettings.whatsappNumber || '0550458812').replace(/[^0-9]/g, '');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
  };

  // Social accounts detection - ONLY show configured links from Manager Panel
  const socialLinks: { id: string; name: string; url: string; icon: React.ReactNode; color: string }[] = [];

  if (storeSettings.instagram && storeSettings.instagram.trim().length > 0) {
    const raw = storeSettings.instagram.trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    socialLinks.push({
      id: 'instagram',
      name: 'Instagram',
      url,
      icon: <Instagram className="w-4 h-4" />,
      color: 'hover:text-[#E1306C] hover:border-[#E1306C]'
    });
  }

  if (storeSettings.facebook && storeSettings.facebook.trim().length > 0) {
    const raw = storeSettings.facebook.trim();
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    socialLinks.push({
      id: 'facebook',
      name: 'Facebook',
      url,
      icon: <Facebook className="w-4 h-4" />,
      color: 'hover:text-[#1877F2] hover:border-[#1877F2]'
    });
  }

  if (cleanWhatsapp.length > 5) {
    socialLinks.push({
      id: 'whatsapp',
      name: 'WhatsApp',
      url: `https://wa.me/${cleanWhatsapp}`,
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'hover:text-[#25D366] hover:border-[#25D366]'
    });
  }

  if (storeSettings.email && storeSettings.email.trim().length > 0) {
    socialLinks.push({
      id: 'email',
      name: 'Email',
      url: `mailto:${storeSettings.email.trim()}`,
      icon: <Mail className="w-4 h-4" />,
      color: 'hover:text-[#C9A96E] hover:border-[#C9A96E]'
    });
  }

  if (storeSettings.mapsUrl && storeSettings.mapsUrl.trim().length > 0) {
    socialLinks.push({
      id: 'maps',
      name: 'Google Maps',
      url: storeSettings.mapsUrl.trim(),
      icon: <MapPin className="w-4 h-4" />,
      color: 'hover:text-[#EA4335] hover:border-[#EA4335]'
    });
  }

  return (
    <footer className="bg-[#191715] text-[#ECE7DF] border-t border-[#36322E] pt-14 pb-10 font-sans" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#36322E]">
          
          {/* Brand Info & Newsletter (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl tracking-[0.15em] font-semibold text-white">
                {storeSettings.storeName || 'DBC WORKSHOP'}
              </span>
            </div>
            <p className="text-xs font-mono text-[#A8A196] tracking-wider uppercase">
              {t.subTagline || t.tagline}
            </p>
            <p className="text-xs text-[#9E9689] leading-relaxed max-w-sm">
              {t.footerAboutText}
            </p>
            <div className="pt-1 text-xs font-mono text-[#8C8477] space-y-1">
              {storeSettings.address && <div>{t.footerShowroomLabel} {storeSettings.address}</div>}
              {storeSettings.city && <div>{t.footerCityLabel} {storeSettings.city}</div>}
              {storeSettings.email && (
                <div>
                  {t.footerDirectEmail}{' '}
                  <a href={`mailto:${storeSettings.email}`} className="text-[#C9A96E] hover:underline" target="_blank" rel="noopener noreferrer">
                    {storeSettings.email}
                  </a>
                </div>
              )}
              {storeSettings.phone && <div>{t.footerPhoneLabel} {storeSettings.phone}</div>}
            </div>

            {/* Newsletter */}
            <div className="pt-4 max-w-sm">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#A8A196] block mb-2">
                {isArabic ? 'النشرة البريدية للأزياء :' : currentLanguage === 'en' ? 'Atelier Newsletter :' : currentLanguage === 'es' ? 'Boletín de Novedades :' : 'Newsletter de l’Atelier :'}
              </span>
              {subscribed ? (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{isArabic ? 'شكراً لاشتراكك في نشرة الورشة !' : currentLanguage === 'en' ? 'Thank you for subscribing to our newsletter!' : currentLanguage === 'es' ? '¡Gracias por suscribirse a nuestro boletín!' : 'Merci pour votre inscription à la newsletter !'}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isArabic ? 'أدخل بريدك الإلكتروني...' : currentLanguage === 'en' ? 'Your email address...' : currentLanguage === 'es' ? 'Su correo electrónico...' : 'Votre adresse email...'}
                    required
                    className="flex-1 px-3 py-1.5 text-xs bg-[#24211D] border border-[#3E3831] rounded text-white placeholder-[#787167] focus:outline-none focus:border-[#C9A96E] font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#C9A96E] hover:bg-[#B89657] text-[#191715] font-mono text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    OK
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Navigation links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
              {t.footerCollectionTitle}
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#A8A196]">
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
                  onClick={() => onSelectCategory('joggers')}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navJoggers}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('long-sleeves')}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navLongSleeves}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('tees')}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navTees}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('tracksuits')}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navTracksuits}
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
              {storeSettings?.customCategories?.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right text-[#C9A96E]"
                  >
                    {isArabic ? (cat.nameAr || cat.name) : currentLanguage === 'en' ? (cat.nameEn || cat.name) : currentLanguage === 'es' ? (cat.nameEs || cat.name) : cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & B2B (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
              {t.footerServicesTitle}
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#A8A196]">
              <li>
                <button
                  onClick={onOpenB2B}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right flex items-center gap-1.5 text-[#C9A96E] font-semibold"
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
                  {t.footerSizeGuideLink}
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
              <li className="pt-2 text-[11px] text-[#7C756B] leading-relaxed">
                {t.footerWhatsappCareText}
              </li>
            </ul>
          </div>

          {/* Contact, Delivery & Official Social Channels (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
              {t.footerContactAtelier}
            </h4>
            <div className="space-y-2 text-xs font-mono text-[#A8A196]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C9A96E] shrink-0" />
                <span>{t.footerHomeDeskDelivery}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A96E] shrink-0" />
                <span>{t.footerAlgerianCraft}</span>
              </div>
            </div>

            {/* Official Social Media Channels (Single Location) */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C756B] block mb-2">
                  {isArabic ? 'شبكات التواصل الرسمي :' : (currentLanguage === 'en' ? 'Official Social Profiles :' : currentLanguage === 'es' ? 'Perfiles Oficiales :' : 'Réseaux Sociaux Officiels :')}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {socialLinks.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full bg-[#24211D] border border-[#3E3831] text-[#B3AAA0] transition-all duration-200 cursor-pointer shadow-xs ${item.color} hover:bg-black hover:scale-105 active:scale-95`}
                      title={`${item.name} - DBC Workshop`}
                      aria-label={`${item.name} DBC Workshop`}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/30 transition-colors text-xs font-mono font-bold cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp : {storeSettings.whatsappNumber || '0550 45 88 12'}</span>
            </a>

            {storeSettings.baridiMobRip && (
              <div className="pt-2 p-3 bg-[#24211D] border border-[#3B352E] rounded space-y-1 font-mono text-[11px] text-[#A8A196]">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <CreditCard className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>BaridiMob Disponible</span>
                </div>
                <p className="text-[10px] text-[#8C8477]">
                  RIP : {storeSettings.baridiMobRip}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar: Brand Statement */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8C8477] gap-3">
          <div className="flex items-center gap-2">
            <span>{storeSettings.storeName || 'DBC WORKSHOP ALGÉRIE'}</span>
            <span>•</span>
            <span>{t.footerAllRightsReserved}</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span>{t.footerAlgerianCraft}</span>
            <span>•</span>
            <span>{t.footerWilayasExpress}</span>
          </div>
        </div>

        {/* Very bottom copyright notice */}
        <div className="mt-8 pt-6 border-t border-[#292522] text-center text-[11px] font-mono text-[#6E675D]">
          <p>© {new Date().getFullYear()} DBC Workshop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
