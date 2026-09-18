import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Scissors, 
  ShieldCheck, 
  Truck, 
  Printer, 
  Package, 
  Phone, 
  MessageCircle,
  CreditCard,
  Building,
  MapPin,
  Clock,
  Copy,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Currency, Order, StoreSettings } from '../types';
import { formatPrice, generateOrderNumber } from '../utils/format';
import { ALGERIAN_WILAYAS, Wilaya, getWilayaByCode } from '../data/wilayas';
import { Language, TRANSLATIONS } from '../data/i18n';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  currency: Currency;
  appliedDiscountPct: number;
  orderNotes: string;
  onOrderSuccess: (order: Order) => void;
  onOpenOrderLookup?: (orderNumber?: string) => void;
  storeSettings: StoreSettings;
  currentLanguage: Language;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currency,
  appliedDiscountPct,
  orderNotes,
  onOrderSuccess,
  onOpenOrderLookup,
  storeSettings,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');

  // Customer form details tailored for Algerian Wilayas
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<string>('16'); // Default 16 - Alger
  const [commune, setCommune] = useState('Dély Ibrahim');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'baridimob'>('cod');
  const [notes, setNotes] = useState(orderNotes);

  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copiedRip, setCopiedRip] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const currentWilaya: Wilaya = getWilayaByCode(selectedWilayaCode, storeSettings.customWilayaRates) || ALGERIAN_WILAYAS[15]; // 16 - Alger

  // Calculations in DZD
  const subtotalDzd = items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  const discountAmountDzd = Math.round((subtotalDzd * appliedDiscountPct) / 100);
  
  // Delivery fee based on selected Wilaya, custom rates and free shipping threshold
  const baseShippingCostDzd = deliveryType === 'home' ? currentWilaya.homeDeliveryFeeDzd : currentWilaya.deskDeliveryFeeDzd;
  const isFreeShipping = Boolean(
    storeSettings.freeShippingThresholdDzd &&
    storeSettings.freeShippingThresholdDzd > 0 &&
    (subtotalDzd - discountAmountDzd) >= storeSettings.freeShippingThresholdDzd
  );
  const shippingCostDzd = isFreeShipping ? 0 : baseShippingCostDzd;
  const totalDzd = subtotalDzd - discountAmountDzd + shippingCostDzd;

  // Active delivery partner from settings
  const activeCarrier = 
    storeSettings.deliveryCompanies?.find(c => c.id === storeSettings.activeDeliveryCompany) ||
    storeSettings.deliveryCompanies?.[0];
  const carrierName = activeCarrier?.name || 'Yalidine Express';

  const handlePlaceOrder = () => {
    if (!fullName.trim() || !phone.trim()) {
      setFormError(isArabic ? 'يرجى إدخال الاسم الكامل ورقم الهاتف لتأكيد التوصيل.' : 'Veuillez renseigner votre nom complet et numéro de téléphone pour la livraison.');
      setStep('details');
      return;
    }
    setFormError(null);

    setIsProcessing(true);

    setTimeout(() => {
      const orderNum = generateOrderNumber();
      const prefix = activeCarrier?.trackingPrefix || 'DZ-YAL-';
      const trackingNum = `${prefix}${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const carrierTrackingUrl = activeCarrier?.trackingUrlTemplate 
        ? activeCarrier.trackingUrlTemplate.replace('{TRACKING}', encodeURIComponent(trackingNum)) 
        : undefined;

      const newOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber: orderNum,
        date: new Date().toLocaleDateString(currentLanguage === 'ar' ? 'ar-DZ' : 'fr-DZ', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        items: [...items],
        subtotal: subtotalDzd,
        shipping: shippingCostDzd,
        discount: discountAmountDzd,
        tax: 0,
        total: totalDzd,
        currency,
        customer: {
          fullName,
          phone,
          email: email || 'client@dbc.dz',
          address: `${address} - ${commune}`,
          city: commune,
          wilayaCode: currentWilaya.code,
          wilayaName: isArabic ? currentWilaya.nameAr : currentWilaya.nameEn,
          notes,
        },
        deliveryType,
        paymentMethod,
        status: 'Reçu / Confirmed',
        carrierName,
        carrierTrackingUrl,
        trackingNumber: trackingNum,
        estimatedDelivery: currentWilaya.zone === 'centre' 
          ? (storeSettings.defaultDeliveryDelay || '24h - 48h') 
          : '48h - 72h',
        trackingNotes: `Colis étiqueté pour ${carrierName}. Destination : ${currentWilaya.nameEn}.`,
      };

      setPlacedOrder(newOrder);
      onOrderSuccess(newOrder);
      setIsProcessing(false);
      setStep('confirmation');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8C6D3B', '#23201D', '#D7CEC2', '#EFE9DF'],
        });
      } catch (e) {
        // graceful
      }
    }, 900);
  };

  const handleOrderViaWhatsApp = () => {
    const cleanNum = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    const itemsList = items
      .map(
        (i) =>
          `• ${i.product.name} (Taille: ${i.size}, Couleur: ${i.color.name}, Qté: ${i.quantity}) - ${formatPrice(
            i.pricePerUnit * i.quantity,
            currency,
            isArabic
          )}`
      )
      .join('\n');

    const msg = isArabic
      ? `مرحباً ورشة DBC 👋\nأود تأكيد طلبية جديدة:\n\n${itemsList}\n\n*المجموع:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\n*الاسم:* ${fullName || 'زبون'}\n*الهاتف:* ${phone || '---'}\n*الولاية:* ${currentWilaya.code} - ${currentWilaya.nameAr} (${commune})\n*العنوان:* ${address}\n*طريقة التوصيل:* ${
          deliveryType === 'home' ? 'توصيل للمنزل' : 'استلام من مكتب التوصيل'
        }\n*طريقة الدفع:* ${paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'BaridiMob'}`
      : `Bonjour DBC Workshop 👋\nJe souhaite passer une commande :\n\n${itemsList}\n\n*Total:* ${formatPrice(
          totalDzd,
          currency,
          isArabic
        )}\n*Nom:* ${fullName || 'Client'}\n*Tél:* ${phone || '---'}\n*Wilaya:* ${currentWilaya.code} - ${currentWilaya.nameEn} (${commune})\n*Adresse:* ${address}\n*Mode:* ${
          deliveryType === 'home' ? 'À Domicile' : 'StopDesk'
        }\n*Paiement:* ${paymentMethod === 'cod' ? 'À la livraison (Cash)' : 'BaridiMob'}`;

    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyRip = () => {
    navigator.clipboard?.writeText(storeSettings.baridiMobRip);
    setCopiedRip(true);
    setTimeout(() => setCopiedRip(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F1D1A] text-white border-b border-[#3B352E]">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C9A96E]" />
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                {step === 'confirmation' ? t.orderSuccessTitle : `${t.siteTitle} • Livraison Algérie`}
              </h2>
              <p className="text-[11px] font-mono text-[#B3AAA0]">
                {t.delivery58Wilayas} • Paiement à la réception ou BaridiMob
              </p>
            </div>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1">
          {step !== 'confirmation' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Delivery Form & Payment (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Step tabs */}
                <div className="flex border-b border-[#DDD4C5] text-xs font-mono">
                  <button
                    onClick={() => setStep('details')}
                    className={`pb-2.5 px-3 uppercase tracking-wider cursor-pointer ${
                      step === 'details' ? 'font-bold text-[#1F1C19] border-b-2 border-black' : 'text-[#847B6F]'
                    }`}
                  >
                    1. {t.wilayaLabel} & Coordonnées
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    className={`pb-2.5 px-3 uppercase tracking-wider cursor-pointer ${
                      step === 'payment' ? 'font-bold text-[#1F1C19] border-b-2 border-black' : 'text-[#847B6F]'
                    }`}
                  >
                    2. {t.paymentMethod} & Validation
                  </button>
                </div>

                {step === 'details' && (
                  <div className="space-y-4 text-xs animate-in fade-in duration-150">
                    {formError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2 font-medium text-xs animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded text-[11px] text-amber-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>{t.delivery58Wilayas}. Expédition sous 24 à 48 heures.</span>
                    </div>

                    {/* Wilaya Selection - 69 Wilayas */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono uppercase text-[#736C61] font-bold">
                          {t.wilayaLabel} *
                        </label>
                        <span className="text-[10px] font-mono text-[#8C6D3B]">
                          Partenaire : {carrierName}
                        </span>
                      </div>
                      <select
                        id="checkout-wilaya-select"
                        value={selectedWilayaCode}
                        onChange={(e) => setSelectedWilayaCode(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black cursor-pointer"
                      >
                        {ALGERIAN_WILAYAS.map((w) => {
                          const customW = getWilayaByCode(w.code, storeSettings.customWilayaRates) || w;
                          return (
                            <option key={w.code} value={w.code}>
                              {w.code} - {w.nameEn} ({w.nameAr}) • Domicile: {customW.homeDeliveryFeeDzd} DZD | Bureau: {customW.deskDeliveryFeeDzd} DZD
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#736C61] mb-1 font-bold">
                          {t.cityCommuneLabel} *
                        </label>
                        <input
                          type="text"
                          value={commune}
                          onChange={(e) => setCommune(e.target.value)}
                          placeholder="Ex: Dély Ibrahim, Chéraga, El Eulma..."
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded focus:outline-none focus:border-black font-sans text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#736C61] mb-1 font-bold">
                          {t.fullNameLabel} *
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          placeholder="Nom & Prénom"
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded focus:outline-none focus:border-black font-sans text-xs"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#736C61] mb-1 font-bold text-emerald-800">
                          {t.phoneLabel} *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (formError) setFormError(null);
                          }}
                          placeholder="05 / 06 / 07 XX XX XX"
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded focus:outline-none focus:border-emerald-600 font-mono text-xs font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#736C61] mb-1">
                          Email (Optionnel)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded focus:outline-none focus:border-black font-sans text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-mono uppercase text-[#736C61] mb-1">
                          {t.addressLabel}
                        </label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Numéro de rue, bâtiment, quartier..."
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded focus:outline-none focus:border-black font-sans text-xs"
                        />
                      </div>
                    </div>

                    {/* Delivery Method Choice */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[11px] font-mono uppercase text-[#736C61] font-bold">
                        {t.deliveryMethod}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          className={`p-3 border rounded flex items-start gap-3 cursor-pointer transition-colors ${
                            deliveryType === 'home'
                              ? 'bg-[#F2EDE4] border-black text-[#1F1C19]'
                              : 'bg-white border-[#DDD4C5] text-[#5C554B]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            checked={deliveryType === 'home'}
                            onChange={() => setDeliveryType('home')}
                            className="mt-0.5"
                          />
                          <div>
                            <span className="font-mono text-xs font-bold block">
                              {t.homeDelivery}
                            </span>
                            <span className="text-[11px] text-[#7A7266] block">
                              {isFreeShipping ? (
                                <span className="text-emerald-700 font-bold">
                                  🎉 LIVRAISON GRATUITE (0 DZD)
                                </span>
                              ) : (
                                `Frais : ${formatPrice(currentWilaya.homeDeliveryFeeDzd, currency, isArabic)}`
                              )}
                            </span>
                            <span className="text-[10px] text-emerald-700 block">
                              Livraison jusqu’à votre porte ({carrierName})
                            </span>
                          </div>
                        </label>

                        <label
                          className={`p-3 border rounded flex items-start gap-3 cursor-pointer transition-colors ${
                            deliveryType === 'desk'
                              ? 'bg-[#F2EDE4] border-black text-[#1F1C19]'
                              : 'bg-white border-[#DDD4C5] text-[#5C554B]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            checked={deliveryType === 'desk'}
                            onChange={() => setDeliveryType('desk')}
                            className="mt-0.5"
                          />
                          <div>
                            <span className="font-mono text-xs font-bold block">
                              {t.deskDelivery}
                            </span>
                            <span className="text-[11px] text-[#7A7266] block">
                              {isFreeShipping ? (
                                <span className="text-emerald-700 font-bold">
                                  🎉 LIVRAISON GRATUITE (0 DZD)
                                </span>
                              ) : (
                                `Frais : ${formatPrice(currentWilaya.deskDeliveryFeeDzd, currency, isArabic)}`
                              )}
                            </span>
                            <span className="text-[10px] text-[#7A7266] block">
                              Récupération agence {carrierName} StopDesk la plus proche
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!fullName.trim() || !phone.trim()) {
                            setFormError(isArabic ? 'يرجى إدخال الاسم ورقم الهاتف للمتابعة' : 'Veuillez saisir votre nom et numéro de téléphone pour continuer');
                            return;
                          }
                          setFormError(null);
                          setStep('payment');
                        }}
                        className="px-6 py-2.5 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>Continuer vers le paiement</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                )}

                {step === 'payment' && (
                  <div className="space-y-4 text-xs animate-in fade-in duration-150">
                    <h3 className="font-serif text-base font-semibold text-[#1F1C19]">
                      {t.paymentMethod}
                    </h3>

                    <div className="space-y-3">
                      {/* Cash on Delivery (COD) */}
                      <label
                        className={`p-4 border rounded block cursor-pointer transition-colors ${
                          paymentMethod === 'cod'
                            ? 'bg-[#F2EDE4] border-black text-[#1F1C19]'
                            : 'bg-white border-[#DDD4C5]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payMethod"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold">
                                {t.cashOnDelivery}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono rounded font-bold">
                                Recommandé en Algérie
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6E6659] mt-0.5">
                              Payez en espèces à l'agent de livraison lors de la remise en main propre de votre colis.
                            </p>
                          </div>
                        </div>
                      </label>

                      {/* BaridiMob / CCP */}
                      <label
                        className={`p-4 border rounded block cursor-pointer transition-colors ${
                          paymentMethod === 'baridimob'
                            ? 'bg-[#F2EDE4] border-black text-[#1F1C19]'
                            : 'bg-white border-[#DDD4C5]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payMethod"
                            checked={paymentMethod === 'baridimob'}
                            onChange={() => setPaymentMethod('baridimob')}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-[#8C6D3B]" />
                                <span>{t.baridiMob}</span>
                              </span>
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-mono rounded">
                                Virement Immédiat
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6E6659]">
                              Effectuez le virement du montant total de la commande via l'application BaridiMob vers notre RIP :
                            </p>
                            <div className="p-2 bg-white border border-[#DDD4C5] rounded flex items-center justify-between font-mono text-xs">
                              <span className="font-bold text-[#1F1C19]">{storeSettings.baridiMobRip}</span>
                              <button
                                type="button"
                                onClick={copyRip}
                                className="px-2 py-1 bg-[#F2EDE4] hover:bg-black hover:text-white rounded text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedRip ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedRip ? 'Copié' : 'Copier RIP'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="p-3 bg-white border border-[#DDD4C5] rounded text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[#6E6659]">Destinataire :</span>
                        <span className="font-bold">{fullName} ({phone})</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[#6E6659]">Destination :</span>
                        <span>{currentWilaya.code} - {isArabic ? currentWilaya.nameAr : currentWilaya.nameEn} ({commune})</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep('details')}
                        className="px-4 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] cursor-pointer"
                      >
                        ← Modifier Coordonnées
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOrderViaWhatsApp}
                          className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{t.orderViaWhatsApp}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={isProcessing}
                          className="px-6 py-2.5 bg-[#1F1D1A] text-white rounded font-mono text-xs font-bold hover:bg-[#3D3730] flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <span>Confirmation en cours...</span>
                          ) : (
                            <>
                              <Check className="w-4 h-4 text-[#C9A96E]" />
                              <span>{t.confirmOrderBtn}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 bg-white p-5 border border-[#E2DAD0] rounded space-y-4 self-start">
                <h3 className="font-serif text-base font-semibold text-[#1F1C19] border-b border-[#E2DAD0] pb-2">
                  {t.orderSummary} ({items.length})
                </h3>

                <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="flex gap-3 pb-3 border-b border-[#F0EAE1]">
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                        alt={item.product.name}
                        className="w-14 h-16 object-cover rounded border border-[#DDD4C5]"
                      />
                      <div className="flex-1 space-y-0.5">
                        <h4 className="font-serif text-xs font-semibold text-[#1F1C19] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] font-mono text-[#7C756B]">
                          Taille: {item.size} • Couleur: {item.color.name}
                        </p>
                        <p className="text-[10px] font-mono text-[#7C756B]">
                          Quantité: {item.quantity}
                        </p>
                        <p className="font-mono text-xs font-bold text-[#1F1C19] pt-0.5">
                          {formatPrice(item.pricePerUnit * item.quantity, currency, isArabic)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing totals */}
                <div className="space-y-2 pt-2 text-xs font-mono border-t border-[#E2DAD0]">
                  <div className="flex justify-between text-[#5C554B]">
                    <span>{t.cartSubtotal}</span>
                    <span>{formatPrice(subtotalDzd, currency, isArabic)}</span>
                  </div>

                  {discountAmountDzd > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Remise B2B / Promo ({appliedDiscountPct}%)</span>
                      <span>-{formatPrice(discountAmountDzd, currency, isArabic)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#5C554B]">
                    <span>Livraison ({currentWilaya.code} - {isArabic ? currentWilaya.nameAr : currentWilaya.nameEn})</span>
                    <span>{formatPrice(shippingCostDzd, currency, isArabic)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-[#1F1C19] pt-2 border-t border-[#DDD4C5]">
                    <span>Total Net à Payer</span>
                    <span>{formatPrice(totalDzd, currency, isArabic)}</span>
                  </div>
                </div>

                {/* Assurance Box */}
                <div className="p-3 bg-[#FAF8F5] border border-[#DDD4C5] rounded space-y-1.5 text-[10px] text-[#6E6659]">
                  <div className="flex items-center gap-1.5 font-bold text-[#1F1C19]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8C6D3B]" />
                    <span>Engagement Qualité Confection Algérie</span>
                  </div>
                  <p>• Produits vérifiés avant envoi</p>
                  <p>• Échange de taille possible sous 48h</p>
                  <p>• Confirmation téléphonique avant expédition</p>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 3: ORDER CONFIRMED */
            <div className="max-w-2xl mx-auto py-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-bold text-[#1F1C19]">
                  {t.orderSuccessTitle}
                </h3>
                <p className="text-xs text-[#6E6659] max-w-md mx-auto">
                  {t.orderSuccessMsg}
                </p>
              </div>

              {placedOrder && (
                <div className="p-5 bg-white border border-[#E2DAD0] rounded text-left space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">Numéro de commande :</span>
                    <span className="font-bold text-[#1F1C19]">{placedOrder.orderNumber}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">Wilaya de destination :</span>
                    <span className="font-bold text-[#1F1C19]">
                      {placedOrder.customer.wilayaCode} - {placedOrder.customer.wilayaName} ({placedOrder.customer.city})
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">Destinataire :</span>
                    <span>{placedOrder.customer.fullName} • {placedOrder.customer.phone}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">Mode de paiement :</span>
                    <span>{placedOrder.paymentMethod === 'cod' ? 'Paiement à la livraison (Cash)' : 'BaridiMob / CCP'}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-[#1F1C19] pt-1">
                    <span>Montant Total :</span>
                    <span>{formatPrice(placedOrder.total, currency, isArabic)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenOrderLookup && placedOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOrderLookup(placedOrder.orderNumber);
                    }}
                    className="px-5 py-2.5 bg-[#8C6D3B] hover:bg-[#72572D] text-white font-mono text-xs font-bold rounded flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{isArabic ? 'تتبع مسار الشحنة الآن' : 'Suivre l’Acheminement du Colis'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleOrderViaWhatsApp}
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-semibold rounded flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Envoyer la confirmation sur WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-white border border-[#DDD4C5] font-mono text-xs rounded hover:bg-[#F2EDE4] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le Reçu</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] cursor-pointer"
                >
                  Retour à la Boutique
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
