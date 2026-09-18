import React, { useState } from 'react';
import { X, Ruler, Check, Scissors, HelpCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBespoke?: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenBespoke,
}) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  
  // Interactive Fit Advisor state
  const [chestInput, setChestInput] = useState(40);
  const [waistInput, setWaistInput] = useState(33);
  const [fitPref, setFitPref] = useState<'slim' | 'tailored' | 'relaxed'>('tailored');

  if (!isOpen) return null;

  const convert = (inches: number) => {
    if (unit === 'in') return `${inches}"`;
    return `${Math.round(inches * 2.54)} cm`;
  };

  // Compute recommended size
  const getRecommendedSize = () => {
    if (chestInput <= 36) return 'XS';
    if (chestInput <= 39) return 'S';
    if (chestInput <= 42) return 'M';
    if (chestInput <= 45) return 'L';
    return 'XL';
  };

  const recSize = getRecommendedSize();

  const sizeTable = [
    { size: 'XS', chest: 36, waist: 29, sleeve: 33, shoulder: 17.0, inseam: 31 },
    { size: 'S', chest: 38, waist: 31, sleeve: 33.5, shoulder: 17.5, inseam: 31.5 },
    { size: 'M', chest: 41, waist: 33, sleeve: 34.5, shoulder: 18.25, inseam: 32 },
    { size: 'L', chest: 44, waist: 36, sleeve: 35.5, shoulder: 19.0, inseam: 32.5 },
    { size: 'XL', chest: 47, waist: 39, sleeve: 36.5, shoulder: 19.75, inseam: 33 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#23201D] text-[#FAF8F5] border-b border-[#3B352E]">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#C9A96E]" />
            <h2 className="font-serif text-lg font-medium tracking-wide">
              Workshop Tailoring & Fit Guide
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
          <div className="flex items-center justify-between">
            <p className="text-[#6D6559]">
              Measurements reflect true garment specifications drafted on our workshop tables.
            </p>
            <div className="flex items-center border border-[#DDD4C5] rounded bg-[#EFE9DF] p-0.5">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 font-mono text-xs rounded transition-colors cursor-pointer ${
                  unit === 'in' ? 'bg-white text-black font-bold shadow-xs' : 'text-[#6D6559]'
                }`}
              >
                Inches (in)
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 font-mono text-xs rounded transition-colors cursor-pointer ${
                  unit === 'cm' ? 'bg-white text-black font-bold shadow-xs' : 'text-[#6D6559]'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto border border-[#DDD4C5] rounded bg-white">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="bg-[#F2ECE1] border-b border-[#DDD4C5] text-[#4A4338] text-[11px] uppercase tracking-wider">
                  <th className="p-2.5">Size</th>
                  <th className="p-2.5">Chest</th>
                  <th className="p-2.5">Trouser Waist</th>
                  <th className="p-2.5">Sleeve Length</th>
                  <th className="p-2.5">Shoulder</th>
                  <th className="p-2.5">Standard Inseam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {sizeTable.map((row) => (
                  <tr 
                    key={row.size} 
                    className={`hover:bg-[#FAF6EE] transition-colors ${
                      recSize === row.size ? 'bg-[#F9F4EB] font-bold text-[#8C6D3B]' : 'text-[#2C2825]'
                    }`}
                  >
                    <td className="p-2.5 font-bold flex items-center gap-1.5">
                      <span>{row.size}</span>
                      {recSize === row.size && (
                        <span className="text-[10px] bg-[#8C6D3B] text-white px-1 rounded">Recommended</span>
                      )}
                    </td>
                    <td className="p-2.5">{convert(row.chest)}</td>
                    <td className="p-2.5">{convert(row.waist)}</td>
                    <td className="p-2.5">{convert(row.sleeve)}</td>
                    <td className="p-2.5">{convert(row.shoulder)}</td>
                    <td className="p-2.5">{convert(row.inseam)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive Fit Advisor Tool */}
          <div className="p-4 bg-[#F2EDE4] border border-[#DDD4C5] rounded space-y-3">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#8C6D3B]" />
              <h3 className="font-serif text-sm font-semibold text-[#1F1C19]">
                Interactive Atelier Fit Recommendation
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1">
                  Your Chest Measurement ({unit})
                </label>
                <input
                  type="number"
                  value={chestInput}
                  onChange={(e) => setChestInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#DDD4C5] rounded font-mono"
                  min={30}
                  max={60}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1">
                  Your Waist Measurement ({unit})
                </label>
                <input
                  type="number"
                  value={waistInput}
                  onChange={(e) => setWaistInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-[#DDD4C5] rounded font-mono"
                  min={24}
                  max={56}
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1">
                  Preferred Silhouette
                </label>
                <select
                  value={fitPref}
                  onChange={(e) => setFitPref(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-white border border-[#DDD4C5] rounded font-mono text-xs"
                >
                  <option value="slim">Slim / Fitted</option>
                  <option value="tailored">Classic Tailored</option>
                  <option value="relaxed">Relaxed / Oversized</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#E2DACB] rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8C8377] uppercase block">Recommended Ready-to-Wear:</span>
                <span className="text-base font-serif font-bold text-[#1F1C19]">
                  Size {recSize} ({fitPref} drape)
                </span>
              </div>
              {onOpenBespoke && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBespoke();
                  }}
                  className="px-3 py-1.5 bg-[#23201D] text-white text-xs font-mono rounded hover:bg-[#3D3730] transition-colors cursor-pointer"
                >
                  Or Order Made-to-Measure
                </button>
              )}
            </div>
          </div>

          {/* Measuring Guide Instructions */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif text-sm font-semibold text-[#1F1C19]">
              How to Measure Yourself Accurately
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#5A5348] text-[11px] leading-relaxed">
              <div className="p-2.5 bg-white border border-[#E9E2D5] rounded">
                <strong className="text-[#1F1C19] block mb-0.5">1. Chest:</strong>
                Measure around the fullest part of your chest, keeping the measuring tape parallel to the floor under your arms.
              </div>
              <div className="p-2.5 bg-white border border-[#E9E2D5] rounded">
                <strong className="text-[#1F1C19] block mb-0.5">2. Natural Waist:</strong>
                Measure around your natural waistline just above the hip bone where high-rise tailored trousers sit naturally.
              </div>
              <div className="p-2.5 bg-white border border-[#E9E2D5] rounded">
                <strong className="text-[#1F1C19] block mb-0.5">3. Sleeve Length:</strong>
                From center back of your neck, over the tip of your shoulder, and down to the wrist bone with arm slightly bent.
              </div>
              <div className="p-2.5 bg-white border border-[#E9E2D5] rounded">
                <strong className="text-[#1F1C19] block mb-0.5">4. Inseam:</strong>
                From the inner crotch point down to your desired trouser shoe break (e.g. slight break or no break).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
