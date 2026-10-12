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
import { formatPrice, generateOrderNumber, parseNumericPrice } from '../utils/format';
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
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showTrackingStatus, setShowTrackingStatus] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const currentWilaya: Wilaya = 
    getWilayaByCode(selectedWilayaCode, storeSettings.customWilayaRates, (storeSettings as any).deliveryRates) 
    || ALGERIAN_WILAYAS.find(w => w.code === selectedWilayaCode) 
    || ALGERIAN_WILAYAS[15]; // 16 - Alger

  // Calculations in DZD - parses numbers and numeric strings accurately without || 0 hiding missing prices
  const subtotalDzd = items.reduce((sum, item) => {
    const rawPrice = 
      parseNumericPrice(item.pricePerUnit) ??
      parseNumericPrice((item as any).price) ??
      parseNumericPrice(item.product?.price) ??
      parseNumericPrice((item.product as any)?.b2bPrice) ??
      parseNumericPrice(item.product?.wholesalePriceDzd);

    const itemPrice = rawPrice !== null ? rawPrice : 0;
    const itemQty = Math.max(1, parseNumericPrice(item.quantity) ?? 1);
    return sum + (itemPrice * itemQty);
  }, 0);

  const safeDiscountPct = Math.max(0, Math.min(100, parseNumericPrice(appliedDiscountPct) ?? 0));
  const discountAmountDzd = Math.round((subtotalDzd * safeDiscountPct) / 100);
  
  // Delivery fee based on selected Wilaya, custom rates and delivery type
  const homeFee = parseNumericPrice(currentWilaya?.homeDeliveryFeeDzd) 
    ?? parseNumericPrice((storeSettings as any)?.defaultHomeRate) 
    ?? parseNumericPrice(storeSettings?.defaultDeliveryFeeDzd) 
    ?? 600;

  const deskFee = parseNumericPrice(currentWilaya?.deskDeliveryFeeDzd) 
    ?? parseNumericPrice((storeSettings as any)?.defaultDeskRate) 
    ?? 400;

  const baseShippingCostDzd = deliveryType === 'home' ? homeFee : deskFee;

  const freeThreshold = parseNumericPrice(storeSettings?.freeShippingThresholdDzd);
  const isFreeShipping = Boolean(
    freeThreshold && freeThreshold > 0 &&
    (subtotalDzd - discountAmountDzd) >= freeThreshold
  );
  const shippingCostDzd = isFreeShipping ? 0 : baseShippingCostDzd;
  const totalDzd = Math.max(0, (subtotalDzd - discountAmountDzd) + shippingCostDzd);

  // Active delivery partner from settings
  const activeCarrier = 
    storeSettings.deliveryCompanies?.find(c => c.id === storeSettings.activeDeliveryCompany) ||
    storeSettings.deliveryCompanies?.[0];
  const carrierName = activeCarrier?.name || 'Yalidine Express';

  const handlePlaceOrder = () => {
    if (!fullName.trim() || !phone.trim()) {
      setFormError(
        isArabic ? 'يرجى إدخال الاسم الكامل ورقم الهاتف لتأكيد التوصيل.' :
        currentLanguage === 'es' ? 'Por favor ingrese su nombre completo y número de teléfono para la entrega.' :
        currentLanguage === 'en' ? 'Please provide your full name and phone number for delivery.' :
        'Veuillez renseigner votre nom complet et numéro de téléphone pour la livraison.'
      );
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

      const itemsSnapshot: CartItem[] = items.map((item) => {
        const rawPrice = 
          parseNumericPrice(item.pricePerUnit) ??
          parseNumericPrice((item as any).price) ??
          parseNumericPrice(item.product?.price) ??
          parseNumericPrice((item.product as any)?.b2bPrice) ??
          parseNumericPrice(item.product?.wholesalePriceDzd);
        const itemPrice = rawPrice !== null ? rawPrice : 0;
        const itemQty = Math.max(1, parseNumericPrice(item.quantity) ?? 1);
        return {
          ...item,
          pricePerUnit: itemPrice,
          quantity: itemQty,
        };
      });

      const finalSubtotal = subtotalDzd;
      const finalShipping = shippingCostDzd;
      const finalDiscount = discountAmountDzd;
      const finalTotal = Math.max(0, (finalSubtotal - finalDiscount) + finalShipping);

      const newOrder: Order = {
        id: `order-${Date.now()}`,
        orderNumber: orderNum,
        date: new Date().toLocaleDateString(currentLanguage === 'ar' ? 'ar-DZ' : 'fr-DZ', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        items: itemsSnapshot,
        subtotal: finalSubtotal,
        shipping: finalShipping,
        discount: finalDiscount,
        tax: 0,
        total: finalTotal,
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

      // Compatibility field for database schema
      (newOrder as any).shippingCost = finalShipping;

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
    const rawNumber = storeSettings?.whatsappNumber || '213550458812';
    const cleanNum = rawNumber.replace(/[^0-9]/g, '') || '213550458812';
    
    // Read from placedOrder if available, otherwise fallback to current form items
    const targetOrder = placedOrder;
    const orderItems = targetOrder ? targetOrder.items : items;
    const orderTotal = targetOrder ? targetOrder.total : totalDzd;
    const orderNum = targetOrder?.orderNumber || 'En cours';
    const trackingNum = targetOrder?.trackingNumber || 'En attente';

    const itemsList = (orderItems || [])
      .map(
        (i) =>
          `• ${i.product?.name || 'Vêtement DBC'} (Taille: ${i.size}, Couleur: ${i.color?.name || 'Standard'}, Qté: ${i.quantity}) - ${formatPrice(
            (Number(i.pricePerUnit) || Number(i.product?.price) || 0) * (Number(i.quantity) || 1),
            currency,
            isArabic
          )}`
      )
      .join('\n');

    const wilayaStr = targetOrder 
      ? `${targetOrder.customer.wilayaCode} - ${targetOrder.customer.wilayaName} (${targetOrder.customer.city})`
      : `${currentWilaya.code} - ${currentWilaya.nameEn} (${commune})`;

    const clientName = targetOrder?.customer.fullName || fullName || 'Client';
    const clientPhone = targetOrder?.customer.phone || phone || '---';
    const clientAddress = targetOrder?.customer.address || address || '---';
    const activeDeliveryType = targetOrder?.deliveryType || deliveryType;
    const activePayMethod = targetOrder?.paymentMethod || paymentMethod;

    const msg = isArabic
      ? `مرحباً ورشة DBC 👋\nتأكيد طلبية جديدة #${orderNum}:\n\n${itemsList}\n\n*رقم التتبع:* ${trackingNum}\n*المجموع النهائي:* ${formatPrice(
          orderTotal,
          currency,
          isArabic
        )}\n*الاسم:* ${clientName}\n*الهاتف:* ${clientPhone}\n*الولاية:* ${wilayaStr}\n*العنوان:* ${clientAddress}\n*طريقة التوصيل:* ${
          activeDeliveryType === 'home' ? 'توصيل للمنزل' : 'استلام من مكتب التوصيل'
        }\n*طريقة الدفع:* ${activePayMethod === 'cod' ? 'الدفع عند الاستلام' : 'BaridiMob'}`
      : `Bonjour DBC Workshop 👋\nConfirmation de commande #${orderNum} :\n\n${itemsList}\n\n*N° de Suivi :* ${trackingNum}\n*Total Net:* ${formatPrice(
          orderTotal,
          currency,
          isArabic
        )}\n*Nom:* ${clientName}\n*Tél:* ${clientPhone}\n*Wilaya:* ${wilayaStr}\n*Adresse:* ${clientAddress}\n*Mode:* ${
          activeDeliveryType === 'home' ? 'À Domicile' : 'StopDesk'
        }\n*Paiement:* ${activePayMethod === 'cod' ? 'À la livraison (Cash)' : 'BaridiMob'}`;

    const waUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`;
    const a = document.createElement('a');
    a.href = waUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintReceipt = () => {
    setShowReceiptModal(true);
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print dialog unavailable:', e);
    }
  };

  const handleReturnToShop = () => {
    setStep('details');
    setPlacedOrder(null);
    setFormError(null);
    setShowReceiptModal(false);
    setShowTrackingStatus(false);
    onClose();
  };

  const handleTrackShipment = () => {
    if (placedOrder && onOpenOrderLookup) {
      onClose();
      onOpenOrderLookup(placedOrder.orderNumber);
    } else {
      setShowTrackingStatus((prev) => !prev);
    }
  };

  const copyReceiptText = () => {
    if (!placedOrder) return;
    const receiptText = `=== DBC WORKSHOP ALGÉRIE - REÇU DE COMMANDE ===\nCommande N°: ${placedOrder.orderNumber}\nDate: ${placedOrder.date}\nClient: ${placedOrder.customer.fullName} (${placedOrder.customer.phone})\nDestination: ${placedOrder.customer.wilayaCode} - ${placedOrder.customer.wilayaName}\nMode de livraison: ${placedOrder.deliveryType === 'home' ? 'À Domicile' : 'StopDesk'}\nN° de Suivi: ${placedOrder.trackingNumber} (${placedOrder.carrierName})\n\nArticles:\n${placedOrder.items.map(i => `• ${i.product.name} [${i.size}] × ${i.quantity} = ${formatPrice(Number(i.pricePerUnit) * Number(i.quantity), currency)}`).join('\n')}\n\nSous-total: ${formatPrice(placedOrder.subtotal, currency)}\nFrais de livraison: ${formatPrice(placedOrder.shipping, currency)}\nTOTAL NET: ${formatPrice(placedOrder.total, currency)}\nMode de paiement: ${placedOrder.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'BaridiMob'}\n===============================================`;
    navigator.clipboard?.writeText(receiptText);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
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
                          {t.emailOptionalLabel}
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
                                  {t.freeShippingTag}
                                </span>
                              ) : (
                                `${t.shippingLabel} : ${formatPrice(currentWilaya.homeDeliveryFeeDzd, currency, isArabic)}`
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
                            setFormError(
                              isArabic ? 'يرجى إدخال الاسم ورقم الهاتف للمتابعة' :
                              currentLanguage === 'es' ? 'Por favor ingrese su nombre y teléfono para continuar' :
                              currentLanguage === 'en' ? 'Please enter your name and phone number to continue' :
                              'Veuillez saisir votre nom et numéro de téléphone pour continuer'
                            );
                            return;
                          }
                          setFormError(null);
                          setStep('payment');
                        }}
                        className="px-6 py-2.5 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>{isArabic ? 'المتابعة إلى خطوة الدفع' : currentLanguage === 'es' ? 'Continuar al Pago' : currentLanguage === 'en' ? 'Continue to Payment' : 'Continuer vers le paiement'}</span>
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
                                {isArabic ? 'موصى به في الجزائر' : currentLanguage === 'es' ? 'Recomendado en Argelia' : currentLanguage === 'en' ? 'Recommended in Algeria' : 'Recommandé en Algérie'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6E6659] mt-0.5">
                              {isArabic
                                ? 'ادفع نقداً لعامل التوصيل عند استلام ومعاينة طردك يداً بيد.'
                                : currentLanguage === 'es'
                                ? 'Pague en efectivo al mensajero en el momento de la entrega en mano.'
                                : currentLanguage === 'en'
                                ? 'Pay in cash to the delivery agent upon physical hand-over of your parcel.'
                                : "Payez en espèces à l'agent de livraison lors de la remise en main propre de votre colis."}
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
                                {isArabic ? 'تحويل فوري' : currentLanguage === 'es' ? 'Transferencia Inmediata' : currentLanguage === 'en' ? 'Instant Transfer' : 'Virement Immédiat'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6E6659]">
                              {isArabic
                                ? 'قم بتحويل المبلغ الإجمالي للطلبية عبر تطبيق بريدي موب إلى رقم الحساب البريدي (RIP) الخاص بنا:'
                                : currentLanguage === 'es'
                                ? 'Realice la transferencia del total del pedido a través de la app BaridiMob a nuestro RIP:'
                                : currentLanguage === 'en'
                                ? 'Transfer the total order amount via BaridiMob app to our official RIP account:'
                                : "Effectuez le virement du montant total de la commande via l'application BaridiMob vers notre RIP :"}
                            </p>
                            <div className="p-2 bg-white border border-[#DDD4C5] rounded flex items-center justify-between font-mono text-xs">
                              <span className="font-bold text-[#1F1C19]">{storeSettings.baridiMobRip}</span>
                              <button
                                type="button"
                                onClick={copyRip}
                                className="px-2 py-1 bg-[#F2EDE4] hover:bg-black hover:text-white rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {copiedRip ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedRip ? (isArabic ? 'تم النسخ' : currentLanguage === 'es' ? 'Copiado' : currentLanguage === 'en' ? 'Copied' : 'Copié') : (isArabic ? 'نسخ الحساب' : currentLanguage === 'es' ? 'Copiar RIP' : currentLanguage === 'en' ? 'Copy RIP' : 'Copier RIP')}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>

                    <div className="p-3 bg-white border border-[#DDD4C5] rounded text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[#6E6659]">{isArabic ? 'المستلم :' : currentLanguage === 'es' ? 'Destinatario :' : currentLanguage === 'en' ? 'Recipient :' : 'Destinataire :'}</span>
                        <span className="font-bold">{fullName} ({phone})</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[#6E6659]">{isArabic ? 'الوجهة :' : currentLanguage === 'es' ? 'Destino :' : currentLanguage === 'en' ? 'Destination :' : 'Destination :'}</span>
                        <span>{currentWilaya.code} - {isArabic ? currentWilaya.nameAr : currentWilaya.nameEn} ({commune})</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep('details')}
                        className="px-4 py-2 bg-white border border-[#DDD4C5] rounded font-mono text-xs hover:bg-[#F2EDE4] cursor-pointer"
                      >
                        {isArabic ? '← تعديل المعلومات' : currentLanguage === 'es' ? '← Modificar Datos' : currentLanguage === 'en' ? '← Edit Details' : '← Modifier Coordonnées'}
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
                            <span>{isArabic ? 'جاري التأكيد...' : currentLanguage === 'es' ? 'Confirmando pedido...' : currentLanguage === 'en' ? 'Confirming order...' : 'Confirmation en cours...'}</span>
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
                          {isArabic ? 'المقاس:' : currentLanguage === 'es' ? 'Talla:' : currentLanguage === 'en' ? 'Size:' : 'Taille :'} {item.size} • {isArabic ? 'اللون:' : currentLanguage === 'es' ? 'Color:' : currentLanguage === 'en' ? 'Color:' : 'Couleur :'} {item.color.name}
                        </p>
                        <p className="text-[10px] font-mono text-[#7C756B]">
                          {isArabic ? 'الكمية:' : currentLanguage === 'es' ? 'Cantidad:' : currentLanguage === 'en' ? 'Quantity:' : 'Quantité :'} {item.quantity}
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
                      <span>{isArabic ? 'الخصم الترويجي' : currentLanguage === 'es' ? 'Descuento B2B / Promo' : currentLanguage === 'en' ? 'Discount B2B / Promo' : 'Remise B2B / Promo'} ({appliedDiscountPct}%)</span>
                      <span>-{formatPrice(discountAmountDzd, currency, isArabic)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#5C554B]">
                    <span>{isArabic ? 'التوصيل' : currentLanguage === 'es' ? 'Envío' : currentLanguage === 'en' ? 'Shipping' : 'Livraison'} ({currentWilaya.code} - {isArabic ? currentWilaya.nameAr : currentWilaya.nameEn})</span>
                    <span>{formatPrice(shippingCostDzd, currency, isArabic)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-[#1F1C19] pt-2 border-t border-[#DDD4C5]">
                    <span>{t.netTotalToPay}</span>
                    <span>{formatPrice(totalDzd, currency, isArabic)}</span>
                  </div>
                </div>

                {/* Assurance Box */}
                <div className="p-3 bg-[#FAF8F5] border border-[#DDD4C5] rounded space-y-1.5 text-[10px] text-[#6E6659]">
                  <div className="flex items-center gap-1.5 font-bold text-[#1F1C19]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8C6D3B]" />
                    <span>{t.qualityPromiseTitle}</span>
                  </div>
                  <p>{t.qualityPromisePoint1}</p>
                  <p>{t.qualityPromisePoint2}</p>
                  <p>{t.qualityPromisePoint3}</p>
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
                <div className="p-5 bg-white border border-[#E2DAD0] rounded text-left rtl:text-right space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">{t.orderNumberLabel}</span>
                    <span className="font-bold text-[#1F1C19]">{placedOrder.orderNumber}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">{t.destinationLabel}</span>
                    <span className="font-bold text-[#1F1C19]">
                      {placedOrder.customer.wilayaCode} - {placedOrder.customer.wilayaName} ({placedOrder.customer.city})
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">{t.recipientLabel}</span>
                    <span>{placedOrder.customer.fullName} • {placedOrder.customer.phone}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">{t.paymentMethod} :</span>
                    <span>{placedOrder.paymentMethod === 'cod' ? t.cashOnDelivery : t.baridiMob}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">{t.cartSubtotal} :</span>
                    <span>{formatPrice(placedOrder.subtotal, currency, isArabic)}</span>
                  </div>

                  <div className="flex justify-between border-b border-[#E2DAD0] pb-2">
                    <span className="text-[#7C756B]">{t.shippingLabel} ({placedOrder.deliveryType === 'home' ? t.homeDelivery : t.deskDelivery}) :</span>
                    <span>{formatPrice(placedOrder.shipping, currency, isArabic)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-[#1F1C19] pt-1">
                    <span>{t.totalLabel}</span>
                    <span>{formatPrice(placedOrder.total, currency, isArabic)}</span>
                  </div>
                </div>
              )}

              {/* Inline Shipment Tracking Status Banner (if activated) */}
              {showTrackingStatus && placedOrder && (
                <div className="p-4 bg-amber-50/80 border border-amber-200 rounded text-left space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>{isArabic ? 'حالة التتبع الحالية للشحنة' : 'Statut d’Acheminement DBC'}</span>
                    </span>
                    <span className="px-2 py-0.5 bg-amber-200/70 rounded text-[10px] text-amber-900">
                      {placedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 font-sans leading-relaxed">
                    {isArabic
                      ? `طلبيتكم رقم (${placedOrder.orderNumber}) مسجلة بنجاح في ورشة DBC. رقم تتبع الشحنة هو (${placedOrder.trackingNumber}) مع شركة ${placedOrder.carrierName || 'Yalidine Express'}. سيتم تسليم الطرد لوكالة الشحن خلال 24-48 ساعة، وستتلقون اتصالاً هاتفياً قبل التوصيل إلى باب منزلكم.`
                      : `Votre commande N° ${placedOrder.orderNumber} est validée et en cours de préparation à l’atelier DBC. Numéro de suivi : ${placedOrder.trackingNumber} (${placedOrder.carrierName || 'Yalidine Express'}). Les étapes détaillées de transport s'activeront dès la prise en charge par l'agence de livraison.`}
                  </p>
                  <div className="text-[11px] font-mono text-amber-800 flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-amber-200/60">
                    <span>{isArabic ? 'شركة الشحن :' : currentLanguage === 'es' ? 'Transportista :' : currentLanguage === 'en' ? 'Carrier :' : 'Transporteur :'} <strong>{placedOrder.carrierName || 'Yalidine Express'}</strong></span>
                    <span>{isArabic ? 'المدة التقديرية :' : currentLanguage === 'es' ? 'Plazo estimado :' : currentLanguage === 'en' ? 'Estimated delay :' : 'Délai estimé :'} <strong>{placedOrder.estimatedDelivery || '24h - 48h'}</strong></span>
                    <span>{isArabic ? 'الولاية :' : currentLanguage === 'es' ? 'Provincia :' : currentLanguage === 'en' ? 'Wilaya :' : 'Wilaya :'} <strong>{placedOrder.customer.wilayaName}</strong></span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  id="checkout-track-shipment-btn"
                  onClick={handleTrackShipment}
                  className="px-5 py-2.5 bg-[#8C6D3B] hover:bg-[#72572D] text-white font-mono text-xs font-bold rounded flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>{t.trackShipmentBtn}</span>
                </button>

                <button
                  type="button"
                  id="checkout-whatsapp-confirm-btn"
                  onClick={handleOrderViaWhatsApp}
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-semibold rounded flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>💬 WhatsApp</span>
                </button>

                <button
                  type="button"
                  id="checkout-print-receipt-btn"
                  onClick={handlePrintReceipt}
                  className="px-5 py-2.5 bg-white border border-[#DDD4C5] font-mono text-xs rounded hover:bg-[#F2EDE4] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printReceiptBtn}</span>
                </button>

                <button
                  type="button"
                  id="checkout-return-to-shop-btn"
                  onClick={handleReturnToShop}
                  className="px-5 py-2.5 bg-[#1F1D1A] text-white font-mono text-xs rounded hover:bg-[#3D3730] cursor-pointer"
                >
                  {t.returnToShopBtn}
                </button>
              </div>

              {/* Printable Receipt Modal View */}
              {showReceiptModal && placedOrder && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="bg-white rounded-lg border border-[#DDD4C5] shadow-2xl max-w-lg w-full p-6 text-left space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-3">
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#1F1D1A]">
                          DBC WORKSHOP ALGÉRIE
                        </h4>
                        <p className="text-[11px] font-mono text-[#7C756B]">
                          {isArabic ? 'ورشة تفصيل وخياطة الملابس • وصل الشراء' : currentLanguage === 'es' ? 'Taller de Confección Textil • Recibo de Compra' : currentLanguage === 'en' ? 'Apparel Workshop • Purchase Receipt' : "Atelier de Confection Textile • Reçu d'Achat"}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowReceiptModal(false)}
                        className="p-1 text-[#7C756B] hover:text-black rounded"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2 font-mono text-xs text-[#2C2825]">
                      <div className="flex justify-between">
                        <span className="text-[#7C756B]">{isArabic ? 'الطلب :' : currentLanguage === 'es' ? 'Pedido :' : currentLanguage === 'en' ? 'Order :' : 'Commande :'}</span>
                        <span className="font-bold">{placedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7C756B]">{isArabic ? 'التاريخ :' : currentLanguage === 'es' ? 'Fecha :' : currentLanguage === 'en' ? 'Date :' : 'Date :'}</span>
                        <span>{placedOrder.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7C756B]">{isArabic ? 'العميل :' : currentLanguage === 'es' ? 'Cliente :' : currentLanguage === 'en' ? 'Customer :' : 'Client :'}</span>
                        <span>{placedOrder.customer.fullName} ({placedOrder.customer.phone})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7C756B]">{isArabic ? 'الوجهة :' : currentLanguage === 'es' ? 'Destino :' : currentLanguage === 'en' ? 'Destination :' : 'Destination :'}</span>
                        <span>{placedOrder.customer.wilayaCode} - {placedOrder.customer.wilayaName} ({placedOrder.customer.city})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7C756B]">{isArabic ? 'رقم التتبع :' : currentLanguage === 'es' ? 'Seguimiento :' : currentLanguage === 'en' ? 'Tracking :' : 'Suivi Colis :'}</span>
                        <span className="font-bold text-[#8C6D3B]">{placedOrder.trackingNumber}</span>
                      </div>
                    </div>

                    <div className="border-t border-b border-[#EAE3D6] py-3 space-y-2 font-mono text-xs">
                      <div className="font-bold text-[#1F1D1A] text-[11px] uppercase tracking-wider">
                        {isArabic ? 'القطع المطلوبة :' : currentLanguage === 'es' ? 'Artículos pedidos :' : currentLanguage === 'en' ? 'Ordered items :' : 'Articles commandés :'}
                      </div>
                      {placedOrder.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span>
                            {it.product?.name || (isArabic ? 'ملابس DBC' : currentLanguage === 'es' ? 'Prenda DBC' : currentLanguage === 'en' ? 'DBC Apparel' : 'Vêtement DBC')} ({it.size}) ×{it.quantity}
                          </span>
                          <span className="font-bold">
                            {formatPrice(Number(it.pricePerUnit) * Number(it.quantity), currency, isArabic)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5 font-mono text-xs pt-1">
                      <div className="flex justify-between text-[#7C756B]">
                        <span>{isArabic ? 'المجموع الفرعي :' : currentLanguage === 'es' ? 'Subtotal :' : currentLanguage === 'en' ? 'Subtotal :' : 'Sous-total :'}</span>
                        <span>{formatPrice(placedOrder.subtotal, currency, isArabic)}</span>
                      </div>
                      {placedOrder.discount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>{isArabic ? 'الخصم :' : currentLanguage === 'es' ? 'Descuento :' : currentLanguage === 'en' ? 'Discount :' : 'Remise :'}</span>
                          <span>-{formatPrice(placedOrder.discount, currency, isArabic)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[#7C756B]">
                        <span>{isArabic ? 'تكلفة الشحن :' : currentLanguage === 'es' ? 'Gastos de envío :' : currentLanguage === 'en' ? 'Shipping cost :' : 'Frais de livraison :'}</span>
                        <span>{formatPrice(placedOrder.shipping, currency, isArabic)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#1F1C19] pt-2 border-t border-[#DDD4C5]">
                        <span>{isArabic ? 'الإجمالي الصافي :' : currentLanguage === 'es' ? 'Total Neto :' : currentLanguage === 'en' ? 'Net Total :' : 'Total Net :'}</span>
                        <span>{formatPrice(placedOrder.total, currency, isArabic)}</span>
                      </div>
                      <div className="text-[11px] text-[#7C756B] pt-1">
                        {isArabic ? 'طريقة الدفع :' : currentLanguage === 'es' ? 'Pago :' : currentLanguage === 'en' ? 'Payment :' : 'Paiement :'} {placedOrder.paymentMethod === 'cod' ? (isArabic ? 'عند الاستلام (نقداً)' : currentLanguage === 'es' ? 'Contra entrega (Efectivo)' : currentLanguage === 'en' ? 'Cash on delivery' : 'À la livraison (Espèces)') : 'BaridiMob / CCP'}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[#EAE3D6]">
                      <button
                        type="button"
                        onClick={copyReceiptText}
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#4A4338] border border-[#DDD4C5] rounded font-mono text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedReceipt ? (isArabic ? 'تم النسخ !' : currentLanguage === 'es' ? '¡Copiado!' : currentLanguage === 'en' ? 'Copied!' : 'Copié !') : (isArabic ? 'نسخ' : currentLanguage === 'es' ? 'Copiar' : currentLanguage === 'en' ? 'Copy' : 'Copier')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            window.print();
                          } catch (e) {
                            console.warn('Window print notice:', e);
                          }
                        }}
                        className="px-4 py-1.5 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#C9A96E]" />
                        <span>{isArabic ? 'طباعة (PDF)' : currentLanguage === 'es' ? 'Imprimir (PDF)' : currentLanguage === 'en' ? 'Print (PDF)' : 'Imprimer (PDF)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
