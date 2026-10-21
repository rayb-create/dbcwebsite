import React from 'react';
import { Globe } from 'lucide-react';
import { useAdminLanguage, AdminLanguage } from '../../context/AdminLanguageContext';

interface LanguageOption {
  code: AdminLanguage;
  label: string;
  shortLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ar', label: 'العربية', shortLabel: 'عر' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
];

interface AdminLanguageSelectorProps {
  variant?: 'header' | 'compact' | 'dropdown';
  className?: string;
}

export const AdminLanguageSelector: React.FC<AdminLanguageSelectorProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { adminLang, setAdminLang } = useAdminLanguage();

  return (
    <div
      className={`inline-flex items-center bg-[#141210] border border-[#3E3832] rounded-lg p-0.5 text-xs font-mono select-none ${className}`}
      role="group"
      aria-label="Admin Interface Language"
    >
      <div className="flex items-center px-2 py-1 text-[#8C8377] gap-1 shrink-0 border-r border-[#2D2824] hidden sm:flex">
        <Globe className="w-3.5 h-3.5 text-[#C9A96E]" />
        <span className="text-[10px] uppercase font-bold text-[#A8A196]">Lang</span>
      </div>

      <div className="flex items-center divide-x divide-[#2D2824]">
        {LANGUAGES.map((lang) => {
          const isActive = adminLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setAdminLang(lang.code)}
              className={`px-2.5 py-1 text-xs rounded transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-[#C9A96E] text-[#141210] font-bold shadow-xs'
                  : 'text-[#C7BFB3] hover:text-white hover:bg-[#25211D]'
              }`}
              title={`Basculer en ${lang.label}`}
              aria-pressed={isActive}
            >
              <span className="hidden md:inline">{lang.label}</span>
              <span className="md:hidden">{lang.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
