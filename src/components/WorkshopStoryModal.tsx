import React from 'react';
import { X, Scissors, Award, Compass, Sparkles } from 'lucide-react';

interface WorkshopStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkshopStoryModal: React.FC<WorkshopStoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#FFFFFF] border border-[#E6E6E6] overflow-hidden my-6 max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#111111] text-white border-b border-black">
          <div className="flex items-center gap-2.5">
            <Scissors className="w-4 h-4 text-white" />
            <h2 className="font-serif text-lg font-normal tracking-[0.15em] uppercase">
              The RENASC Atelier Manifesto
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

        {/* Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 text-xs text-[#525252] leading-relaxed font-sans">
          {/* Intro Section */}
          <div className="space-y-3">
            <span className="text-[11px] font-sans tracking-[0.2em] text-[#737373] uppercase font-semibold">
              Maison RENASC Philosophy • Algérie
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#111111] leading-tight tracking-tight">
              Architectural Form Over Transitory Speed
            </h3>
            <p className="text-sm text-[#525252] font-light leading-relaxed">
              RENASC was founded on an exacting ethos: clothing should possess tangible weight, enduring structural geometry, and uncompromising tactile presence. Operating our own physical atelier, we create deliberate limited runs using ultra-dense cotton fleeces and bespoke woven fabrics.
            </p>
          </div>

          {/* Machinery & Craft Pillar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-5 bg-[#FBFBFA] border border-[#E6E6E6] space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-medium text-[#111111]">
                <Scissors className="w-4 h-4 text-[#111111]" />
                <span>Single-Needle French Tailoring</span>
              </div>
              <p className="text-xs text-[#737373] leading-relaxed">
                All structural stress points and hem lines are turned in twice and sewn with single-needle lockstitches, delivering an interior finish as clean and enduring as the exterior silhouette.
              </p>
            </div>

            <div className="p-5 bg-[#FBFBFA] border border-[#E6E6E6] space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-medium text-[#111111]">
                <Award className="w-4 h-4 text-[#111111]" />
                <span>Heavyweight Density Engineering</span>
              </div>
              <p className="text-xs text-[#737373] leading-relaxed">
                From 450+ GSM loopback fleeces to 320 GSM combed jersey, our fabrics are selected and tested for dimensional stability and wash resilience.
              </p>
            </div>

            <div className="p-5 bg-[#FBFBFA] border border-[#E6E6E6] space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-medium text-[#111111]">
                <Compass className="w-4 h-4 text-[#111111]" />
                <span>Mill Traceability & Integrity</span>
              </div>
              <p className="text-xs text-[#737373] leading-relaxed">
                Every bolt of cloth is sourced directly from ethical weaving mills, emphasizing high-grade long-staple cotton, natural drape, and zero synthetic shortcuts.
              </p>
            </div>

            <div className="p-5 bg-[#FBFBFA] border border-[#E6E6E6] space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-medium text-[#111111]">
                <Sparkles className="w-4 h-4 text-[#111111]" />
                <span>Zero-Waste Pattern Drafting</span>
              </div>
              <p className="text-xs text-[#737373] leading-relaxed">
                Cutting room off-cuts are repurposed into interior reinforcements, pocket facings, and complementary garment care pouches, upholding an eco-conscious atelier standard.
              </p>
            </div>
          </div>

          {/* Atelier Repair Commitment */}
          <div className="p-5 bg-[#F8F8F7] border border-[#E6E6E6] space-y-2">
            <h4 className="font-serif text-sm font-medium text-[#111111]">
              The Lifetime Atelier Service
            </h4>
            <p className="text-xs text-[#737373] leading-relaxed">
              RENASC creations are crafted to be worn season after season. Should a seam strain or hardware require adjustment, our workshop provides complimentary care and repair assistance.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#111111] hover:bg-black text-white text-xs font-sans uppercase tracking-widest transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopStoryModal;
