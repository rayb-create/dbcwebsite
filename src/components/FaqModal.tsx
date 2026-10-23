import React, { useState } from 'react';
import { X, ChevronDown, HelpCircle } from 'lucide-react';
import { WORKSHOP_FAQS } from '../data/products';
import { Language } from '../data/i18n';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
}

export const FaqModal: React.FC<FaqModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const isArabic = currentLanguage === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E6E6E6] shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#111111] text-white border-b border-black">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-white" />
            <h2 className="font-serif text-lg font-normal tracking-[0.15em] uppercase">
              {isArabic ? 'الأسئلة الشائعة' : currentLanguage === 'en' ? 'Frequently Asked Questions' : currentLanguage === 'es' ? 'Preguntas Frecuentes' : 'Questions Fréquentes'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-3 font-sans">
          {WORKSHOP_FAQS.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx}
                className="border border-[#E6E6E6] bg-white transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full px-5 py-4 text-left rtl:text-right flex items-center justify-between text-xs sm:text-sm font-medium text-[#111111] hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                >
                  <span className="font-serif text-sm sm:text-base font-normal text-[#111111] pr-3 rtl:pl-3">
                    {currentLanguage === 'ar' ? (faq.questionAr || faq.question) : currentLanguage === 'en' ? (faq.questionEn || faq.question) : currentLanguage === 'es' ? (faq.questionEs || faq.question) : faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#737373] shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 text-xs text-[#525252] leading-relaxed border-t border-[#F3F3F1] pt-3.5 bg-[#FBFBFA] font-light">
                    {currentLanguage === 'ar' ? (faq.answerAr || faq.answer) : currentLanguage === 'en' ? (faq.answerEn || faq.answer) : currentLanguage === 'es' ? (faq.answerEs || faq.answer) : faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FBFBFA] border-t border-[#E6E6E6] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#111111] hover:bg-black text-white text-xs font-sans uppercase tracking-widest transition-colors cursor-pointer"
          >
            {isArabic ? 'إغلاق' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqModal;
