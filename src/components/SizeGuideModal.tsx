import React, { useState } from 'react';
import { X, Ruler, Check, HelpCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/i18n';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBespoke?: () => void;
  currentLanguage?: Language;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenBespoke,
  currentLanguage = 'fr',
}) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('cm');
  const t = TRANSLATIONS[currentLanguage];
  const isArabic = currentLanguage === 'ar';
  
  // Interactive Fit Advisor state
  const [chestInput, setChestInput] = useState(102); // in cm default
  const [waistInput, setWaistInput] = useState(84);

  if (!isOpen) return null;

  const convert = (cmVal: number) => {
    if (unit === 'cm') return `${cmVal} cm`;
    return `${Math.round(cmVal / 2.54)}"`;
  };

  // Compute recommended size based on cm
  const getRecommendedSize = () => {
    if (chestInput <= 92) return 'XS';
    if (chestInput <= 99) return 'S';
    if (chestInput <= 107) return 'M';
    if (chestInput <= 114) return 'L';
    if (chestInput <= 122) return 'XL';
    return 'XXL';
  };

  const recSize = getRecommendedSize();

  const sizeTable = [
    { size: 'XS', chest: 91, waist: 74, sleeve: 84, shoulder: 43, inseam: 79 },
    { size: 'S', chest: 96, waist: 79, sleeve: 85, shoulder: 44.5, inseam: 80 },
    { size: 'M', chest: 104, waist: 84, sleeve: 88, shoulder: 46.5, inseam: 81 },
    { size: 'L', chest: 112, waist: 91, sleeve: 90, shoulder: 48.5, inseam: 82.5 },
    { size: 'XL', chest: 120, waist: 99, sleeve: 93, shoulder: 50, inseam: 84 },
    { size: 'XXL', chest: 128, waist: 107, sleeve: 95, shoulder: 52, inseam: 85 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200" dir={isArabic ? 'rtl' : 'ltr'}>
      <div 
        className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#23201D] text-[#FAF8F5] border-b border-[#3B352E]">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#C9A96E]" />
            <h2 className="font-serif text-lg font-medium tracking-wide">
              {t.sizeGuideTitle}
            </h2>
          </div>
          <button
            id="close-size-guide-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Unit Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[#6D6559]">
              {t.sizeGuideSubtitle}
            </p>
            <div className="flex items-center border border-[#DDD4C5] rounded bg-[#EFE9DF] p-0.5 font-mono text-xs">
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  unit === 'cm' ? 'bg-white text-black font-bold shadow-xs' : 'text-[#6D6559]'
                }`}
              >
                {t.sizeGuideCm}
              </button>
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  unit === 'in' ? 'bg-white text-black font-bold shadow-xs' : 'text-[#6D6559]'
                }`}
              >
                {t.sizeGuideInches}
              </button>
            </div>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto border border-[#DDD4C5] rounded bg-white">
            <table className="w-full text-left rtl:text-right font-mono">
              <thead>
                <tr className="bg-[#F2ECE1] border-b border-[#DDD4C5] text-[#4A4338] text-[11px] uppercase tracking-wider">
                  <th className="p-2.5">{t.selectSize}</th>
                  <th className="p-2.5">{isArabic ? 'الصدر' : (currentLanguage === 'en' ? 'Chest' : currentLanguage === 'es' ? 'Pecho' : 'Tour de Poitrine')}</th>
                  <th className="p-2.5">{isArabic ? 'الخصر' : (currentLanguage === 'en' ? 'Waist' : currentLanguage === 'es' ? 'Cintura' : 'Tour de Taille')}</th>
                  <th className="p-2.5">{isArabic ? 'طول الكم' : (currentLanguage === 'en' ? 'Sleeve' : currentLanguage === 'es' ? 'Manga' : 'Longueur Manches')}</th>
                  <th className="p-2.5">{isArabic ? 'عرض الكتفين' : (currentLanguage === 'en' ? 'Shoulder' : currentLanguage === 'es' ? 'Hombros' : 'Carrure Épaules')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D6] text-[#2C2825]">
                {sizeTable.map((row) => (
                  <tr key={row.size} className="hover:bg-[#FAF8F5]">
                    <td className="p-2.5 font-bold font-serif">{row.size}</td>
                    <td className="p-2.5">{convert(row.chest)}</td>
                    <td className="p-2.5">{convert(row.waist)}</td>
                    <td className="p-2.5">{convert(row.sleeve)}</td>
                    <td className="p-2.5">{convert(row.shoulder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive Advisor */}
          <div className="p-4 bg-[#F2EDE4] border border-[#DDD4C5] rounded space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#8C6D3B]" />
              <h3 className="font-serif text-sm font-bold text-[#1F1C19]">
                {t.sizeGuideAdvisorTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[#5C554B] mb-1">
                  {t.sizeGuideChestLabel} <strong>{convert(chestInput)}</strong>
                </label>
                <input
                  type="range"
                  min="85"
                  max="135"
                  value={chestInput}
                  onChange={(e) => setChestInput(Number(e.target.value))}
                  className="w-full accent-[#8C6D3B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#5C554B] mb-1">
                  {t.sizeGuideWaistLabel} <strong>{convert(waistInput)}</strong>
                </label>
                <input
                  type="range"
                  min="70"
                  max="120"
                  value={waistInput}
                  onChange={(e) => setWaistInput(Number(e.target.value))}
                  className="w-full accent-[#8C6D3B]"
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-[#DDD4C5] rounded flex items-center justify-between">
              <span className="font-mono text-xs text-[#5C554B]">
                {t.sizeGuideRecommended}
              </span>
              <span className="font-serif text-lg font-bold text-[#8C6D3B] px-3 py-0.5 bg-[#FAF3E8] rounded border border-[#E8DCB8]">
                {recSize}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
