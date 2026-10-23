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
  onOpenStory?: () => void;
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
  onOpenStory,
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
        <div className="grid grid-cols-3 items-center h-16 sm:h-20">
          
          {/* LEFT COLUMN: Mobile triggers & Desktop Curated Navigation */}
          <div className="col-span-1 flex items-center justify-start gap-1 sm:gap-2">
            {/* Mobile Menu & Search triggers (visible on < 1024px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#111111] hover:bg-[#F3F3F1] transition-colors cursor-pointer lg:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#111111] hover:bg-[#F3F3F1] transition-colors cursor-pointer lg:hidden"
              aria-label="Recherche"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Desktop Curated Editorial Navigation (visible on >= 1024px) */}
            <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7 rtl:space-x-reverse text-xs font-sans uppercase tracking-[0.2em] font-medium text-[#111111]">
              <button
                onClick={scrollToCollection}
                className={`py-1 transition-colors cursor-pointer ${
                  activeCategory !== 'all' ? 'text-[#737373] hover:text-[#111111]' : 'text-[#111111] font-semibold border-b border-[#111111]'
                }`}
              >
                {isArabic ? 'المجموعة' : (currentLanguage === 'en' ? 'Shop' : currentLanguage === 'es' ? 'Colección' : 'Collection')}
              </button>

              <button
                onClick={onOpenStory || onOpenB2B}
                className="py-1 text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
              >
                {isArabic ? 'الورشة' : (currentLanguage === 'en' ? 'The Atelier' : currentLanguage === 'es' ? 'El Atelier' : 'L’Atelier')}
              </button>

              <button
                onClick={onOpenStory || onOpenContact}
                className="py-1 text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
              >
                {isArabic ? 'عن الدار' : (currentLanguage === 'en' ? 'About' : currentLanguage === 'es' ? 'Sobre Nosotros' : 'À Propos')}
              </button>
            </nav>
          </div>

          {/* CENTER COLUMN: Exact Horizontally Centered RENASC Wordmark */}
          <div className="col-span-1 flex items-center justify-center text-center">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block group cursor-pointer"
              aria-label="RENASC Home"
            >
              <span className="font-serif text-2xl sm:text-3xl lg:text-3xl xl:text-4xl tracking-[0.25em] sm:tracking-[0.28em] font-normal text-[#111111] uppercase transition-colors select-none block ml-[0.25em] rtl:mr-[0.25em] rtl:ml-0">
                RENASC
              </span>
            </a>
          </div>

          {/* RIGHT COLUMN: Action Icons & Discreet Utility Selectors */}
          <div className="col-span-1 flex items-center justify-end gap-1 sm:gap-2 xl:gap-2.5 shrink-0">
            
            {/* Desktop Search Input (Desktop lg+) */}
            <div className="hidden lg:flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={isArabic ? 'بحث...' : (currentLanguage === 'en' ? 'Search...' : currentLanguage === 'es' ? 'Buscar...' : 'Recherche...')}
                className="w-28 xl:w-40 pl-6 pr-3 py-1 text-xs font-sans bg-transparent border-b border-[#E6E6E6] focus:border-[#111111] focus:outline-none transition-all text-[#111111]"
              />
              <Search className="w-3.5 h-3.5 text-[#737373] absolute left-0.5 rtl:left-auto rtl:right-0.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-1 rtl:right-auto rtl:left-1 text-[#737373] hover:text-[#111111] text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Language Selector (Desktop & Tablet md+) */}
            <div className="relative hidden md:block">
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
                <span className="text-[11px] font-semibold">{currentLanguage}</span>
                <ChevronDown className="w-3 h-3 text-[#737373]" />
              </button>

              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
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
                </>
              )}
            </div>

            {/* Currency Selector (Desktop & Tablet md+) */}
            <div className="relative hidden md:block">
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
                <span className="text-[11px] font-semibold">{currency}</span>
                <ChevronDown className="w-3 h-3 text-[#737373]" />
              </button>

              {currDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCurrDropdownOpen(false)} />
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
                </>
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
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#111111] text-white text-[9px] font-sans font-bold flex items-center justify-center">
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
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#111111] text-white text-[9px] font-sans font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              {cartTotal > 0 && (
                <span className="hidden 2xl:inline font-sans font-medium text-xs text-[#111111]">
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
              {isArabic ? 'المجموعة' : (currentLanguage === 'en' ? 'Shop' : currentLanguage === 'es' ? 'Colección' : 'Collection')}
            </button>

            <button
              onClick={() => {
                if (onOpenStory) onOpenStory();
                else onOpenB2B();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right py-2 text-[#737373] hover:text-[#111111] border-b border-[#F3F3F1]"
            >
              {isArabic ? 'الورشة' : (currentLanguage === 'en' ? 'The Atelier' : currentLanguage === 'es' ? 'El Atelier' : 'L’Atelier')}
            </button>

            <button
              onClick={() => {
                if (onOpenStory) onOpenStory();
                else onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right py-2 text-[#737373] hover:text-[#111111] border-b border-[#F3F3F1]"
            >
              {isArabic ? 'عن الدار' : (currentLanguage === 'en' ? 'About' : currentLanguage === 'es' ? 'Sobre Nosotros' : 'À Propos')}
            </button>

            <button
              onClick={() => {
                onOpenOrderLookup();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right py-2 text-[#737373] hover:text-[#111111] border-b border-[#F3F3F1] flex items-center justify-between"
            >
              <span>{isArabic ? 'تتبع الطلبية' : (currentLanguage === 'en' ? 'Track Order' : currentLanguage === 'es' ? 'Seguimiento' : 'Suivi de commande')}</span>
              <Truck className="w-4 h-4 text-[#737373]" />
            </button>

            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right py-2 text-[#737373] hover:text-[#111111]"
            >
              {isArabic ? 'تواصل معنا' : (currentLanguage === 'en' ? 'Contact' : currentLanguage === 'es' ? 'Contacto' : 'Contact')}
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
