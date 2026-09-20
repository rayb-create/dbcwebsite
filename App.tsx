import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  MessageCircle, 
  Building2, 
  Phone, 
  ShieldCheck, 
  Truck, 
  Sliders, 
  Check, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  Package,
  Layers,
  Award,
  Clock,
  MapPin,
  Lock,
  Camera
} from 'lucide-react';

import { Product, CartItem, StoreSettings, Currency, MediaAsset, Order } from './types';
import { PRODUCTS, INITIAL_STORE_SETTINGS, SEED_ORDERS } from './data/mockData';
import { Language, TRANSLATIONS } from './data/i18n';
import { formatPrice } from './utils/format';
import { generateWhatsAppCheckoutUrl, generateWhatsAppCustomInquiryUrl } from './utils/whatsapp';

// Contexts
import { useAuth } from './context/AuthContext';

// Components
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistModal } from './components/WishlistModal';
import { ContactModal } from './components/ContactModal';
import { B2BInquiryModal } from './components/B2BInquiryModal';
import { OrderLookupModal } from './components/OrderLookupModal';
import { AdminModal } from './components/AdminModal';
import { AdminLogin } from './components/admin/AdminLogin';
import { FloatingWhatsAppWidget } from './components/FloatingWhatsAppWidget';
import { WorkshopStylistModal } from './components/WorkshopStylistModal';
import { Footer } from './components/Footer';

export function App() {
  // Authentication & Admin Context
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Internationalization & Preferences
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('dbc_language');
    return (saved as Language) || 'fr';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('dbc_currency');
    return (saved as Currency) || 'DZD';
  });

  // State: Store Settings with Local Persistence
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('dbc_store_settings');
    if (saved) {
      try {
        return { ...INITIAL_STORE_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    return INITIAL_STORE_SETTINGS;
  });

  // State: Products Catalog with Local Persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dbc_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved products', e);
      }
    }
    return PRODUCTS;
  });

  // State: Orders with Local Persistence & Initial Seeding
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dbc_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved orders', e);
      }
    }
    return SEED_ORDERS;
  });

  // State: Media Assets for Photo Library
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    const saved = localStorage.getItem('dbc_media_assets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved media', e);
      }
    }
    return [
      {
        id: 'media-hero-default',
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=2400&q=85',
        name: 'DBC Atelier Workshop & Confection',
        category: 'banner',
        tags: ['atelier', 'machines', 'hero'],
        uploadedAt: new Date().toISOString()
      },
      {
        id: 'media-hoodie-cotton',
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
        name: 'Heavy Cotton Hoodie Workshop',
        category: 'hoodies',
        tags: ['hoodie', 'coton'],
        uploadedAt: new Date().toISOString()
      }
    ];
  });

  // Shopping & Interaction State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('dbc_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
    return [];
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dbc_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
    return [];
  });

  // Catalog Filtering & UI Navigation State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentlyViewedProduct, setCurrentlyViewedProduct] = useState<Product | null>(null);

  // Modals Visibility State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isB2BOpen, setIsB2BOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [prefilledTrackingCode, setPrefilledTrackingCode] = useState<string>('');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('dbc_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('dbc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dbc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dbc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dbc_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('dbc_language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('dbc_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('dbc_media_assets', JSON.stringify(mediaAssets));
  }, [mediaAssets]);

  // Set HTML Direction based on Language
  const isArabic = currentLanguage === 'ar';
  const t = TRANSLATIONS[currentLanguage];

  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, isArabic]);

  // Toast Helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Cart Operations
  const handleAddToCart = (
    product: Product, 
    size: string, 
    color: string, 
    quantity = 1, 
    customNotes?: string
  ) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (customNotes) {
          updated[existingIndex].customNotes = customNotes;
        }
        return updated;
      }

      return [
        ...prev,
        {
          product,
          selectedSize: size,
          selectedColor: color,
          quantity,
          customNotes
        }
      ];
    });

    showToast(
      isArabic 
        ? `تمت إضافة "${product.name}" إلى السلة (${quantity})`
        : `Ajouté au panier : ${product.name} (${quantity})`
    );
  };

  const handleUpdateCartQuantity = (productId: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId, size, color);
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string, size: string, color: string) => {
    setCart(prev =>
      prev.filter(
        item => !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist Operations
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(isArabic ? 'تمت الإزالة من المفضلة' : 'Retiré des favoris');
        return prev.filter(id => id !== productId);
      } else {
        showToast(isArabic ? 'تمت الإضافة إلى المفضلة' : 'Ajouté aux favoris');
        return [...prev, productId];
      }
    });
  };

  // Product Management (Admin)
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === updatedProduct.id);
      if (exists) {
        return prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
      }
      return [updatedProduct, ...prev];
    });

    showToast(isArabic ? 'تم حفظ وتحديث المنتج بنجاح!' : 'Produit enregistré et mis à jour avec succès !');
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast(isArabic ? 'تم حذف المنتج من الكتالوج.' : 'Produit retiré du catalogue.');
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null);
    }
  };

  const handleResetCatalog = () => {
    setProducts(PRODUCTS);
    showToast(isArabic ? 'تم تحميل نماذج المنتجات الاسترشادية.' : 'Modèles d’exemples chargés.');
  };

  const handleClearCatalog = () => {
    setProducts([]);
    setCart([]);
    setWishlistIds([]);
    localStorage.removeItem('dbc_products');
    localStorage.removeItem('dbc_cart');
    localStorage.removeItem('dbc_wishlist');
    showToast(isArabic ? 'تم تفريغ كتالوج المنتجات بنجاح.' : 'Catalogue vidé avec succès.');
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    showToast(isArabic ? 'تم حفظ بيانات الاتصال والورشة بنجاح!' : 'Coordonnées de l’atelier mises à jour !');
  };

  const handleUpdateHeroSettings = (updates: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({
      ...prev,
      ...updates
    }));
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
    showToast(isArabic ? 'تم تحديث حالة ومعلومات الطلبية بنجاح' : 'Commande et suivi mis à jour avec succès');
  };

  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    showToast(isArabic ? 'تم تحديث قائمة الطلبيات بنجاح' : 'Commandes mises à jour avec succès');
  };

  const handleOpenOrderLookup = (trackingCode?: string) => {
    if (trackingCode) {
      setPrefilledTrackingCode(trackingCode);
    }
    setIsOrderLookupOpen(true);
  };

  // Filtered Products Memo
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category Filter
      if (activeCategory !== 'all' && p.category !== activeCategory) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesGsm = p.fabricGsm?.toString().includes(q);
        return matchesName || matchesDesc || matchesCat || matchesGsm;
      }

      return true;
    });
  }, [products, activeCategory, searchQuery]);

  // Wishlist Products List
  const wishlistProducts = useMemo(() => {
    return products.filter(p => wishlistIds.includes(p.id));
  }, [products, wishlistIds]);

  // Calculate Cart Counts and Totals
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const isWholesale = item.quantity >= 6;
      const unitPrice = isWholesale && item.product.wholesalePriceDzd 
        ? item.product.wholesalePriceDzd 
        : item.product.price;
      return total + unitPrice * item.quantity;
    }, 0);
  }, [cart]);

  // Place Order From Cart Flow (Creates a Pending Order Record for Tracking)
  const handlePlaceOrderFromCart = (customerInfo: {
    name: string;
    phone: string;
    wilaya: string;
    address: string;
    commune: string;
    deliveryType: 'home' | 'stopdesk';
    deliveryFee: number;
    notes?: string;
  }) => {
    const trackingCode = `DBC-${customerInfo.wilaya.slice(0, 2)}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: newOrderId,
      trackingCode,
      createdAt: new Date().toISOString(),
      status: 'pending',
      customer: {
        name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        wilaya: customerInfo.wilaya,
        commune: customerInfo.commune
      },
      items: cart.map(item => ({
        product: item.product,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: item.quantity,
        unitPriceDzd: item.quantity >= 6 && item.product.wholesalePriceDzd
          ? item.product.wholesalePriceDzd
          : item.product.price
      })),
      delivery: {
        wilayaName: customerInfo.wilaya,
        type: customerInfo.deliveryType,
        feeDzd: customerInfo.deliveryFee,
        carrier: 'Yalidine Express / ZR Express',
        estimatedDays: '24h - 48h'
      },
      pricing: {
        subtotalDzd: cartTotal,
        deliveryFeeDzd: customerInfo.deliveryFee,
        totalDzd: cartTotal + customerInfo.deliveryFee
      },
      notes: customerInfo.notes
    };

    setOrders(prev => [newOrder, ...prev]);

    // Build WhatsApp URL with the generated tracking code included
    const whatsappUrl = generateWhatsAppCheckoutUrl({
      cart,
      currency,
      customerInfo: {
        ...customerInfo,
        trackingCode
      },
      storeSettings,
      language: currentLanguage
    });

    handleClearCart();
    setIsCartOpen(false);

    showToast(isArabic ? 'تم تسجيل طلبيتك بنجاح! سنتصل بك لتأكيد الشحن.' : 'Commande enregistrée avec succès !');

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  // Direct Product Order Trigger (e.g. from Product Card Quick Order)
  const handleQuickOrder = (product: Product) => {
    const isWholesale = false;
    const defaultSize = product.sizes?.[0] || 'L';
    const defaultColor = product.colors?.[0] || 'Noir';
    handleAddToCart(product, defaultSize, defaultColor, 1);
    setIsCartOpen(true);
  };

  return (
    <div className={`w-full max-w-full overflow-x-hidden min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F1C19] ${isArabic ? 'font-sans' : ''}`}>
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-2rem)] bg-[#1F1D1A] text-white px-5 py-2.5 rounded shadow-2xl border border-[#C9A96E] text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
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
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('collection-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
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
          onUpdateHeroSettings={handleUpdateHeroSettings}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
          mediaAssets={mediaAssets}
          isAdmin={isAdmin}
        />

        {/* Collection Section Header & Filter Bar */}
        <section id="collection-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E8E1D5]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EDE6DB] text-[#8C6D3B] rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                <span>{t.collectionSubtitle}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#1F1C19]">
                {t.collectionTitle}
              </h2>
            </div>

            {/* Quick Filter Category Pills & Search summary */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-[#8C8275] uppercase px-2 py-1">
                {filteredProducts.length} {isArabic ? 'منتج معروض' : 'Articles'}
              </span>

              {['all', 'hoodies', 'joggers', 'longsleeves', 'tees'].map((catKey) => {
                const labelMap: Record<string, string> = {
                  all: t.navAll,
                  hoodies: t.navHoodies,
                  joggers: t.navJoggers,
                  longsleeves: t.navLongSleeves,
                  tees: t.navTees,
                };

                const isActive = activeCategory === catKey;

                return (
                  <button
                    key={catKey}
                    onClick={() => setActiveCategory(catKey)}
                    className={`px-3.5 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1F1D1A] text-white font-bold shadow-sm'
                        : 'bg-[#F2EDE4] text-[#4A4338] hover:bg-[#E8E1D5]'
                    }`}
                  >
                    {labelMap[catKey] || catKey}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search notice if actively searching */}
          {searchQuery && (
            <div className="mt-4 p-3 bg-[#F2EDE4] border border-[#E0D7C9] rounded-md flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#8C6D3B]" />
                <span>
                  {isArabic ? 'نتائج البحث عن:' : 'Résultats de recherche pour :'} <strong>"{searchQuery}"</strong> ({filteredProducts.length})
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#8C6D3B] hover:text-black font-bold underline cursor-pointer"
              >
                {isArabic ? 'إلغاء البحث' : 'Effacer la recherche'}
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  currentLanguage={currentLanguage}
                  isWishlisted={wishlistIds.includes(product.id)}
                  onToggleWishlist={() => handleToggleWishlist(product.id)}
                  onSelectProduct={(p) => {
                    setSelectedProduct(p);
                    setCurrentlyViewedProduct(p);
                  }}
                  onAddToCart={(p, size, color, qty) => handleAddToCart(p, size, color, qty)}
                  onQuickOrder={handleQuickOrder}
                  storeSettings={storeSettings}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-lg border border-dashed border-[#DDD4C5] mt-8 p-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#DDD4C5] mb-4 text-[#8C6D3B]">
                <Package className="w-7 h-7" />
              </div>
              {products.length === 0 ? (
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#1F1C19]">
                    {isArabic ? 'كتالوج ورشتك جاهز لاستقبال منتجاتك' : 'Votre catalogue est prêt pour vos confections'}
                  </h3>
                  <p className="text-sm text-[#736B5E] max-w-md mx-auto mt-2 font-mono">
                    {isAdmin
                      ? (isArabic
                          ? 'يمكنك إضافة منتجات جديدة أو استعادة النماذج التجريبية من لوحة الإدارة.'
                          : 'Vous pouvez ajouter vos confections ou réinitialiser les modèles d’exemples.')
                      : (isArabic
                          ? 'يتم تحديث الموديلات والمخزون حالياً في ورشة DBC. تفضل بالتواصل معنا عبر واتساب.'
                          : 'Nos ateliers préparent la nouvelle collection. Contactez-nous pour commander sur-mesure.')}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="px-5 py-2.5 bg-[#1F1D1A] text-white text-xs font-mono uppercase tracking-wider rounded font-bold hover:bg-black transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                      <span>{isArabic ? 'تواصل مع الورشة' : 'Contacter l’atelier'}</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={handleResetCatalog}
                        className="px-5 py-2.5 bg-white text-[#8C6D3B] border border-[#8C6D3B] text-xs font-mono uppercase tracking-wider rounded font-bold hover:bg-[#F9F6F0] transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" />
                        <span>{isArabic ? 'عرض نماذج الورشة' : 'Charger des modèles'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#1F1C19]">
                    {isArabic ? 'لا توجد منتجات مطابقة لهذا الفلتر' : 'Aucun produit ne correspond à ces critères'}
                  </h3>
                  <p className="text-sm text-[#736B5E] mt-2 font-mono">
                    {isArabic 
                      ? 'جرب البحث بكلمة أخرى أو تصفح كل تصنيفات الورشة.'
                      : 'Essayez un autre mot-clé ou sélectionnez "Tous les modèles".'}
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 bg-[#1F1D1A] text-white text-xs font-mono uppercase tracking-wider rounded hover:bg-black cursor-pointer font-bold"
                  >
                    {isArabic ? 'عرض جميع المنتجات' : 'Voir toute la collection'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* B2B Workshop Atelier Spotlight Banner */}
        <section className="bg-[#1E1B18] text-[#FAF8F5] py-16 sm:py-20 border-y border-[#3D3730]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#332E27] text-[#C9A96E] rounded-full text-xs font-mono uppercase tracking-wider border border-[#C9A96E]/30 font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t.b2bBadge}</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
                  {t.b2bTitle}
                </h2>

                <p className="text-[#B3A99A] text-base sm:text-lg font-sans leading-relaxed max-w-2xl">
                  {t.b2bSubtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-[#292420] p-4 rounded border border-[#423C34]">
                    <span className="text-[#C9A96E] font-serif text-2xl font-bold block">100% Cotton</span>
                    <span className="text-xs font-mono text-[#8C8275]">{t.b2bSpec1}</span>
                  </div>
                  <div className="bg-[#292420] p-4 rounded border border-[#423C34]">
                    <span className="text-[#C9A96E] font-serif text-2xl font-bold block">69 Wilayas</span>
                    <span className="text-xs font-mono text-[#8C8275]">{t.b2bSpec2}</span>
                  </div>
                  <div className="bg-[#292420] p-4 rounded border border-[#423C34]">
                    <span className="text-[#C9A96E] font-serif text-2xl font-bold block">Sérigraphie</span>
                    <span className="text-xs font-mono text-[#8C8275]">{t.b2bSpec3}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button
                    onClick={() => setIsB2BOpen(true)}
                    className="px-7 py-3.5 bg-[#C9A96E] hover:bg-[#b89759] text-[#1E1B18] text-xs font-mono uppercase tracking-widest rounded-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{t.b2bCta}</span>
                  </button>

                  <button
                    onClick={() => {
                      const url = generateWhatsAppCustomInquiryUrl(
                        storeSettings.whatsappNumber || '+213550458812',
                        isArabic ? 'طلبية جملة / B2B' : 'Commande de Gros / B2B',
                        currentLanguage
                      );
                      window.open(url, '_blank');
                    }}
                    className="px-6 py-3.5 bg-transparent hover:bg-white/10 text-white border border-white/20 text-xs font-mono uppercase tracking-widest rounded-xs font-semibold cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp B2B 🇩🇿</span>
                  </button>
                </div>
              </div>

              {/* Atelier Visual Display */}
              <div className="lg:col-span-5">
                <div className="relative rounded-lg overflow-hidden border border-[#3D3730] shadow-2xl bg-[#141210]">
                  <img
                    src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80"
                    alt="Atelier de confection DBC Algérie"
                    className="w-full h-80 object-cover opacity-85 hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent p-6 flex flex-col justify-end">
                    <span className="text-xs font-mono text-[#C9A96E] uppercase tracking-wider block">
                      {isArabic ? 'خبرة تصنيع محلية في الجزائر' : 'Savoir-Faire Textile Algérien'}
                    </span>
                    <strong className="text-white font-serif text-lg font-bold">
                      {storeSettings.storeName || 'DBC Clothing Workshop'}
                    </strong>
                    <p className="text-xs text-[#DDD4C5] font-sans mt-1">
                      {isArabic
                        ? 'معدات قص وتطريز احترافية، فحص جودة فردي لكل قطعة قبل الشحن.'
                        : 'Atelier équipé pour coupes de précision, broderies fines et finitions premium.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition & Service Guarantees */}
        <section className="bg-[#FAF8F5] py-14 border-b border-[#E8E1D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                onClick={() => handleOpenOrderLookup('')}
                className="p-6 bg-white rounded-lg border border-[#E8E1D5] hover:border-[#8C6D3B] transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#DDD4C5] text-[#8C6D3B] mb-4 group-hover:scale-110 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1F1C19] mb-1 group-hover:text-[#8C6D3B] transition-colors">
                  {t.featureDeliveryTitle}
                </h3>
                <p className="text-xs text-[#6B6357] font-mono leading-relaxed mb-3">
                  {t.featureDeliveryDesc}
                </p>
                <span className="text-xs font-mono text-[#8C6D3B] font-semibold underline flex items-center gap-1">
                  <span>{isArabic ? 'تتبع طلبيتك أو اكتشف جدول التعريفات ←' : 'Suivre une commande & voir les tarifs →'}</span>
                </span>
              </div>

              <div 
                onClick={() => setIsB2BOpen(true)}
                className="p-6 bg-white rounded-lg border border-[#E8E1D5] hover:border-[#8C6D3B] transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#DDD4C5] text-[#8C6D3B] mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1F1C19] mb-1 group-hover:text-[#8C6D3B] transition-colors">
                  {isArabic ? 'بيع بالتجزئة وبالجملة' : 'Vente B2C (Détail) & B2B (Gros)'}
                </h3>
                <p className="text-xs text-[#6B6357] font-mono leading-relaxed">
                  {isArabic
                    ? 'اشتري قطعة واحدة لمظهرك الشخصي، أو اطلب كميات بالجملة لمشروعك بأسعار خاصة.'
                    : 'Achetez à la pièce pour vous ou profitez de nos tarifs grossistes à partir de 6 pièces.'}
                </p>
              </div>

              <div 
                onClick={() => {
                  const url = `https://wa.me/${(storeSettings.whatsappNumber || '+213550458812').replace(/[^0-9]/g, '')}`;
                  window.open(url, '_blank');
                }}
                className="p-6 bg-white rounded-lg border border-[#E8E1D5] hover:border-[#25D366] transition-colors cursor-pointer group shadow-2xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#DDD4C5] text-[#25D366] mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1F1C19] mb-1 group-hover:text-[#25D366] transition-colors">
                  {isArabic ? 'طلب سريع ومباشر عبر واتساب' : 'Commande Directe via WhatsApp'}
                </h3>
                <p className="text-xs text-[#6B6357] font-mono leading-relaxed">
                  {isArabic
                    ? 'تواصل مباشرة مع الورشة للاستفسار عن الألوان، القياسات، والشحن قبل تأكيد الطلبية.'
                    : 'Échangez directement avec nos conseillers atelier pour valider votre coupe et expédition.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews & Workshop Feedback */}
        <section className="bg-white py-14 border-b border-[#E8E1D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C19]">
                {isArabic ? 'آراء وتجارب الزبائن في الجزائر' : 'Avis & Témoignages Clients en Algérie'}
              </h2>
              <p className="text-xs sm:text-sm font-mono text-[#736B5E] mt-1.5">
                {isArabic ? 'جودة تصنيع موثوقة عبر كافة الولايات' : 'Recommandé par les particuliers et boutiques'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[#FAF8F5] rounded-lg border border-[#E8E1D5]">
                <div className="flex text-[#C9A96E] text-xs mb-2">★★★★★</div>
                <p className="text-xs text-[#4A4338] font-sans leading-relaxed italic mb-3">
                  "القماش ثقيل جداً والجودة ممتازة مقارنة بالسعر. التوصيل إلى قسنطينة وصل في 48 ساعة فقط."
                </p>
                <div className="text-[11px] font-mono text-[#8C8275]">
                  — <strong>ياسين .م</strong> • قسنطينة (Constantine)
                </div>
              </div>

              <div className="p-5 bg-[#FAF8F5] rounded-lg border border-[#E8E1D5]">
                <div className="flex text-[#C9A96E] text-xs mb-2">★★★★★</div>
                <p className="text-xs text-[#4A4338] font-sans leading-relaxed italic mb-3">
                  "J'ai commandé 20 hoodies pour notre équipe avec broderie personnalisée. Finition impeccable et respect des délais."
                </p>
                <div className="text-[11px] font-mono text-[#8C8275]">
                  — <strong>Amine K.</strong> • Alger B2B (Bab Ezzouar)
                </div>
              </div>

              <div className="p-5 bg-[#FAF8F5] rounded-lg border border-[#E8E1D5]">
                <div className="flex text-[#C9A96E] text-xs mb-2">★★★★★</div>
                <p className="text-xs text-[#4A4338] font-sans leading-relaxed italic mb-3">
                  "Jogging coupe parfaite, tissu molletonné doux à l'intérieur. Service client WhatsApp très réactif."
                </p>
                <div className="text-[11px] font-mono text-[#8C8275]">
                  — <strong>Sofiane B.</strong> • Oran (Akid Lotfi)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="bg-[#FAF8F5] py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-mono uppercase text-[#8C6D3B] font-bold tracking-wider block mb-1">
                FAQ • DBC Workshop
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C19]">
                {isArabic ? 'الأسئلة الشائعة' : 'Questions Fréquentes'}
              </h2>
              <p className="text-xs sm:text-sm font-mono text-[#736B5E] mt-1">
                {isArabic ? 'كل ما تود معرفته عن الشحن والطلبيات' : 'Livraison, Tailles & Tarifs Gros'}
              </p>
            </div>

            <div className="space-y-3">
              <details className="bg-white p-4 rounded-lg border border-[#E8E1D5] group">
                <summary className="font-mono text-xs sm:text-sm font-bold text-[#1F1C19] cursor-pointer flex items-center justify-between">
                  <span>{isArabic ? 'كم تستغرق مدة التوصيل إلى ولايتي؟' : 'Combien de temps prend la livraison en Algérie ?'}</span>
                  <span className="text-[#8C6D3B] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs text-[#6B6357] font-sans leading-relaxed mt-2.5 pt-2.5 border-t border-[#F0EAE1]">
                  {isArabic
                    ? 'التوصيل يتم خلال 24 إلى 48 ساعة للجزائر العاصمة والولايات الكبرى (وهران، قسنطينة، سطيف)، وخلال 48 إلى 72 ساعة لباقي ولايات الوطن عبر شركائنا (Yalidine Express / ZR Express).'
                    : 'La livraison prend généralement 24 à 48h pour Alger et les grandes villes, et 48h à 72h pour les autres wilayas.'}
                </p>
              </details>

              <details className="bg-white p-4 rounded-lg border border-[#E8E1D5] group">
                <summary className="font-mono text-xs sm:text-sm font-bold text-[#1F1C19] cursor-pointer flex items-center justify-between">
                  <span>{isArabic ? 'كيف يمكنني معرفة مقاسي بدقة؟' : 'Comment bien choisir ma taille (Guide des tailles) ?'}</span>
                  <span className="text-[#8C6D3B] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs text-[#6B6357] font-sans leading-relaxed mt-2.5 pt-2.5 border-t border-[#F0EAE1]">
                  {isArabic
                    ? 'تصاميمنا تعتمد قصة مريحة (Oversized Fit / Regular Fit). يمكنك الرجوع إلى جدول المقاسات في صفحة كل منتج، أو مراسلتنا بوزنك وطولك عبر واتساب لنحدد المقاس المثالي لك.'
                    : 'Nos confections adoptent des coupes modernes (Oversized ou Regular). Consultez le guide des tailles ou envoyez-nous votre taille et poids sur WhatsApp.'}
                </p>
              </details>

              <details className="bg-white p-4 rounded-lg border border-[#E8E1D5] group">
                <summary className="font-mono text-xs sm:text-sm font-bold text-[#1F1C19] cursor-pointer flex items-center justify-between">
                  <span>{isArabic ? 'هل تقدمون أسعاراً خاصة بالمحلات وطلبيات الجملة؟' : 'Proposez-vous des tarifs pour les boutiques et grossistes ?'}</span>
                  <span className="text-[#8C6D3B] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-xs text-[#6B6357] font-sans leading-relaxed mt-2.5 pt-2.5 border-t border-[#F0EAE1]">
                  {isArabic
                    ? 'نعم، ورشة DBC توفر أسعاراً تنافسية للمحلات وطلبيات الجملة ابتداءً من 6 قطع، مع إمكانية التطريز والطباعة الخاصة بالبراند الخاص بك.'
                    : 'Oui, nous proposons des tarifs préférentiels pour les commandes dès 6 pièces, avec possibilité de personnalisation (sérigraphie, broderie, packaging).'}
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Fast Interaction Controls */}
      <FloatingWhatsAppWidget
        whatsappNumber={storeSettings.whatsappNumber || '+213550458812'}
        currentlyViewedProduct={currentlyViewedProduct}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
        currency={currency}
      />

      {/* Footnote & Algerian Atelier Footer */}
      <Footer
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenOrderLookup={() => handleOpenOrderLookup('')}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
        isAdmin={isAdmin}
      />

      {/* Modals & Dialogs */}

      {/* 1. Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, size, color, quantity, notes) => {
            handleAddToCart(product, size, color, quantity, notes);
            setSelectedProduct(null);
            setIsCartOpen(true);
          }}
          isWishlisted={wishlistIds.includes(selectedProduct.id)}
          onToggleWishlist={() => handleToggleWishlist(selectedProduct.id)}
          currency={currency}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          isAdmin={isAdmin}
        />
      )}

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckout={handlePlaceOrderFromCart}
        currency={currency}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
      />

      {/* 3. Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(product) => {
          handleAddToCart(product, product.sizes[0] || 'M', product.colors[0] || 'Noir', 1);
          setIsWishlistOpen(false);
          setIsCartOpen(true);
        }}
        currency={currency}
        currentLanguage={currentLanguage}
      />

      {/* 4. Contact & Workshop Information Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* 5. B2B & Wholesale Atelier Inquiry Modal */}
      <B2BInquiryModal
        isOpen={isB2BOpen}
        onClose={() => setIsB2BOpen(false)}
        storeSettings={storeSettings}
        currentLanguage={currentLanguage}
      />

      {/* 6. Order Tracking & 69 Wilayas Delivery Rates Modal */}
      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => {
          setIsOrderLookupOpen(false);
          setPrefilledTrackingCode('');
        }}
        orders={orders}
        initialTrackingCode={prefilledTrackingCode}
        currentLanguage={currentLanguage}
        currency={currency}
        storeSettings={storeSettings}
      />

      {/* 7. AI Workshop Stylist Advisor */}
      <WorkshopStylistModal
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        products={products}
        currentLanguage={currentLanguage}
        currency={currency}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsStylistOpen(false);
        }}
      />

      {/* 8. Admin Authentication & Dashboard Modals */}
      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {isAdmin && (
        <AdminModal
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          products={products}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetCatalog={handleResetCatalog}
          onClearCatalog={handleClearCatalog}
          storeSettings={storeSettings}
          onSaveSettings={handleSaveSettings}
          orders={orders}
          onUpdateOrder={handleUpdateOrder}
          onUpdateOrders={handleUpdateOrders}
          mediaAssets={mediaAssets}
          onUpdateMediaAssets={setMediaAssets}
          currentLanguage={currentLanguage}
          currency={currency}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </div>
  );
}
