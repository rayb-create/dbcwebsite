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
  Check,
  Trash2,
  AlertTriangle
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
import { useAuth } from '../../context/AuthContext';

interface OrderManagerTabProps {
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
  onUpdateOrders?: (allOrders: Order[]) => void;
  onDeleteOrder?: (orderId: string) => Promise<void> | void;
  storeSettings: StoreSettings;
  currentLanguage?: Language;
  currency: Currency;
  onOpenCustomerTracking?: (orderNumber: string) => void;
}

export const OrderManagerTab: React.FC<OrderManagerTabProps> = ({
  orders,
  onUpdateOrder,
  onUpdateOrders,
  onDeleteOrder,
  storeSettings,
  currency,
  onOpenCustomerTracking,
}) => {
  const { t, adminLang, isRtl } = useAdminLanguage();
  const isArabic = adminLang === 'ar';
  const { isAdmin: authIsAdmin, currentUser, loading: authLoading } = useAuth();
  // Verified admin check: ONLY verified logged-in administrators can delete orders
  const isVerifiedAdmin = Boolean(!authLoading && currentUser && authIsAdmin === true);

  // Ensure there are visible orders (merge demo orders if orders state is empty)
  const displayOrders = orders.length > 0 ? orders : DEMO_ORDERS;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Deletion modal & notification state (Admin Only)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState<string | null>(null);

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
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    const newTracking = `${prefix}${randomDigits}`;
    setEditTrackingNumber(newTracking);
  };

  const handleSaveOrderAdjustment = (order: Order) => {
    const updated: Order = {
      ...order,
      status: editStatus,
      trackingNumber: editTrackingNumber,
      carrierName: editCarrierName,
      estimatedDelivery: editEstimatedDelivery,
      trackingNotes: editTrackingNotes,
    };

    onUpdateOrder(updated);
    setSavedSuccessOrderId(order.id);
    setTimeout(() => setSavedSuccessOrderId(null), 3000);
  };

  const handleOpenWhatsAppCustomer = (order: Order) => {
    const activeCarrier = editCarrierName || order.carrierName || 'Yalidine Express';
    const activeTracking = editTrackingNumber || order.trackingNumber || '';
    const activeStatus = editStatus || order.status;
    const activeEst = editEstimatedDelivery || order.estimatedDelivery || '24h à 48h';

    const text = generateAdminWhatsAppCustomerDispatch(
      {
        ...order,
        carrierName: activeCarrier,
        trackingNumber: activeTracking,
        status: activeStatus,
        estimatedDelivery: activeEst,
      },
      storeSettings.storeName,
      isArabic ? 'ar' : 'fr'
    );

    let cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.substring(1);
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete || !onDeleteOrder) return;
    setIsDeletingOrder(true);
    const deletedNum = orderToDelete.orderNumber || orderToDelete.id;
    try {
      await onDeleteOrder(orderToDelete.id);
      setDeleteNotification(`Order ${deletedNum} deleted successfully.`);
      setOrderToDelete(null);
      if (selectedOrderId === orderToDelete.id) {
        setSelectedOrderId(null);
      }
      setTimeout(() => {
        setDeleteNotification(null);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to delete order:', err);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Tab Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DAD0] pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#1F1C19] flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#8C6D3B]" />
            <span>{t.orderManagerTitle}</span>
          </h2>
          <p className="text-xs font-mono text-[#7C756B] mt-0.5">
            {t.orderManagerSubtitle}
          </p>
        </div>

        {/* Global Live Tracking Stats Counter */}
        <div className="flex items-center gap-2 text-xs font-mono bg-[#FAF8F5] p-2 rounded-lg border border-[#E2DAD0]">
          <span className="text-[#7C756B]">{t.kpiTotalOrders}:</span>
          <span className="font-bold text-[#1F1C19]">{totalCount}</span>
          <span className="text-[#DDD4C5]">|</span>
          <span className="text-amber-800 font-bold">{pendingCount} {t.orderFilterPending}</span>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DAD0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#7C756B] uppercase font-bold">{t.orderFilterPending}</div>
            <div className="text-lg font-bold text-amber-900">{pendingCount}</div>
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DAD0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#7C756B] uppercase font-bold">{t.orderFilterShipped}</div>
            <div className="text-lg font-bold text-blue-900">{shippedCount}</div>
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DAD0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#7C756B] uppercase font-bold">{t.orderFilterDelivered}</div>
            <div className="text-lg font-bold text-emerald-900">{deliveredCount}</div>
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E2DAD0] flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-stone-200 flex items-center justify-center text-stone-800 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-[#7C756B] uppercase font-bold">{t.kpiTotalRevenue}</div>
            <div className="text-xs font-bold text-[#1F1C19] truncate">{formatPrice(totalRevenueDzd, currency, isArabic)}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 text-[#7C756B] absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.orderSearchPlaceholder}
            className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 bg-white border border-[#DDD4C5] rounded-lg text-xs font-mono focus:outline-none focus:border-black`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#1F1D1A] text-white border-[#1F1D1A]'
                : 'bg-white text-[#5C5446] border-[#DDD4C5] hover:bg-[#F2EDE4]'
            }`}
          >
            {t.orderFilterAll} ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Reçu / Confirmed')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'Reçu / Confirmed'
                ? 'bg-amber-800 text-white border-amber-800'
                : 'bg-white text-[#5C5446] border-[#DDD4C5] hover:bg-amber-50'
            }`}
          >
            {t.orderStatusReceived}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('En Préparation / Atelier')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'En Préparation / Atelier'
                ? 'bg-[#8C6D3B] text-white border-[#8C6D3B]'
                : 'bg-white text-[#5C5446] border-[#DDD4C5] hover:bg-amber-50'
            }`}
          >
            {t.orderStatusPrep}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Expédié / En Livraison')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'Expédié / En Livraison'
                ? 'bg-blue-800 text-white border-blue-800'
                : 'bg-white text-[#5C5446] border-[#DDD4C5] hover:bg-blue-50'
            }`}
          >
            {t.orderStatusShipped}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Livré / Completed')}
            className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              statusFilter === 'Livré / Completed'
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-white text-[#5C5446] border-[#DDD4C5] hover:bg-emerald-50'
            }`}
          >
            {t.orderStatusDelivered}
          </button>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#DDD4C5]">
            <Package className="w-10 h-10 text-[#7C756B] mx-auto mb-2 opacity-50" />
            <h3 className="font-serif text-sm font-semibold text-[#1F1C19]">{t.noOrdersFound}</h3>
            <p className="text-xs font-mono text-[#7C756B] mt-1">{t.noOrdersFoundDesc}</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            const wilaya = getWilayaByCode(order.customer.wilayaCode, storeSettings.customWilayaRates);
            const externalTrackingUrl = generateCarrierExternalTrackingUrl(
              order.carrierName || 'Yalidine Express',
              order.trackingNumber || ''
            );

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  isSelected ? 'border-[#8C6D3B] ring-1 ring-[#8C6D3B]/40 shadow-md' : 'border-[#E2DAD0] hover:border-[#C4B7A5]'
                }`}
              >
                {/* Summary Row */}
                <div className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Order Info & Status Badge */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#DDD4C5] flex items-center justify-center shrink-0 text-[#1F1C19]">
                      <Package className="w-5 h-5 text-[#8C6D3B]" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#1F1C19]">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            order.status === 'Livré / Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Expédié / En Livraison'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'En Préparation / Atelier'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-[11px] font-mono text-[#7C756B]">
                          {order.date}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5C5446]">
                        <span className="flex items-center gap-1 font-semibold text-[#1F1C19]">
                          <User className="w-3.5 h-3.5 text-[#8C6D3B]" />
                          <span>{order.customer.fullName}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-[#7C756B]" />
                          <span>{order.customer.phone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#7C756B]" />
                          <span>
                            {order.customer.wilayaCode} - {isArabic ? wilaya?.nameAr || order.customer.wilayaName : order.customer.wilayaName} ({order.customer.city})
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Amount, Tracking tag & Action buttons */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F2EDE4]">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-[#1F1C19]">
                        {formatPrice(order.total, currency, isArabic)}
                      </div>
                      <div className="text-[10px] font-mono text-[#7C756B]">
                        {order.items.reduce((acc, i) => acc + (i.quantity || 1), 0)} articles • {order.deliveryType === 'home' ? t.deliveryHome : t.deliveryDesk}
                      </div>
                    </div>

                    {order.trackingNumber ? (
                      <span className="px-2 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded text-[11px] font-mono flex items-center gap-1">
                        <Truck className="w-3 h-3 text-amber-700" />
                        <span>{order.trackingNumber}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-[10px] font-mono">
                        {t.orderNoTrackingYet}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartAdjust(order)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F1D1A] text-white border-[#1F1D1A]'
                            : 'bg-white text-[#5C5446] border-[#DDD4C5] hover:bg-[#F2EDE4]'
                        }`}
                      >
                        <span>{isSelected ? t.orderClosePanel : t.orderManageTrackingBtn}</span>
                        {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Admin-Only Delete Order Button */}
                      {isVerifiedAdmin && onDeleteOrder && (
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-900 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Management & Tracking Drawer */}
                {isSelected && (
                  <div className="bg-[#FAF8F5] p-5 border-t border-[#E2DAD0] space-y-5 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Ordered Items Table (5 cols) */}
                      <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-[#E2DAD0] space-y-3">
                        <h4 className="font-serif text-xs font-bold text-[#1F1C19] uppercase tracking-wider pb-2 border-b border-[#F2EDE4] flex items-center justify-between">
                          <span>{t.orderedItems} ({order.items.length})</span>
                          <span className="font-mono text-[10px] text-[#7C756B]">Réf: {order.orderNumber}</span>
                        </h4>

                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2.5 items-center text-xs pb-2 border-b border-[#FAF8F5]">
                              <img
                                src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                                alt={item.product?.name}
                                className="w-10 h-12 object-cover rounded border border-[#DDD4C5] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-[#1F1C19] truncate">{item.product?.name || 'Vêtement DBC'}</div>
                                <div className="text-[10px] font-mono text-[#7C756B]">
                                  Taille: <strong className="text-[#1F1C19]">{item.size}</strong> • Qté: {item.quantity}
                                </div>
                              </div>
                              <div className="font-mono text-xs font-bold text-[#1F1C19] shrink-0">
                                {formatPrice((item.pricePerUnit || item.product?.price || 0) * (item.quantity || 1), currency, isArabic)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Notes / Monogram if present */}
                        {order.notes && (
                          <div className="p-2.5 bg-amber-50/80 rounded border border-amber-200/80 text-[11px] font-sans text-amber-900">
                            <strong>Note Client:</strong> {order.notes}
                          </div>
                        )}

                        {/* Customer Delivery Details Card */}
                        <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E2DAD0] text-xs font-mono space-y-1">
                          <div className="text-[10px] text-[#7C756B] uppercase font-bold">{t.customerDetails}</div>
                          <div className="text-[#1F1C19]"><strong>{order.customer.fullName}</strong></div>
                          <div className="text-[#5C5446]">{order.customer.phone}</div>
                          <div className="text-[#5C5446] text-[11px] leading-relaxed">
                            {order.customer.address}, {order.customer.city}, {order.customer.wilayaCode} - {order.customer.wilayaName}
                          </div>
                          <div className="text-[10px] text-[#8C6D3B] pt-1">
                            Paiement: {order.paymentMethod === 'baridimob' ? 'BaridiMob (Virement)' : 'À la livraison (Cash)'}
                          </div>
                        </div>
                      </div>

                      {/* Right: Live Tracking & Carrier Dispatch Controls (7 cols) */}
                      <div className="lg:col-span-7 bg-white p-4 rounded-lg border border-[#E2DAD0] space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#F2EDE4]">
                          <h4 className="font-serif text-xs font-bold text-[#1F1C19] uppercase tracking-wider flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-[#8C6D3B]" />
                            <span>{t.orderCarrierDispatchTitle}</span>
                          </h4>
                          <span className="text-[10px] font-mono text-[#8C6D3B]">
                            Algérie 58 Wilayas
                          </span>
                        </div>

                        {/* Status Select */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#7C756B] font-bold mb-1">
                            {t.orderStatusLabel}
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as Order['status'])}
                            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono focus:outline-none focus:border-black cursor-pointer font-bold"
                          >
                            <option value="Reçu / Confirmed">{t.orderStatusReceived}</option>
                            <option value="En Préparation / Atelier">{t.orderStatusPrep}</option>
                            <option value="Expédié / En Livraison">{t.orderStatusShipped}</option>
                            <option value="Livré / Completed">{t.orderStatusDelivered}</option>
                            <option value="Annulé / Cancelled">{t.orderStatusCancelled}</option>
                          </select>
                        </div>

                        {/* Carrier Name & Quick Auto Generator */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-[#7C756B] font-bold mb-1">
                              {t.orderCarrierLabel}
                            </label>
                            <select
                              value={editCarrierName}
                              onChange={(e) => setEditCarrierName(e.target.value)}
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono focus:outline-none focus:border-black cursor-pointer"
                            >
                              <option value="Yalidine Express">Yalidine Express</option>
                              <option value="ZR Express">ZR Express</option>
                              <option value="Kazitour">Kazitour</option>
                              <option value="Maystro Delivery">Maystro Delivery</option>
                              <option value="DBC Express Atelier">DBC Express Atelier (Propre flotte)</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[10px] font-mono uppercase text-[#7C756B] font-bold">
                                {t.orderTrackingNumberLabel}
                              </label>
                              <button
                                type="button"
                                onClick={handleGenerateTrackingCode}
                                className="text-[10px] font-mono text-[#8C6D3B] hover:text-[#72572D] flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{t.orderGenTrackingBtn}</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              value={editTrackingNumber}
                              onChange={(e) => setEditTrackingNumber(e.target.value)}
                              placeholder="Ex: YAL-DZ-8942105"
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono focus:outline-none focus:border-black font-bold"
                            />
                          </div>
                        </div>

                        {/* Estimated Delivery Time */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#7C756B] font-bold mb-1">
                            {t.orderEstDeliveryLabel}
                          </label>
                          <input
                            type="text"
                            value={editEstimatedDelivery}
                            onChange={(e) => setEditEstimatedDelivery(e.target.value)}
                            placeholder="Ex: 24h à 48h (Livraison express)"
                            className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono focus:outline-none focus:border-black"
                          />
                        </div>

                        {/* Internal notes / dispatch info */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#7C756B] font-bold mb-1">
                            {t.orderTrackingNotesLabel}
                          </label>
                          <textarea
                            value={editTrackingNotes}
                            onChange={(e) => setEditTrackingNotes(e.target.value)}
                            rows={2}
                            placeholder={t.orderTrackingNotesPlaceholder}
                            className="w-full px-3 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono focus:outline-none focus:border-black resize-none"
                          />
                        </div>

                        {/* External Carrier Link & Customer Tracker Link */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                          {externalTrackingUrl && (
                            <a
                              href={externalTrackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#1F1C19] rounded flex items-center gap-1.5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#8C6D3B]" />
                              <span>{t.orderViewOnCarrierSite}</span>
                            </a>
                          )}

                          {onOpenCustomerTracking && (
                            <button
                              type="button"
                              onClick={() => onOpenCustomerTracking(order.orderNumber)}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5 text-amber-700" />
                              <span>{t.orderCustomerTrackerModal}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar: WhatsApp Notify Customer & Save Changes */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#E2DAD0]">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp Customer Dispatch Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsAppCustomer(order)}
                          className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-mono font-semibold rounded flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{t.orderSendWhatsAppUpdate}</span>
                        </button>

                        <span className="text-[11px] font-mono text-[#7C756B] hidden md:inline">
                          Envoi automatique du numéro de suivi et du statut
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {savedSuccessOrderId === order.id && (
                          <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                            <Check className="w-4 h-4" />
                            <span>{t.orderSaveSuccess}</span>
                          </span>
                        )}

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

      {/* Admin-Only Delete Order Confirmation Dialog */}
      {orderToDelete && isVerifiedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-[#DDD4C5] shadow-2xl max-w-md w-full p-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1F1C19]">
                  Delete this order?
                </h3>
                <p className="text-xs font-mono text-[#7C756B]">
                  {orderToDelete.orderNumber} • {orderToDelete.customer?.fullName}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#5C5446]">
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EAE3D6]">
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 bg-white hover:bg-[#F2EDE4] text-[#5C5446] border border-[#DDD4C5] rounded text-xs font-mono cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isDeletingOrder ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Notification Toast after Deletion */}
      {deleteNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-5 py-3 rounded-lg shadow-2xl border border-emerald-500/60 text-xs font-mono flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{deleteNotification}</span>
        </div>
      )}
    </div>
  );
};
