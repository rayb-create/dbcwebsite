import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  Printer, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  Calendar,
  Building,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Order, Currency, StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';
import { formatPrice } from '../utils/format';
import { ALGERIAN_WILAYAS, Wilaya, getWilayaByCode } from '../data/wilayas';
import { 
  DEMO_ORDERS, 
  findOrderByQuery, 
  generateTrackingCheckpoints, 
  generateOrderWhatsAppInquiry,
  TrackingCheckpoint
} from '../utils/orderTracking';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currency: Currency;
  currentLanguage: Language;
  storeSettings: StoreSettings;
  initialQuery?: string;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  orders,
  currency,
  currentLanguage,
  storeSettings,
  initialQuery = '',
}) => {
  const [activeTab, setActiveTab] = useState<'track' | 'rates'>('track');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [wilayaFilterZone, setWilayaFilterZone] = useState<'all' | 'centre' | 'est' | 'ouest' | 'sud'>('all');
  const [wilayaSearchQuery, setWilayaSearchQuery] = useState('');

  const isArabic = currentLanguage === 'ar';
  const t = TRANSLATIONS[currentLanguage];

  // If initialQuery changes or opens, trigger lookup automatically
  useEffect(() => {
    if (initialQuery && isOpen) {
      setSearchQuery(initialQuery);
      const found = findOrderByQuery(initialQuery, orders);
      if (found) {
        setSelectedOrder(found);
      }
      setHasSearched(true);
    } else if (isOpen && !selectedOrder && orders.length > 0) {
      // Pre-select most recent customer order if available
      setSelectedOrder(orders[0]);
      setSearchQuery(orders[0].orderNumber);
      setHasSearched(true);
    } else if (isOpen && !selectedOrder && orders.length === 0) {
      setSelectedOrder(null);
      setSearchQuery('');
      setHasSearched(false);
    }
  }, [initialQuery, isOpen, orders]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHasSearched(true);
    const result = findOrderByQuery(searchQuery, orders);
    setSelectedOrder(result);
  };

  const handleSelectPredefined = (order: Order) => {
    setSelectedOrder(order);
    setSearchQuery(order.orderNumber);
    setHasSearched(true);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const checkpoints: TrackingCheckpoint[] = selectedOrder
    ? generateTrackingCheckpoints(selectedOrder)
    : [];

  const selectedWilaya: Wilaya | undefined = selectedOrder
    ? getWilayaByCode(selectedOrder.customer.wilayaCode)
    : undefined;

  // Filtered wilayas list for the "Tarifs & Délais 69 Wilayas" explorer tab
  const filteredWilayas = ALGERIAN_WILAYAS.filter((w) => {
    const matchesZone = wilayaFilterZone === 'all' || w.zone === wilayaFilterZone;
    const q = wilayaSearchQuery.toLowerCase().trim();
    if (!q) return matchesZone;
    const matchesQuery =
      w.code.includes(q) ||
      w.nameEn.toLowerCase().includes(q) ||
      w.nameAr.includes(q);
    return matchesZone && matchesQuery;
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Expédié / En Livraison':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-full font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {isArabic ? 'الشحنة في طريقها إليك (قيد التوصيل)' : 'En Transit & Livraison'}
          </span>
        );
      case 'En Préparation / Atelier':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-900 border border-blue-300 rounded-full font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {isArabic ? 'قيد التجهيز في ورشة الجزائر' : 'En Confection & Préparation'}
          </span>
        );
      case 'Livré / Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-full font-mono text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {isArabic ? 'تم التسليم بنجاح' : 'Colis Livré'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F2EDE4] text-[#4A4338] border border-[#DDD4C5] rounded-full font-mono text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#8C6D3B]" />
            {isArabic ? 'الطلب مسجل ومؤكد' : 'Commande Confirmée'}
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div 
        className="bg-[#FAF8F5] w-full max-w-4xl border border-[#DDD4C5] rounded-lg shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#1F1D1A] text-white flex items-center justify-between border-b border-[#3D3730] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/40 rounded flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-white tracking-tight">
                  {isArabic ? 'تتبع طلبيات ورشة DBC' : 'Suivi de Commande & Colis'}
                </h2>
                <span className="px-2 py-0.5 bg-[#C9A96E] text-[#1F1D1A] text-[10px] font-mono font-bold rounded-sm uppercase tracking-wider">
                  69 Wilayas
                </span>
              </div>
              <p className="text-xs text-[#A8A196] font-mono">
                {isArabic 
                  ? 'تتبع حالة الشحنة وخطوات التوصيل في كامل الولايات الجزائرية' 
                  : 'Vérifiez en temps réel l’acheminement de votre colis à travers l’Algérie'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A8A196] hover:text-white hover:bg-[#3D3730] rounded transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Track Order vs 69 Wilayas Rates) */}
        <div className="px-5 py-2.5 bg-[#F2EDE4] border-b border-[#DDD4C5] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('track')}
              className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-[#1F1D1A] text-white shadow-xs'
                  : 'bg-white text-[#4A4338] hover:bg-[#EAE3D6] border border-[#DDD4C5]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تتبع طلبيتي' : 'Suivre une commande'}</span>
            </button>

            <button
              onClick={() => setActiveTab('rates')}
              className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'rates'
                  ? 'bg-[#1F1D1A] text-white shadow-xs'
                  : 'bg-white text-[#4A4338] hover:bg-[#EAE3D6] border border-[#DDD4C5]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#8C6D3B]" />
              <span>{isArabic ? 'دليل وتعريفات الـ 69 ولاية' : 'Délais & Tarifs des 69 Wilayas'}</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#7C756B]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isArabic ? 'نظام تتبع مباشر وسريع' : 'Yalidine & Procolis Express'}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'track' ? (
            <>
              {/* Search Box */}
              <div className="bg-white border border-[#DDD4C5] p-4 rounded-lg shadow-2xs space-y-3">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        isArabic
                          ? 'أدخل رقم الطلب (مثال: DBC-2026-8492) أو رقم الهاتف أو كود التتبع...'
                          : 'N° de commande (ex: DBC-2026-8492), N° de téléphone ou N° de suivi...'
                      }
                      className="w-full pl-9 pr-8 py-2.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-[#1F1D1A] transition-colors"
                    />
                    <Search className={`w-4 h-4 text-[#8C8377] absolute top-3 ${isArabic ? 'right-3' : 'left-3'}`} />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedOrder(null);
                          setHasSearched(false);
                        }}
                        className={`absolute top-2.5 text-[#8C8377] hover:text-black text-xs font-bold px-1.5 ${isArabic ? 'left-2.5' : 'right-2.5'}`}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1F1D1A] hover:bg-[#3D3730] text-white font-mono text-xs font-semibold rounded flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'بحث وتتبع' : 'Rechercher'}</span>
                  </button>
                </form>

                {/* Recent Orders Chips */}
                {orders.length > 0 && (
                  <div className="pt-2 border-t border-[#F2EDE4] flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    <span className="text-[11px] text-[#8C8377] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C9A96E]" />
                      <span>{isArabic ? 'طلبيات حديثة :' : 'Commandes récentes :'}</span>
                    </span>

                    {orders.slice(0, 3).map((ord) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => handleSelectPredefined(ord)}
                        className={`px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer flex items-center gap-1 ${
                          selectedOrder?.orderNumber === ord.orderNumber
                            ? 'bg-[#1F1D1A] text-white border-[#1F1D1A]'
                            : 'bg-[#F2EDE4] hover:bg-[#E8E1D5] text-[#1F1C19] border-[#DDD4C5]'
                        }`}
                      >
                        <span>{ord.orderNumber}</span>
                        <span className="text-[9px] opacity-75">({ord.customer.wilayaName})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Result Area */}
              {selectedOrder ? (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Order Overview Banner */}
                  <div className="bg-white border border-[#DDD4C5] rounded-lg p-4 sm:p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EAE1] pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm sm:text-base font-bold text-[#1F1C19]">
                            {selectedOrder.orderNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(selectedOrder.orderNumber, 'ord-num')}
                            className="p-1 text-[#8C8377] hover:text-black rounded hover:bg-[#F2EDE4] transition-colors"
                            title="Copier le N° de commande"
                          >
                            {copiedCode === 'ord-num' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {getStatusBadge(selectedOrder.status)}
                        </div>

                        <p className="text-xs text-[#7C756B] font-mono mt-1 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {isArabic ? 'تاريخ التسجيل :' : 'Date de commande :'} {selectedOrder.date}
                          </span>
                          <span>•</span>
                          <span>
                            {selectedOrder.deliveryType === 'home'
                              ? (isArabic ? 'توصيل للمنزل' : 'Livraison à Domicile')
                              : (isArabic ? 'استلام من المكتب StopDesk' : 'Retrait StopDesk')}
                          </span>
                        </p>
                      </div>

                      {/* Carrier & Tracking */}
                      <div className="sm:text-right bg-[#FAF8F5] p-2.5 rounded border border-[#E8E2D8] font-mono">
                        <div className="text-[10px] text-[#8C8377] uppercase tracking-wider">
                          {isArabic ? 'شركة الشحن ورقم التتبع :' : 'Transporteur & N° de Suivi :'}
                        </div>
                        <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-[#1F1C19]">
                            {selectedOrder.trackingNumber || 'DZ-YAL-EnAttente'}
                          </span>
                          <button
                            onClick={() => handleCopy(selectedOrder.trackingNumber, 'trk-num')}
                            className="p-1 text-[#8C8377] hover:text-black rounded hover:bg-[#EAE3D6] transition-colors"
                            title="Copier le N° de suivi"
                          >
                            {copiedCode === 'trk-num' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          {isArabic ? 'تقدير الوصول :' : 'Estimation :'} {selectedOrder.estimatedDelivery}
                        </div>
                      </div>
                    </div>

                    {/* Progress Stepper (Timeline) */}
                    <div className="py-2">
                      <h4 className="text-xs font-mono font-bold text-[#1F1C19] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#8C6D3B]" />
                        <span>{isArabic ? 'مسار الشحنة عبر الولايات :' : 'Étapes d’Acheminement du Colis :'}</span>
                      </h4>

                      <div className="relative border-l-2 sm:border-l-0 sm:border-t-2 border-[#DDD4C5] ml-4 sm:ml-0 sm:pt-4 sm:grid sm:grid-cols-6 gap-2 space-y-6 sm:space-y-0">
                        {checkpoints.map((cp, idx) => {
                          const isDone = cp.isCompleted;
                          const isCurrent = cp.isCurrent;

                          return (
                            <div key={cp.id} className="relative pl-6 sm:pl-0 sm:text-center group">
                              {/* Step Node Marker */}
                              <div
                                className={`absolute -left-2.5 sm:left-1/2 sm:-translate-x-1/2 -top-1 sm:-top-6 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-[#1F1D1A] text-white'
                                    : isCurrent
                                    ? 'bg-amber-500 text-white ring-4 ring-amber-200 animate-pulse'
                                    : 'bg-white border-2 border-[#DDD4C5] text-[#A8A196]'
                                }`}
                              >
                                {isDone ? (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                ) : (
                                  <span className="text-[9px] font-mono font-bold">{idx + 1}</span>
                                )}
                              </div>

                              {/* Text info */}
                              <div className="space-y-1">
                                <div className="text-xs font-mono font-bold text-[#1F1C19] leading-tight">
                                  {isArabic ? cp.titleAr : cp.titleFr}
                                </div>
                                <div className="text-[11px] text-[#6E6659] leading-relaxed hidden sm:block line-clamp-2 group-hover:line-clamp-none">
                                  {isArabic ? cp.descriptionAr : cp.descriptionFr}
                                </div>
                                <div className="text-[10px] font-mono text-[#8C6D3B] font-semibold flex items-center sm:justify-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{isArabic ? cp.locationAr : cp.locationFr}</span>
                                </div>
                                <div className="text-[10px] font-mono text-[#9C9488]">
                                  {cp.timestamp}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Wilaya & Delivery Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#F0EAE1]">
                      {/* Destination Wilaya Box */}
                      <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1F1C19] uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#8C6D3B]" />
                            <span>{isArabic ? 'وجهة التوصيل بالجزائر' : 'Destination en Algérie'}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-[#EAE3D6] text-[#4A4338] text-[10px] font-bold rounded">
                            Wilaya {selectedOrder.customer.wilayaCode}
                          </span>
                        </div>

                        <div className="text-sm font-serif font-bold text-[#1F1C19]">
                          {selectedOrder.customer.wilayaName} ({selectedOrder.customer.city})
                        </div>

                        <div className="text-[11px] text-[#6E6659] space-y-0.5">
                          <p><strong>{isArabic ? 'العنوان :' : 'Adresse :'}</strong> {selectedOrder.customer.address}</p>
                          <p><strong>{isArabic ? 'العميل :' : 'Client :'}</strong> {selectedOrder.customer.fullName} • {selectedOrder.customer.phone}</p>
                          {selectedOrder.customer.notes && (
                            <p className="text-[#8C6D3B] italic mt-1">
                              "{selectedOrder.customer.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment & COD Summary */}
                      <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1F1C19] uppercase tracking-wider">
                            {isArabic ? 'معلومات الدفع والتوصيل' : 'Modalités & Paiement'}
                          </span>
                          <span className="text-[11px] font-semibold text-[#8C6D3B]">
                            {selectedOrder.paymentMethod === 'cod'
                              ? (isArabic ? 'الدفع عند الاستلام' : 'Cash à la livraison')
                              : (isArabic ? 'مدفوع عبر بريديموب' : 'BaridiMob / CCP')}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] text-[#6E6659]">
                          <div className="flex justify-between">
                            <span>{isArabic ? 'المجموع الفرعي للملابس :' : 'Sous-total articles :'}</span>
                            <span>{formatPrice(selectedOrder.subtotal, currency, isArabic)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>
                              {isArabic ? 'تكلفة التوصيل للولاية :' : 'Frais de livraison wilaya :'}
                            </span>
                            <span>{formatPrice(selectedOrder.shipping, currency, isArabic)}</span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <div className="flex justify-between text-emerald-700">
                              <span>{isArabic ? 'الخصم المطبق :' : 'Remise atelier :'}</span>
                              <span>-{formatPrice(selectedOrder.discount, currency, isArabic)}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#E8E2D8] flex justify-between items-center text-sm font-bold text-[#1F1C19]">
                          <span>
                            {selectedOrder.paymentMethod === 'cod' 
                              ? (isArabic ? 'المبلغ المطلوب تسليمه للموزع :' : 'À régler au livreur :')
                              : (isArabic ? 'المبلغ الإجمالي للمطابقة :' : 'Total réglé :')}
                          </span>
                          <span className="text-[#1F1D1A] font-serif text-base">
                            {formatPrice(selectedOrder.total, currency, isArabic)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Garments List */}
                    <div className="pt-3 border-t border-[#F0EAE1] space-y-2">
                      <div className="text-xs font-mono font-bold text-[#1F1C19] uppercase tracking-wider flex items-center justify-between">
                        <span>{isArabic ? 'القطع الموجودة داخل الطرد :' : 'Contenu du colis :'}</span>
                        <span className="text-[11px] text-[#8C8377] font-normal">
                          {selectedOrder.items.reduce((sum, i) => sum + i.quantity, 0)} {isArabic ? 'قطع' : 'articles'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white border border-[#E5DEC9] rounded flex items-center gap-3 text-xs"
                          >
                            <img
                              src={item.product?.images[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                              alt={item.product?.name || 'Garment'}
                              className="w-12 h-14 object-cover rounded border border-[#DDD4C5] shrink-0"
                            />
                            <div className="min-w-0 flex-1 font-mono">
                              <div className="font-bold text-[#1F1C19] truncate">
                                {item.product?.name || 'Vêtement DBC'}
                              </div>
                              <div className="text-[11px] text-[#7C756B] flex items-center gap-2 mt-0.5">
                                <span>Taille: <strong>{item.size}</strong></span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <span
                                    className="w-2 h-2 rounded-full inline-block border border-black/20"
                                    style={{ backgroundColor: item.color.hex }}
                                  />
                                  <span className="truncate">{item.color.name}</span>
                                </span>
                              </div>
                              <div className="text-[10px] text-[#8C6D3B] font-semibold mt-0.5">
                                Qté: {item.quantity} • {formatPrice(item.pricePerUnit * item.quantity, currency, isArabic)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Assistance Buttons */}
                    <div className="pt-3 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2">
                        <a
                          href={generateOrderWhatsAppInquiry(selectedOrder, storeSettings.whatsappNumber, isArabic)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-mono text-xs font-semibold rounded flex items-center gap-2 shadow-2xs transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 fill-current" />
                          <span>
                            {isArabic ? 'مساعدة واتساب بشأن هذه الطلبية' : 'Support WhatsApp pour ce colis'}
                          </span>
                        </a>

                        <button
                          onClick={() => window.print()}
                          className="px-3 py-2 bg-white hover:bg-[#F2EDE4] border border-[#DDD4C5] text-[#1F1C19] font-mono text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Imprimer le bon de livraison"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isArabic ? 'طباعة الوصل' : 'Imprimer'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrder(null);
                          setSearchQuery('');
                          setHasSearched(false);
                        }}
                        className="text-xs font-mono text-[#8C8377] hover:text-[#1F1C19] underline cursor-pointer"
                      >
                        {isArabic ? 'بحث عن طلبية أخرى' : 'Vérifier une autre commande'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : hasSearched ? (
                /* Not Found State */
                <div className="bg-white border border-[#DDD4C5] rounded-lg p-8 text-center space-y-4 shadow-2xs">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#1F1C19]">
                      {isArabic ? 'لم نتمكن من العثور على هذه الطلبية' : 'Aucune commande trouvée'}
                    </h3>
                    <p className="text-xs text-[#6E6659] max-w-md mx-auto font-mono">
                      {isArabic
                        ? `لم نجد أي طلبية برقم "${searchQuery}". تأكد من صحة رقم الطلب (DBC-2026-XXXX) أو رقم الهاتف المستخدم عند الشراء.`
                        : `Aucune commande ne correspond à la référence "${searchQuery}". Vérifiez le numéro reçu par SMS ou sur votre reçu.`}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <a
                      href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        isArabic
                          ? `مرحباً ورشة DBC، أود الاستفسار عن رقم طلبيتي (${searchQuery})`
                          : `Bonjour DBC Workshop, je cherche ma commande avec la référence (${searchQuery})`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#1F1D1A] text-white rounded font-mono text-xs font-semibold hover:bg-[#3D3730] transition-colors flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>{isArabic ? 'استفسار عبر واتساب' : 'Assistance WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* Initial Welcome Helper */
                <div className="bg-white border border-[#DDD4C5] rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#F2EDE4] text-[#8C6D3B] rounded">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-[#1F1C19]">
                        {isArabic ? 'كيف تتتبع طلبيتك مع ورشة DBC ؟' : 'Comment suivre votre colis DBC Workshop ?'}
                      </h4>
                      <p className="text-xs text-[#6E6659] leading-relaxed">
                        {isArabic
                          ? 'بمجرد تسجيل طلبيتك في المتجر، يتم إسناد رقم طلب رسمي خاص بك يبدأ بـ (DBC-2026-XXXX) وكود تتبع للشحن السريع (Yalidine). يمكنك إدخال رقم الطلب أو رقم هاتفك في الخانة أعلاه لعرض مسار الشحنة مباشرة.'
                          : 'Après confirmation de commande, un numéro de référence unique (ex: DBC-2026-8492) vous est attribué. Vous pouvez le saisir ci-dessus ou utiliser le numéro de téléphone renseigné lors de votre achat.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* TAB 2: 69 WILAYAS COVERAGE & TARIFF EXPLORER */
            <div className="space-y-4">
              <div className="bg-white border border-[#DDD4C5] p-4 rounded-lg shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#1F1C19] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#8C6D3B]" />
                      <span>{isArabic ? 'تغطية وتعريفات الشحن لـ 69 ولاية جزائرية' : 'Couverture et Tarifs de Livraison (69 Wilayas)'}</span>
                    </h3>
                    <p className="text-xs text-[#7C756B] font-mono mt-0.5">
                      {isArabic
                        ? 'توصيل مباشر إلى باب المنزل أو الاستلام من مكاتب StopDesk بأسعار مضبوطة'
                        : 'Expéditions quotidiennes vers l’ensemble des 69 wilayas d’Algérie'}
                    </p>
                  </div>

                  {/* Search wilaya */}
                  <div className="relative w-full sm:w-60">
                    <input
                      type="text"
                      value={wilayaSearchQuery}
                      onChange={(e) => setWilayaSearchQuery(e.target.value)}
                      placeholder={isArabic ? 'ابحث باسم أو رقم الولاية...' : 'Filtrer par nom ou N° de wilaya...'}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono text-xs focus:outline-none focus:border-black"
                    />
                    <Search className={`w-3.5 h-3.5 text-[#8C8377] absolute top-2.5 ${isArabic ? 'right-2.5' : 'left-2.5'}`} />
                  </div>
                </div>

                {/* Zone Filter Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F2EDE4] text-xs font-mono">
                  <span className="text-[11px] text-[#8C8377]">{isArabic ? 'المنطقة :' : 'Zone géographique :'}</span>
                  {[
                    { id: 'all', label: isArabic ? 'الكل (69)' : 'Toutes (69)' },
                    { id: 'centre', label: isArabic ? 'الوسط' : 'Centre' },
                    { id: 'est', label: isArabic ? 'الشرق' : 'Est' },
                    { id: 'ouest', label: isArabic ? 'الغرب' : 'Ouest' },
                    { id: 'sud', label: isArabic ? 'الجنوب الكبير' : 'Sud' },
                  ].map((z) => (
                    <button
                      key={z.id}
                      onClick={() => setWilayaFilterZone(z.id as any)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                        wilayaFilterZone === z.id
                          ? 'bg-[#1F1D1A] text-white shadow-2xs'
                          : 'bg-[#FAF8F5] hover:bg-[#EAE3D6] text-[#4A4338] border border-[#DDD4C5]'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wilayas Grid / Table */}
              <div className="bg-white border border-[#DDD4C5] rounded-lg overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left font-mono text-xs" dir={isArabic ? 'rtl' : 'ltr'}>
                    <thead className="bg-[#1F1D1A] text-white sticky top-0 z-10 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">N°</th>
                        <th className="py-2.5 px-3 font-semibold">{isArabic ? 'الولاية' : 'Wilaya'}</th>
                        <th className="py-2.5 px-3 font-semibold">{isArabic ? 'المنطقة' : 'Zone'}</th>
                        <th className="py-2.5 px-3 font-semibold">{isArabic ? 'مدة التوصيل' : 'Délai'}</th>
                        <th className="py-2.5 px-3 font-semibold text-right">{isArabic ? 'للمنزل' : 'À Domicile'}</th>
                        <th className="py-2.5 px-3 font-semibold text-right">{isArabic ? 'مكتب StopDesk' : 'Bureau StopDesk'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE3D6]">
                      {filteredWilayas.map((w) => {
                        const estimated =
                          w.zone === 'centre'
                            ? (isArabic ? '24 - 48 ساعة' : '24h - 48h')
                            : w.zone === 'sud'
                            ? (isArabic ? '3 - 5 أيام' : '3 - 5 jours')
                            : (isArabic ? '48 - 72 ساعة' : '48h - 72h');

                        return (
                          <tr key={w.code} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="py-2 px-3 font-bold text-[#8C6D3B]">
                              {w.code}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-bold text-[#1F1C19]">{w.nameEn}</span>
                              <span className="text-[#8C8377] text-[11px] block">{w.nameAr}</span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-[#F2EDE4] text-[#4A4338]">
                                {w.zone}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[#5C554A] text-[11px]">
                              {estimated}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-[#1F1C19]">
                              {formatPrice(w.homeDeliveryFeeDzd, currency, isArabic)}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-emerald-800">
                              {formatPrice(w.deskDeliveryFeeDzd, currency, isArabic)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-[#F2EDE4] border-t border-[#DDD4C5] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#6E6659]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isArabic ? 'الأسعار شاملة التغليف الآمن والضمان' : 'Tarifs transparents avec emballage étanche de l’atelier'}</span>
                  </span>
                  <span className="font-semibold">
                    {filteredWilayas.length} {isArabic ? 'ولاية معروضة' : 'wilayas affichées'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#F2EDE4] border-t border-[#DDD4C5] flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-[#6E6659]">
            <Package className="w-4 h-4 text-[#8C6D3B]" />
            <span className="hidden sm:inline">
              {isArabic ? 'ورشة DBC — الجزائر العاصمة' : 'Atelier DBC — Alger, Algérie'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>{isArabic ? 'خدمة الزبائن' : 'Service Client'}</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1F1D1A] text-white hover:bg-[#3D3730] rounded font-semibold transition-colors cursor-pointer"
            >
              {isArabic ? 'إغلاق' : 'Fermer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
