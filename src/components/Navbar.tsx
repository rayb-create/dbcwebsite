import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Phone,
  Building2,
  Globe,
  ChevronDown,
  MessageCircle,
  Truck,
  Coins
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

  const customNavCategories = (storeSettings.customCategories || []).map((cat) => ({
    id: cat.id,
    label: (currentLanguage === 'ar' ? cat.nameAr : currentLanguage === 'es' ? cat.nameEs : currentLanguage === 'en' ? cat.nameEn : cat.name) || cat.name,
  }));

  const standardNavCategories = [
    { id: 'all', label: t.navAll },
    { id: 'hoodies', label: t.navHoodies },
    { id: 'joggers', label: t.navJoggers },
    { id: 'long-sleeves', label: t.navLongSleeves },
    { id: 'tees', label: t.navTees },
    { id: 'tracksuits', label: t.navTracksuits },
    { id: 'outerwear', label: t.navOuterwear || (isArabic ? 'سترات ومعاطف' : currentLanguage === 'es' ? 'Chaquetas' : currentLanguage === 'en' ? 'Outerwear' : 'Vestes') },
  ];

  const categories = [...standardNavCategories, ...customNavCategories];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6E6E6] transition-all">
      {/* Top Banner: Nationwide 69-Wilaya logistics notice & Order tracking utility */}
      <div className="bg-[#111111] text-[#FFFFFF] text-[11px] font-mono py-1.5 px-4 tracking-wider border-b border-black">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span className="text-[#DCDCDC]">{t.topbarDelivery}</span>
          </div>

          <div className="hidden md:flex items-center gap-5 text-xs">
            <a
              href={`https://wa.me/${storeSettings.whatsappNumber?.replace(/[^0-9]/g, '') || '213550458812'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#DCDCDC] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              <span>WhatsApp : {storeSettings.whatsappNumber || '0550 45 88 12'}</span>
            </a>

            <button
              onClick={onOpenOrderLookup}
              className="text-[#DCDCDC] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-white" />
              <span>{t.navOrderLookup}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Mobile Menu & Search triggers */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#111111] hover:bg-[#F3F3F1] rounded transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#111111] hover:bg-[#F3F3F1] rounded transition-colors cursor-pointer"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Logo / Brand Name */}
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
              <span className="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.2em] font-semibold text-[#111111] uppercase transition-colors">
                {storeSettings.storeName || 'DBC WORKSHOP'}
              </span>
              <span className="text-[9px] sm:text-[10px] font-sans tracking-widest text-[#737373] uppercase">
                {t.subTagline || t.tagline}
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs font-sans tracking-wider overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 uppercase transition-colors cursor-pointer whitespace-nowrap text-xs font-mono ${
                  activeCategory === cat.id
                    ? 'text-[#111111] font-bold border-b-2 border-[#111111]'
                    : 'text-[#737373] hover:text-[#111111] border-b-2 border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              onClick={onOpenB2B}
              className="ml-2 px-3 py-1.5 uppercase transition-colors cursor-pointer whitespace-nowrap text-[#111111] font-bold border border-[#E6E6E6] hover:border-[#111111] hover:bg-[#F3F3F1] flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.navB2B}</span>
            </button>
          </nav>

          {/* Right Action Icons & Selectors */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            
            {/* Desktop Search */}
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-40 lg:w-52 pl-8 pr-3 py-1.5 text-xs font-sans bg-[#F3F3F1] border border-[#E6E6E6] rounded-none focus:outline-none focus:border-[#111111] focus:w-60 transition-all text-[#111111]"
              />
              <Search className="w-3.5 h-3.5 text-[#737373] absolute left-2.5 rtl:left-auto rtl:right-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 rtl:right-auto rtl:left-2 text-[#737373] hover:text-[#111111] text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrDropdownOpen(false);
                }}
                className="px-2 py-1 bg-[#F3F3F1] hover:bg-[#E6E6E6] border border-[#E6E6E6] text-xs font-sans flex items-center gap-1 cursor-pointer transition-colors"
                title="Changer la langue / تغيير اللغة"
              >
                <Globe className="w-3.5 h-3.5 text-[#111111]" />
                <span className="uppercase font-bold text-[#111111]">{currentLanguage}</span>
                <ChevronDown className="w-3 h-3 text-[#737373]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1 w-44 bg-white border border-[#E6E6E6] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-mono text-[#737373] uppercase border-b border-[#E6E6E6]">
                    Langue / اللغة
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-[#F3F3F1] cursor-pointer ${
                        currentLanguage === lang.code ? 'font-bold text-[#111111] bg-[#F8F8F7]' : 'text-[#737373]'
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
                className="px-2 py-1 bg-[#F3F3F1] hover:bg-[#E6E6E6] border border-[#E6E6E6] text-xs font-sans font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="Devise / العملة"
              >
                <Coins className="w-3.5 h-3.5 text-[#111111] shrink-0 inline-block" />
                <span className="text-[#111111]">{currency}</span>
                <ChevronDown className="w-3 h-3 text-[#737373]" />
              </button>

              {currDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1 w-28 bg-white border border-[#E6E6E6] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-mono text-[#737373] uppercase border-b border-[#E6E6E6]">
                    Devise
                  </div>
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onCurrencyChange(c);
                        setCurrDropdownOpen(false);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-[#F3F3F1] cursor-pointer ${
                        currency === c ? 'font-bold text-[#111111] bg-[#F8F8F7]' : 'text-[#737373]'
                      }`}
                    >
                      <span>{c} {c === 'DZD' ? '(د.ج)' : ''}</span>
                      {currency === c && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Contact Button */}
            <button
              onClick={onOpenContact}
              className="hidden sm:flex p-2 text-[#737373] hover:text-[#111111] hover:bg-[#F3F3F1] rounded transition-colors cursor-pointer"
              title={t.navContact}
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="navbar-wishlist-btn"
              onClick={onOpenWishlist}
              className="p-1.5 sm:p-2 text-[#737373] hover:text-[#111111] hover:bg-[#F3F3F1] rounded transition-colors relative cursor-pointer"
              title="Favoris"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 bg-[#111111] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={onOpenCart}
              className="p-1.5 sm:p-2 text-[#111111] hover:bg-[#F3F3F1] rounded transition-colors relative flex items-center gap-1.5 cursor-pointer"
              title="Panier"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 bg-[#111111] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              {cartTotal > 0 && (
                <span className="hidden xl:inline font-mono font-bold text-xs text-[#111111]">
                  {formatPrice(cartTotal, currency, isArabic)}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-[#E6E6E6] bg-[#FFFFFF]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs font-mono bg-[#F3F3F1] border border-[#E6E6E6] rounded-none focus:outline-none focus:border-[#111111]"
              autoFocus
            />
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-2.5" />
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E6E6E6] bg-[#FFFFFF] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left rtl:text-right px-3 py-2 text-xs font-sans uppercase tracking-wider rounded transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#111111] text-white font-bold'
                    : 'text-[#737373] hover:bg-[#F3F3F1] hover:text-[#111111]'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              onClick={() => {
                onOpenOrderLookup();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right px-3 py-2 text-xs font-sans uppercase tracking-wider text-[#111111] font-bold flex items-center gap-2 bg-[#F3F3F1] border border-[#E6E6E6] rounded"
            >
              <Truck className="w-4 h-4 text-[#111111]" />
              <span>{t.navOrderLookup} (69 Wilayas)</span>
            </button>

            <button
              onClick={() => {
                onOpenB2B();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right px-3 py-2 text-xs font-sans uppercase tracking-wider text-[#111111] font-bold flex items-center gap-2 border border-[#E6E6E6] hover:bg-[#F3F3F1]"
            >
              <Building2 className="w-4 h-4 text-[#111111]" />
              <span>{t.navB2B}</span>
            </button>

            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rtl:text-right px-3 py-2 text-xs font-sans uppercase tracking-wider text-[#737373] hover:text-[#111111] flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t.navContact} ({storeSettings.phone})</span>
            </button>
          </div>

          {/* Mobile Language & Currency */}
          <div className="pt-3 border-t border-[#E6E6E6] space-y-3">
            <div>
              <div className="text-[11px] font-mono text-[#737373] uppercase flex items-center gap-1 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-[#111111]" />
                <span>Langue / Language</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`py-1.5 px-2 rounded text-xs font-mono text-center cursor-pointer ${
                      currentLanguage === lang.code
                        ? 'bg-[#111111] text-white font-bold'
                        : 'bg-[#F3F3F1] text-[#737373] hover:bg-[#E6E6E6] hover:text-[#111111]'
                    }`}
                  >
                    {lang.native.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[#737373] uppercase flex items-center gap-1 mb-1.5">
                <Coins className="w-3.5 h-3.5 text-[#111111] shrink-0 inline-block" />
                <span>Devise / Currency</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onCurrencyChange(c);
                      setMobileMenuOpen(false);
                    }}
                    className={`py-1.5 px-2 rounded text-xs font-mono text-center cursor-pointer ${
                      currency === c
                        ? 'bg-[#111111] text-white font-bold'
                        : 'bg-[#F3F3F1] text-[#737373] hover:bg-[#E6E6E6] hover:text-[#111111]'
                    }`}
                  >
                    {c} {c === 'DZD' ? '(د.ج)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </header>
  );
};

export default Navbar;
