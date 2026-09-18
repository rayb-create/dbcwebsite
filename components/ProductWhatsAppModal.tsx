import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Truck, 
  Building2, 
  Scissors, 
  HelpCircle,
  ShoppingBag,
  Share2
} from 'lucide-react';
import { Product, Currency, StoreSettings } from '../types';
import { Language } from '../data/i18n';
import { ALGERIAN_WILAYAS } from '../data/wilayas';
import { 
  WhatsAppGreetingIntent, 
  generateProductWhatsAppMessage, 
  generateProductWhatsAppUrl,
  cleanWhatsAppNumber 
} from '../utils/whatsapp';
import { formatPrice } from '../utils/format';

interface ProductWhatsAppModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  selectedColor?: string;
  selectedSize?: string;
  isMadeToMeasure?: boolean;
  currency: Currency;
  currentLanguage: Language;
  storeSettings?: StoreSettings;
}

export const ProductWhatsAppModal: React.FC<ProductWhatsAppModalProps> = ({
  product,
  isOpen,
  onClose,
  selectedColor,
  selectedSize,
  isMadeToMeasure = false,
  currency,
  currentLanguage,
  storeSettings,
}) => {
  const isArabic = currentLanguage === 'ar';

  const [intent, setIntent] = useState<WhatsAppGreetingIntent>('order');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<string>('16'); // Alger default
  const [quantity, setQuantity] = useState<number>(1);
  const [customNote, setCustomNote] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Auto adjust quantity when selecting B2B wholesale
  useEffect(() => {
    if (intent === 'wholesale' && quantity < 6) {
      setQuantity(6);
    } else if (intent !== 'wholesale' && quantity === 6) {
      setQuantity(1);
    }
  }, [intent]);

  const activeColor = selectedColor || product?.colors?.[0]?.name || 'Standard';
  const activeSize = isMadeToMeasure ? 'Sur-Mesure' : (selectedSize || product?.sizes?.[0] || 'L');
  const selectedWilaya = ALGERIAN_WILAYAS.find((w) => w.code === selectedWilayaCode);
  const wilayaName = selectedWilaya 
    ? (isArabic ? selectedWilaya.nameAr : selectedWilaya.nameEn)
    : '';

  const options = {
    selectedColor: activeColor,
    selectedSize: activeSize,
    quantity,
    intent,
    wilayaName,
    wilayaCode: selectedWilayaCode,
    customNote: customNote.trim(),
    currency,
    language: currentLanguage,
    isMadeToMeasure,
  };

  const messageText = product ? generateProductWhatsAppMessage(product, storeSettings, options) : '';
  const whatsappUrl = product ? generateProductWhatsAppUrl(product, storeSettings, options) : '';
  const whatsappPhone = cleanWhatsAppNumber(storeSettings?.whatsappNumber);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(whatsappUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F5] rounded border border-[#DCD4C7] shadow-2xl overflow-hidden my-4 max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1F1D1A] text-white border-b border-[#3B352E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-serif text-sm sm:text-base font-semibold text-white leading-tight">
                {isArabic ? 'رابط رسالة واتساب مخصص للمنتج' : 'Lien WhatsApp Pré-rempli avec le Produit'}
              </h3>
              <p className="text-[11px] font-mono text-[#C9A96E] leading-none mt-0.5">
                WhatsApp Direct : +{whatsappPhone}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Currently Viewed Product Banner */}
          <div className="p-3.5 bg-white border border-[#E2DAD0] rounded-md flex items-center gap-3.5 shadow-xs">
            <img 
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'} 
              alt={product.name}
              className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded border border-[#DDD4C5] shrink-0" 
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-[#F2EDE4] text-[#8C6D3B] px-1.5 py-0.5 rounded font-bold">
                  {product.fabricWeight || '460 GSM'}
                </span>
                <span className="text-[10px] font-mono text-[#7C756B]">
                  Réf : DBC-{product.id.toUpperCase()}
                </span>
              </div>
              <h4 className="font-serif text-sm sm:text-base font-semibold text-[#1F1C19] truncate mt-0.5">
                {product.name}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-mono text-[#5C554B] mt-1">
                <span>{isArabic ? 'المقاس:' : 'Taille :'} <strong className="text-[#1F1C19]">{activeSize}</strong></span>
                <span>•</span>
                <span>{isArabic ? 'اللون:' : 'Couleur :'} <strong className="text-[#1F1C19]">{activeColor}</strong></span>
                <span>•</span>
                <span className="font-bold text-[#8C6D3B]">
                  {formatPrice(product.price, currency, isArabic)}
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Purpose of Greeting / Intent */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-semibold uppercase text-[#1F1C19]">
              {isArabic ? '1. حدد موضوع الرسالة التلقائية :' : '1. Objet de la prise de contact WhatsApp :'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setIntent('order')}
                className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  intent === 'order'
                    ? 'bg-[#1F1D1A] text-white border-[#1F1D1A] shadow-xs'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#3D3831] border-[#DDD4C5]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{isArabic ? 'طلب مباشر' : 'Commande'}</span>
                </div>
                <span className={`text-[10px] font-sans mt-1 leading-tight ${intent === 'order' ? 'text-[#DCD4C7]' : 'text-[#7C756B]'}`}>
                  {isArabic ? 'تأكيد شراء قطعة' : 'Achat direct au détail'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIntent('wholesale')}
                className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  intent === 'wholesale'
                    ? 'bg-[#1F1D1A] text-white border-[#1F1D1A] shadow-xs'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#3D3831] border-[#DDD4C5]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{isArabic ? 'سعر الجملة B2B' : 'Tarif Gros B2B'}</span>
                </div>
                <span className={`text-[10px] font-sans mt-1 leading-tight ${intent === 'wholesale' ? 'text-[#DCD4C7]' : 'text-[#7C756B]'}`}>
                  {isArabic ? 'متاجر وموزعين (6+)' : 'Boutiques & revendeurs'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIntent('inquiry')}
                className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  intent === 'inquiry'
                    ? 'bg-[#1F1D1A] text-white border-[#1F1D1A] shadow-xs'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#3D3831] border-[#DDD4C5]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{isArabic ? 'استفسار توفر' : 'Disponibilité'}</span>
                </div>
                <span className={`text-[10px] font-sans mt-1 leading-tight ${intent === 'inquiry' ? 'text-[#DCD4C7]' : 'text-[#7C756B]'}`}>
                  {isArabic ? 'سؤال عن المقاس والمخزون' : 'Vérifier le stock atelier'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIntent('custom')}
                className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  intent === 'custom'
                    ? 'bg-[#1F1D1A] text-white border-[#1F1D1A] shadow-xs'
                    : 'bg-white hover:bg-[#F7F4EE] text-[#3D3831] border-[#DDD4C5]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Scissors className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>{isArabic ? 'تفصيل وتطريز' : 'Sur-Mesure'}</span>
                </div>
                <span className={`text-[10px] font-sans mt-1 leading-tight ${intent === 'custom' ? 'text-[#DCD4C7]' : 'text-[#7C756B]'}`}>
                  {isArabic ? 'تطريز مخصص أو قياس' : 'Broderie & étiquettes'}
                </span>
              </button>
            </div>
          </div>

          {/* Step 2: Custom Parameters (Wilaya, Qty, Note) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 bg-white border border-[#E2DAD0] rounded-md">
            
            {/* Wilaya selector (6 cols) */}
            <div className="sm:col-span-6 space-y-1">
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#1F1C19]">
                📍 {isArabic ? 'ولاية التوصيل في الجزائر :' : 'Wilaya de Livraison (69 wilayas) :'}
              </label>
              <select
                value={selectedWilayaCode}
                onChange={(e) => setSelectedWilayaCode(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-sans text-xs focus:bg-white focus:outline-none focus:border-black"
              >
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {isArabic ? w.nameAr : w.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Selector (3 cols) */}
            <div className="sm:col-span-3 space-y-1">
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#1F1C19]">
                🔢 {isArabic ? 'الكمية :' : 'Quantité :'}
              </label>
              <div className="flex items-center border border-[#DDD4C5] rounded bg-[#FAF8F5] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-xs font-mono hover:bg-[#EAE3D5] cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center text-xs font-mono bg-transparent py-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2.5 py-1 text-xs font-mono hover:bg-[#EAE3D5] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Optional note (12 cols) */}
            <div className="sm:col-span-12 space-y-1 pt-1">
              <label className="block text-[11px] font-mono font-semibold uppercase text-[#1F1C19]">
                💬 {isArabic ? 'ملاحظة خاصة أو سؤال إضافي (اختياري) :' : 'Question ou note supplémentaire (optionnel) :'}
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder={
                  isArabic 
                    ? 'مثال: هل يتوفر مقاس XL باللون الأسود؟ / هل يمكن إضافة لوغو المطرز؟' 
                    : 'Ex: Avez-vous du XL en stock ? Est-ce que la livraison se fait en StopDesk ?'
                }
                className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-sans text-xs focus:bg-white focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Step 3: Live WhatsApp Chat Bubble Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase text-[#1F1C19] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                {isArabic ? 'معاينة الرسالة التلقائية التي ستصل إلى الورشة :' : 'Aperçu du modèle généré automatiquement :'}
              </span>
              <span className="text-[10px] font-mono text-[#7C756B]">
                WhatsApp Format
              </span>
            </div>

            {/* WhatsApp Chat Simulation Container */}
            <div className="p-3.5 bg-[#E5DDD5] rounded-md border border-[#D5CABB] relative overflow-hidden">
              <div 
                className="bg-white p-3 rounded-lg shadow-xs max-w-full text-xs font-sans text-[#111B21] leading-relaxed whitespace-pre-wrap border border-[#D1D7DB] relative"
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {messageText}

                <div className="mt-2 text-right text-[10px] text-[#667781] font-mono flex items-center justify-end gap-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-[#53BDEB] font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            {/* Primary Open in WhatsApp */}
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs uppercase tracking-wider font-bold rounded flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>
                {isArabic ? 'فتح المحادثة على واتساب مباشرة ⚡' : 'Ouvrir WhatsApp avec ce message ⚡'}
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Secondary Copy buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 bg-white hover:bg-[#F2EDE4] text-[#1F1D1A] border border-[#DDD4C5] rounded font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Copier le lien complet wa.me"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{isArabic ? 'تم نسخ الرابط!' : 'Lien copié !'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#8C6D3B]" />
                    <span>{isArabic ? 'نسخ رابط واتساب' : 'Copier le lien direct'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="py-2 px-3 bg-white hover:bg-[#F2EDE4] text-[#1F1D1A] border border-[#DDD4C5] rounded font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Copier le texte du modèle"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{isArabic ? 'تم نسخ النص!' : 'Texte copié !'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8C6D3B]" />
                    <span>{isArabic ? 'نسخ نص الرسالة' : 'Copier le message'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
