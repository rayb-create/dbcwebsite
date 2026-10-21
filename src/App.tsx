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
import { Language, TRANSLATIONS, getCategoryLabel } from './data/i18n';
import { formatPrice, parseNumericPrice } from './utils/format';
import { useAuth } from './context/AuthContext';
import { 
  subscribeProducts, 
  subscribeStoreSettings, 
  subscribeOrders, 
  subscribeMedia,
  saveProductToDb,
  deleteProductFromDb,
  saveOrderToDb,
  deleteOrderFromDb,
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
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // 4. Workshop Store Settings & Contacts State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('dbc_store_settings');
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed === 'object' ? { ...DEFAULT_STORE_SETTINGS, ...parsed } : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // Cart & Wishlist states
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dbc_cart');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
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
  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setFabricFilter('all');
    setTimeout(() => {
      if (cat === 'all') {
        const el = document.getElementById('collection-grid');
        if (el) {
          const headerOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
        }
      } else {
        const el = document.getElementById('collection-grid');
        if (el) {
          const headerOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
        }
      }
    }, 60);
  };

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
    customPrice?: number,
    quantityToAdd: number = 1
  ) => {
    const selectedColor = product.colors?.[colorIndex] || product.colors?.[0] || { name: 'Standard', hex: '#1C1C1C' };
    const parsedCustomPrice = parseNumericPrice(customPrice);
    const parsedProductPrice = parseNumericPrice(product?.price);
    const parsedWholesalePrice = parseNumericPrice((product as any)?.b2bPrice) ?? parseNumericPrice(product?.wholesalePriceDzd);

    const unitPrice = parsedCustomPrice ?? parsedProductPrice ?? parsedWholesalePrice ?? 6000;
    const cartItemId = `${product.id}-${size}-${selectedColor.name}`;
    const qty = Math.max(1, parseNumericPrice(quantityToAdd) ?? 1);

    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + qty, pricePerUnit: unitPrice }
            : item
        );
      }
      const newItem: CartItem = {
        cartItemId,
        productId: product.id,
        product: {
          ...product,
          price: parsedProductPrice ?? unitPrice,
        },
        size,
        color: selectedColor,
        quantity: qty,
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
    const subtotal = parseNumericPrice(newOrder.subtotal) ?? 0;
    const shipping = parseNumericPrice(newOrder.shipping) ?? parseNumericPrice((newOrder as any).shippingCost) ?? 0;
    const discount = parseNumericPrice(newOrder.discount) ?? 0;
    const computedTotal = parseNumericPrice(newOrder.total) ?? Math.max(0, (subtotal - discount) + shipping);

    const sanitizedOrder: Order = {
      ...newOrder,
      subtotal,
      shipping,
      discount,
      total: computedTotal,
    };
    (sanitizedOrder as any).shippingCost = shipping;

    setOrders((prev) => [sanitizedOrder, ...prev]);
    saveOrderToDb(sanitizedOrder).catch((err) => console.error('Error saving order to Firestore:', err));
    setCartItems([]);
    showToast(isArabic ? 'تم تسجيل طلبيتك بنجاح! سنتصل بك لتأكيد الشحن.' : 'Commande enregistrée avec succès !');
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!isAdmin) {
      console.warn('[Orders] Unauthorized deletion attempt blocked.');
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await deleteOrderFromDb(orderId);
      showToast(isArabic ? 'تم حذف الطلبية بنجاح.' : 'Commande supprimée avec succès.');
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
    <div className={`w-full max-w-full overflow-x-hidden min-h-screen flex flex-col bg-[#FFFFFF] text-[#1F1C19] ${isArabic ? 'font-sans' : ''}`}>
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] bg-[#1F1D1A] text-white px-5 py-2.5 rounded shadow-2xl border border-white/20 text-xs font-sans flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
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
              currentLanguage === 'ar' ? 'تم تحديث إعدادات واجهة الموقع بنجاح' : 'Paramètres de la couverture mis à jour avec succès'
            );
            setTimeout(() => setToastMessage(null), 3500);
          }}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
          mediaAssets={mediaAssets}
          isAdmin={Boolean(currentUser && isAdmin)}
          isSettingsLoaded={isSettingsLoaded}
        />

        {/* Collection Section */}
        <section id="collection-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E8E1D5]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans tracking-widest text-[#737373] uppercase font-semibold">
                  {t.subTagline || t.tagline}
                </span>
                <span className="text-[11px] font-mono text-[#111111] bg-[#F3F3F1] border border-[#E6E6E6] px-2 py-0.5">
                  {filteredProducts.length} {isArabic ? 'منتج معروض' : currentLanguage === 'en' ? 'Items' : currentLanguage === 'es' ? 'Artículos' : 'Articles'}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C19] mt-1 capitalize">
                {activeCategory === 'all'
                  ? t.winterCollectionHeader
                  : activeCategory === 'b2b'
                  ? (isArabic ? 'عرض خاص لتجارة الجملة (B2B)' : currentLanguage === 'en' ? 'Special B2B Wholesale Offer' : currentLanguage === 'es' ? 'Oferta Mayorista B2B' : 'Offre Spéciale Vente en Gros (B2B)')
                  : getCategoryLabel(activeCategory, currentLanguage, storeSettings.customCategories)}
              </h2>
            </div>

            {/* Quick Action & Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Quick Filter */}
              <div className="flex items-center gap-2 bg-[#F3F3F1] px-3 py-2 border border-[#E6E6E6] text-xs font-mono">
                <span className="text-[#737373]">{t.filterAll} :</span>
                <select
                  value={activeCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="bg-transparent text-[#111111] font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">{t.navAll}</option>
                  <option value="hoodies">{t.navHoodies}</option>
                  <option value="joggers">{t.navJoggers}</option>
                  <option value="longsleeves">{t.navLongSleeves}</option>
                  <option value="tees">{t.navTees}</option>
                  <option value="tracksuits">{t.navTracksuits}</option>
                  <option value="outerwear">{t.navOuterwear || (isArabic ? 'سترات ومعاطف' : currentLanguage === 'es' ? 'Chaquetas y Abrigos' : currentLanguage === 'en' ? 'Outerwear' : 'Vestes & Manteaux')}</option>
                  {storeSettings.customCategories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isArabic ? (cat.nameAr || cat.name) : currentLanguage === 'es' ? (cat.nameEs || cat.name) : currentLanguage === 'en' ? (cat.nameEn || cat.name) : cat.name}
                    </option>
                  ))}
                  <option value="b2b">{t.navB2B}</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 bg-[#F3F3F1] px-3 py-2 border border-[#E6E6E6] text-xs font-mono">
                <span className="text-[#737373]">{t.sortBy} :</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[#111111] font-bold focus:outline-none cursor-pointer"
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
                className="text-xs font-sans text-[#111111] font-bold hover:underline cursor-pointer ml-1"
              >
                {isArabic ? 'إعادة ضبط' : currentLanguage === 'en' ? 'Reset' : currentLanguage === 'es' ? 'Restablecer' : 'Réinitialiser'}
              </button>
            </div>
          )}

          {/* Product Grid or Onboarding Empty Catalog State */}
          {products.length === 0 ? (
            <div className="py-16 px-6 max-w-xl mx-auto my-8 bg-white border border-[#E0D7C9] rounded-lg text-center shadow-xs space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#F3F3F1] border border-[#E6E6E6] flex items-center justify-center text-[#111111]">
                <Plus className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-2xl font-semibold text-[#1F1C19]">
                  {isArabic ? 'كتالوج ورشتك جاهز لاستقبال منتجاتك' : currentLanguage === 'en' ? 'Your catalog is ready for your garments' : currentLanguage === 'es' ? 'Su catálogo está listo para sus confecciones' : 'Votre catalogue est prêt pour vos confections'}
                </h3>
                <p className="text-xs text-[#7A7367] max-w-md mx-auto leading-relaxed">
                  {isAdmin
                    ? (isArabic
                      ? 'تم تفريغ المقالات السابقة بنجاح. أضف الآن مقالاتك وملابسك الخاصة مع صورك، الأسعار بالدينار الجزائري، المقاسات، والألوان.'
                      : currentLanguage === 'en'
                      ? 'Previous items cleared. You can now add your own apparel with photos, DZD prices, sizes, and colors.'
                      : currentLanguage === 'es'
                      ? 'Artículos anteriores eliminados. Puede agregar sus prendas con fotos, precios en DZD, tallas y colores.'
                      : 'Les articles précédents ont été retirés. Vous pouvez dès maintenant ajouter vos propres vêtements, photos, prix en DZD, tailles et couleurs.')
                    : (isArabic
                      ? 'تشكيلة ملابس جديدة ومميزة قيد التحضير والتجهيز حالياً في ورشتنا. تواصل معنا للاستفسار أو الطلب المباشر.'
                      : currentLanguage === 'en'
                      ? 'A new apparel collection is being prepared at our workshop. Contact us for inquiries or direct orders.'
                      : currentLanguage === 'es'
                      ? 'Una nueva colección de confección se está preparando en nuestro taller. Contáctenos para pedidos.'
                      : 'Notre nouvelle collection de confections est actuellement en préparation à l’atelier. Contactez-nous pour toute demande ou commande personnalisée.')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsContactOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#1F1D1A] text-white text-xs font-mono font-bold rounded hover:bg-[#3D3730] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>{isArabic ? 'تواصل مع الورشة' : currentLanguage === 'en' ? 'Contact the Workshop' : currentLanguage === 'es' ? 'Contactar el Taller' : 'Contacter l’atelier'}</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={handleResetDefaultProducts}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#F3F3F1] hover:bg-[#E6E6E6] text-[#111111] border border-[#E6E6E6] text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Charger des modèles"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isArabic ? 'عرض نماذج الورشة' : currentLanguage === 'en' ? 'Load Sample Garments' : currentLanguage === 'es' ? 'Cargar Modelos' : 'Charger des modèles'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Layers className="w-10 h-10 text-[#C9BFB0] mx-auto" />
              <h3 className="font-serif text-xl font-medium text-[#1F1C19]">
                {isArabic ? 'لا توجد منتجات مطابقة لهذا الفلتر' : currentLanguage === 'en' ? 'No products match these filters' : currentLanguage === 'es' ? 'Ningún producto coincide con estos criterios' : 'Aucun produit ne correspond à ces critères'}
              </h3>
              <p className="text-xs text-[#7A7367] max-w-sm mx-auto">
                {isArabic
                  ? 'يرجى تجربة فلتر آخر أو إعادة ضبط البحث للاطلاع على كافة معروضات الورشة.'
                  : currentLanguage === 'en'
                  ? 'Try modifying your search or filter criteria to discover our garments.'
                  : currentLanguage === 'es'
                  ? 'Intente modificar su búsqueda o filtros para descubrir nuestras confecciones.'
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
                  {isArabic ? 'عرض جميع المنتجات' : currentLanguage === 'en' ? 'View All Collection' : currentLanguage === 'es' ? 'Ver Toda la Colección' : 'Voir toute la collection'}
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
        <section className="bg-[#111111] text-[#FFFFFF] py-16 sm:py-24 border-y border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-3.5">
                <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-widest">
                  <Building2 className="w-4 h-4" />
                  <span>{t.b2bSectionTitle}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-medium tracking-tight">
                  {isArabic
                    ? 'أصحاب المحلات وموزعي الملابس في الجزائر؟'
                    : currentLanguage === 'en'
                    ? 'Retail Store Owner or Clothing Distributor in Algeria?'
                    : currentLanguage === 'es'
                    ? '¿Tiene una tienda de ropa en Argelia?'
                    : 'Vous possédez une boutique de vêtements en Algérie ?'} <br />
                  <span className="italic text-white">
                    {isArabic
                      ? 'وفر لزبائنك تشكيلة ملابس ذات جودة تصنيع عالية وأسعار جملة منافسة.'
                      : currentLanguage === 'en'
                      ? 'Enjoy factory wholesale prices starting from 6 pieces per style.'
                      : currentLanguage === 'es'
                      ? 'Aproveche nuestras tarifas mayoristas de fábrica desde 6 piezas.'
                      : 'Profitez de nos tarifs de confection usine B2B dès 6 pièces.'}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-[#BDB5AA] max-w-2xl leading-relaxed">
                  {t.b2bSectionDesc || t.b2bSectionSubtitle}
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                <button
                  id="open-b2b-modal-cta"
                  onClick={() => setIsB2BOpen(true)}
                  className="w-full px-6 py-4 bg-white hover:bg-[#F3F3F1] text-[#111111] text-xs font-sans uppercase tracking-widest font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isArabic ? 'طلب تسعيرة الجملة والكتالوج (B2B)' : currentLanguage === 'en' ? 'Request B2B Wholesale Pricing' : currentLanguage === 'es' ? 'Solicitar Precios B2B' : 'Demander Tarifs Gros & B2B'}</span>
                </button>

                <button
                  id="open-contact-modal-cta"
                  onClick={() => setIsContactOpen(true)}
                  className="w-full px-6 py-3.5 border border-white/20 text-white hover:bg-white/10 text-xs font-sans uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-white" />
                  <span>{t.navContact} ({storeSettings.phone})</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 69 Wilayas Coverage & Delivery Guarantees */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-[#E6E6E6]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#F8F8F7] border border-[#E6E6E6] space-y-3">
              <div className="w-10 h-10 bg-white border border-[#E6E6E6] flex items-center justify-center text-[#111111]">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {t.delivery58Wilayas}
              </h3>
              <p className="text-xs text-[#6E6659] leading-relaxed font-sans">
                {isArabic
                  ? 'تغطية شاملة لكافة الولايات الجزائرية الـ 69 من الشمال إلى الجنوب، مع خياري التوصيل للمنزل أو الاستلام من المكتب (StopDesk).'
                  : currentLanguage === 'en'
                  ? 'Fast shipping across all 69 Wilayas of Algeria with home delivery or StopDesk pickup options.'
                  : currentLanguage === 'es'
                  ? 'Envíos rápidos a las 69 wilayas de Argelia con entrega a domicilio o punto StopDesk.'
                  : 'Expédition rapide vers toutes les 69 wilayas d’Algérie avec option livraison à domicile ou retrait en bureau StopDesk.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenOrderLookup('')}
                  className="text-xs font-sans font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'تتبع طلبيتك أو اكتشف جدول التعريفات ←' : currentLanguage === 'en' ? 'Track order & view shipping rates →' : currentLanguage === 'es' ? 'Seguir pedido y ver tarifas →' : 'Suivre une commande & voir les tarifs →'}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-white border border-[#E6E6E6] rounded space-y-2">
              <div className="w-10 h-10 rounded bg-white border border-[#E6E6E6] flex items-center justify-center text-[#111111]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {isArabic ? 'بيع بالتجزئة وبالجملة' : currentLanguage === 'en' ? 'Retail (B2C) & Wholesale (B2B)' : currentLanguage === 'es' ? 'Venta al Detalle (B2C) y por Mayor (B2B)' : 'Vente B2C (Détail) & B2B (Gros)'}
              </h3>
              <p className="text-xs text-[#6E6659] leading-relaxed font-sans">
                {isArabic
                  ? 'اشتري قطعة واحدة لنفسك أو اطلب كميات تجارية لمتاجرك بأسعار جملة مخفضة مع حرية اختيار المقاسات والألوان.'
                  : currentLanguage === 'en'
                  ? 'Order single pieces for yourself or supply your boutiques with preferential factory reseller rates.'
                  : currentLanguage === 'es'
                  ? 'Compre prendas individuales o abastezca sus tiendas con precios mayoristas preferenciales.'
                  : 'Commandez pour vous-même à l’unité ou approvisionnez vos magasins avec nos tarifs revendeurs préférentiels.'}
              </p>
            </div>

            <div className="p-5 bg-white border border-[#E6E6E6] rounded space-y-2">
              <div className="w-10 h-10 rounded bg-white border border-[#E6E6E6] flex items-center justify-center text-[#111111]">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#1F1C19]">
                {isArabic ? 'طلب سريع ومباشر عبر واتساب' : currentLanguage === 'en' ? 'Direct Order via WhatsApp' : currentLanguage === 'es' ? 'Pedido Directo por WhatsApp' : 'Commande Directe via WhatsApp'}
              </h3>
              <p className="text-xs text-[#6E6659] leading-relaxed font-sans">
                {isArabic
                  ? 'تواصل معنا في أي وقت لتأكيد طلبيتك، اختيار الألوان، أو معرفة حالة الإرسالية مع فريق خدمة العملاء.'
                  : currentLanguage === 'en'
                  ? 'Responsive customer care on WhatsApp at ' + storeSettings.phone + ' to advise you and confirm your orders.'
                  : currentLanguage === 'es'
                  ? 'Atención al cliente rápida por WhatsApp al ' + storeSettings.phone + ' para asesorarle en sus compras.'
                  : 'Un service client réactif disponible sur WhatsApp au ' + storeSettings.phone + ' pour vous conseiller et confirmer vos expéditions.'}
              </p>
            </div>
          </div>
        </section>

        {/* Client Reviews */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E6E6E6]">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#737373]">
              {isArabic ? 'آراء وتجارب الزبائن في الجزائر' : currentLanguage === 'en' ? 'Customer Reviews & Feedback in Algeria' : currentLanguage === 'es' ? 'Opiniones y Reseñas de Clientes en Argelia' : 'Avis & Témoignages Clients en Algérie'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C19]">
              {isArabic ? 'جودة تصنيع موثوقة عبر كافة الولايات' : currentLanguage === 'en' ? 'Trusted Craftsmanship Across All Wilayas' : currentLanguage === 'es' ? 'Calidad de Confección Confiable en Toda Argelia' : 'Recommandé par les particuliers et boutiques'}
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
                      {currentLanguage === 'ar' ? (rev.dateAr || rev.date) : currentLanguage === 'en' ? (rev.dateEn || rev.date) : currentLanguage === 'es' ? (rev.dateEs || rev.date) : rev.date}
                    </span>
                  </div>

                  <h4 className="font-serif text-sm font-semibold text-[#1F1C19] leading-snug">
                    "{currentLanguage === 'ar' ? (rev.titleAr || rev.title) : currentLanguage === 'en' ? (rev.titleEn || rev.title) : currentLanguage === 'es' ? (rev.titleEs || rev.title) : rev.title}"
                  </h4>

                  <p className="text-xs text-[#5C554B] leading-relaxed mt-2 font-sans">
                    {currentLanguage === 'ar' ? (rev.commentAr || rev.comment) : currentLanguage === 'en' ? (rev.commentEn || rev.comment) : currentLanguage === 'es' ? (rev.commentEs || rev.comment) : rev.comment}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#F2ECE1]">
                  <div className="font-semibold text-xs text-[#1F1C19]">
                    {rev.author}
                  </div>
                  <div className="text-[11px] font-mono text-[#8C8377]">
                    📍 {currentLanguage === 'ar' ? (rev.locationAr || rev.location) : rev.location}
                  </div>
                  <div className="text-[10px] font-mono text-[#737373] mt-0.5">
                    {currentLanguage === 'ar' ? (rev.garmentSpecAr || rev.garmentSpec) : currentLanguage === 'en' ? (rev.garmentSpecEn || rev.garmentSpec) : currentLanguage === 'es' ? (rev.garmentSpecEs || rev.garmentSpec) : rev.garmentSpec}
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
              <span className="text-xs font-sans uppercase tracking-widest text-[#737373] font-semibold">
                {isArabic ? 'الأسئلة الشائعة' : currentLanguage === 'en' ? 'Frequently Asked Questions' : currentLanguage === 'es' ? 'Preguntas Frecuentes' : 'Questions Fréquentes'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1F1C19]">
                {isArabic ? 'كل ما تود معرفته عن الشحن والطلبيات' : currentLanguage === 'en' ? 'Delivery, Sizes & Wholesale Pricing' : currentLanguage === 'es' ? 'Envíos, Tallas y Tarifas Mayoristas' : 'Livraison, Tailles & Tarifs Gros'}
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
                      className="w-full px-5 py-4 text-left rtl:text-right flex items-center justify-between text-xs sm:text-sm font-medium text-[#1F1C19] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                    >
                      <span className="font-serif text-sm sm:text-base font-semibold">
                        {currentLanguage === 'ar' ? (faq.questionAr || faq.question) : currentLanguage === 'en' ? (faq.questionEn || faq.question) : currentLanguage === 'es' ? (faq.questionEs || faq.question) : faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7C756B] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-[#595246] leading-relaxed border-t border-[#F2ECE1] pt-3 animate-in fade-in-50 duration-150 font-sans">
                        {currentLanguage === 'ar' ? (faq.answerAr || faq.answer) : currentLanguage === 'en' ? (faq.answerEn || faq.answer) : currentLanguage === 'es' ? (faq.answerEs || faq.answer) : faq.answer}
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
        currentLanguage={currentLanguage}
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
        currentLanguage={currentLanguage}
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
