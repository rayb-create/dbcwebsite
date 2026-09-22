import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderLookupModal } from './components/OrderLookupModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { ContactModal } from './components/ContactModal';
import { B2BModal } from './components/B2BModal';
import { BespokeStudio } from './components/BespokeStudio';
import { AdminLayout } from './components/admin/AdminLayout';
import { AuthModal } from './components/admin/AuthModal';
import { PRODUCTS, REVIEWS } from './data/products';
import { WILAYAS } from './data/delivery';
import { Product, Currency, Language, CartItem, CustomMeasurements, StoreSettings, MediaAsset, DeliveryCarrier } from './types';
import { TRANSLATIONS } from './data/i18n';
import {
  listenToProducts,
  listenToStoreSettings,
  listenToMediaAssets,
  listenToDeliveries,
  saveProductToDb,
  deleteProductFromDb,
  saveSettingsToDb,
  saveOrderToDb,
} from './services/db';
import { useAuth } from './context/AuthContext';
import { 
  Building2, 
  Sparkles, 
  MessageCircle, 
  Phone, 
  ShieldCheck, 
  Truck, 
  Scissors, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Lock,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [currency, setCurrency] = useState<Currency>('DZD');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState<boolean>(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isB2BOpen, setIsB2BOpen] = useState<boolean>(false);
  const [isBespokeStudioOpen, setIsBespokeStudioOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.hash === '#admin' ? '/admin' : window.location.pathname
  );
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const { isAdmin: authIsAdmin, currentUser, loading: authLoading } = useAuth();
  // Strictly verified admin flag: public/logged-out visitors are ALWAYS false
  const isAdmin = Boolean(!authLoading && currentUser && authIsAdmin === true);

  // Track whether store settings have loaded from persistent storage (localStorage / Firestore)
  const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('dbc_store_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        return Boolean(parsed && typeof parsed === 'object');
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const cached = localStorage.getItem('dbc_store_settings');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return {
      storeName: 'DBC CLOTHING WORKSHOP',
      tagline: 'Atelier de Confection Algérie • B2B & B2C',
      heroTitle: 'Confection Textile Algérienne & Streetwear Haut de Gamme',
      heroSubtitle: 'Spécialiste du molleton lourd 350-450 GSM. Production locale à Alger pour particuliers et marques en gros.',
      heroCtaText: 'Explorer la Collection',
      heroImage: '',
      heroImages: [],
      heroOverlayStrength: 'medium',
      heroFocalPosition: 'center',
      contactPhone: '+213 550 45 88 12',
      contactEmail: 'contact@dbc-workshop.dz',
      whatsappNumber: '+213550458812',
      instagramUrl: 'https://instagram.com/dbc_workshop',
      facebookUrl: '',
      tiktokUrl: '',
      atelierAddress: 'Zone d’Activité, Bordj El Kiffan, Alger',
      atelierHours: 'Samedi - Jeudi : 08h30 - 18h00',
      b2bMinQty: 6,
      freeShippingThresholdDzd: 15000,
    };
  });

  const [deliveryCarriers, setDeliveryCarriers] = useState<DeliveryCarrier[]>([]);

  // Hash change detection for routing
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentPath('/admin');
      } else if (window.location.hash === '' || window.location.hash === '#') {
        setCurrentPath('/');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listeners
  useEffect(() => {
    const unsubscribeProducts = listenToProducts((dbProducts) => {
      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
      }
    });

    const unsubscribeSettings = listenToStoreSettings((dbSettings) => {
      if (dbSettings) {
        setStoreSettings((prev) => {
          const updated = { ...prev, ...dbSettings };
          try {
            localStorage.setItem('dbc_store_settings', JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
        setIsSettingsLoaded(true);
      }
    });

    const unsubscribeMedia = listenToMediaAssets((assets) => {
      setMediaAssets(assets);
    });

    const unsubscribeDeliveries = listenToDeliveries((carriers) => {
      setDeliveryCarriers(carriers);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
      unsubscribeMedia();
      unsubscribeDeliveries();
    };
  }, []);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const handleUpdateStoreSettings = async (updates: Partial<StoreSettings>) => {
    const updated = { ...storeSettings, ...updates };
    setStoreSettings(updated);
    try {
      localStorage.setItem('dbc_store_settings', JSON.stringify(updated));
    } catch {
      // ignore
    }
    await saveSettingsToDb(updates);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!isAdmin) return;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await deleteProductFromDb(productId);
  };

  const handleSaveProduct = async (productData: Product) => {
    if (!isAdmin) return;
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === productData.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = productData;
        return next;
      }
      return [productData, ...prev];
    });
    await saveProductToDb(productData);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.pricePerUnit * item.quantity, 0);

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
    const cartItemId = `${product.id}-${size}-${selectedColor.name}`;
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
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
        )
      );
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const categories = [
    { id: 'all', label: isArabic ? 'الكل' : 'Tous les Articles' },
    { id: 'hoodies', label: isArabic ? 'هوديز' : 'Hoodies' },
    { id: 'sweatshirts', label: isArabic ? 'سويت شيرت' : 'Sweatshirts' },
    { id: 'joggings', label: isArabic ? 'جوجينج' : 'Pantalons Jogging' },
    { id: 'ensembles', label: isArabic ? 'أطقم كاملة' : 'Ensembles' },
  ];

  // Route: Admin
  if (currentPath === '/admin') {
    return (
      <AdminLayout
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        products={products}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        storeSettings={storeSettings}
        onUpdateSettings={handleUpdateStoreSettings}
        mediaAssets={mediaAssets}
        deliveryCarriers={deliveryCarriers}
        onClose={() => {
          window.location.hash = '';
          setCurrentPath('/');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAF8F5] text-[#1F1D1A] flex flex-col ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Navbar */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currency={currency}
        onCurrencyChange={setCurrency}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenB2B={() => setIsB2BOpen(true)}
        onOpenBespoke={() => setIsBespokeStudioOpen(true)}
        onOpenAdmin={() => {
          window.location.hash = 'admin';
          setCurrentPath('/admin');
        }}
        storeSettings={storeSettings}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroBanner
          onExploreCollection={() => {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenB2B={() => setIsB2BOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenOrderLookup={() => setIsOrderLookupOpen(true)}
          onUpdateHeroSettings={handleUpdateStoreSettings}
          currentLanguage={currentLanguage}
          storeSettings={storeSettings}
          mediaAssets={mediaAssets}
          isAdmin={isAdmin}
          isSettingsLoaded={isSettingsLoaded}
        />

        {/* Catalog Section */}
        <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[#E8E1D5] gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8C6D3B]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#8C6D3B] font-bold">
                  {isArabic ? 'كتالوج ورشة الخياطة' : 'Catalogue Confection Algérie'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1F1D1A]">
                {isArabic ? 'الموديلات المتوفرة والتفصيل' : 'Nos Articles & Modèles en Molleton'}
              </h2>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-[#1F1D1A] text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-[#F2EDE4] text-[#544D42] border border-[#DDD4C5]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                currentLanguage={currentLanguage}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white rounded border border-[#E8E1D5] p-8">
              <p className="text-[#6E6659] font-mono text-sm">
                {isArabic ? 'لا توجد منتجات في هذا التصنيف حالياً.' : 'Aucun modèle dans cette catégorie pour le moment.'}
              </p>
            </div>
          )}
        </section>

        {/* Custom Bespoke & Atelier Craft Banner */}
        <section className="bg-[#1F1D1A] text-white py-12 sm:py-16 border-t border-b border-[#3B352E]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#332D26] text-[#C9A96E] rounded-full text-xs font-mono uppercase tracking-wider">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'خدمة التفصيل والطلبات الخاصة' : 'Atelier Sur-Mesure & Commandes B2B'}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white">
                  {isArabic
                    ? 'هل لديك متجر أو ترغب في مقاسات خاصة؟'
                    : 'Besoin d’un Taillage Spécifique ou d’une Série en Gros ?'}
                </h3>
                <p className="text-sm sm:text-base text-[#B3AAA0] font-sans max-w-2xl leading-relaxed">
                  {isArabic
                    ? 'نحن ننتج مباشرة في ورشتنا بالجزائر العاصمة. يمكنك طلب تفصيل خاص بالسنتمتر أو طلب كميات بالجملة مع تطريز وطباعة مخصصة لعلامتك التجارية.'
                    : 'Nous fabriquons directement dans notre atelier à Alger. Commandez vos pièces avec vos propres mensurations ou lancez votre production de marque en gros avec broderie et étiquetage personnalisés.'}
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  onClick={() => setIsB2BOpen(true)}
                  className="px-6 py-3.5 bg-[#C9A96E] hover:bg-[#B39358] text-[#1F1D1A] rounded font-mono text-xs uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isArabic ? 'طلب عرض أسعار بالجملة' : 'Devis Grossiste B2B'}</span>
                </button>
                <button
                  onClick={() => setIsBespokeStudioOpen(true)}
                  className="px-6 py-3.5 bg-transparent hover:bg-white/10 text-white border border-[#DDD4C5]/40 rounded font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-[#C9A96E]" />
                  <span>{isArabic ? 'استوديو التفصيل المخصص' : 'Studio Sur-Mesure'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FAF8F5] border-t border-[#E8E1D5] py-10 sm:py-14 text-xs font-mono text-[#6E6659]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-[#1F1D1A]">
                {storeSettings.storeName || 'DBC CLOTHING WORKSHOP'}
              </h4>
              <p className="font-sans text-xs leading-relaxed text-[#544D42]">
                {storeSettings.tagline || 'Atelier de confection textile haut de gamme en Algérie.'}
              </p>
              <p className="text-[11px] text-[#8C6D3B]">
                {storeSettings.atelierAddress || 'Alger, Algérie'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-[#1F1D1A] block">
                {isArabic ? 'خدماتنا' : 'Prestations'}
              </span>
              <ul className="space-y-1.5 text-xs">
                <li>• Vente au détail (B2C)</li>
                <li>• Confection en gros (B2B)</li>
                <li>• Taillage sur-mesure</li>
                <li>• Livraison 58 Wilayas</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold uppercase tracking-wider text-[#1F1D1A] block">
                {isArabic ? 'تواصل سريع' : 'Contact & Support'}
              </span>
              <ul className="space-y-1.5 text-xs">
                <li>Tél: {storeSettings.contactPhone}</li>
                <li>WhatsApp: {storeSettings.whatsappNumber}</li>
                <li>Email: {storeSettings.contactEmail}</li>
                <li>Horaires: {storeSettings.atelierHours}</li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-bold uppercase tracking-wider text-[#1F1D1A] block">
                {isArabic ? 'إدارة الورشة' : 'Accès Restreint'}
              </span>
              <p className="text-[11px] leading-relaxed">
                {isArabic ? 'فضاء خاص بمسؤولي الورشة فقط.' : 'Espace réservé à l’équipe de l’atelier DBC.'}
              </p>
              <button
                onClick={() => {
                  window.location.hash = 'admin';
                  setCurrentPath('/admin');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F2EDE4] text-[#1F1D1A] border border-[#DDD4C5] rounded text-[11px] font-mono cursor-pointer transition-colors"
              >
                <Lock className="w-3 h-3 text-[#8C6D3B]" />
                <span>{isArabic ? 'دخول المشرف' : 'Administration Atelier'}</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E8E1D5] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <span>© {new Date().getFullYear()} DBC Clothing Workshop. Tous droits réservés.</span>
            <span>Algérie • Confection Locale & Haute Qualité</span>
          </div>
        </div>
      </footer>

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
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        currency={currency}
        currentLanguage={currentLanguage}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        currency={currency}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
        deliveryCarriers={deliveryCarriers}
        onOrderSuccess={() => {
          setCartItems([]);
          setIsCheckoutOpen(false);
        }}
      />

      {/* 4. Order Lookup Modal */}
      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        currentLanguage={currentLanguage}
        currency={currency}
      />

      {/* 5. Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        currentLanguage={currentLanguage}
      />

      {/* 6. Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
      />

      {/* 7. B2B Modal */}
      <B2BModal
        isOpen={isB2BOpen}
        onClose={() => setIsB2BOpen(false)}
        currentLanguage={currentLanguage}
        storeSettings={storeSettings}
      />

      {/* 8. Bespoke Studio Modal */}
      <BespokeStudio
        isOpen={isBespokeStudioOpen}
        onClose={() => setIsBespokeStudioOpen(false)}
        currentLanguage={currentLanguage}
        currency={currency}
        storeSettings={storeSettings}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
