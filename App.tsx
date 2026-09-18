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
  const { isAdmin } = useAuth();

  // Listen to browser navigation changes & hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setCurrentPath('/admin');
      } else {
        setCurrentPath(window.location.pathname);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial check in case loaded with #admin
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Initialize and live-subscribe to Firestore database
  useEffect(() => {
    if (isAdmin) {
      initializeWorkshopDatabase();
    }

    const unsubProducts = subscribeProducts((dbProducts) => {
      if (dbProducts) {
        setProducts(dbProducts);
      }
    });
    const unsubSettings = subscribeStoreSettings((dbSettings) => {
      if (dbSettings) {
        setStoreSettings(dbSettings);
      }
    });
    const unsubMedia = subscribeMedia((dbMedia) => {
      if (dbMedia) {
        setMediaAssets(dbMedia);
      }
    });

    let unsubOrders = () => {};
    if (isAdmin) {
      unsubOrders = subscribeOrders((dbOrders) => {
        if (dbOrders) {
          setOrders(dbOrders);
        }
      });
    }

    return () => {
      unsubProducts();
      unsubSettings();
      unsubOrders();
      unsubMedia();
    };
  }, [isAdmin]);

  const handleOpenOrderLookup = (query: string = '') => {
    setOrderLookupQuery(query);
    setIsOrderLookupOpen(true);
  };

  // Cart helpers
  const [discountCode, setDiscountCode] = useState<string>('DBC2026');
  const [appliedDiscountPct, setAppliedDiscountPct] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  // Safe localStorage helper to prevent QuotaExceededError or security exceptions
  const safeSetLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (err) {
      console.warn(`[Storage] LocalStorage notice for key ${key}:`, err);
    }
  };

  // Synchronize direction and language attribute on document root
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    safeSetLocalStorage('dbc_language', currentLanguage);
  }, [currentLanguage, isArabic]);

  // Save changes to localStorage safely
  useEffect(() => {
    safeSetLocalStorage('dbc_currency', currency);
  }, [currency]);

  useEffect(() => {
    safeSetLocalStorage('dbc_cart', cartItems);
  }, [cartItems]);

  useEffect(() => {
    safeSetLocalStorage('dbc_wishlist', wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    safeSetLocalStorage('dbc_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeSetLocalStorage('dbc_custom_products_v3', products);
  }, [products]);

  useEffect(() => {
    safeSetLocalStorage('dbc_store_settings', storeSettings);

    // Dynamic Live SEO & Social Metadata Synchronization
    const title = storeSettings.seoTitle || `${storeSettings.storeName} | Atelier de Confection Textile Algérie`;
    document.title = title;

    const updateMetaTag = (selector: string, attributeName: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(selector) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        if (selector.startsWith('meta[property=')) {
          const propName = selector.match(/meta\[property="([^"]+)"\]/)?.[1];
          if (propName) el.setAttribute('property', propName);
        } else if (selector.startsWith('meta[name=')) {
          const nameValue = selector.match(/meta\[name="([^"]+)"\]/)?.[1];
          if (nameValue) el.setAttribute('name', nameValue);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attributeName, content);
    };

    const desc = storeSettings.seoDescription || storeSettings.tagline || 'Atelier de confection textile en Algérie spécialisé dans les hoodies lourds, joggings et confection sur-mesure.';
    const keywords = storeSettings.seoKeywords || 'confection textile algérie, atelier vêtements alger, grossiste hoodie algérie, livraison 69 wilayas';
    const author = storeSettings.seoAuthor || storeSettings.storeName;
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

  // Auto-heal / sanitize any preexisting oversized image in localStorage that previously exceeded Firestore limits
  useEffect(() => {
    if (storeSettings.heroImage && storeSettings.heroImage.startsWith('data:image/') && storeSettings.heroImage.length > 350 * 1024) {
      compressBase64Image(storeSettings.heroImage, 1400, 0.82, 350 * 1024)
        .then((compressed) => {
          const sanitized = {
            ...storeSettings,
            heroImage: compressed,
            heroImages: compressed ? [compressed] : []
          };
          setStoreSettings(sanitized);
          localStorage.setItem('dbc_store_settings', JSON.stringify(sanitized));
          saveStoreSettingsToDb(sanitized).catch((err) => console.warn('Could not auto-sync sanitized settings:', err));
        })
        .catch((err) => console.warn('Hero image sanitization skipped:', err));
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Workshop Product Management Handlers
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updatedProduct.id);
      if (exists) {
        return prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      } else {
        return [updatedProduct, ...prev];
      }
    });
    showToast(isArabic ? 'تم حفظ وتحديث المنتج بنجاح!' : 'Produit enregistré et mis à jour avec succès !');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast(isArabic ? 'تم حذف المنتج من الكتالوج.' : 'Produit retiré du catalogue.');
  };

  const handleResetDefaultProducts = () => {
    setProducts(PRODUCTS);
    safeSetLocalStorage('dbc_custom_products_v3', PRODUCTS);
    showToast(isArabic ? 'تم تحميل نماذج المنتجات الاسترشادية.' : 'Modèles d’exemples chargés.');
  };

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setLastViewedProduct(product);
    }
  };

  const handleClearAllProducts = () => {
    setProducts([]);
    safeSetLocalStorage('dbc_custom_products_v3', []);
    showToast(isArabic ? 'تم تفريغ كتالوج المنتجات بنجاح.' : 'Catalogue vidé avec succès.');
  };

  const handleUpdateStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    showToast(isArabic ? 'تم حفظ بيانات الاتصال والورشة بنجاح!' : 'Coordonnées de l’atelier mises à jour !');
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updatedOrder.id);
      if (exists) {
        return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      }
      return [updatedOrder, ...prev];
    });
    showToast(isArabic ? 'تم تحديث حالة ومعلومات الطلبية بنجاح' : 'Commande et suivi mis à jour avec succès');
  };

  const handleUpdateOrders = (allOrders: Order[]) => {
    setOrders(allOrders);
    showToast(isArabic ? 'تم تحديث قائمة الطلبيات بنجاح' : 'Commandes mises à jour avec succès');
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'b2b') {
          if (!p.isB2BAvailable) return false;
        } else if (p.category !== activeCategory) {
          return false;
        }
      }
      // Fabric filter
      if (fabricFilter !== 'all') {
        const fabLower = (p.fabric + ' ' + (p.fabricWeight || '')).toLowerCase();
        if (fabricFilter === 'thermal' && !fabLower.includes('thermal') && !fabLower.includes('gaufre')) return false;
        if (fabricFilter === 'fleece' && !fabLower.includes('molleton') && !fabLower.includes('fleece')) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchSub = (p.subtitle || '').toLowerCase().includes(q);
        const matchFab = p.fabric.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchSub && !matchFab) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, activeCategory, fabricFilter, searchQuery, sortBy]);

  // Cart totals
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.pricePerUnit * item.quantity, 0);
  const cartTotal = cartSubtotal - (cartSubtotal * appliedDiscountPct) / 100;

  // Toggle wishlist
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => 
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Add to cart
  const handleAddToCart = (
    product: Product,
    size: string,
    colorIndex: number,
    isMadeToMeasure: boolean,
    measurements?: CustomMeasurements,
    monogram?: any,
    customPrice?: number
  ) => {
    const selectedColor = product.colors[colorIndex] || product.colors[0];
    const unitPrice = customPrice || product.price;
    const cartItemId = `${product.id}-${size}-${selectedColor.name}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        product,
        size,
        color: selectedColor,
        quantity: 1,
        isMadeToMeasure: false,
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
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleApplyDiscountCode = (code: string): boolean => {
    if (code === 'DBC2026' || code === 'WINTER10' || code === 'DZ10') {
      setAppliedDiscountPct(10);
      setDiscountCode(code);
      return true;
    }
    return false;
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    saveOrderToDb(newOrder).catch((err) => console.error('Error saving order to Firestore:', err));
    setCartItems([]);
    showToast(isArabic ? 'تم تسجيل طلبيتك بنجاح! سنتصل بك لتأكيد الشحن.' : 'Commande enregistrée avec succès !');
  };

  // ROUTE: /admin -> Render secure isolated Admin Layout
  if (currentPath.startsWith('/admin')) {
    return (
      <AdminLayout
        products={products}
        orders={orders}
        storeSettings={storeSettings}
        media={mediaAssets}
        currency={currency}
        currentLanguage={currentLanguage}
        onUpdateProduct={(prod) => {
          handleSaveProduct(prod);
        }}
        onDeleteProduct={(id) => {
          handleDeleteProduct(id);
        }}
        onUpdateOrder={async (ord) => {
          handleUpdateOrder(ord);
          try {
            await saveOrderToDb(ord);
          } catch (err) {
            console.warn('[Orders] Notice: could not persist order update to Firestore:', err);
          }
        }}
        onUpdateOrders={async (newOrds) => {
          handleUpdateOrders(newOrds);
          for (const ord of newOrds) {
            try {
              await saveOrderToDb(ord);
            } catch (err) {
              console.warn('[Orders] Notice: could not persist batch order update:', err);
            }
          }
        }}
        onUpdateStoreSettings={async (settings) => {
          handleUpdateStoreSettings(settings);
          try {
            await saveStoreSettingsToDb(settings);
          } catch (err) {
            console.warn('[Settings] Notice: could not persist store settings:', err);
          }
        }}
        onBackToStore={() => {
          window.location.hash = '';
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
        onPurgeCompleted={() => {
          setProducts([]);
          setOrders([]);
          setMediaAssets([]);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F1C19] ${isArabic ? 'font-sans' : ''}`}>
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1F1D1A] text-white px-5 py-2.5 rounded shadow-2xl border border-[#C9A96E] text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation with Language and DZD currency */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlistIds.length}
        currency={currency}
        onCurrencyChange={setCurrency}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenOrderLookup={() => handleOpenOrderLookup('')}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('collection-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        storeSettings={storeSettings}
      />

      <main className="flex-1">
        {/* DBC Workshop Hero Banner - B2B & B2C, 69 Wilayas Algeria */}
        <HeroBanner
          onExploreCollection={() => {
            const el = document.getElementById('collection-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenB2B={() => setIsB2BOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenOrderLookup={() => handleOpenOrderLookup('')}
          onUpdateHeroImage={async (imageUrl) => {
            let processedUrl = imageUrl;
            if (imageUrl && imageUrl.startsWith('data:image/')) {
              try {
                processedUrl = await compressBase64Image(imageUrl, 1400, 0.82, 350 * 1024);
              } catch (e) {
                console.warn('Could not compress hero image:', e);
              }
            }
            const updated = { 
              ...storeSettings, 
              heroImage: processedUrl,
              heroImages: processedUrl ? [processedUrl] : []
            };
            setStoreSettings(updated);
            localStorage.setItem('dbc_store_settings', JSON.stringify(updated));
            try {
              await saveStoreSettingsToDb(updated);
            } catch (err) {
              console.error('Error saving hero cover to Firestore:', err);
            }
            setToastMessage(
              imageUrl 
                ? (currentLanguage === 'ar' ? 'تم تحديث صورة واجهة الموقع بنجاح' : 'Photo de couverture du site mise à jour avec succès')
                : (currentLanguage === 'ar' ? 'تمت إزالة صورة واجهة الموقع' : 'Photo de couverture retirée avec succès')
            );
            setTimeout(() => setToastMessage(null), 3500);
          }}
          onUpdateHeroSettings={async (heroUpdates) => {
            let processedUrl = heroUpdates.heroImage;
            if (processedUrl && processedUrl.startsWith('data:image/')) {
              try {
                processedUrl = await compressBase64Image(processedUrl, 1400, 0.82, 350 * 1024);
              } catch (e) {
                console.warn('Could not compress hero image:', e);
              }
            }
            const updated = { 
              ...storeSettings, 
              ...heroUpdates,
              ...(processedUrl !== undefined ? { heroImage: processedUrl, heroImages: processedUrl ? [processedUrl] : [] } : {})
            };
            setStoreSettings(updated);
            localStorage.setItem('dbc_store_settings', JSON.stringify(updated));
            try {
              await saveStoreSettingsToDb(updated);
            } catch (err) {
              console.error('Error saving hero settings to Firestore:', err);
            }
            setToastMessage(
              currentLanguage === 'ar' ? 'تم تحديث إعدادات واجهة الموقع بنجاح' : 'Paramètres de la couverture mis à jour avec succès'
            );
            setTimeout(() => setToastMessage(null), 3500);
          }}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
          mediaAssets={mediaAssets}
        />

        {/* Collection Section */}
        <section id="collection-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E8E1D5]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-widest text-[#8C6D3B] uppercase font-bold">
                  {t.heroSubtitle.split('.')[0] || 'DBC Workshop Confection Algérie'}
                </span>
                <span className="text-[11px] font-mono text-[#787167] bg-[#EFEAE1] px-2 py-0.5 rounded">
                  {filteredProducts.length} {isArabic ? 'منتج معروض' : 'Articles'}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C19] mt-1 capitalize">
                {activeCategory === 'all'
                  ? t.winterCollectionHeader
                  : activeCategory === 'b2b'
                  ? 'Offre Spéciale Vente en Gros (B2B)'
                  : `${activeCategory}`}
              </h2>
            </div>

            {/* Quick Action & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Quick Filter */}
              <div className="flex items-center gap-1.5 bg-[#F2EDE4] px-2.5 py-1.5 rounded border border-[#E0D7C9] text-xs font-mono">
                <span className="text-[#7A7163]">{t.filterAll} :</span>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="bg-transparent text-[#1F1C19] font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">{t.navAll}</option>
                  <option value="hoodies">{t.navHoodies}</option>
                  <option value="joggers">{t.navJoggers}</option>
                  <option value="longsleeves">{t.navLongSleeves}</option>
                  <option value="tees">{t.navTees}</option>
                  <option value="tracksuits">Tracksuits Complets</option>
                  <option value="b2b">{t.navB2B}</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 bg-[#F2EDE4] px-2.5 py-1.5 rounded border border-[#E0D7C9] text-xs font-mono">
                <span className="text-[#7A7163]">{t.sortBy} :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[#1F1C19] font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="featured">{t.sortFeatured}</option>
                  <option value="price-asc">{t.sortPriceAsc}</option>
                  <option value="price-desc">{t.sortPriceDesc}</option>
                  <option value="newest">{t.sortNewest}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(activeCategory !== 'all' || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <span className="text-xs font-mono text-[#8C8377]">{t.filterAll} :</span>
              {activeCategory !== 'all' && (
                <button
                  onClick={() => setActiveCategory('all')}
                  className="px-2.5 py-0.5 bg-[#EAE2D5] text-[#2C2825] text-xs font-mono rounded-full flex items-center gap-1 hover:bg-[#DDD2C0] cursor-pointer"
                >
                  <span>{activeCategory}</span>
                  <span className="font-bold">×</span>
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-0.5 bg-[#EAE2D5] text-[#2C2825] text-xs font-mono rounded-full flex items-center gap-1 hover:bg-[#DDD2C0] cursor-pointer"
                >
                  <span>"{searchQuery}"</span>
                  <span className="font-bold">×</span>
                </button>
              )}
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-mono text-[#8C6D3B] hover:underline cursor-pointer ml-1"
              >
                {isArabic ? 'إعادة ضبط' : 'Réinitialiser'}
              </button>
            </div>
          )}

          {/* Product Grid or Onboarding Empty Catalog State */}
          {products.length === 0 ? (
            <div className="py-16 px-6 max-w-xl mx-auto my-8 bg-white border border-[#E0D7C9] rounded-lg text-center shadow-xs space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF4EB] border border-[#E8DCCB] flex items-center justify-center text-[#8C6D3B]">
                <Plus className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-semibold text-[#1F1C19]">
                  {isArabic ? 'كتالوج ورشتك جاهز لاستقبال منتجاتك' : 'Votre catalogue est prêt pour vos confections'}
                </h3>
                <p className="text-xs text-[#7A7367] max-w-md mx-auto leading-relaxed">
                  {isArabic
                    ? 'تم تفريغ المقالات السابقة بنجاح. أضف الآن مقالاتك وملابسك الخاصة مع صورك، الأسعار بالدينار الجزائري، المقاسات، والألوان.'
                    : 'Les articles précédents ont été retirés. Vous pouvez dès maintenant ajouter vos propres vêtements, photos, prix en DZD, tailles et couleurs.'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#1F1D1A] text-white text-xs font-mono font-bold rounded hover:bg-[#3D3730] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-[#C9A96E]" />
                  <span>{isArabic ? 'تواصل مع الورشة' : 'Contacter l’atelier'}</span>
                </button>
                <button
                  onClick={handleResetDefaultProducts}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#F2EDE4] hover:bg-[#E8DFC9] text-[#4A4338] border border-[#DDD4C5] text-xs font-mono rounded flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Charger des modèles d'exemples si besoin"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'عرض نماذج الورشة' : 'Charger des modèles'}</span>
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Layers className="w-10 h-10 text-[#C9BFB0] mx-auto" />
              <h3 className="font-serif text-xl font-medium text-[#1F1C19]">
                {isArabic ? 'لا توجد منتجات مطابقة لهذا الفلتر' : 'Aucun produit ne correspond à ces critères'}
              </h3>
              <p className="text-xs text-[#7A7367] max-w-sm mx-auto">
                {isArabic
                  ? 'يرجى تجربة فلتر آخر أو إعادة ضبط البحث للاطلاع على كافة معروضات الورشة.'
                  : 'Essayez de modifier votre recherche ou vos critères de filtres pour découvrir nos confections.'}
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-[#1F1D1A] text-white text-xs font-mono rounded cursor-pointer"
                >
                  {isArabic ? 'عرض جميع المنتجات' : 'Voir toute la collection'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectProduct={handleSelectProduct}
                  onQuickAdd={handleQuickAdd}
                  currentLanguage={currentLanguage}
                  storeSettings={storeSettings}
                />
              ))}
            </div>
          )}
        </section>

        {/* B2B Wholesale Callout Section for Stores & Retailers */}
        <section className="bg-[#1F1D1A] text-[#FAF8F5] py-14 border-y border-[#3A352F]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3.5">
                <div className="flex items-center gap-2 text-[#C9A96E] font-mono text-xs uppercase tracking-widest">
                  <Building2 className="w-4 h-4" />
                  <span>{t.b2bSectionTitle}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-medium tracking-tight">
                  {isArabic
                    ? 'أصحاب المحلات وموزعي الملابس في الجزائر؟'
                    : 'Vous possédez une boutique de vêtements en Algérie ?'} <br />
                  <span className="italic text-[#C9A96E]">
                    {isArabic
                      ? 'وفر لزبائنك تشكيلة ملابس ذات جودة تصنيع عالية وأسعار جملة منافسة.'
                      : 'Profitez de nos tarifs de confection usine B2B dès 6 pièces.'}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#BDB5AA] max-w-2xl leading-relaxed">
                  {t.b2bSectionDesc}
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                <button
                  id="open-b2b-modal-cta"
                  onClick={() => setIsB2BOpen(true)}
                  className="px-6 py-3.5 bg-[#FAF8F5] text-[#1F1C19] hover:bg-[#EAE4D8] text-xs font-mono uppercase tracking-widest rounded transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-bold"
                >
                  <Building2 className="w-4 h-4 text-[#8C6D3B]" />
                  <span>{isArabic ? 'طلب تسعيرة الجملة (B2B)' : 'Demander Tarifs Gros'}</span>
                </button>

                <button
                  id="open-contact-modal-cta"
                  onClick={() => setIsContactOpen(true)}
                  className="px-6 py-3.5 border border-[#6E665B] text-white hover:bg-white/10 text-xs font-mono uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#C9A96E]" />
                  <span>{t.navContact} ({storeSettings.phone})</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 69 Wilayas Coverage & Delivery Guarantees */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white border border-[#E8E1D5] rounded space-y-2">
              <div className="w-10 h-10 rounded bg-[#F2EDE4] flex items-center justify-center text-[#8C6D3B]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {t.delivery58Wilayas}
              </h3>
              <p className="text-xs text-[#6E6659] leading-relaxed font-sans">
                {isArabic
                  ? 'تغطية شاملة لكافة الولايات الجزائرية الـ 69 من الشمال إلى الجنوب، مع خياري التوصيل للمنزل أو الاستلام من المكتب (StopDesk).'
                  : 'Expédition rapide vers toutes les 69 wilayas d’Algérie avec option livraison à domicile ou retrait en bureau StopDesk.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenOrderLookup('')}
                  className="text-xs font-mono font-bold text-[#8C6D3B] hover:text-[#1F1C19] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'تتبع طلبيتك أو اكتشف جدول التعريفات ←' : 'Suivre une commande & voir les tarifs →'}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-white border border-[#E8E1D5] rounded space-y-2">
              <div className="w-10 h-10 rounded bg-[#F2EDE4] flex items-center justify-center text-[#8C6D3B]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {isArabic ? 'بيع بالتجزئة وبالجملة' : 'Vente B2C (Détail) & B2B (Gros)'}
              </h3>
              <p className="text-xs text-[#6E6659] leading-relaxed font-sans">
                {isArabic
                  ? 'اشتري قطعة واحدة لنفسك أو اطلب كميات تجارية لمتاجرك بأسعار جملة مخفضة مع حرية اختيار المقاسات والألوان.'
                  : 'Commandez pour vous-même à l’unité ou approvisionnez vos magasins avec nos tarifs revendeurs préférentiels.'}
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E8E1D5] rounded space-y-2">
              <div className="w-10 h-10 rounded bg-[#F2EDE4] flex items-center justify-center text-[#8C6D3B]">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {isArabic ? 'طلب سريع ومباشر عبر واتساب' : 'Commande Directe via WhatsApp'}
              </h3>
              <p className="text-xs text-[#6E6659] leading-relaxed font-sans">
                {isArabic
                  ? 'تواصل معنا في أي وقت لتأكيد طلبيتك، اختيار الألوان، أو معرفة حالة الإرسالية مع فريق خدمة العملاء.'
                  : 'Un service client réactif disponible sur WhatsApp au ' + storeSettings.phone + ' pour vous conseiller et confirmer vos expéditions.'}
              </p>
            </div>
          </div>
        </section>

        {/* Client Reviews */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-[#E8E1D5]">
          <div className="text-center max-w-2xl mx-auto space-y-1.5 mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D3B] font-semibold">
              {isArabic ? 'آراء وتجارب الزبائن في الجزائر' : 'Avis & Témoignages Clients en Algérie'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C19]">
              {isArabic ? 'جودة تصنيع موثوقة عبر كافة الولايات' : 'Recommandé par les particuliers et boutiques'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="p-5 bg-white border border-[#E5DFD4] rounded flex flex-col justify-between shadow-xs hover:border-[#2C2825] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-[#8C8377]">
                      {rev.date}
                    </span>
                  </div>

                  <h4 className="font-serif text-sm font-semibold text-[#1F1C19] leading-snug">
                    "{rev.title}"
                  </h4>

                  <p className="text-xs text-[#5C554B] leading-relaxed mt-2 font-sans">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#F2ECE1]">
                  <div className="font-semibold text-xs text-[#1F1C19]">
                    {rev.author}
                  </div>
                  <div className="text-[11px] font-mono text-[#8C8377]">
                    📍 {rev.location}
                  </div>
                  <div className="text-[10px] font-mono text-[#8C6D3B] mt-0.5">
                    {rev.garmentSpec}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Workshop FAQ Accordion */}
        <section className="bg-[#F4EFE7] border-t border-[#E3DBD0] py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center space-y-1.5 mb-8">
              <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D3B] font-semibold">
                {isArabic ? 'الأسئلة الشائعة' : 'Questions Fréquentes'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C19]">
                {isArabic ? 'كل ما تود معرفته عن الشحن والطلبيات' : 'Livraison, Tailles & Tarifs Gros'}
              </h2>
            </div>

            <div className="space-y-3">
              {WORKSHOP_FAQS.map((faq, idx) => {
                const isOpen = faqExpanded === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#DDD4C5] rounded bg-white overflow-hidden"
                  >
                    <button
                      onClick={() => setFaqExpanded(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between text-xs sm:text-sm font-medium text-[#1F1C19] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      <span className="font-serif text-sm sm:text-base font-semibold">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7C756B] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-[#595246] leading-relaxed border-t border-[#F2ECE1] pt-3 animate-in fade-in-50 duration-150 font-sans">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Workshop Footer */}
      <Footer
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setCurrentPath('/admin');
        }}
        onOpenOrderLookup={() => handleOpenOrderLookup('')}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('collection-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* Modals */}
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
        orderNotes={orderNotes}
        onOrderNotesChange={setOrderNotes}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
      />

      {/* 3. Checkout Modal with 58 Algerian Wilayas & COD / BaridiMob */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currency={currency}
        appliedDiscountPct={appliedDiscountPct}
        orderNotes={orderNotes}
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
