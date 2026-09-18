import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Search, 
  MessageCircle, 
  ExternalLink, 
  Save, 
  MapPin, 
  Phone, 
  User, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { Order, StoreSettings, Currency } from '../../types';
import { Language } from '../../data/i18n';
import { formatPrice } from '../../utils/format';
import { getWilayaByCode, ALGERIAN_WILAYAS } from '../../data/wilayas';
import { 
  generateCarrierExternalTrackingUrl, 
  generateAdminWhatsAppCustomerDispatch, 
  DEMO_ORDERS 
} from '../../utils/orderTracking';
import { useAdminLanguage } from '../../context/AdminLanguageContext';

interface OrderManagerTabProps {
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
  onUpdateOrders?: (allOrders: Order[]) => void;
  storeSettings: StoreSettings;
  currentLanguage?: Language;
  currency: Currency;
  onOpenCustomerTracking?: (orderNumber: string) => void;
}

export const OrderManagerTab: React.FC<OrderManagerTabProps> = ({
  orders,
  onUpdateOrder,
  onUpdateOrders,
  storeSettings,
  currency,
  onOpenCustomerTracking,
}) => {
  const { t, adminLang, isRtl } = useAdminLanguage();
  const isArabic = adminLang === 'ar';

  // Ensure there are visible orders (merge demo orders if orders state is empty)
  const displayOrders = orders.length > 0 ? orders : DEMO_ORDERS;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Edit draft state for selected order
  const [editStatus, setEditStatus] = useState<Order['status']>('En Préparation / Atelier');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editCarrierName, setEditCarrierName] = useState('');
  const [editEstimatedDelivery, setEditEstimatedDelivery] = useState('');
  const [editTrackingNotes, setEditTrackingNotes] = useState('');
  const [savedSuccessOrderId, setSavedSuccessOrderId] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = displayOrders.filter((o) => {
    // Status filter
    if (statusFilter !== 'all' && o.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = (o.orderNumber || '').toLowerCase().includes(q);
      const matchTrack = (o.trackingNumber || '').toLowerCase().includes(q);
      const matchName = (o.customer?.fullName || '').toLowerCase().includes(q);
      const matchPhone = (o.customer?.phone || '').includes(q);
      const matchWilaya = (o.customer?.wilayaName || '').toLowerCase().includes(q) || (o.customer?.wilayaCode || '').includes(q);
      const matchCarrier = (o.carrierName || '').toLowerCase().includes(q);
      return matchNum || matchTrack || matchName || matchPhone || matchWilaya || matchCarrier;
    }
    return true;
  });

  // KPI counts
  const totalCount = displayOrders.length;
  const pendingCount = displayOrders.filter(
    (o) => o.status === 'Reçu / Confirmed' || o.status === 'En Préparation / Atelier'
  ).length;
  const shippedCount = displayOrders.filter((o) => o.status === 'Expédié / En Livraison').length;
  const deliveredCount = displayOrders.filter((o) => o.status === 'Livré / Completed').length;
  const totalRevenueDzd = displayOrders.reduce((acc, o) => acc + (o.total || 0), 0);

  const handleStartAdjust = (order: Order) => {
    if (selectedOrderId === order.id) {
      setSelectedOrderId(null);
      return;
    }
    setSelectedOrderId(order.id);
    setEditStatus(order.status);
    setEditTrackingNumber(order.trackingNumber || '');
    setEditCarrierName(
      order.carrierName ||
        storeSettings.deliveryCompanies?.find((c) => c.id === storeSettings.activeDeliveryCompany)?.name ||
        'Yalidine Express'
    );
    setEditEstimatedDelivery(order.estimatedDelivery || (isArabic ? '24 إلى 48 ساعة' : '24h à 48h'));
    setEditTrackingNotes(order.trackingNotes || '');
  };

  const handleGenerateTrackingCode = () => {
    const carrier = storeSettings.deliveryCompanies?.find(
      (c) => c.name.toLowerCase() === editCarrierName.toLowerCase() || c.id === editCarrierName
    );
    const prefix = carrier?.trackingPrefix || 'DBC-EXP-';
    const randDigits = Math.floor(100000 + Math.random() * 900000);
    const dateYear = new Date().getFullYear();
    setEditTrackingNumber(`${prefix}${dateYear}-${randDigits}`);
  };

  const handleSaveOrderAdjustment = (order: Order) => {
    const updated: Order = {
      ...order,
      status: editStatus,
      trackingNumber: editTrackingNumber.trim() || order.trackingNumber,
      carrierName: editCarrierName.trim(),
      estimatedDelivery: editEstimatedDelivery.trim(),
      trackingNotes: editTrackingNotes.trim(),
      dispatchedAt: editStatus === 'Expédié / En Livraison' ? new Date().toISOString() : order.dispatchedAt,
    };

    onUpdateOrder(updated);

    if (onUpdateOrders) {
      const updatedList = orders.map((o) => (o.id === order.id ? updated : o));
      if (!orders.some((o) => o.id === order.id)) {
        updatedList.unshift(updated);
      }
      onUpdateOrders(updatedList);
    }

    setSavedSuccessOrderId(order.id);
    setTimeout(() => {
      setSavedSuccessOrderId(null);
    }, 3000);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Reçu / Confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'En Préparation / Atelier':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Expédié / En Livraison':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Livré / Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const getLocalizedStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'Reçu / Confirmed':
        return t.orderFilterPending;
      case 'En Préparation / Atelier':
        return isArabic ? 'قيد التجهيز' : 'En Préparation';
      case 'Expédié / En Livraison':
        return t.orderFilterShipped;
      case 'Livré / Completed':
        return t.orderFilterDelivered;
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Summary & KPIs */}
      <div className="bg-white border border-[#DDD4C5] rounded p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-serif text-lg font-medium text-[#1F1D1A]">
                {t.orderManagerTitle}
              </h3>
            </div>
            <p className="text-xs text-[#736B5E] mt-0.5 font-sans">
              {t.orderManagerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <span className="text-xs font-mono px-3 py-1 bg-[#F5F2EB] text-[#5C5446] border border-[#DDD4C5] rounded">
              {displayOrders.length} {isArabic ? 'طلبيات مسجلة' : 'commandes'}
            </span>
          </div>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D6] rounded">
            <div className="flex items-center justify-between text-[#8C6D3B] text-xs font-mono mb-1">
              <span>{t.orderKpiTotalOrders}</span>
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-mono font-semibold text-[#1F1D1A]">{totalCount}</div>
            <div className="text-[10px] text-[#8C8275] font-mono mt-0.5">
              {formatPrice(totalRevenueDzd, currency)}
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded">
            <div className="flex items-center justify-between text-amber-800 text-xs font-mono mb-1">
              <span>{t.orderKpiPending}</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-mono font-semibold text-amber-900">{pendingCount}</div>
            <div className="text-[10px] text-amber-700 font-mono mt-0.5">
              {isArabic ? 'بالورشة / قيد التجهيز' : 'En cours à l’atelier'}
            </div>
          </div>

          <div className="p-3 bg-sky-50/60 border border-sky-200/80 rounded">
            <div className="flex items-center justify-between text-sky-800 text-xs font-mono mb-1">
              <span>{t.orderKpiShipped}</span>
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-mono font-semibold text-sky-900">{shippedCount}</div>
            <div className="text-[10px] text-sky-700 font-mono mt-0.5">
              {isArabic ? 'مع شركة التوصيل' : 'Pris en charge transporteur'}
            </div>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-mono mb-1">
              <span>{t.orderKpiDelivered}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-mono font-semibold text-emerald-900">{deliveredCount}</div>
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
              {isArabic ? 'مكتملة بنجاح' : 'Livrées avec succès'}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className={`w-4 h-4 text-[#8C8275] absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.orderSearchPlaceholder}
            className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-white border border-[#DDD4C5] rounded text-xs font-sans text-[#1F1D1A] placeholder-[#9E9589] focus:outline-none focus:border-[#C9A96E]`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-xs text-[#8C8275] hover:text-[#1F1D1A]`}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-[11px] font-mono">
          {[
            { key: 'all', label: t.orderFilterAllStatuses },
            { key: 'Reçu / Confirmed', label: t.orderFilterPending },
            { key: 'En Préparation / Atelier', label: isArabic ? 'بالورشة' : 'Atelier' },
            { key: 'Expédié / En Livraison', label: t.orderFilterShipped },
            { key: 'Livré / Completed', label: t.orderFilterDelivered },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-2.5 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-[#1F1D1A] text-white font-medium shadow-xs'
                  : 'bg-white text-[#5C5446] border border-[#DDD4C5] hover:bg-[#F2EDE4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#DDD4C5] rounded text-[#8C8275]">
            <Package className="w-8 h-8 mx-auto text-[#B3AAA0] mb-2" />
            <p className="text-sm font-serif text-[#4A4338]">
              {t.orderNoOrdersFound}
            </p>
            <p className="text-xs text-[#8C8275] mt-1">
              {t.orderNoOrdersDesc}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            const wilaya = getWilayaByCode(order.customer.wilayaCode) || ALGERIAN_WILAYAS[15];
            const externalTrackingUrl = generateCarrierExternalTrackingUrl(
              isSelected ? { ...order, carrierName: editCarrierName, trackingNumber: editTrackingNumber } : order,
              storeSettings.deliveryCompanies
            );

            return (
              <div
                key={order.id}
                className={`bg-white border transition-all rounded overflow-hidden shadow-xs ${
                  isSelected ? 'border-[#C9A96E] ring-1 ring-[#C9A96E]/50' : 'border-[#DDD4C5] hover:border-[#B3AAA0]'
                }`}
              >
                {/* Order Summary Bar */}
                <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#1F1D1A] tracking-wider">
                        {order.orderNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-mono border rounded-full ${getStatusBadge(order.status)}`}>
                        {getLocalizedStatusLabel(order.status)}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-[#FAF8F5] text-[#736B5E] border border-[#DDD4C5] rounded">
                        {order.deliveryType === 'home' ? '🏠 À Domicile' : '🏢 StopDesk'}
                      </span>
                      <span className="text-xs text-[#8C8275] font-mono">
                        {order.date}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#5C5446]">
                      <div className="flex items-center gap-1 font-medium text-[#1F1D1A]">
                        <User className="w-3.5 h-3.5 text-[#8C6D3B]" />
                        <span>{order.customer.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#736B5E]">
                        <Phone className="w-3.5 h-3.5 text-[#8C6D3B]" />
                        <span dir="ltr">{order.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#736B5E]">
                        <MapPin className="w-3.5 h-3.5 text-[#8C6D3B]" />
                        <span>{wilaya.code} - {wilaya.nameEn} ({order.customer.city})</span>
                      </div>
                    </div>

                    {/* Items snippet */}
                    <div className="text-[11px] text-[#8C8275] font-mono flex flex-wrap items-center gap-2">
                      <span className="text-[#1F1D1A] font-semibold">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} {isArabic ? 'قطع:' : 'articles :'}
                      </span>
                      {order.items.map((it, idx) => (
                        <span key={idx} className="bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#EAE3D6]">
                          {it.product?.name || 'Vêtement DBC'} ({it.size}) ×{it.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Financial Total & Controls */}
                  <div className="flex flex-col sm:flex-row items-end md:items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#F2EDE4]">
                    <div className={`${isRtl ? 'text-right' : 'text-left md:text-right'}`}>
                      <div className="text-xs text-[#8C8275] font-mono">{t.orderTableTotal}</div>
                      <div className="text-base font-mono font-bold text-[#1F1D1A]">
                        {formatPrice(order.total, currency)}
                      </div>
                      <div className="text-[10px] text-amber-700 font-mono">
                        {order.paymentMethod === 'baridimob' ? '💳 BaridiMob' : '💵 Cash on Delivery'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartAdjust(order)}
                      className={`px-3.5 py-2 text-xs font-mono font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F1D1A] text-white'
                          : 'bg-[#F5F2EB] hover:bg-[#EAE3D6] text-[#4A4338] border border-[#DDD4C5]'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>{isSelected ? (isArabic ? 'إخفاء' : 'Masquer') : t.orderSaveTrackingBtn}</span>
                      {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Tracking Code Badge Preview */}
                <div className="px-4 py-2 bg-[#FAF8F5] border-t border-[#EAE3D6] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#5C5446]">
                    <span className="text-[#8C8275]">{t.orderCarrierLabel} :</span>
                    <span className="font-semibold text-[#1F1D1A]">
                      {order.carrierName || storeSettings.activeDeliveryCompany || 'Yalidine Express'}
                    </span>
                    <span className="text-[#DDD4C5]">|</span>
                    <span className="text-[#8C8275]">{t.orderTrackingNumberLabel} :</span>
                    <span className="px-2 py-0.5 bg-white border border-[#DDD4C5] rounded font-bold text-[#8C6D3B]">
                      {order.trackingNumber}
                    </span>
                    {order.estimatedDelivery && (
                      <>
                        <span className="text-[#DDD4C5]">|</span>
                        <span className="text-[#8C8275]">{t.orderEstDeliveryLabel} :</span>
                        <span>{order.estimatedDelivery}</span>
                      </>
                    )}
                  </div>

                  {onOpenCustomerTracking && (
                    <button
                      onClick={() => onOpenCustomerTracking(order.orderNumber)}
                      className="text-[11px] text-[#8C6D3B] hover:text-[#1F1D1A] underline flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{t.orderTrackingLinkCustomer}</span>
                    </button>
                  )}
                </div>

                {/* Expanded Tracking Adjuster Panel */}
                {isSelected && (
                  <div className="p-5 bg-[#F9F7F4] border-t border-[#C9A96E]/50 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm font-medium text-[#1F1D1A] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                        <span>{t.orderDetailTitle} : {order.orderNumber}</span>
                      </h4>

                      {savedSuccessOrderId === order.id && (
                        <div className="flex items-center gap-1 text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-300">
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.orderSavedTrackingSuccess}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 1. Status Selector */}
                      <div>
                        <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                          {t.orderTableStatus}
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as Order['status'])}
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded text-xs font-sans text-[#1F1D1A] focus:outline-none focus:border-[#C9A96E]"
                        >
                          <option value="Reçu / Confirmed">🟡 {t.orderFilterPending}</option>
                          <option value="En Préparation / Atelier">🔵 {isArabic ? 'قيد التجهيز / بالورشة' : 'En Préparation / Atelier'}</option>
                          <option value="Expédié / En Livraison">🟣 {t.orderFilterShipped}</option>
                          <option value="Livré / Completed">🟢 {t.orderFilterDelivered}</option>
                        </select>
                      </div>

                      {/* 2. Carrier Company Selector */}
                      <div>
                        <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                          {t.orderCarrierLabel}
                        </label>
                        <div className="space-y-1">
                          <select
                            value={editCarrierName}
                            onChange={(e) => setEditCarrierName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded text-xs font-sans text-[#1F1D1A] focus:outline-none focus:border-[#C9A96E]"
                          >
                            {(storeSettings.deliveryCompanies || []).map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name} {c.isActive ? '★' : ''}
                              </option>
                            ))}
                            <option value="Autre Transporteur">Autre Transporteur</option>
                          </select>
                        </div>
                      </div>

                      {/* 3. Tracking Number & Generator */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-mono text-[#5C5446] font-medium">
                            {t.orderTrackingNumberLabel}
                          </label>
                          <button
                            type="button"
                            onClick={handleGenerateTrackingCode}
                            className="text-[10px] text-[#8C6D3B] hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{isArabic ? 'توليد تلقائي' : 'Générer code'}</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={editTrackingNumber}
                          onChange={(e) => setEditTrackingNumber(e.target.value)}
                          placeholder="DZ-YAL-2026-..."
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A] focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>

                      {/* 4. Estimated Delivery Date */}
                      <div>
                        <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                          {t.orderEstDeliveryLabel}
                        </label>
                        <input
                          type="text"
                          value={editEstimatedDelivery}
                          onChange={(e) => setEditEstimatedDelivery(e.target.value)}
                          placeholder="24h - 48h"
                          className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded text-xs font-sans text-[#1F1D1A] focus:outline-none focus:border-[#C9A96E]"
                        />
                      </div>
                    </div>

                    {/* Delivery Notes / Tracking instructions */}
                    <div>
                      <label className="block text-xs font-mono text-[#5C5446] mb-1 font-medium">
                        {t.orderNotesLabel}
                      </label>
                      <input
                        type="text"
                        value={editTrackingNotes}
                        onChange={(e) => setEditTrackingNotes(e.target.value)}
                        placeholder="Ex: Hub Alger Centre..."
                        className="w-full px-3 py-2 bg-white border border-[#DDD4C5] rounded text-xs font-sans text-[#1F1D1A] focus:outline-none focus:border-[#C9A96E]"
                      />
                    </div>

                    {/* Action Bar inside Expanded Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE3D6]">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1-Click WhatsApp customer update */}
                        <a
                          href={generateAdminWhatsAppCustomerDispatch(
                            {
                              ...order,
                              status: editStatus,
                              carrierName: editCarrierName,
                              trackingNumber: editTrackingNumber,
                              estimatedDelivery: editEstimatedDelivery,
                              trackingNotes: editTrackingNotes,
                            },
                            storeSettings,
                            isArabic
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20BE5A] text-white text-xs font-mono font-medium rounded flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>{t.orderWhatsAppDispatchBtn}</span>
                        </a>

                        {/* Test external carrier link if available */}
                        {externalTrackingUrl && (
                          <a
                            href={externalTrackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-white hover:bg-[#F2EDE4] text-[#4A4338] border border-[#DDD4C5] text-xs font-mono rounded flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#8C6D3B]" />
                            <span>{isArabic ? `فتح تتبع ${editCarrierName}` : `Vérifier sur ${editCarrierName}`}</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(null)}
                          className="px-3 py-2 bg-white hover:bg-[#F2EDE4] text-[#736B5E] border border-[#DDD4C5] text-xs font-mono rounded cursor-pointer"
                        >
                          {t.prodFormCancelBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveOrderAdjustment(order)}
                          className="px-4 py-2 bg-[#1F1D1A] hover:bg-[#332E27] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                        >
                          <Save className="w-3.5 h-3.5 text-[#C9A96E]" />
                          <span>{t.orderSaveTrackingBtn}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
