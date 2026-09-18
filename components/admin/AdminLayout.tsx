import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Boxes, 
  Truck, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Menu, 
  X,
  Store,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminLanguageProvider, useAdminLanguage } from '../../context/AdminLanguageContext';
import { AdminLanguageSelector } from './AdminLanguageSelector';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { ProductManagerTab } from './ProductManagerTab';
import { CategoryManagerTab } from './CategoryManagerTab';
import { InventoryTab } from './InventoryTab';
import { OrderManagerTab } from './OrderManagerTab';
import { ContentManagerTab } from './ContentManagerTab';
import { MediaManagerTab } from './MediaManagerTab';
import { DeliveryManagerTab } from './DeliveryManagerTab';
import { Product, Order, StoreSettings, MediaAsset, Currency } from '../../types';
import { Language } from '../../data/i18n';
import { purgeAllDemoDataFromFirestore, saveStoreSettingsToDb } from '../../services/db';

interface AdminLayoutProps {
  products: Product[];
  orders: Order[];
  storeSettings: StoreSettings;
  media: MediaAsset[];
  currency: Currency;
  currentLanguage: Language;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrder: (order: Order) => void;
  onUpdateOrders?: (orders: Order[]) => void;
  onUpdateStoreSettings: (settings: StoreSettings) => void;
  onBackToStore: () => void;
  onPurgeCompleted?: () => void;
}

const AdminLayoutInner: React.FC<AdminLayoutProps> = ({
  products,
  orders,
  storeSettings,
  media,
  currency,
  currentLanguage,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrder,
  onUpdateOrders,
  onUpdateStoreSettings,
  onBackToStore,
  onPurgeCompleted,
}) => {
  const { currentUser, isAdmin, loading, logout } = useAuth();
  const { t, isRtl } = useAdminLanguage();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeSuccessMessage, setPurgeSuccessMessage] = useState<string | null>(null);
  const [purgeErrorMessage, setPurgeErrorMessage] = useState<string | null>(null);

  const handleExecutePurge = async () => {
    setIsPurging(true);
    setPurgeErrorMessage(null);
    try {
      const res = await purgeAllDemoDataFromFirestore();
      // Clear localStorage cache keys
      localStorage.removeItem('dbc_custom_products_v3');
      localStorage.removeItem('dbc_orders');
      localStorage.removeItem('dbc_cart');
      localStorage.removeItem('dbc_wishlist');

      setShowPurgeConfirm(false);
      setPurgeSuccessMessage(t.purgeSuccessToast(res.deletedProducts, res.deletedOrders, res.deletedMedia));
      if (onPurgeCompleted) {
        onPurgeCompleted();
      }
      setTimeout(() => setPurgeSuccessMessage(null), 5000);
    } catch (err: any) {
      setPurgeErrorMessage(err?.message || String(err));
    } finally {
      setIsPurging(false);
    }
  };

  // If Auth is still loading from Firebase, show a clean loading view
  if (loading) {
    return (
      <div 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="min-h-screen bg-[#191715] flex flex-col items-center justify-center text-[#ECE7DF] space-y-4"
      >
        <div className="w-10 h-10 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-[#A8A196] uppercase tracking-wider">
          {t.verifyingSession}
        </p>
      </div>
    );
  }

  // If user is not authenticated or not an authorized admin, display the secure login screen
  if (!currentUser || !isAdmin) {
    return <AdminLogin onBackToStore={onBackToStore} />;
  }

  const navItems = [
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard, badge: null },
    { id: 'products', label: t.navProducts, icon: Package, badge: products.length },
    { id: 'categories', label: t.navCategories, icon: Layers, badge: null },
    { 
      id: 'inventory', 
      label: t.navInventory, 
      icon: Boxes, 
      badge: products.filter(p => p.inStock === false || (p.stock ?? 50) === 0).length > 0 ? t.alertBadge : null 
    },
    { 
      id: 'orders', 
      label: t.navOrders, 
      icon: Truck, 
      badge: orders.filter(o => o.status.includes('Reçu') || o.status.includes('Confirmed')).length || null 
    },
    { id: 'content', label: t.navContent, icon: FileText, badge: null },
    { id: 'media', label: t.navMedia, icon: ImageIcon, badge: media.length || null },
    { id: 'delivery', label: t.navDelivery, icon: Settings, badge: null },
  ];

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-[#F5F2EC] text-[#1F1C19] flex flex-col font-sans transition-all duration-150"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#1F1D1A] text-[#ECE7DF] border-b border-[#36322E] px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 text-[#ECE7DF] hover:bg-[#332E27] rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-[0.12em] font-bold text-white">
              {t.adminHeaderTitle}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#332E27] text-[#C9A96E] border border-[#C9A96E]/30 font-bold uppercase">
              {t.adminHeaderBadge}
            </span>
          </div>
        </div>

        {/* Center/Right Language Selector & Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* Visible 4-Language Selector: العربية | Français | English | Español */}
          <AdminLanguageSelector />

          {/* Purge Demo Data Button */}
          <button
            type="button"
            onClick={() => setShowPurgeConfirm(true)}
            className="px-2.5 py-1.5 bg-[#2B231D] hover:bg-rose-950/80 text-amber-200/90 hover:text-rose-200 rounded-lg border border-[#4A3D33] hover:border-rose-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            title={t.purgeDemoDataBtn}
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">{t.purgeDemoDataBtn}</span>
          </button>

          {/* Public store preview link */}
          <button
            type="button"
            onClick={onBackToStore}
            className="px-2.5 sm:px-3 py-1.5 bg-[#332E27] hover:bg-[#474037] text-[#ECE7DF] hover:text-white rounded-lg border border-[#4A433B] flex items-center gap-1.5 transition-colors cursor-pointer"
            title={t.viewPublicStore}
          >
            <Store className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="hidden lg:inline">{t.viewPublicStore}</span>
            <ExternalLink className={`w-3 h-3 text-[#7C756B] ${isRtl ? 'rotate-180' : ''}`} />
          </button>

          {/* Admin badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#292521] border border-[#3D3730] rounded-lg text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#ECE7DF] font-semibold truncate max-w-[120px] lg:max-w-[160px]">
              {currentUser.email}
            </span>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="px-2.5 sm:px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title={t.logoutBtn}
          >
            <LogOut className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            <span className="hidden sm:inline">{t.logoutBtn}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 ${
            isRtl ? 'right-0 border-l' : 'left-0 border-r'
          } z-30 w-64 bg-[#191715] text-[#ECE7DF] border-[#36322E] flex flex-col justify-between transition-transform duration-200 pt-16 lg:pt-0 ${
            mobileSidebarOpen 
              ? 'translate-x-0' 
              : isRtl 
                ? 'translate-x-full lg:translate-x-0' 
                : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-mono text-[#8C8377] uppercase tracking-wider">
              {t.navSectionTitle}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#C9A96E] text-[#191715] font-bold shadow-md'
                      : 'text-[#A8A196] hover:text-white hover:bg-[#272320]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#191715]' : 'text-[#8C6D3B]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-[#191715] text-[#C9A96E]'
                          : item.badge === t.alertBadge
                          ? 'bg-rose-900/70 text-rose-300'
                          : 'bg-[#332E27] text-[#ECE7DF]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#36322E] space-y-2">
            <div className="text-[10px] font-mono text-[#7C756B] flex items-center justify-between">
              <span>Cloud Firestore</span>
              <span className="text-emerald-400">● {isRtl ? 'متصل' : 'En ligne'}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full py-2 bg-[#272320] hover:bg-rose-950/60 hover:text-rose-200 text-[#A8A196] rounded-lg text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#36322E]"
            >
              <LogOut className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              <span>{t.logoutBtn}</span>
            </button>
          </div>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <AdminDashboardOverview
              products={products}
              orders={orders}
              storeSettings={storeSettings}
              currency={currency}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onAddNewProduct={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagerTab
              products={products}
              onUpdateProduct={onUpdateProduct}
              onDeleteProduct={onDeleteProduct}
              currency={currency}
              onOpenMediaTab={() => setActiveTab('media')}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManagerTab
              products={products}
              onSelectCategoryFilter={() => setActiveTab('products')}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              products={products}
              onUpdateProduct={onUpdateProduct}
              currency={currency}
            />
          )}

          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs">
              <OrderManagerTab
                orders={orders}
                onUpdateOrder={onUpdateOrder}
                onUpdateOrders={onUpdateOrders}
                storeSettings={storeSettings}
                currentLanguage={currentLanguage}
                currency={currency}
              />
            </div>
          )}

          {activeTab === 'content' && (
            <ContentManagerTab
              storeSettings={storeSettings}
              onUpdateStoreSettings={onUpdateStoreSettings}
              media={media}
              onOpenMediaTab={() => setActiveTab('media')}
            />
          )}

          {activeTab === 'media' && (
            <MediaManagerTab
              media={media}
              storeSettings={storeSettings}
              onSetHeroImage={async (url) => {
                const updated = { 
                  ...storeSettings, 
                  heroImage: url,
                  heroImages: url ? [url] : []
                };
                onUpdateStoreSettings(updated);
                await saveStoreSettingsToDb(updated);
              }}
            />
          )}

          {activeTab === 'delivery' && (
            <div className="bg-white p-6 rounded-xl border border-[#E2DAD0] shadow-2xs">
              <DeliveryManagerTab
                storeSettings={storeSettings}
                onUpdateStoreSettings={(partial) => onUpdateStoreSettings({ ...storeSettings, ...partial })}
                currentLanguage={currentLanguage}
                currency={currency}
              />
            </div>
          )}
        </main>
      </div>

      {/* Success Notification Toast */}
      {purgeSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-5 py-3 rounded-lg shadow-2xl border border-emerald-500/60 text-xs font-mono flex items-center gap-3 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{purgeSuccessMessage}</span>
        </div>
      )}

      {/* Confirmation Modal for Data Purge */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1F1D1A] border border-[#3D3730] rounded-xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-white">
                {t.purgeConfirmTitle}
              </h3>
              <p className="text-xs text-[#A8A196] font-mono leading-relaxed">
                {t.purgeConfirmDesc}
              </p>
            </div>

            <ul className="text-xs font-mono text-[#D5CEBF] bg-[#161412] p-3.5 rounded-lg border border-[#332E27] space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{t.purgeItemProducts}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{t.purgeItemOrders}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{t.purgeItemMedia}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span>{t.purgeItemInventory}</span>
              </li>
            </ul>

            <p className="text-[11px] text-[#8C8377] font-mono text-center">
              {t.purgeWarningCleanStart}
            </p>

            {purgeErrorMessage && (
              <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded text-rose-200 text-xs font-mono text-center">
                {purgeErrorMessage}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isPurging}
                onClick={() => setShowPurgeConfirm(false)}
                className="flex-1 py-2.5 bg-[#292521] hover:bg-[#38332C] text-[#D5CEBF] rounded-lg text-xs font-mono transition-colors cursor-pointer border border-[#3D3730]"
              >
                {t.purgeCancelBtn}
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handleExecutePurge}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isPurging ? t.purgeProcessingBtn : t.purgeConfirmBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  return (
    <AdminLanguageProvider>
      <AdminLayoutInner {...props} />
    </AdminLanguageProvider>
  );
};
