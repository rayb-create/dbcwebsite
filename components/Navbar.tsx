import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Scissors, 
  Phone,
  Sliders,
  Building2,
  Globe,
  ChevronDown,
  MessageCircle,
  Truck,
  Package,
  CreditCard,
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
  onOpenOrderLookup?: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  storeSettings: StoreSettings;
}

interface LanguageOption {
  code: Language;
  label: string;
  native: string;
}

const LANGUAGES: LanguageOption[] = [
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

  const categories = [
    { id: 'all', label: t.navAll },
    { id: 'hoodies', label: t.navHoodies },
    { id: 'joggers', label: t.navJoggers },
    { id: 'long-sleeves', label: t.navLongSleeves },
    { id: 'tees', label: t.navTees },
    { id: 'tracksuits', label: t.navTracksuits },
    { id: 'outerwear', label: t.navOuterwear },
    { id: 'b2b', label: t.navB2B },
  ];

  const customCategories = storeSettings?.customCategories || [];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] transition-all">
      {/* Top Banner: Wilaya delivery notification & WhatsApp quick access */}
      <div className="bg-[#1F1D1A] text-[#EDE7DD] text-[11px] font-mono py-1.5 px-4 tracking-wider">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"></span>
            <span>{t.topbarDelivery}</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs">
            <a
              href={`https://wa.me/${storeSettings.whatsappNumber?.replace(/[^0-9]/g, '') || '213550458812'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E0D8CB] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp : {storeSettings.whatsappNumber || '0550 45 88 12'}</span>
            </a>

            {onOpenOrderLookup && (
              <button
                onClick={onOpenOrderLookup}
                className="text-[#E0D8CB] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Truck className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span>{t.navOrderLookup}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#2C2825] hover:text-black focus:outline-none cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              <span className="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.18em] font-bold text-[#1F1D1A] uppercase group-hover:text-[#8C6D3B] transition-colors">
                {storeSettings.storeName || 'DBC WORKSHOP'}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[#7C756B] uppercase font-medium">
                {t.subTagline || t.tagline}
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs font-mono tracking-wider overflow-x-auto scrollbar-none py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#1F1D1A] text-white font-bold'
                    : 'text-[#4A4338] hover:text-black hover:bg-[#EAE4D9]/60'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {customCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-[#8C6D3B] text-white font-bold'
                    : 'text-[#8C6D3B] hover:text-black hover:bg-[#EAE4D9]/60'
                }`}
              >
                {isArabic ? (cat.nameAr || cat.name) : currentLanguage === 'en' ? (cat.nameEn || cat.name) : currentLanguage === 'es' ? (cat.nameEs || cat.name) : cat.name}
              </button>
            ))}
          </nav>

          {/* Action Icons & Selectors */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            
            {/* Search Bar Toggle / Expandable Input */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-[#F2EDE4] border border-[#DDD4C5] rounded px-2.5 py-1 animate-in fade-in duration-200">
                  <Search className="w-3.5 h-3.5 text-[#8C6D3B] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    autoFocus
                    className="w-28 sm:w-44 md:w-56 bg-transparent border-none text-xs font-mono text-[#1F1D1A] focus:outline-none pl-2 pr-1"
                  />
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setSearchOpen(false);
                    }}
                    className="text-[#7C756B] hover:text-black cursor-pointer p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[#2C2825] hover:text-black hover:bg-[#EDE7DD] rounded-full transition-colors cursor-pointer"
                  title={t.searchPlaceholder}
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                id="language-selector-btn"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrDropdownOpen(false);
                }}
                className="px-1.5 py-1 sm:px-2 sm:py-1 bg-[#F2EDE4] hover:bg-[#E8E1D5] border border-[#DDD4C5] rounded text-[11px] sm:text-xs font-mono flex items-center gap-0.5 sm:gap-1 cursor-pointer"
                title="Changer la langue / تغيير اللغة"
              >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8C6D3B]" />
                <span className="uppercase font-bold">{currentLanguage}</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#7C756B]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1 w-44 bg-white border border-[#DDD4C5] rounded shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-mono text-[#8C8377] uppercase border-b border-[#F0EAE1]">
                    Langue / اللغة
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-[#F4EFE7] cursor-pointer ${
                        currentLanguage === lang.code ? 'font-bold text-[#8C6D3B] bg-[#FAF8F5]' : 'text-[#2C2825]'
                      }`}
                    >
                      <span>{lang.native}</span>
                      {currentLanguage === lang.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector with Visible Coins Icon */}
            <div className="relative">
              <button
                id="currency-selector-btn"
                onClick={() => {
                  setCurrDropdownOpen(!currDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="px-1.5 py-1 sm:px-2 sm:py-1 bg-[#F2EDE4] hover:bg-[#E8E1D5] border border-[#DDD4C5] rounded text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                title="Devise / العملة"
              >
                <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8C6D3B]" />
                <span>{currency}</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#7C756B]" />
              </button>

              {currDropdownOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1 w-28 bg-white border border-[#DDD4C5] rounded shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[10px] font-mono text-[#8C8377] uppercase border-b border-[#F0EAE1]">
                    Devise
                  </div>
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onCurrencyChange(c);
                        setCurrDropdownOpen(false);
                      }}
                      className={`w-full text-left rtl:text-right px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-[#F4EFE7] cursor-pointer ${
                        currency === c ? 'font-bold text-[#8C6D3B] bg-[#FAF8F5]' : 'text-[#2C2825]'
                      }`}
                    >
                      <span>{c} {c === 'DZD' ? '(د.ج)' : ''}</span>
                      {currency === c && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="p-2 text-[#2C2825] hover:text-black hover:bg-[#EDE7DD] rounded-full transition-colors relative cursor-pointer"
              title={t.navWishlist}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#8C6D3B] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              id="navbar-cart-btn"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#1F1D1A] hover:bg-black text-white rounded text-xs font-mono font-semibold transition-colors cursor-pointer shadow-xs"
              title={t.cartTitle}
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C9A96E]" />
              <span className="hidden sm:inline">{cartCount}</span>
              {cartCount > 0 && (
                <span className="sm:hidden text-[11px] font-bold text-[#C9A96E]">
                  ({cartCount})
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden md:inline border-l border-white/20 pl-1.5 text-[#C9A96E]">
                  {formatPrice(cartTotal, currency, isArabic)}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#DDD4C5] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8C6D3B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD4C5] rounded text-xs font-mono text-[#1F1D1A] focus:outline-none"
            />
          </div>

          {/* Categories Grid */}
          <div>
            <div className="text-[11px] font-mono text-[#8C8377] uppercase tracking-wider mb-2">
              {t.footerColCollection}
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 px-3 rounded text-left rtl:text-right transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#1F1D1A] text-white font-bold'
                      : 'bg-[#F2EDE4] text-[#2C2825] hover:bg-[#E8E1D5]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              {customCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 px-3 rounded text-left rtl:text-right transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#8C6D3B] text-white font-bold'
                      : 'bg-[#EAE4D9] text-[#8C6D3B] font-semibold hover:bg-[#DDD4C5]'
                  }`}
                >
                  {isArabic ? (cat.nameAr || cat.name) : currentLanguage === 'en' ? (cat.nameEn || cat.name) : currentLanguage === 'es' ? (cat.nameEs || cat.name) : cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="pt-2 border-t border-[#E8E2D8] flex flex-col gap-2 text-xs font-mono">
            <button
              onClick={() => {
                onOpenB2B();
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 bg-[#24211D] text-[#C9A96E] rounded flex items-center gap-2 font-bold cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>{t.navB2B}</span>
            </button>

            {onOpenOrderLookup && (
              <button
                onClick={() => {
                  onOpenOrderLookup();
                  setMobileMenuOpen(false);
                }}
                className="py-2 px-3 bg-[#F2EDE4] hover:bg-[#E8E1D5] rounded flex items-center gap-2 text-[#2C2825] cursor-pointer"
              >
                <Truck className="w-4 h-4 text-[#8C6D3B]" />
                <span>{t.navOrderLookup}</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 bg-[#F2EDE4] hover:bg-[#E8E1D5] rounded flex items-center gap-2 text-[#2C2825] cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{t.navContact} ({storeSettings.phone})</span>
            </button>
          </div>

          {/* Mobile Language and Currency Selectors */}
          <div className="pt-3 border-t border-[#E8E2D8] space-y-3">
            <div>
              <div className="text-[11px] font-mono text-[#8C8377] uppercase flex items-center gap-1 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-[#8C6D3B]" />
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
                        ? 'bg-[#1F1D1A] text-white font-bold'
                        : 'bg-[#F2EDE4] text-[#4A4338] hover:bg-[#E8E1D5]'
                    }`}
                  >
                    {lang.native.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[#8C8377] uppercase flex items-center gap-1 mb-1.5">
                <Coins className="w-3.5 h-3.5 text-[#8C6D3B]" />
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
                        ? 'bg-[#1F1D1A] text-white font-bold'
                        : 'bg-[#F2EDE4] text-[#4A4338] hover:bg-[#E8E1D5]'
                    }`}
                  >
                    {c}
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
