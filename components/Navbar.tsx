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
  Package
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

  const categories = [
    { id: 'all', label: t.navAll },
    { id: 'hoodies', label: t.navHoodies },
    { id: 'joggers', label: t.navJoggers },
    { id: 'longsleeves', label: t.navLongSleeves },
    { id: 'tees', label: t.navTees },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] transition-colors duration-200">
      {/* Top Algerian Delivery & Contact Bar */}
      <div className="bg-[#1F1D1A] text-[#ECE7DF] px-4 py-1.5 text-xs font-mono tracking-wider flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Truck className="w-3.5 h-3.5 text-[#C9A96E]" />
          <span>{t.topbarDelivery}</span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <button
            onClick={onOpenOrderLookup}
            className="text-[#C9A96E] hover:text-white flex items-center gap-1.5 cursor-pointer font-bold transition-colors bg-[#332E27] px-2 py-0.5 rounded border border-[#C9A96E]/30"
          >
            <Package className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{t.navOrderLookup} (69 Wilayas)</span>
          </button>
          <span className="text-[#5C554A]">|</span>
          <span className="text-[#8C8377]">
            Alger • Oran • Constantine • Sétif + 65 Wilayas
          </span>
          <span className="text-[#5C554A]">|</span>
          <button
            onClick={onOpenContact}
            className="text-[#ECE7DF] hover:text-[#C9A96E] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Phone className="w-3 h-3 text-[#C9A96E]" />
            <span>{storeSettings.phone}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2C2825] hover:text-black focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              id="mobile-search-toggle-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 ml-1 text-[#2C2825] hover:text-black"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectCategory('all')}>
            <div className="w-10 h-10 bg-[#1F1D1A] text-white flex items-center justify-center rounded font-serif text-xl font-bold tracking-tighter shadow-sm border border-[#3D3730]">
              DBC
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1F1C19] block leading-none">
                DBC WORKSHOP
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#8C6D3B] uppercase block mt-1">
                Atelier de Confection • B2B & B2C Algérie
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors rounded-xs cursor-pointer ${
                  activeCategory === cat.id
                    ? 'text-[#1F1C19] font-bold border-b-2 border-black'
                    : 'text-[#686055] hover:text-[#1F1C19] hover:bg-[#F2EDE4]'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              onClick={onOpenB2B}
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[#8C6D3B] hover:text-white hover:bg-[#8C6D3B] border border-[#8C6D3B]/40 rounded transition-all cursor-pointer flex items-center gap-1.5 ml-2"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.navB2B}</span>
            </button>
          </nav>

          {/* Right Action Icons & Selectors */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Search */}
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-44 lg:w-56 pl-8 pr-3 py-1.5 text-xs font-sans bg-[#F2EDE4] border border-[#DDD4C5] rounded focus:outline-none focus:border-black focus:w-64 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-[#7C756B] absolute left-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 text-[#7C756B] hover:text-black text-xs font-bold"
                >
                  ×
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
                className="px-2 py-1 bg-[#F2EDE4] hover:bg-[#E8E1D5] border border-[#DDD4C5] rounded text-xs font-mono flex items-center gap-1 cursor-pointer"
                title="Changer la langue / تغيير اللغة"
              >
                <Globe className="w-3.5 h-3.5 text-[#8C6D3B]" />
                <span className="uppercase font-bold">{currentLanguage}</span>
                <ChevronDown className="w-3 h-3 text-[#7C756B]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#DDD4C5] rounded shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-[#F4EFE7] cursor-pointer ${
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

            {/* Currency Selector */}
            <div className="relative">
              <button
                id="currency-selector-btn"
                onClick={() => {
                  setCurrDropdownOpen(!currDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="px-2 py-1 bg-[#F2EDE4] hover:bg-[#E8E1D5] border border-[#DDD4C5] rounded text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                title="Devise / العملة"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-[#7C756B]" />
              </button>

              {currDropdownOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white border border-[#DDD4C5] rounded shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
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
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-[#F4EFE7] cursor-pointer ${
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

            {/* Order Lookup Tracker Trigger */}
            <button
              id="navbar-order-lookup-btn"
              onClick={onOpenOrderLookup}
              className="px-2.5 py-1 bg-white hover:bg-[#F2EDE4] text-[#1F1C19] border border-[#DDD4C5] rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              title="Suivi de Commande & Livraison 69 Wilayas"
            >
              <Truck className="w-3.5 h-3.5 text-[#8C6D3B]" />
              <span className="hidden md:inline">{t.navOrderLookup}</span>
            </button>

            {/* Contact Trigger */}
            <button
              onClick={onOpenContact}
              className="p-2 text-[#4A4338] hover:text-black hover:bg-[#F2EDE4] rounded transition-colors cursor-pointer"
              title={t.navContact}
            >
              <Phone className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <button
              id="navbar-wishlist-btn"
              onClick={onOpenWishlist}
              className="p-2 text-[#4A4338] hover:text-black hover:bg-[#F2EDE4] rounded transition-colors relative cursor-pointer"
              title="Favoris"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#8C6D3B] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              id="navbar-cart-btn"
              onClick={onOpenCart}
              className="p-2 text-[#1F1C19] hover:bg-[#F2EDE4] rounded transition-colors relative flex items-center gap-2 cursor-pointer font-mono text-xs"
              title={t.cartTitle}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              {cartCount > 0 && (
                <span className="hidden xl:inline font-bold">
                  {formatPrice(cartTotal, currency, isArabic)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Expandable */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-[#E8E2D8] bg-[#FAF8F5]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#DDD4C5] rounded focus:outline-none"
              autoFocus
            />
            <Search className="w-4 h-4 text-[#7C756B] absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 text-[#7C756B] font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D8] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wider rounded ${
                  activeCategory === cat.id
                    ? 'bg-[#1F1D1A] text-white font-bold'
                    : 'text-[#4A4338] hover:bg-[#F2EDE4]'
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
              className="w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#1F1C19] font-bold flex items-center gap-2 bg-white border border-[#DDD4C5] rounded"
            >
              <Truck className="w-4 h-4 text-[#8C6D3B]" />
              <span>{t.navOrderLookup} (69 Wilayas)</span>
            </button>
            <button
              onClick={() => {
                onOpenB2B();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#8C6D3B] font-bold flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>{t.navB2B}</span>
            </button>
            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-[#4A4338] flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{t.navContact} ({storeSettings.phone})</span>
            </button>
          </div>

          {/* Mobile Language and Currency Selectors */}
          <div className="pt-3 border-t border-[#E8E2D8] space-y-2">
            <div className="text-[11px] font-mono text-[#8C8377] uppercase flex items-center gap-1">
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
        </div>
      )}
    </header>
  );
};
