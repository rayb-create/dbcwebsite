import React from 'react';
import { 
  Package, 
  Truck, 
  DollarSign, 
  AlertTriangle, 
  ShoppingBag, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  Boxes, 
  Layers, 
  Sparkles
} from 'lucide-react';
import { Product, Order, StoreSettings, Currency } from '../../types';
import { formatPrice } from '../../utils/format';
import { useAdminLanguage } from '../../context/AdminLanguageContext';

interface AdminDashboardOverviewProps {
  products: Product[];
  orders: Order[];
  storeSettings: StoreSettings;
  currency: Currency;
  onNavigateTab: (tab: string) => void;
  onAddNewProduct: () => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  products,
  orders,
  currency,
  onNavigateTab,
  onAddNewProduct,
}) => {
  const { t, isRtl } = useAdminLanguage();

  // Stats
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const pendingOrders = orders.filter((o) => o.status.includes('Reçu') || o.status.includes('Préparation')).length;
  const shippedOrders = orders.filter((o) => o.status.includes('Expédié')).length;
  const outOfStockProducts = products.filter((p) => p.inStock === false || (p.stock ?? 50) === 0).length;
  const lowStockProducts = products.filter((p) => (p.inStock ?? true) && (p.stock ?? 50) > 0 && (p.stock ?? 50) <= 5).length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions */}
      <div className="bg-white border border-[#E2DAD0] rounded-xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono text-[#8C6D3B] uppercase tracking-wider font-bold">
            {t.dashExecutiveTitle}
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#1F1C19] mt-0.5">
            {t.dashMainTitle}
          </h2>
          <p className="text-xs text-[#7C756B] font-mono mt-1">
            {t.dashSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddNewProduct}
            className="px-4 py-2 bg-[#8C6D3B] hover:bg-[#72572D] text-white rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.dashAddProductBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 bg-[#1F1D1A] hover:bg-[#3D3730] text-white rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{t.dashProcessOrdersBtn}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white p-5 rounded-xl border border-[#E2DAD0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#7C756B] uppercase">{t.dashRevenueTitle}</span>
            <div className="p-2 bg-[#FAF8F5] rounded-lg text-[#8C6D3B]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#1F1C19] mt-2">
            {formatPrice(totalRevenue, currency)}
          </div>
          <span className="text-[11px] font-mono text-emerald-700 mt-1 block">
            {t.dashRevenueSubtitle(orders.length)}
          </span>
        </div>

        {/* Orders Pending */}
        <div className="bg-white p-5 rounded-xl border border-[#E2DAD0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#7C756B] uppercase">{t.dashPendingOrdersTitle}</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#1F1C19] mt-2">
            {pendingOrders}
          </div>
          <span className="text-[11px] font-mono text-[#8C6D3B] mt-1 block">
            {t.dashPendingOrdersSubtitle(shippedOrders)}
          </span>
        </div>

        {/* Products in Catalog */}
        <div className="bg-white p-5 rounded-xl border border-[#E2DAD0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#7C756B] uppercase">{t.dashCatalogItemsTitle}</span>
            <div className="p-2 bg-[#FAF8F5] rounded-lg text-[#8C6D3B]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-[#1F1C19] mt-2">
            {products.length}
          </div>
          <span className="text-[11px] font-mono text-[#7C756B] mt-1 block">
            {t.dashCatalogItemsSubtitle(products.filter((p) => p.isPublished !== false).length)}
          </span>
        </div>

        {/* Out of stock warnings */}
        <div className="bg-white p-5 rounded-xl border border-[#E2DAD0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#7C756B] uppercase">{t.dashStockAlertsTitle}</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`font-mono text-2xl font-bold mt-2 ${outOfStockProducts > 0 ? 'text-rose-600' : 'text-[#1F1C19]'}`}>
            {outOfStockProducts}
          </div>
          <span className="text-[11px] font-mono text-amber-700 mt-1 block">
            {t.dashStockAlertsSubtitle(lowStockProducts)}
          </span>
        </div>
      </div>

      {/* Grid: Recent Orders & Quick Management Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E2DAD0] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#8C6D3B]" />
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {t.dashRecentOrdersTitle}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-mono text-[#8C6D3B] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>{t.dashViewAllOrders}</span>
              <ArrowUpRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-[-90deg]' : ''}`} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-[#7C756B]">
              {t.dashNoOrdersYet}
            </div>
          ) : (
            <div className="divide-y divide-[#F0EBE1]">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-4 text-xs font-mono">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1F1C19]">{ord.orderNumber}</span>
                      <span className="text-[#7C756B]">• {ord.customer.fullName}</span>
                      <span className="px-1.5 py-0.5 bg-[#FAF8F5] rounded text-[10px] text-[#8C6D3B] border border-[#DDD4C5]">
                        {ord.customer.wilayaName} ({ord.customer.wilayaCode})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7C756B] mt-0.5">
                      {t.dashOrderItemsCount(ord.items.length)} • {ord.deliveryType === 'home' ? t.dashHomeDelivery : t.dashDeskDelivery} • {ord.paymentMethod === 'cod' ? t.dashCodPayment : t.dashBaridiMobPayment}
                    </div>
                  </div>

                  <div className={isRtl ? 'text-left shrink-0' : 'text-right shrink-0'}>
                    <div className="font-bold text-[#1F1C19]">
                      {formatPrice(ord.total, currency)}
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                      {ord.status.split('/')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E2DAD0] rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-serif text-base font-bold text-[#1F1C19]">
              {t.dashShortcutsTitle}
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => onNavigateTab('products')}
                className="w-full p-3 bg-[#FAF8F5] hover:bg-[#F2EDE4] rounded-lg border border-[#EAE3D5] text-left flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{t.dashShortcutProducts}</span>
                </div>
                <span className="text-[#7C756B] font-bold">{products.length}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('inventory')}
                className="w-full p-3 bg-[#FAF8F5] hover:bg-[#F2EDE4] rounded-lg border border-[#EAE3D5] text-left flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{t.dashShortcutInventory}</span>
                </div>
                <span className="text-amber-700 font-bold">{outOfStockProducts}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('media')}
                className="w-full p-3 bg-[#FAF8F5] hover:bg-[#F2EDE4] rounded-lg border border-[#EAE3D5] text-left flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{t.dashShortcutMedia}</span>
                </div>
                <span className="text-[#8C6D3B] font-bold">Cloud</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('delivery')}
                className="w-full p-3 bg-[#FAF8F5] hover:bg-[#F2EDE4] rounded-lg border border-[#EAE3D5] text-left flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{t.dashShortcutDelivery}</span>
                </div>
                <span className="text-[#8C6D3B] font-bold">Yalidine</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('content')}
                className="w-full p-3 bg-[#FAF8F5] hover:bg-[#F2EDE4] rounded-lg border border-[#EAE3D5] text-left flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{t.dashShortcutContent}</span>
                </div>
                <span className="text-[#8C6D3B] font-bold">●</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
