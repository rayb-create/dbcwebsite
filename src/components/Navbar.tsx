import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Globe, 
  ChevronDown, 
  Coins,
  Truck
} from 'lucide-react';
import { Currency, StoreSettings } from '../types';
import { Language, TRANSLATIONS } from '../data/i18n';
import { formatPrice } from '../utils/format';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  currentLanguage: Language;
  onLanguageChange: (l: Language) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin?: () => void;
  onOpenContact: () => void;
  onOpenB2B: () => void;
  onOpenOrderLookup: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  storeSettings: StoreSettings;
}

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'es', label: 'Spanish', native: 'Español' },
];

const CURRENCIES: Currency[] = ['DZD', 'EUR', 'USD', 'GBP'];

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  wishlistCount,
  currency,
  onCurrencyChange,
  currentLanguage,
  onLanguageChange,
  onOpenCart,
  onOpenWishlist,
  onOpenAdmin,
  onOpenContact,
  onOpenB2B,
  onOpenOrderLookup,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  storeSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);

  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';

  const scrollToCollection = () => {
    const el = document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onSelectCategory('all');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6E6E6] transition-all">
      {/* Refined Slim Editorial Header with Generous Spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile Menu & Search triggers */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#111111] hover:bg-[#F3F3F1] transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#111111] hover:bg-[#F3F3F1] transition-colors cursor-pointer"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Editorial Logo / Brand Wordmark */}
          <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col items-center lg:items-start group cursor-pointer"
            >
              <span className="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.22em] font-normal text-[#111111] uppercase transition-colors">
                {storeSettings.storeName || 'DBC WORKSHOP'}
              </span>
              <span className="text-[9px] font-sans tracking-[0.25em] text-[#737373] uppercase font-medium">
                {isArabic ? 'ورشة أزياء جزائرية' : 'Atelier • Confection'}
              </span>
            </a>
          </div>

          {/* Desktop Curated Editorial Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse text-xs font-sans uppercase tracking-[0.18em] font-medium text-[#111111]">
            <button
              onClick={scrollToCollection}
              className={`py-1 transition-colors cursor-pointer ${
                activeCategory !== 'all' ? 'text-[#737373] hover:text-[#111111]' : 'text-[#111111] font-semibold border-b border-[#111111]'
              }`}
            >
              {isArabic ? 'التشكيلة' : (currentLanguage === 'en' ? 'Shop' : currentLanguage === 'es' ? 'Colección' : 'Collection')}
            </button>

            <button
              onClick={onOpenB2B}
              className="py-1 text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
            >
              {isArabic ? 'الورشة والتصنيع' : (currentLanguage === 'en' ? 'Atelier & Manufacturing' : currentLanguage === 'es' ? 'Atelier y Confección' : 'Atelier & Confection')}
            </button>

            <button
              onClick={onOpenContact}
              className="py-1 text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
            >
              {isArabic ? 'اتصل بنا' : (currentLanguage === 'en' ? 'Contact' : currentLanguage === 'es' ? 'Contacto' : 'Contact')}
            </button>

            <button
              onClick={onOpenOrderLookup}
              className="py-1 text-[#737373] hover:text-[#111111] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-[#737373]" />
              <span>{isArabic ? 'تتبع الطلبية' : (currentLanguage === 'en' ? 'Track Order' : currentLanguage === 'es' ? 'Seguimiento' : 'Suivi')}</span>
            </button>
          </nav>

          {/* Right Action Icons & Discreet Selectors */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Desktop Search Input */}
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={isArabic ? 'بحث...' : (currentLanguage === 'en' ? 'Search...' : currentLanguage === 'es' ? 'Buscar...' : 'Recherche...')}
                className="w-36 lg:w-44 pl-7 pr-3 py-1 text-xs font-sans bg-transparent border-b border-[#E6E6E6] focus:border-[#111111] focus:outline-none transition-all text-[#111111]"
              />
              <Search className="w-3.5 h-3.5 text-[#737373] absolute left-1 rtl:left-auto rtl:right-1" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-1 rtl:right-auto rtl:left-1 text-[#737373] hover:text-[#111111] text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrDropdownOpen(false);
                }}
                className="px-2 py-1 text-xs font-sans uppercase font-medium flex items-center gap-1 text-[#111111] hover:text-[#737373] cursor-pointer transition-colors"
                title="Langue / Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#111111]" />
                <span>{currentLanguage}</span>
                <ChevronDown className="w-3 h-3 text-[#737373]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-36 bg-white border border-[#E6E6E6] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs font-sans flex items-center justify-between hover:bg-[#F8F8F7] cursor-pointer ${
                        currentLanguage === lang.code ? 'font-semibold text-[#111111]' : 'text-[#737373]'
                      }`}
                    >
                      <span>{lang.native}</span>
                      {currentLanguage === lang.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <button
                id="currency-selector-btn"
                onClick={() => {
                  setCurrDropdownOpen(!currDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="px-2 py-1 text-xs font-sans font-semibold flex items-center gap-1 text-[#111111] hover:text-[#737373] cursor-pointer transition-colors"
                title="Devise / Currency"
              >
                <Coins className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-[#737373]" />
              </button>

              {currDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-28 bg-white border border-[#E6E6E6] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onCurrencyChange(c);
                        setCurrDropdownOpen(false);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs font-sans flex items-center justify-between hover:bg-[#F8F8F7] cursor-pointer ${
                        currency === c ? 'font-semibold text-[#111111]' : 'text-[#737373]'
                      }`}
                    >
                      <span>{c}</span>
                      {currency === c && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              id="navbar-wishlist-btn"
              onClick={onOpenWishlist}
              className="p-2 text-[#111111] hover:text-[#737373] transition-colors relative cursor-pointer"
              title="Favoris"
            >
              <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#111111] text-white text-[9px] font-sans font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={onOpenCart}
              className="p-2 text-[#111111] hover:text-[#737373] transition-colors relative flex items-center gap-1.5 cursor-pointer"
              title="Panier"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#111111] text-white text-[9px] font-sans font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              {cartTotal > 0 && (
                <span className="hidden xl:inline font-sans font-medium text-xs text-[#111111]">
                  {formatPrice(cartTotal, currency, isArabic)}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Expandable Mobile Search Field */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-[#E6E6E6] bg-white">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isArabic ? 'بحث في التشكيلة...' : 'Recherche dans la collection...'}
              className="w-full pl-8 pr-8 py-2 text-xs font-sans bg-[#F8F8F7] border border-[#E6E6E6] focus:outline-none focus:border-[#111111]"
              autoFocus
            />
            <Search className="w-4 h-4 text-[#737373] absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 text-[#737373] font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E6E6E6] bg-white px-5 py-6 space-y-5 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-2 text-xs font-sans uppercase tracking-[0.2em]">
            <button
              onClick={() => {
                scrollToCollection();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right py-2 text-[#111111] font-semibold border-b border-[#F3F3F1]"
            >
              {isArabic ? 'التشكيلة' : (currentLanguage === 'en' ? 'Shop Collection' : currentLanguage === 'es' ? 'Colección' : 'Collection')}
            </button>

            <button
              onClick={() => {
                onOpenB2B();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right py-2 text-[#737373] hover:text-[#111111] border-b border-[#F3F3F1]"
            >
              {isArabic ? 'الورشة والتصنيع (B2B)' : (currentLanguage === 'en' ? 'Atelier & Manufacturing' : currentLanguage === 'es' ? 'Atelier y Confección' : 'Atelier & Confection')}
            </button>

            <button
              onClick={() => {
                onOpenOrderLookup();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right py-2 text-[#737373] hover:text-[#111111] border-b border-[#F3F3F1] flex items-center justify-between"
            >
              <span>{isArabic ? 'تتبع الطلبيات' : 'Suivi de commande'}</span>
              <Truck className="w-4 h-4 text-[#737373]" />
            </button>

            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right py-2 text-[#737373] hover:text-[#111111]"
            >
              {isArabic ? 'اتصل بالورشة' : (currentLanguage === 'en' ? 'Contact' : currentLanguage === 'es' ? 'Contacto' : 'Contact')}
            </button>
          </div>

          {/* Mobile Language and Currency Selectors */}
          <div className="pt-4 border-t border-[#E6E6E6] flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 text-xs font-sans uppercase ${
                    currentLanguage === lang.code ? 'font-bold text-[#111111] bg-[#F3F3F1]' : 'text-[#737373]'
                  }`}
                >
                  {lang.code}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onCurrencyChange(c);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1 text-xs font-sans ${
                    currency === c ? 'font-bold text-[#111111] bg-[#F3F3F1]' : 'text-[#737373]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </header>
  );
};

export default Navbar;
