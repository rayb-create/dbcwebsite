import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  CreditCard, 
  Truck, 
  Copy, 
  Check, 
  Building2, 
  ExternalLink 
} from 'lucide-react';
import { StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
  currentLanguage: Language;
  onOpenAdmin?: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  storeSettings,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';
  const [copiedRip, setCopiedRip] = useState(false);
  const [copiedCcp, setCopiedCcp] = useState(false);

  if (!isOpen) return null;

  const mapsUrl = storeSettings.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeSettings.address + ', ' + storeSettings.city)}`;

  const copyToClipboard = (text: string, type: 'rip' | 'ccp') => {
    navigator.clipboard?.writeText(text);
    if (type === 'rip') {
      setCopiedRip(true);
      setTimeout(() => setCopiedRip(false), 2000);
    } else {
      setCopiedCcp(true);
      setTimeout(() => setCopiedCcp(false), 2000);
    }
  };

  const whatsappClean = (storeSettings.whatsappNumber || '0550458812').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
    currentLanguage === 'ar'
      ? 'السلام عليكم ورشة DBC، أود الاستفسار بخصوص منتجات الورشة وطلبيات التجزئة والجملة.'
      : 'Bonjour DBC Workshop, je souhaite avoir des informations sur vos confections et vêtements (détail & gros).'
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir={isArabic ? 'rtl' : 'ltr'}>
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F1D1A] text-white border-b border-[#3B352E]">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#C9A96E]" />
            <div>
              <h2 className="font-serif text-lg font-medium tracking-wide">
                {t.navContact} • {storeSettings.storeName || 'DBC WORKSHOP'}
              </h2>
              <p className="text-[11px] font-mono text-[#B3AAA0]">
                {t.subTagline || t.tagline}
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

        {/* Body */}
        <div className="p-6 space-y-6 text-xs text-[#2C2825]">
          {/* WhatsApp Direct Action Hero */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-emerald-950">
                  {t.contactDirectWhatsappTitle}
                </h4>
                <p className="text-[11px] text-emerald-800">
                  {t.contactDirectWhatsappDesc}
                </p>
                <span className="font-mono text-xs font-bold text-emerald-900 block mt-0.5">
                  +{whatsappClean}
                </span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-semibold rounded text-center flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
              <div className="flex items-center gap-2 text-[#8C6D3B]">
                <Phone className="w-4 h-4" />
                <span className="font-mono text-[11px] font-bold uppercase">{t.footerPhoneLabel}</span>
              </div>
              <p className="font-mono text-sm font-semibold text-[#1F1C19]">
                {storeSettings.phone}
              </p>
              <p className="text-[10px] text-[#7C756B]">
                {isArabic ? 'السبت إلى الخميس: 09:00 - 19:00' : (currentLanguage === 'en' ? 'Saturday - Thursday: 09:00 - 19:00' : 'Samedi au Jeudi : 09h00 - 19h00')}
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
              <div className="flex items-center gap-2 text-[#8C6D3B]">
                <Mail className="w-4 h-4" />
                <span className="font-mono text-[11px] font-bold uppercase">{t.footerDirectEmail}</span>
              </div>
              <p className="font-mono text-xs font-semibold text-[#1F1C19] break-all">
                {storeSettings.email}
              </p>
              <p className="text-[10px] text-[#7C756B]">
                {t.b2bSectionTitle}
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
              <div className="flex items-center justify-between text-[#8C6D3B]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-mono text-[11px] font-bold uppercase">{t.footerShowroomLabel}</span>
                </div>
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 bg-[#F4EFE7] hover:bg-[#8C6D3B] hover:text-white text-[#8C6D3B] rounded text-[10px] font-mono flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Maps</span>
                  </a>
                )}
              </div>
              <p className="font-sans text-xs font-semibold text-[#1F1C19]">
                {storeSettings.address}
              </p>
              <p className="text-[11px] text-[#7C756B] font-mono">
                {storeSettings.city}
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
              <div className="flex items-center gap-2 text-[#8C6D3B]">
                <Truck className="w-4 h-4" />
                <span className="font-mono text-[11px] font-bold uppercase">{t.delivery58Wilayas}</span>
              </div>
              <p className="font-sans text-xs font-semibold text-[#1F1C19]">
                {t.footerWilayasExpress}
              </p>
              <p className="text-[10px] text-[#7C756B]">
                {t.footerHomeDeskDelivery}
              </p>
            </div>
          </div>

          {/* BaridiMob & CCP Details Box */}
          {storeSettings.baridiMobRip && (
            <div className="p-4 bg-[#F2EDE4] border border-[#DDD4C5] rounded space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#8C6D3B]" />
                  <h4 className="font-serif text-xs font-bold text-[#1F1C19]">
                    {t.footerBaridiMobText}
                  </h4>
                </div>
                <span className="px-2 py-0.5 bg-white border border-[#DDD4C5] rounded text-[10px] font-mono text-[#8C6D3B]">
                  Algérie Poste
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2.5 bg-white border border-[#DDD4C5] rounded flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#7C756B] block">RIP BaridiMob :</span>
                    <span className="font-mono text-xs font-bold text-[#1F1C19]">{storeSettings.baridiMobRip}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(storeSettings.baridiMobRip, 'rip')}
                    className="p-1.5 text-[#5C554B] hover:text-black rounded hover:bg-[#F4EFE7] cursor-pointer"
                    title={t.contactCopyRip}
                  >
                    {copiedRip ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {storeSettings.ccpAccount && (
                  <div className="p-2.5 bg-white border border-[#DDD4C5] rounded flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#7C756B] block">{t.contactCcpLabel}</span>
                      <span className="font-mono text-xs font-bold text-[#1F1C19]">{storeSettings.ccpAccount}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(storeSettings.ccpAccount, 'ccp')}
                      className="p-1.5 text-[#5C554B] hover:text-black rounded hover:bg-[#F4EFE7] cursor-pointer"
                      title={t.contactCopyRip}
                    >
                      {copiedCcp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
