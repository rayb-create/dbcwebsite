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
  Lock,
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
  onOpenAdmin?: () => void;
  onOpenOrderLookup?: () => void;
  onSelectCategory: (cat: string) => void;
  storeSettings: StoreSettings;
  currentLanguage: Language;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
  onOpenContact,
  onOpenB2B,
  onOpenAdmin,
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
          {/* Brand Info (4 cols) */}
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

            {/* Social Media Channels (Brand column) */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C756B] block mb-2">
                  {isArabic ? 'شبكات التواصل الاجتماعي :' : (currentLanguage === 'en' ? 'Follow Us :' : currentLanguage === 'es' ? 'Síguenos :' : 'Réseaux Sociaux :')}
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
          </div>

          {/* Quick Collection Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-xs font-mono">
            <h4 className="text-white uppercase tracking-wider font-semibold text-[11px]">
              {t.footerCollectionTitle}
            </h4>
            <ul className="space-y-2 text-[#A8A196]">
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
                  onClick={() => onSelectCategory('tracksuits')} 
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.navTracksuits}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('longsleeves')} 
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
                  onClick={onOpenB2B} 
                  className="text-[#C9A96E] hover:underline transition-colors cursor-pointer font-bold flex items-center gap-1 mt-1"
                >
                  <Building2 className="w-3 h-3" />
                  <span>{t.navB2B}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Sourcing & Atelier Care (2 cols) */}
          <div className="lg:col-span-2 space-y-3 text-xs font-mono">
            <h4 className="text-white uppercase tracking-wider font-semibold text-[11px]">
              {t.footerServicesTitle}
            </h4>
            <ul className="space-y-2 text-[#A8A196]">
              <li>
                <span className="text-white">{t.delivery58Wilayas}</span>
              </li>
              {onOpenOrderLookup && (
                <li>
                  <button
                    onClick={onOpenOrderLookup}
                    className="text-[#C9A96E] hover:text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-left rtl:text-right"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t.navOrderLookup} (69 Wilayas)</span>
                  </button>
                </li>
              )}
              <li>
                <span>{t.footerHomeDeskDelivery}</span>
              </li>
              <li>
                <span>{t.footerCodText}</span>
              </li>
              <li>
                <span>{t.footerBaridiMobText}</span>
              </li>
              <li>
                <button 
                  onClick={onOpenSizeGuide} 
                  className="hover:text-white underline transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.footerSizeGuideLink}
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenContact} 
                  className="hover:text-white text-[#C9A96E] underline transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.footerContactAtelier}
                </button>
              </li>
            </ul>
          </div>

          {/* WhatsApp & Contact Box (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="font-mono text-white uppercase tracking-wider font-semibold text-[11px]">
              {t.footerClientCareTitle}
            </h4>
            <p className="text-[#9E9689] leading-relaxed">
              {t.footerWhatsappCareText}
            </p>

            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-semibold rounded flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp : +{cleanWhatsapp}</span>
            </a>

            {storeSettings.baridiMobRip && (
              <div className="pt-2 p-3 bg-[#24211D] border border-[#3B352E] rounded space-y-1 font-mono text-[11px] text-[#A8A196]">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <CreditCard className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>BaridiMob / CCP</span>
                </div>
                <p className="text-[10px] text-[#8C8477]">
                  RIP : {storeSettings.baridiMobRip}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Dedicated Social Media Links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8C8477] gap-3">
          <p>© {new Date().getFullYear()} {storeSettings.storeName || 'DBC WORKSHOP ALGÉRIE'} • {t.footerAllRightsReserved}</p>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Social media icons also cleanly embedded in the bottom banner */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 border-r rtl:border-r-0 rtl:border-l border-[#36322E] pr-3 rtl:pr-0 rtl:pl-3">
                {socialLinks.map((item) => (
                  <a
                    key={`bottom-${item.id}`}
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
            {onOpenAdmin && (
              <>
                <span>•</span>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#C9A96E] flex items-center gap-1 transition-colors cursor-pointer text-[#6B6358] hover:underline"
                  title={t.footerManagerAccess}
                >
                  <Lock className="w-3 h-3" />
                  <span>{t.footerManagerAccess}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
