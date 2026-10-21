import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  SlidersHorizontal, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Heart
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
  Order, 
  StoreSettings, 
  Currency, 
  MediaAsset 
} from './types';
import { PRODUCTS, REVIEWS, WORKSHOP_FAQS } from './data/products';
import { DEFAULT_STORE_SETTINGS } from './data/storeSettings';
import { Language, TRANSLATIONS, getCategoryLabel } from './data/i18n';
import { formatPrice, parseNumericPrice } from './utils/format';
import { useAuth } from './context/AuthContext';
import { 
  subscribeProducts, 
  subscribeOrders, 
  subscribeStoreSettings, 
  subscribeMedia,
  saveOrderToDb,
  saveProductToDb,
  deleteProductFromDb,
  saveStoreSettingsToDb,
  deleteOrderFromDb,
  initializeWorkshopDatabase
} from './services/db';
import { compressBase64Image } from './utils/imageCompressor';

export function App() {
  // Multilingual & Currency configuration
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('dbc_language');
      if (saved === 'ar' || saved === 'fr' || saved === 'en' || saved === 'es') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'fr';
  });

  const [currency, setCurrency] = useState<Currency>('DZD');

  // Core Data States with localStorage fallback & Firestore live subscriptions
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('dbc_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STORE_SETTINGS, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_custom_products_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_cart');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_wishlist');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_orders');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
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
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      const search = window.location.search;
      if (
        hash === '#admin' ||
        hash === '#/admin' ||
        hash.startsWith('#admin') ||
        hash.startsWith('#/admin') ||
        pathname.startsWith('/admin') ||
        pathname.endsWith('/admin') ||
        pathname.includes('/admin') ||
        search.includes('/admin') ||
        search.includes('admin')
      ) {
        return '/admin';
      }
      return pathname;
    }
    return '/';
  });
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

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  // Save language selection to localStorage
  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('dbc_language', lang);
    } catch {
      // fallback
    }
  };

  // Sync cart & wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dbc_cart', JSON.stringify(cart));
    } catch {
      // fallback
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('dbc_wishlist', JSON.stringify(wishlist));
    } catch {
      // fallback
    }
  }, [wishlist]);

  // Listen to browser navigation changes & hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      const search = window.location.search;
      if (
        hash === '#admin' ||
        hash === '#/admin' ||
        hash.startsWith('#admin') ||
        hash.startsWith('#/admin') ||
        pathname.startsWith('/admin') ||
        pathname.endsWith('/admin') ||
        pathname.includes('/admin') ||
        search.includes('/admin') ||
        search.includes('admin')
      ) {
        setCurrentPath('/admin');
      } else {
        setCurrentPath(pathname);
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
        setIsSettingsLoaded(true);
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
      unsubMedia();
      unsubOrders();
    };
  }, [isAdmin]);

  // Dynamic Page Title & Meta Description based on storeSettings
  useEffect(() => {
    if (storeSettings.seoTitle) {
      document.title = storeSettings.seoTitle;
    } else {
      document.title = 'DBC Workshop Algérie | Atelier de Confection Textile & Streetwear';
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && storeSettings.seoDescription) {
      metaDesc.setAttribute('content', storeSettings.seoDescription);
    }
  }, [storeSettings]);

  // Cart operations
  const handleAddToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, size, color, quantity }];
    });

    setToastMessage(
      isArabic
        ? `تمت إضافة ${product.name} إلى حقيبة التسوق`
        : `${product.name} ajouté au panier`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(index);
      return;
    }
    setCart((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], quantity };
      return next;
    });
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist toggle
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      const prod = products.find((p) => p.id === productId);
      const name = prod ? prod.name : 'Produit';

      setToastMessage(
        exists
          ? (isArabic ? `تمت إزالة ${name} من قائمة الرغبات` : `${name} retiré des favoris`)
          : (isArabic ? `تمت إضافة ${name} إلى قائمة الرغبات` : `${name} ajouté aux favoris`)
      );
      setTimeout(() => setToastMessage(null), 2500);
      return next;
    });
  };

  // Checkout submission
  const handleOrderSubmitted = async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    handleClearCart();

    try {
      const savedOrders = localStorage.getItem('dbc_orders');
      const parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];
      localStorage.setItem('dbc_orders', JSON.stringify([order, ...parsedOrders]));
    } catch {
      // fallback
    }

    try {
      await saveOrderToDb(order);
    } catch (err) {
      console.warn('[Orders] Notice: could not persist order to Firestore:', err);
    }

    setToastMessage(
      isArabic
        ? `تم استلام طلبك بنجاح! رقم الطلب: ${order.orderNumber}`
        : `Commande ${order.orderNumber} enregistrée avec succès !`
    );
    setTimeout(() => setToastMessage(null), 6000);
  };

  // Direct order lookup trigger
  const handleOpenOrderLookup = (initialQuery: string = '') => {
    setOrderLookupQuery(initialQuery);
    setIsOrderLookupOpen(true);
  };

  // Category navigation click
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    const el = document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Available custom and standard categories
  const allCategoryDefinitions = useMemo(() => {
    const builtIn = [
      { id: 'all', label: t.navAll },
      { id: 'hoodies', label: t.navHoodies },
      { id: 'joggers', label: t.navJoggers },
      { id: 'long-sleeves', label: t.navLongSleeves },
      { id: 'tees', label: t.navTees },
      { id: 'tracksuits', label: t.navTracksuits },
      { id: 'outerwear', label: t.navOuterwear },
      { id: 'b2b', label: t.navB2B },
    ];

    const custom = (storeSettings?.customCategories || []).map((cat) => ({
      id: cat.id,
      label: currentLanguage === 'ar'
        ? (cat.nameAr || cat.name)
        : currentLanguage === 'en'
        ? (cat.nameEn || cat.name)
        : currentLanguage === 'es'
        ? (cat.nameEs || cat.name)
        : (cat.name || cat.id)
    }));

    return [...builtIn, ...custom];
  }, [t, currentLanguage, storeSettings?.customCategories]);

  // Unique fabrics found in product list for filtering
  const availableFabrics = useMemo(() => {
    const fabrics = new Set<string>();
    products.forEach((p) => {
      if (p.fabric) fabrics.add(p.fabric);
    });
    return Array.from(fabrics);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Only show published products unless an admin is browsing
        if (p.isPublished === false && !isAdmin) return false;

        // Category filter
        if (activeCategory === 'b2b') {
          if (!p.isB2B && !p.category?.toLowerCase().includes('b2b')) return false;
        } else if (activeCategory !== 'all') {
          const catLower = (p.category || '').toLowerCase();
          const targetLower = activeCategory.toLowerCase();
          if (catLower !== targetLower && !catLower.includes(targetLower)) {
            return false;
          }
        }

        // Fabric filter
        if (fabricFilter !== 'all' && p.fabric !== fabricFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchCategory = (p.category || '').toLowerCase().includes(q);
          const matchGsm = p.gsm ? `${p.gsm}`.includes(q) : false;
          const matchColors = p.colors ? p.colors.some((c) => c.name.toLowerCase().includes(q)) : false;

          if (!matchName && !matchDesc && !matchCategory && !matchGsm && !matchColors) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          return parseNumericPrice(a.price) - parseNumericPrice(b.price);
        }
        if (sortBy === 'price-desc') {
          return parseNumericPrice(b.price) - parseNumericPrice(a.price);
        }
        if (sortBy === 'newest') {
          return (b.id || '').localeCompare(a.id || '');
        }
        // 'featured': preserves natural catalogue order
        return 0;
      });
  }, [products, activeCategory, fabricFilter, searchQuery, sortBy, isAdmin]);

  // Admin Data Sync Handlers
  const handleSaveProduct = async (product: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      let updated: Product[];
      if (idx > -1) {
        updated = [...prev];
        updated[idx] = product;
      } else {
        updated = [product, ...prev];
      }
      try {
        localStorage.setItem('dbc_custom_products_v3', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }
      return updated;
    });

    try {
      await saveProductToDb(product);
    } catch (err) {
      console.warn('[Products] Notice: could not persist product to Firestore:', err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('dbc_custom_products_v3', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not update localStorage:', e);
      }
      return updated;
    });

    try {
      await deleteProductFromDb(productId);
    } catch (err) {
      console.warn('[Products] Notice: could not delete product from Firestore:', err);
    }
  };

  const handleUpdateStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    try {
      localStorage.setItem('dbc_store_settings', JSON.stringify(newSettings));
    } catch {
      // fallback
    }
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
      try {
        localStorage.setItem('dbc_orders', JSON.stringify(next));
      } catch {
        // fallback
      }
      return next;
    });
  };

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem('dbc_orders', JSON.stringify(newOrders));
    } catch {
      // fallback
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      try {
        localStorage.setItem('dbc_orders', JSON.stringify(next));
      } catch {
        // fallback
      }
      return next;
    });

    try {
      await deleteOrderFromDb(orderId);
    } catch (err) {
      console.error('[Orders] Failed to delete order from Firestore:', err);
    }
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
        onDeleteOrder={isAdmin ? handleDeleteOrder : undefined}
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
          const basePath = window.location.pathname.includes('/dbcwebsite') ? '/dbcwebsite/' : '/';
          window.history.pushState({}, '', basePath);
          setCurrentPath(basePath);
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
    <div className={`w-full max-w-full overflow-x-hidden min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F1C19] ${isArabic ? 'font-sans' : ''}`}>
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] bg-[#1F1D1A] text-white px-5 py-2.5 rounded shadow-2xl border border-[#C9A96E] text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenOrderLookup={() => handleOpenOrderLookup('')}
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        storeSettings={storeSettings}
      />

      <main className="w-full max-w-full flex-1 overflow-x-hidden">
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
              currentLanguage === 'ar' 
                ? 'تم حفظ إعدادات الواجهة الرئيسية بنجاح' 
                : 'Paramètres du Hero Banner enregistrés avec succès'
            );
            setTimeout(() => setToastMessage(null), 3500);
          }}
          storeSettings={storeSettings}
          currentLanguage={currentLanguage}
        />

        {/* Collection & Filter Section */}
        <section 
          id="collection-grid" 
          className="w-full max-w-full overflow-hidden py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#E8E1D5] gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C9A96E]"></span>
                <span className="text-xs font-mono tracking-widest text-[#8C6D3B] uppercase font-bold">
                  {t.tagline}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#1F1D1A] font-medium tracking-tight">
                {activeCategory === 'all' 
                  ? t.navAll 
                  : getCategoryLabel(activeCategory, currentLanguage, storeSettings?.customCategories)}
              </h2>
              <p className="text-xs sm:text-sm text-[#787167] mt-1 font-sans">
                {activeCategory === 'b2b' 
                  ? (isArabic ? 'عروض الجملة وتصنيع الملابس للشركات والمحلات بأسعار الورشة المباشرة' : 'Packs revendeurs et confection sur-mesure pour boutiques et marques à travers 69 wilayas')
                  : (isArabic ? 'ملابس مصنعة بأعلى معايير الحياكة والأقمشة الثقيلة' : 'Confection haut de gamme en molleton lourd et finitions soignées')}
              </p>
            </div>

            {/* Total Results Count */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#8C8377] uppercase tracking-wider">
                {filteredProducts.length}{' '}
                {isArabic ? 'منتج متاح' : filteredProducts.length === 1 ? 'pièce disponible' : 'pièces disponibles'}
              </span>
            </div>
          </div>

          {/* Filtering Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 bg-[#F4EFEA] p-3 sm:p-4 rounded border border-[#E6DEC8]">
            {/* Horizontal Categories Scroll */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none w-full lg:w-auto">
              {allCategoryDefinitions.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#1F1D1A] text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-[#EAE4D9] text-[#5A5247] border border-[#DDD4C5]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Filter by Fabric & Sort */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-end sm:self-auto w-full lg:w-auto justify-between lg:justify-end">
              {/* Fabric Select */}
              {availableFabrics.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xs border border-[#DDD4C5] text-xs font-mono">
                  <Filter className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <select
                    value={fabricFilter}
                    onChange={(e) => setFabricFilter(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer text-[#1F1D1A]"
                    aria-label="Filtrer par matière"
                  >
                    <option value="all">
                      {isArabic ? 'كافة الأقمشة' : 'Toutes les matières'}
                    </option>
                    {availableFabrics.map((fab) => (
                      <option key={fab} value={fab}>
                        {fab}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort Order Select */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xs border border-[#DDD4C5] text-xs font-mono">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent focus:outline-none cursor-pointer text-[#1F1D1A]"
                  aria-label="Trier la collection"
                >
                  <option value="featured">
                    {isArabic ? 'الترتيب: الافتراضي' : 'Tri: Recommandé'}
                  </option>
                  <option value="price-asc">
                    {isArabic ? 'السعر: من الأقل إلى الأعلى' : 'Prix: Croissant'}
                  </option>
                  <option value="price-desc">
                    {isArabic ? 'السعر: من الأعلى إلى الأقل' : 'Prix: Décroissant'}
                  </option>
                  <option value="newest">
                    {isArabic ? 'الأحدث أولاً' : 'Nouveautés'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Search Badge */}
          {searchQuery && (
            <div className="flex items-center gap-2 mb-6 p-2.5 bg-[#EDE6DB] rounded-xs text-xs font-mono text-[#5A5247]">
              <Search className="w-3.5 h-3.5 text-[#8C6D3B]" />
              <span>
                {isArabic ? `نتائج البحث عن:` : `Résultats pour :`}{' '}
                <strong>"{searchQuery}"</strong>
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="ml-auto underline hover:text-[#1F1D1A] cursor-pointer"
              >
                {isArabic ? 'إلغاء' : 'Effacer'}
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded border border-[#E8E1D5] p-8 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#DDD4C5] flex items-center justify-center mx-auto mb-4 text-[#8C6D3B]">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#1F1D1A]">
                {t.catalogEmptyTitle}
              </h3>
              <p className="text-xs text-[#787167] font-mono mt-1 mb-6 leading-relaxed">
                {t.catalogEmptyDesc}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setFabricFilter('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 bg-[#1F1D1A] text-white text-xs font-mono uppercase tracking-wider rounded-xs hover:bg-black transition-colors cursor-pointer"
              >
                {t.catalogResetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  currentLanguage={currentLanguage}
                  storeSettings={storeSettings}
                  onSelectProduct={(p) => {
                    setSelectedProduct(p);
                    setLastViewedProduct(p);
                  }}
                  onAddToCart={(p, size, color) => handleAddToCart(p, size, color, 1)}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={() => handleToggleWishlist(product.id)}
                  onDirectWhatsAppOrder={(p) => {
                    setWhatsAppCustomizerProduct(p);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* B2B / Wholesale Dedicated Banner */}
        <section className="w-full bg-[#191715] text-[#ECE7DF] py-14 sm:py-20 border-y border-[#36302A] overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2C2723] rounded-full text-[11px] font-mono text-[#C9A96E] border border-[#4A423A]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.heroB2BBtn}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
                  {isArabic 
                    ? 'البيع بالجملة وتفصيل الملابس للمحلات والماركات'
                    : 'Vente en Gros & Confection Sur-Mesure B2B'}
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-[#A8A196] leading-relaxed max-w-2xl font-sans">
                  {isArabic
                    ? 'نوفر لتجار الملابس والمحلات في كامل الـ 69 ولاية أسعار الجملة التفضيلية مباشرة من ورشة الخياطة، مع إمكانية التطريز الخاص والطباعة وإضافة علامتكم التجارية.'
                    : 'Bénéficiez de tarifs grossistes directs atelier à partir de 6 pièces par modèle. Personnalisation de broderie, sérigraphie haute densité et étiquetage de votre marque.'}
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setIsB2BOpen(true)}
                    className="px-6 py-3.5 bg-[#C9A96E] hover:bg-[#B89657] text-[#191715] text-xs font-mono uppercase tracking-widest font-bold rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>{t.navB2B}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="px-6 py-3.5 bg-transparent hover:bg-white/10 text-white text-xs font-mono uppercase tracking-widest font-semibold rounded-xs border border-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-[#C9A96E]" />
                    <span>{t.navContact}</span>
                  </button>
                </div>
              </div>

              {/* B2B Highlights */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 font-mono">
                <div className="p-4 sm:p-5 bg-[#24211E] border border-[#3D3730] rounded-sm">
                  <span className="text-xl sm:text-2xl font-bold text-[#C9A96E] block mb-1">
                    6+ pcs
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#A8A196] leading-snug block">
                    {isArabic ? 'الحد الأدنى لطلب الجملة' : 'Minimum de commande souple'}
                  </span>
                </div>
                <div className="p-4 sm:p-5 bg-[#24211E] border border-[#3D3730] rounded-sm">
                  <span className="text-xl sm:text-2xl font-bold text-[#C9A96E] block mb-1">
                    69
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#A8A196] leading-snug block">
                    {isArabic ? 'ولاية مغطاة بالشحن السريع' : 'Wilayas livrées à domicile & StopDesk'}
                  </span>
                </div>
                <div className="p-4 sm:p-5 bg-[#24211E] border border-[#3D3730] rounded-sm">
                  <span className="text-xl sm:text-2xl font-bold text-[#C9A96E] block mb-1">
                    100%
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#A8A196] leading-snug block">
                    {isArabic ? 'صناعة جزائرية بأقمشة ممتازة' : 'Confection atelier algérien'}
                  </span>
                </div>
                <div className="p-4 sm:p-5 bg-[#24211E] border border-[#3D3730] rounded-sm">
                  <span className="text-xl sm:text-2xl font-bold text-[#C9A96E] block mb-1">
                    Broderie
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#A8A196] leading-snug block">
                    {isArabic ? 'تخصيص الشعار والعلامة' : 'Personnalisation & Private Label'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[#E8E1D5]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono tracking-widest text-[#8C6D3B] uppercase font-bold">
              {isArabic ? 'آراء الزبائن والتجار' : 'Avis Clients & Partenaires'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1F1D1A] font-medium tracking-tight mt-1">
              {isArabic ? 'ثقة زبائننا عبر 69 ولاية' : 'La qualité éprouvée par nos clients'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev) => (
              <div 
                key={rev.id} 
                className="bg-white p-6 rounded border border-[#E8E1D5] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#C9A96E] mb-3">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#5A5247] italic font-sans leading-relaxed mb-4">
                    "{isArabic ? (rev.commentAr || rev.comment) : rev.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#1F1D1A]">{rev.author}</span>
                  <span className="text-[#8C8377]">{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono tracking-widest text-[#8C6D3B] uppercase font-bold">
              {isArabic ? 'الأسئلة الشائعة' : 'Questions Fréquentes'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1F1D1A] font-medium tracking-tight mt-1">
              {isArabic ? 'كل ما تحتاج معرفته عن الورشة والطلبيات' : 'Tout sur nos confections et livraisons'}
            </h2>
          </div>

          <div className="space-y-3">
            {WORKSHOP_FAQS.map((faq) => {
              const q = isArabic ? (faq.questionAr || faq.question) : faq.question;
              const a = isArabic ? (faq.answerAr || faq.answer) : faq.answer;
              return (
                <details
                  key={faq.id}
                  className="group bg-white rounded border border-[#E8E1D5] p-4.5 cursor-pointer open:bg-[#FDFBF7] transition-colors"
                >
                  <summary className="font-serif text-sm sm:text-base font-medium text-[#1F1D1A] flex items-center justify-between list-none">
                    <span>{q}</span>
                    <span className="text-xs font-mono text-[#8C6D3B] ml-2 group-open:rotate-90 transition-transform">
                      ▸
                    </span>
                  </summary>
                  <p className="text-xs sm:text-sm text-[#5A5247] mt-3 pt-3 border-t border-[#F0EAE1] font-sans leading-relaxed">
                    {a}
                  </p>
                </details>
              );
            })}
          </div>
        </section>
      </main>

      {/* Workshop Footer */}
      <Footer
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenOrderLookup={() => handleOpenOrderLookup('')}
        onSelectCategory={handleCategorySelect}
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
          onOpenWhatsAppInquiry={(prod) => {
            setSelectedProduct(null);
            setWhatsAppCustomizerProduct(prod);
          }}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          currentLanguage={currentLanguage}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onToggleWishlist={() => handleToggleWishlist(selectedProduct.id)}
          customCategories={storeSettings?.customCategories}
        />
      )}

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        currency={currency}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        currency={currency}
        storeSettings={storeSettings}
        onOrderComplete={handleOrderSubmitted}
        currentLanguage={currentLanguage}
      />

      {/* 4. Sizing Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        currentLanguage={currentLanguage}
      />

      {/* 5. Wishlist Drawer */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        products={products}
        currency={currency}
        onRemoveWishlist={handleToggleWishlist}
        onAddToCart={(prod, size, color) => handleAddToCart(prod, size, color, 1)}
        currentLanguage={currentLanguage}
      />

      {/* 6. Contact / Workshop Location Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* 7. B2B & Wholesale Modal */}
      <B2BWholesaleModal
        isOpen={isB2BOpen}
        onClose={() => setIsB2BOpen(false)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* 8. Order Tracking & Lookup Modal */}
      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        initialQuery={orderLookupQuery}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* 9. Direct Product WhatsApp Order Customizer */}
      {whatsAppCustomizerProduct && (
        <ProductWhatsAppModal
          isOpen={true}
          onClose={() => setWhatsAppCustomizerProduct(null)}
          product={whatsAppCustomizerProduct}
          currency={currency}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
        />
      )}

      {/* 10. Persistent Clean Floating WhatsApp Action Button */}
      <FloatingWhatsAppWidget
        currentlyViewedProduct={lastViewedProduct}
        currency={currency}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
        onOpenCustomWhatsAppModal={(prod) => setWhatsAppCustomizerProduct(prod)}
      />
    </div>
  );
}

export default App;
