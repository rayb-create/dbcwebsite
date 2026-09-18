import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminLanguage, AdminTranslations, ADMIN_TRANSLATIONS } from '../data/adminI18n';
import { Globe } from 'lucide-react';

export type { AdminLanguage, AdminTranslations };

const ADMIN_LANG_STORAGE_KEY = 'dbc_admin_lang';

interface AdminLanguageContextType {
  adminLang: AdminLanguage;
  setAdminLang: (lang: AdminLanguage) => void;
  isRtl: boolean;
  t: AdminTranslations;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export const AdminLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminLang, setAdminLangState] = useState<AdminLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ADMIN_LANG_STORAGE_KEY);
      if (saved === 'ar' || saved === 'fr' || saved === 'en' || saved === 'es') {
        return saved;
      }
    }
    return 'fr';
  });

  const setAdminLang = (lang: AdminLanguage) => {
    setAdminLangState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ADMIN_LANG_STORAGE_KEY, lang);
    }
  };

  const isRtl = adminLang === 'ar';
  const t = ADMIN_TRANSLATIONS[adminLang] || ADMIN_TRANSLATIONS.fr;

  return (
    <AdminLanguageContext.Provider value={{ adminLang, setAdminLang, isRtl, t }}>
      <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-arabic' : ''}>
        {children}
      </div>
    </AdminLanguageContext.Provider>
  );
};

export const useAdminLanguage = (): AdminLanguageContextType => {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      adminLang: 'fr',
      setAdminLang: () => {},
      isRtl: false,
      t: ADMIN_TRANSLATIONS.fr,
    };
  }
  return context;
};

/**
 * Reusable Admin Language Switcher Component
 * Renders: العربية | Français | English | Español
 */
export const AdminLanguageSelector: React.FC<{
  className?: string;
  variant?: 'dark' | 'light';
}> = ({ className = '', variant = 'dark' }) => {
  const { adminLang, setAdminLang } = useAdminLanguage();

  const languages: { code: AdminLanguage; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];

  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center rounded-lg p-1 text-xs font-mono transition-colors ${
        isDark
          ? 'bg-[#191715] border border-[#3D3730]'
          : 'bg-[#F2EDE4] border border-[#DDD4C5]'
      } ${className}`}
      dir="ltr"
    >
      <div className="flex items-center px-1.5 py-0.5 text-[#8C8377] shrink-0">
        <Globe className="w-3.5 h-3.5 text-[#C9A96E]" />
      </div>

      <div className="flex items-center gap-0.5">
        {languages.map((lang, index) => {
          const isActive = adminLang === lang.code;
          return (
            <React.Fragment key={lang.code}>
              <button
                type="button"
                onClick={() => setAdminLang(lang.code)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? 'bg-[#C9A96E] text-[#191715] shadow-xs'
                      : 'bg-[#1F1D1A] text-white shadow-xs'
                    : isDark
                    ? 'text-[#A8A196] hover:text-white hover:bg-[#2B2723]'
                    : 'text-[#5C5549] hover:text-[#1F1C19] hover:bg-[#E5DEC9]'
                }`}
                title={`Changer la langue du panneau : ${lang.label}`}
              >
                {lang.label}
              </button>
              {index < languages.length - 1 && (
                <span
                  className={`text-[10px] select-none ${
                    isDark ? 'text-[#3D3730]' : 'text-[#DDD4C5]'
                  }`}
                >
                  |
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
