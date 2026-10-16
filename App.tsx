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
