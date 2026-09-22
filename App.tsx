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

  // 3. Workshop Owner Mutable Products State (Clean start so owner adds their own creations)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_custom_products_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Workshop Store Settings & Contacts State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('dbc_store_settings');
      return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // Cart & Wishlist states
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter & Search states
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [fabricFilter, setFabricFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastViewedProduct, setLastViewedProduct] = useState<Product | null>(null);
  const [whatsAppCustomizerProduct, setWhatsAppCustomizerProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isB2BOpen, setIsB2BOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [orderLookupQuery, setOrderLookupQuery] = useState<string>('');
  const [currentPath, setCurrentPath] = useState(
    window.location.hash === '#admin' ? '/admin' : window.location.pathname
  );
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const { isAdmin: authIsAdmin, currentUser, loading: authLoading } = useAuth();
  // Strictly verified admin flag: public/logged-out visitors are ALWAYS false
  const isAdmin = Boolean(!authLoading && currentUser && authIsAdmin === true);

  // Track whether store settings have loaded from persistent storage (localStorage / Firestore)
  const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('dbc_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed && typeof parsed.heroImage === 'string' && parsed.heroImage.trim().length > 0);
      }
    } catch {
      // fallback
    }
    return false;
  });

  // Listen to browser navigation changes & hash changes
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin') {
        setCurrentPath('/admin');
      } else {
        setCurrentPath(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Save Cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dbc_cart', JSON.stringify(cartItems));
    } catch {
      // LocalStorage error handling
    }
  }, [cartItems]);

  // Save Wishlist to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dbc_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // LocalStorage error handling
    }
  }, [wishlistIds]);

  // Save Orders to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dbc_orders', JSON.stringify(orders));
    } catch {
      // LocalStorage error handling
    }
  }, [orders]);

  // Save Store Settings to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dbc_store_settings', JSON.stringify(storeSettings));
    } catch {
      // LocalStorage error handling
    }
  }, [storeSettings]);

  // Subscribe to Cloud Firestore updates in real-time
  useEffect(() => {
    const unsubscribeProducts = subscribeProducts((dbProducts) => {
      setProducts(dbProducts);
      try {
        localStorage.setItem('dbc_custom_products_v3', JSON.stringify(dbProducts));
      } catch {
        // quota handled
      }
    });

    const unsubscribeSettings = subscribeStoreSettings((dbSettings) => {
      if (dbSettings) {
        setStoreSettings((prev) => {
          const merged = { ...prev, ...dbSettings };
          try {
            localStorage.setItem('dbc_store_settings', JSON.stringify(merged));
          } catch {
            // quota handled
          }
          return merged;
        });
        setIsSettingsLoaded(true);
      }
    });

    const unsubscribeOrders = subscribeOrders((dbOrders) => {
      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders);
        try {
          localStorage.setItem('dbc_orders', JSON.stringify(dbOrders));
        } catch {
          // quota handled
        }
      }
    });

    const unsubscribeMedia = subscribeMedia((dbMedia) => {
      setMediaAssets(dbMedia);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
      unsubscribeOrders();
      unsubscribeMedia();
    };
  }, []);

  // One-time auto seed if database is entirely empty
  useEffect(() => {
    initializeWorkshopDatabase(PRODUCTS, DEFAULT_STORE_SETTINGS);
  }, []);

  // SEO & Head Tags Synchronization
  useEffect(() => {
    const title = storeSettings.seoTitle || `${storeSettings.storeName} - ${storeSettings.tagline}`;
    const desc = storeSettings.seoDescription || storeSettings.heroSubtitle || 'Atelier de confection textile en Algérie spécialisé en molleton lourd 350-450 GSM. Vente B2C et confection B2B.';
    const keywords = storeSettings.seoKeywords || 'confection algerie, streetwear algerie, grossiste hoodie algerie, atelier textile alger, molleton lourd, grossiste vetement algerie, confection sur mesure algerie';
    const author = storeSettings.seoAuthor || 'DBC Clothing Workshop Algérie';

    document.title = title;

    const updateMetaTag = (selector: string, attr: string, val: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(attrName, attrVal.replace(/"/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };

    const ogImg = (storeSettings.ogImage && !storeSettings.ogImage.startsWith('data:'))
      ? storeSettings.ogImage
      : (storeSettings.heroImage && !storeSettings.heroImage.startsWith('data:'))
        ? storeSettings.heroImage
        : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80';
    const canonical = storeSettings.canonicalUrl || window.location.origin;

    updateMetaTag('meta[name="description"]', 'content', desc);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[name="author"]', 'content', author);
    updateMetaTag('meta[property="og:title"]', 'content', title);
    updateMetaTag('meta[property="og:description"]', 'content', desc);
    updateMetaTag('meta[property="og:image"]', 'content', ogImg);
    updateMetaTag('meta[property="og:site_name"]', 'content', storeSettings.storeName);
    updateMetaTag('meta[name="twitter:title"]', 'content', title);
    updateMetaTag('meta[name="twitter:description"]', 'content', desc);
    updateMetaTag('meta[name="twitter:image"]', 'content', ogImg);

    // Dynamic Schema.org JSON-LD Structured Data
    let schemaScript = document.getElementById('dbc-schema-jsonld') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'dbc-schema-jsonld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    const schemaObj = {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      'name': storeSettings.storeName,
      'description': desc,
      'telephone': storeSettings.phone,
      'email': storeSettings.email,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': storeSettings.address,
        'addressLocality': storeSettings.city,
        'addressCountry': 'DZ',
      },
      'priceRange': '$$',
      'currenciesAccepted': 'DZD',
      'paymentAccepted': 'Cash on Delivery, BaridiMob, CCP',
      'areaServed': 'Algeria (69 Wilayas)',
      'url': canonical,
      'image': ogImg,
    };
    schemaScript.text = JSON.stringify(schemaObj);
  }, [storeSettings]);

  // Discount code state
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscountPct, setAppliedDiscountPct] = useState<number>(0);

  const handleApplyDiscountCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'DBC10') {
      setAppliedDiscountPct(10);
      setDiscountCode('DBC10');
      return true;
    } else if (clean === 'ATELIER15') {
      setAppliedDiscountPct(15);
      setDiscountCode('ATELIER15');
      return true;
    } else if (clean === 'GROS20') {
      setAppliedDiscountPct(20);
      setDiscountCode('GROS20');
      return true;
    }
    return false;
  };

  // Switch language and persist
  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('dbc_language', lang);
  };

  // Switch currency and persist
  const handleCurrencyChange = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem('dbc_currency', curr);
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    size: string,
    colorIndex: number,
    isMadeToMeasure: boolean,
    measurements?: CustomMeasurements,
    monogram?: any,
    customPrice?: number,
    quantityToAdd: number = 1
  ) => {
    const selectedColor = product.colors[colorIndex] || product.colors[0];
    const unitPrice = customPrice || product.price;
    const cartItemId = `${product.id}-${size}-${selectedColor.name}-${isMadeToMeasure ? 'm2m' : 'std'}`;
    const qty = Math.max(1, quantityToAdd || 1);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }

      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        product,
        size,
        color: selectedColor,
        quantity: qty,
        isMadeToMeasure,
        measurements,
        monogram,
        pricePerUnit: unitPrice,
      };
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const handleQuickAdd = (product: Product, size: string, colorIndex: number) => {
    handleAddToCart(product, size, colorIndex, false);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
        )
      );
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setLastViewedProduct(product);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    saveOrderToDb(newOrder);
  };

  const handleOpenOrderLookup = (orderNum?: string) => {
    setOrderLookupQuery(orderNum || '');
    setIsOrderLookupOpen(true);
  };

  // Admin mutation callbacks
  const handleSaveProduct = async (productData: Product) => {
    if (!isAdmin) return;
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === productData.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = productData;
        return copy;
      }
      return [productData, ...prev];
    });
    await saveProductToDb(productData);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!isAdmin) return;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await deleteProductFromDb(productId);
  };

  const handleUpdateSettings = async (updates: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const merged = { ...prev, ...updates };
      try {
        localStorage.setItem('dbc_store_settings', JSON.stringify(merged));
      } catch {
        // quota
      }
      return merged;
    });
    await saveStoreSettingsToDb(updates);
  };

  // Filter products by category, fabric, search, and sort
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (activeCategory !== 'all') {
        const cat = (product.category || '').toLowerCase();
        if (activeCategory === 'hoodies' && !cat.includes('hoodie')) return false;
        if (activeCategory === 'sweatshirts' && !cat.includes('sweat')) return false;
        if (activeCategory === 'pants' && !cat.includes('jogging') && !cat.includes('pantalon')) return false;
        if (activeCategory === 'sets' && !cat.includes('ensemble') && !cat.includes('set')) return false;
        if (activeCategory === 'b2b' && !product.wholesalePriceDzd && !product.isB2BAvailable) return false;
      }

      if (fabricFilter !== 'all') {
        const fab = (product.fabric || '').toLowerCase();
        if (fabricFilter === '450' && !fab.includes('450')) return false;
        if (fabricFilter === '380' && !fab.includes('380') && !fab.includes('400')) return false;
        if (fabricFilter === '320' && !fab.includes('320') && !fab.includes('350')) return false;
      }

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        const matchCategory = product.category.toLowerCase().includes(q);
        const matchFabric = product.fabric.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCategory && !matchFabric) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.id || '').localeCompare(a.id || '');
      return 0;
    });
  }, [products, activeCategory, fabricFilter, searchQuery, sortBy]);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  // If Admin panel is open
  if (currentPath === '/admin') {
    return (
      <AdminLayout
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        storeSettings={storeSettings}
        onUpdateSettings={handleUpdateSettings}
        mediaAssets={mediaAssets}
        onClose={() => {
          window.location.hash = '';
          setCurrentPath('/');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAF8F5] text-[#1F1C19] flex flex-col ${isArabic ? 'font-sans rtl' : 'font-sans'}`}>
      {/* 1. Atelier Top Navigation Bar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenOrderLookup={() => handleOpenOrderLookup()}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setCurrentPath('/admin');
        }}
        storeSettings={storeSettings}
      />

      {/* 2. Hero Presentation Banner */}
      <HeroBanner
        onExploreCollection={() => {
          const el = document.getElementById('catalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenOrderLookup={() => handleOpenOrderLookup()}
        onUpdateHeroSettings={handleUpdateSettings}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
        mediaAssets={mediaAssets}
        isAdmin={isAdmin}
        isSettingsLoaded={isSettingsLoaded}
      />

      {/* 3. Main Catalog Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#EAE3D5] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8C6D3B]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D3B] font-bold">
                {isArabic ? 'كتالوج ورشة الخياطة' : 'Catalogue Confection Algérie'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1F1C19]">
              {isArabic ? 'الموديلات المتوفرة والتفصيل' : 'Nos Articles & Modèles en Molleton'}
            </h2>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: isArabic ? 'الكل' : 'Tous' },
              { id: 'hoodies', label: isArabic ? 'هوديز' : 'Hoodies' },
              { id: 'sweatshirts', label: isArabic ? 'سويت شيرت' : 'Sweatshirts' },
              { id: 'pants', label: isArabic ? 'جوجينج' : 'Pantalons' },
              { id: 'sets', label: isArabic ? 'أطقم كاملة' : 'Ensembles' },
              { id: 'b2b', label: isArabic ? 'طلبيات الجملة' : 'Grossiste B2B' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === c.id
                    ? 'bg-[#1F1C19] text-white font-bold'
                    : 'bg-white hover:bg-[#F2EDE4] text-[#544D42] border border-[#DDD4C5]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              currency={currency}
              currentLanguage={currentLanguage}
              onSelectProduct={handleSelectProduct}
              onQuickAdd={handleQuickAdd}
              isWishlisted={wishlistIds.includes(prod.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded border border-[#EAE3D5] p-8">
            <p className="text-[#6E6659] font-mono text-sm">
              {isArabic ? 'لا توجد منتجات في هذا التصنيف حالياً.' : 'Aucun modèle dans cette catégorie pour le moment.'}
            </p>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        currentLanguage={currentLanguage}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenOrderLookup={() => handleOpenOrderLookup()}
        storeSettings={storeSettings}
      />

      {/* ================= MODALS ================= */}

      {/* 1. Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currency={currency}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
          isAdmin={isAdmin}
          onDeleteProduct={isAdmin ? handleDeleteProduct : undefined}
          onEditProduct={isAdmin ? () => {
            setSelectedProduct(null);
            window.location.hash = 'admin';
            setCurrentPath('/admin');
          } : undefined}
        />
      )}

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        discountCode={discountCode}
        onApplyDiscountCode={handleApplyDiscountCode}
        appliedDiscountPct={appliedDiscountPct}
        currentLanguage={currentLanguage}
      />

      {/* 3. Direct Order / Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currency={currency}
        discountPct={appliedDiscountPct}
        onOrderSuccess={handleOrderSuccess}
        onOpenOrderLookup={(ordNum) => handleOpenOrderLookup(ordNum || '')}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
      />

      {/* 4. Workshop Contact & Payment Details Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* 6. B2B Wholesale Inquiries Modal */}
      <B2BWholesaleModal
        isOpen={isB2BOpen}
        onClose={() => setIsB2BOpen(false)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* 7. Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        onOpenBespoke={() => {
          setIsSizeGuideOpen(false);
          setIsB2BOpen(true);
        }}
      />

      {/* 8. Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={products}
        currency={currency}
        onRemoveFromWishlist={handleToggleWishlist}
        onSelectProduct={handleSelectProduct}
      />

      {/* 9. Floating WhatsApp Direct Action with Contextual Product Greeting */}
      <FloatingWhatsAppWidget
        currentlyViewedProduct={selectedProduct || lastViewedProduct}
        currency={currency}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
        onOpenCustomWhatsAppModal={(prod) => setWhatsAppCustomizerProduct(prod)}
      />

      {/* 10. Standalone WhatsApp Greeting Customizer (triggered from floating button) */}
      {whatsAppCustomizerProduct && (
        <ProductWhatsAppModal
          product={whatsAppCustomizerProduct}
          isOpen={true}
          onClose={() => setWhatsAppCustomizerProduct(null)}
          currency={currency}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
        />
      )}

      {/* 11. Order Lookup & Tracking Across 69 Wilayas Modal */}
      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        orders={orders}
        currency={currency}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
        initialQuery={orderLookupQuery}
      />
    </div>
  );
}
