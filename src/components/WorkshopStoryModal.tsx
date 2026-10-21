import React from 'react';
import { X, Scissors, Award, CheckCircle2, HeartHandshake, Compass } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#23201D] text-[#FAF8F5] border-b border-[#3B352E]">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#C9A96E]" />
            <h2 className="font-serif text-lg font-medium tracking-wide">
              The DBC Workshop Manifesto
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-[#4A4338] leading-relaxed">
          {/* Intro Section */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono tracking-widest text-[#8C6D3B] uppercase font-semibold">
              Atelier Philosophy • Est. 2021
            </span>
            <h3 className="font-serif text-2xl font-medium text-[#1F1C19] leading-tight">
              Small-Batch Craft Over Mass Production
            </h3>
            <p>
              DBC Workshop was founded on a simple premise: modern clothing has surrendered soul, longevity, and tactile integrity to industrial speed. We operate our own physical cutting room and sewing atelier, producing strictly in small batches between 16 and 50 garments per run.
            </p>
          </div>

          {/* Machinery & Craft Pillar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-semibold text-[#1F1C19]">
                <Scissors className="w-4 h-4 text-[#8C6D3B]" />
                <span>Single-Needle French Seams</span>
              </div>
              <p className="text-[#686055]">
                We avoid synthetic multi-thread overlockers. All structural seams are turned in twice and sewn with single-needle lockstitches for an interior that looks as clean as the outside.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-semibold text-[#1F1C19]">
                <Award className="w-4 h-4 text-[#8C6D3B]" />
                <span>Vintage Chainstitch Hemming</span>
              </div>
              <p className="text-[#686055]">
                Our denim and heavy overshirts are finished on a restored 1950s Union Special 43200G chainstitch machine, producing the coveted roping fade effect at leg openings and hems.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-semibold text-[#1F1C19]">
                <Compass className="w-4 h-4 text-[#8C6D3B]" />
                <span>Ethical Mill Transparency</span>
              </div>
              <p className="text-[#686055]">
                Every roll of cloth traces directly to a specific family-owned or historic weaver: Baird McNutt in Ireland, Kuroki Mill in Japan, Albini in Italy, and Cerruti in Biella.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E2DAD0] rounded space-y-2">
              <div className="flex items-center gap-2 font-serif text-sm font-semibold text-[#1F1C19]">
                <HeartHandshake className="w-4 h-4 text-[#8C6D3B]" />
                <span>Zero Off-Cut Scrap Program</span>
              </div>
              <p className="text-[#686055]">
                Cutting room remnants are never landfilled. Linen and denim scraps become interior pocket bags, waistband reinforcements, and complimentary patch repair kits included with every order.
              </p>
            </div>
          </div>

          {/* Seam Guarantee */}
          <div className="p-4 bg-[#F2EDE4] border border-[#DDD4C5] rounded space-y-2">
            <h4 className="font-serif text-sm font-semibold text-[#1F1C19]">
              The Lifetime Workshop Repair Promise
            </h4>
            <p className="text-[#6A6256]">
              Garments are meant to be worn hard, faded, and repaired. If a button breaks, a bar-tack strains, or a hem comes loose, return your piece to DBC Workshop anytime for complimentary hand-stitching and repair.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#23201D] text-white text-xs font-mono uppercase tracking-wider rounded hover:bg-[#3D3730] transition-colors cursor-pointer"
            >
              Close Manifesto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
