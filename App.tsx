import React, { useState, useEffect, useMemo } from 'react';
import { 
  Filter, 
  Sparkles, 
  Ruler, 
  ChevronDown, 
  Star, 
  Check, 
  Phone,
  Layers,
  Truck,
  Building2,
  Sliders,
  Plus,
  RotateCcw,
  MessageCircle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { WishlistModal } from './components/WishlistModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { ContactModal } from './components/ContactModal';
import { B2BWholesaleModal } from './components/B2BWholesaleModal';
import { FloatingWhatsAppWidget } from './components/FloatingWhatsAppWidget';
import { ProductWhatsAppModal } from './components/ProductWhatsAppModal';
import { OrderLookupModal } from './components/OrderLookupModal';
import { Footer } from './components/Footer';

import { 
  Product, 
  CartItem, 
  Currency, 
  Order, 
  CustomMeasurements, 
  StoreSettings,
  MediaAsset
} from './types';
import { PRODUCTS, REVIEWS, WORKSHOP_FAQS } from './data/products';
import { DEFAULT_STORE_SETTINGS } from './data/storeSettings';
import { Language, TRANSLATIONS } from './data/i18n';
import { formatPrice } from './utils/format';
import { useAuth } from './context/AuthContext';
import { 
  subscribeProducts, 
  subscribeStoreSettings, 
  subscribeOrders, 
  subscribeMedia,
  saveProductToDb,
  deleteProductFromDb,
  saveOrderToDb,
  saveStoreSettingsToDb,
  initializeWorkshopDatabase
} from './services/db';
import { compressBase64Image } from './utils/imageCompressor';

export default function App() {
  // 1. Language state - Default is English ('en') with options for French ('fr'), Arabic ('ar'), Spanish ('es')
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    return (localStorage.getItem('dbc_language') as Language) || 'en';
  });

  // 2. Currency state - Default is Algerian Dinar ('DZD')
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('dbc_currency') as Currency) || 'DZD';
  });

  // Database & Local synced states
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  // Cart & Wishlist state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Navigation state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isB2BOpen, setIsB2BOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [whatsAppModalProduct, setWhatsAppModalProduct] = useState<Product | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isAdmin } = useAuth();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.fr || TRANSLATIONS.en;

  // Sync to database
  useEffect(() => {
    initializeWorkshopDatabase();
    const unsubProducts = subscribeProducts(setProducts);
    const unsubSettings = subscribeStoreSettings(setStoreSettings);
    const unsubOrders = subscribeOrders(setOrders);
    const unsubMedia = subscribeMedia(setMediaAssets);

    return () => {
      unsubProducts();
      unsubSettings();
      unsubOrders();
      unsubMedia();
    };
  }, []);

  // Save cart & wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('dbc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dbc_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('dbc_language', currentLanguage);
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('dbc_currency', currency);
  }, [currency]);

  // Cart operations
  const handleAddToCart = (product: Product, size: string, color: string, qty: number = 1, customMeasurements?: CustomMeasurements) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product, selectedSize: size, selectedColor: color, quantity: qty, customMeasurements }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, size: string, color: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId, size, color);
      return;
    }
    setCart(prev => prev.map(item => 
      (item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
        ? { ...item, quantity: qty }
        : item
    ));
  };

  const handleRemoveItem = (productId: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, activeCategory, searchQuery]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0), [cart]);

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen flex flex-col bg-[#FAF8F5] text-[#1E1C1A]">
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlist.length}
        currency={currency}
        onCurrencyChange={setCurrency}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        storeSettings={storeSettings}
      />

      <main className="w-full max-w-full flex-1 overflow-x-hidden">
        <HeroBanner
          onExploreCollection={() => {
            const el = document.getElementById('collection');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenB2B={() => setIsB2BOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
          onUpdateHeroSettings={(updates) => saveStoreSettingsToDb({ ...storeSettings, ...updates })}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
          mediaAssets={mediaAssets}
          isAdmin={isAdmin}
        />

        <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D3B] font-bold">
                {t.collectionSubtitle || 'Catalogue Atelier'}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1E1C1A] font-bold mt-1">
                {t.collectionTitle || 'Nos Confections'}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'hoodies', 'joggers', 'longsleeves', 'tees'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#1F1D1A] text-white font-bold'
                      : 'bg-[#F2EDE4] text-[#4A4338] hover:bg-[#E8E1D5]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                currentLanguage={currentLanguage}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={() => handleToggleWishlist(product.id)}
                onSelectProduct={setSelectedProduct}
                onAddToCart={(p, size, color, qty) => handleAddToCart(p, size, color, qty)}
                onQuickOrder={(p) => {
                  setSelectedProduct(p);
                  setWhatsAppModalProduct(p);
                }}
                storeSettings={storeSettings}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        onOpenAdminLogin={() => setIsAdminOpen(true)}
        onOpenAdminDashboard={() => setIsAdminOpen(true)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
        isAdmin={isAdmin}
      />

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onToggleWishlist={() => handleToggleWishlist(selectedProduct.id)}
          currency={currency}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
          onSaveProduct={saveProductToDb}
          onDeleteProduct={deleteProductFromDb}
          isAdmin={isAdmin}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCart([])}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        currency={currency}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currency={currency}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
        onOrderSuccess={(order) => {
          saveOrderToDb(order);
          setCart([]);
          setIsCheckoutOpen(false);
        }}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        products={products}
        onRemove={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        currency={currency}
        currentLanguage={currentLanguage}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      <B2BWholesaleModal
        isOpen={isB2BOpen}
        onClose={() => setIsB2BOpen(false)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        orders={orders}
        initialTrackingCode=""
        currentLanguage={currentLanguage}
        currency={currency}
        storeSettings={storeSettings}
      />

      {whatsAppModalProduct && (
        <ProductWhatsAppModal
          product={whatsAppModalProduct}
          isOpen={!!whatsAppModalProduct}
          onClose={() => setWhatsAppModalProduct(null)}
          storeSettings={storeSettings}
          currentLanguage={currentLanguage}
          currency={currency}
        />
      )}

      <FloatingWhatsAppWidget
        whatsappNumber={storeSettings.whatsappNumber || '+213550458812'}
        currentlyViewedProduct={selectedProduct}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
        currency={currency}
      />

      {isAdmin && isAdminOpen && (
        <AdminLayout
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          products={products}
          storeSettings={storeSettings}
          orders={orders}
          mediaAssets={mediaAssets}
          currentLanguage={currentLanguage}
          currency={currency}
        />
      )}
    </div>
  );
}
