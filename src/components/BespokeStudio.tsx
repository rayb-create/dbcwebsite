import React, { useState } from 'react';
import { 
  Scissors, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Ruler, 
  ShieldCheck, 
  X,
  Palette,
  Package
} from 'lucide-react';
import { Product, Currency, CartItem, CustomMeasurements, MonogramOptions } from '../types';
import { 
  BESPOKE_SILHOUETTES, 
  BESPOKE_FABRICS, 
  BESPOKE_HARDWARE 
} from '../data/bespoke';
import { PRODUCTS } from '../data/products';
import { formatPrice } from '../utils/format';

interface BespokeStudioProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onAddBespokeToCart: (item: CartItem) => void;
  onOpenSizeGuide: () => void;
}

export const BespokeStudio: React.FC<BespokeStudioProps> = ({
  isOpen,
  onClose,
  currency,
  onAddBespokeToCart,
  onOpenSizeGuide,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSilhouetteId, setSelectedSilhouetteId] = useState(BESPOKE_SILHOUETTES[0].id);
  const [selectedFabricId, setSelectedFabricId] = useState(BESPOKE_FABRICS[0].id);
  const [selectedHardwareId, setSelectedHardwareId] = useState(BESPOKE_HARDWARE[0].id);
  
  // Monogramming
  const [monogramEnabled, setMonogramEnabled] = useState(true);
  const [monogramText, setMonogramText] = useState('DBC');
  const [threadColor, setThreadColor] = useState('Old Gold');
  const [monogramPlacement, setMonogramPlacement] = useState('Inside Breast Pocket');

  // Measurements
  const [measurements, setMeasurements] = useState<CustomMeasurements>({
    chest: 41,
    waist: 34,
    sleeve: 34.5,
    inseam: 31,
    fitPreference: 'tailored',
    specialNotes: 'Please draft with generous armhole mobility',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const currentSilhouette = BESPOKE_SILHOUETTES.find((s) => s.id === selectedSilhouetteId)!;
  const currentFabric = BESPOKE_FABRICS.find((f) => f.id === selectedFabricId)!;
  const currentHardware = BESPOKE_HARDWARE.find((h) => h.id === selectedHardwareId)!;

  // Total price calculation
  const basePrice = currentSilhouette.basePrice;
  const fabricExtra = currentFabric.priceModifier;
  const hardwareExtra = currentHardware.addedPrice;
  const monogramExtra = monogramEnabled && monogramText ? 15 : 0;
  const bespokePatternmakingFee = 45; // custom master cutter pattern setup
  const totalPrice = basePrice + fabricExtra + hardwareExtra + monogramExtra + bespokePatternmakingFee;

  const handleCommission = () => {
    // Generate an authentic Product reference for cart
    const baseProductMatch = PRODUCTS.find((p) => p.category.toLowerCase().includes(currentSilhouette.category.toLowerCase())) || PRODUCTS[0];
    
    const bespokeProduct: Product = {
      ...baseProductMatch,
      id: `bespoke-${currentSilhouette.id}-${Date.now()}`,
      name: `Bespoke ${currentSilhouette.name}`,
      subtitle: `Custom cut in ${currentFabric.name}`,
      category: currentSilhouette.category,
      price: totalPrice,
      fabric: currentFabric.name,
      fabricWeight: currentFabric.weight,
      millOrigin: currentFabric.mill,
      allowsMadeToMeasure: true,
      batchNumber: 'BESPOKE-1-OF-1',
      readyInDays: '5-7 business days',
    };

    const cartItem: CartItem = {
      cartItemId: `bespoke-item-${Date.now()}`,
      productId: bespokeProduct.id,
      product: bespokeProduct,
      size: 'Custom Made-to-Measure',
      color: { name: currentFabric.color, hex: currentFabric.hex },
      quantity: 1,
      isMadeToMeasure: true,
      customMeasurements: measurements,
      monogram: monogramEnabled && monogramText ? {
        enabled: true,
        text: monogramText.toUpperCase(),
        threadColor,
        placement: monogramPlacement,
      } : undefined,
      pricePerUnit: totalPrice,
    };

    onAddBespokeToCart(cartItem);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1A1816]/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Studio Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#23201D] text-[#FAF8F5] border-b border-[#3B352E]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C9A96E]/20 text-[#C9A96E] rounded">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                DBC Workshop Bespoke Studio
              </h2>
              <p className="text-[11px] font-mono text-[#B3AAA0] uppercase tracking-wider">
                1-of-1 Custom Garment Commission • Master Pattern Drafter
              </p>
            </div>
          </div>
          <button
            id="close-bespoke-studio-btn"
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 border-b border-[#E5DFD4] bg-[#F4EFE7] text-xs font-mono">
          {[
            { s: 1, label: '1. Silhouette' },
            { s: 2, label: '2. Mill Fabric' },
            { s: 3, label: '3. Hardware' },
            { s: 4, label: '4. Tailoring Specs' },
          ].map((item) => (
            <button
              key={item.s}
              onClick={() => setStep(item.s as any)}
              className={`py-3 text-center border-r border-[#E5DFD4] last:border-r-0 transition-colors cursor-pointer ${
                step === item.s 
                  ? 'bg-white font-bold text-[#1F1C19] border-b-2 border-b-[#8C6D3B]' 
                  : 'text-[#7D766C] hover:bg-[#EDE7DC]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Studio Interactive Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* STEP 1: Silhouette */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#1F1C19]">
                      Select Garment Architecture
                    </h3>
                    <p className="text-xs text-[#756E63] mt-0.5">
                      Choose the foundational pattern block drafted in our workshop cutting room.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {BESPOKE_SILHOUETTES.map((sil) => (
                      <div
                        key={sil.id}
                        id={`bespoke-sil-${sil.id}`}
                        onClick={() => setSelectedSilhouetteId(sil.id)}
                        className={`p-3 rounded border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          selectedSilhouetteId === sil.id
                            ? 'border-[#23201D] bg-white ring-2 ring-[#23201D] shadow-sm'
                            : 'border-[#DDD4C5] bg-[#F8F4EC] hover:border-[#968E82]'
                        }`}
                      >
                        <div className="aspect-[4/3] rounded overflow-hidden mb-2.5 bg-[#EAE4D8]">
                          <img src={sil.image} alt={sil.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-base font-semibold text-[#1F1C19]">{sil.name}</span>
                            <span className="font-mono text-xs text-[#8C6D3B] font-semibold">{formatPrice(sil.basePrice, currency)}</span>
                          </div>
                          <p className="text-xs text-[#70685D] mt-1 font-sans">{sil.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 bg-[#23201D] text-white text-xs font-mono uppercase tracking-wider rounded flex items-center gap-2 hover:bg-[#3D3730] transition-colors cursor-pointer"
                    >
                      <span>Proceed to Fabrics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Fabric Selection */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#1F1C19]">
                      Select Artisan Mill Cloth
                    </h3>
                    <p className="text-xs text-[#756E63] mt-0.5">
                      All fabrics are sourced directly from historic weaving mills with certified origins.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {BESPOKE_FABRICS.map((fab) => (
                      <div
                        key={fab.id}
                        id={`bespoke-fab-${fab.id}`}
                        onClick={() => setSelectedFabricId(fab.id)}
                        className={`p-3.5 rounded border cursor-pointer transition-all flex items-center justify-between ${
                          selectedFabricId === fab.id
                            ? 'border-[#8C6D3B] bg-white ring-2 ring-[#8C6D3B] shadow-sm'
                            : 'border-[#DDD4C5] bg-[#F8F4EC] hover:border-[#968E82]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-full border border-black/20 shadow-xs flex-shrink-0"
                            style={{ backgroundColor: fab.hex }}
                          />
                          <div>
                            <div className="font-medium text-sm text-[#1F1C19] flex items-center gap-2">
                              <span>{fab.name}</span>
                              <span className="text-xs font-mono text-[#8C6D3B]">({fab.color})</span>
                            </div>
                            <div className="text-xs text-[#70685D] flex items-center gap-2 mt-0.5">
                              <span>Mill: {fab.mill}</span>
                              <span>•</span>
                              <span className="font-mono">{fab.weight}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-semibold text-[#1F1C19]">
                            {fab.priceModifier > 0 ? `+${formatPrice(fab.priceModifier, currency)}` : 'Included'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-[#DDD4C5] text-xs font-mono uppercase tracking-wider rounded text-[#595248] hover:border-black cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 bg-[#23201D] text-white text-xs font-mono uppercase tracking-wider rounded flex items-center gap-2 hover:bg-[#3D3730] transition-colors cursor-pointer"
                    >
                      <span>Proceed to Hardware</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Hardware & Monogramming */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-xl font-medium text-[#1F1C19]">
                      Hardware & Embroidery Detail
                    </h3>
                    <p className="text-xs text-[#756E63] mt-0.5">
                      Hand-carved horn, corozo nuts, and personalized atelier monograms.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#635C52]">
                      Workshop Buttons & Rivets
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BESPOKE_HARDWARE.map((hw) => (
                        <div
                          key={hw.id}
                          id={`bespoke-hw-${hw.id}`}
                          onClick={() => setSelectedHardwareId(hw.id)}
                          className={`p-3 rounded border text-left cursor-pointer transition-all ${
                            selectedHardwareId === hw.id
                              ? 'border-[#23201D] bg-white ring-1 ring-[#23201D]'
                              : 'border-[#DDD4C5] bg-[#F8F4EC] hover:border-[#968E82]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-medium text-[#1F1C19]">
                            <span>{hw.name}</span>
                            <span className="font-mono text-[#8C6D3B]">
                              {hw.addedPrice > 0 ? `+${formatPrice(hw.addedPrice, currency)}` : 'Standard'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7C7468] block mt-0.5">Origin: {hw.origin}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monogramming Config */}
                  <div className="p-4 bg-white border border-[#DDD4C5] rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1F1C19]">
                        <input
                          type="checkbox"
                          checked={monogramEnabled}
                          onChange={(e) => setMonogramEnabled(e.target.checked)}
                          className="rounded text-[#23201D] focus:ring-black cursor-pointer"
                        />
                        <span>Embroider Custom Initials</span>
                      </label>
                      <span className="text-xs font-mono text-[#8C6D3B] font-semibold">+$15</span>
                    </div>

                    {monogramEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#EAE3D6] text-xs">
                        <div>
                          <label className="block text-[10px] font-mono text-[#787167] uppercase mb-1">
                            Initials
                          </label>
                          <input
                            type="text"
                            maxLength={3}
                            value={monogramText}
                            onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                            className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded font-mono font-bold uppercase text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-[#787167] uppercase mb-1">
                            Thread Color
                          </label>
                          <select
                            value={threadColor}
                            onChange={(e) => setThreadColor(e.target.value)}
                            className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono"
                          >
                            <option value="Old Gold">Old Gold</option>
                            <option value="Ecru Cream">Ecru Cream</option>
                            <option value="Deep Navy">Deep Navy</option>
                            <option value="Wine Red">Wine Red</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-[#787167] uppercase mb-1">
                            Placement
                          </label>
                          <select
                            value={monogramPlacement}
                            onChange={(e) => setMonogramPlacement(e.target.value)}
                            className="w-full px-2 py-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded text-xs font-mono"
                          >
                            <option value="Inside Breast Pocket">Inside Breast Pocket</option>
                            <option value="Left Sleeve Cuff">Left Sleeve Cuff</option>
                            <option value="Rear Collar Stand">Rear Collar Stand</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-[#DDD4C5] text-xs font-mono uppercase tracking-wider rounded text-[#595248] hover:border-black cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="px-5 py-2.5 bg-[#23201D] text-white text-xs font-mono uppercase tracking-wider rounded flex items-center gap-2 hover:bg-[#3D3730] transition-colors cursor-pointer"
                    >
                      <span>Proceed to Measurements</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Measurements */}
              {step === 4 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-[#1F1C19]">
                        Personal Pattern Measurements
                      </h3>
                      <p className="text-xs text-[#756E63] mt-0.5">
                        Our master cutter will draft your garment pattern using these exact dimensions.
                      </p>
                    </div>
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-xs font-mono text-[#8C6D3B] hover:text-black flex items-center gap-1 cursor-pointer underline"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Measuring Guide</span>
                    </button>
                  </div>

                  <div className="p-4 bg-white border border-[#DDD4C5] rounded space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1">
                          Chest (in)
                        </label>
                        <input
                          type="number"
                          value={measurements.chest}
                          onChange={(e) => setMeasurements({ ...measurements, chest: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DDD4C5] rounded focus:outline-none focus:border-black"
                          min={30}
                          max={60}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1">
                          Waist (in)
                        </label>
                        <input
                          type="number"
                          value={measurements.waist}
                          onChange={(e) => setMeasurements({ ...measurements, waist: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DDD4C5] rounded focus:outline-none focus:border-black"
                          min={24}
                          max={56}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1">
                          Sleeve (in)
                        </label>
                        <input
                          type="number"
                          value={measurements.sleeve}
                          onChange={(e) => setMeasurements({ ...measurements, sleeve: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DDD4C5] rounded focus:outline-none focus:border-black"
                          min={28}
                          max={40}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1">
                          Inseam (in)
                        </label>
                        <input
                          type="number"
                          value={measurements.inseam}
                          onChange={(e) => setMeasurements({ ...measurements, inseam: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FAF8F5] border border-[#DDD4C5] rounded focus:outline-none focus:border-black"
                          min={26}
                          max={40}
                        />
                      </div>
                    </div>

                    {/* Silhouette fit preference */}
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1.5">
                        Drape & Fit Silhouette
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['slim', 'tailored', 'relaxed'] as const).map((fit) => (
                          <button
                            key={fit}
                            type="button"
                            onClick={() => setMeasurements({ ...measurements, fitPreference: fit })}
                            className={`py-2 text-xs font-mono capitalize rounded border transition-all cursor-pointer ${
                              measurements.fitPreference === fit
                                ? 'bg-[#23201D] text-white border-[#23201D]'
                                : 'bg-[#FAF8F5] text-[#3E3830] border-[#DDD4C5] hover:border-black'
                            }`}
                          >
                            {fit} Fit
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#736C61] mb-1">
                        Special Tailoring Instructions or Anatomic Notes
                      </label>
                      <textarea
                        rows={2}
                        value={measurements.specialNotes}
                        onChange={(e) => setMeasurements({ ...measurements, specialNotes: e.target.value })}
                        placeholder="e.g. Slightly longer torso, prefer extra room in shoulder blade area..."
                        className="w-full p-2 text-xs bg-[#FAF8F5] border border-[#DDD4C5] rounded focus:outline-none focus:border-black text-[#2C2825]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 border border-[#DDD4C5] text-xs font-mono uppercase tracking-wider rounded text-[#595248] hover:border-black cursor-pointer"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary & Commission Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E0D7C9] rounded p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#ECE6DB]">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#8A8174]">
                    Commission Specification
                  </span>
                  <span className="text-[11px] font-mono text-[#8C6D3B] font-semibold bg-[#F5EFE6] px-2 py-0.5 rounded">
                    1-of-1 Workshop Order
                  </span>
                </div>

                {/* Silhouette preview */}
                <div className="mt-4 flex items-center gap-3">
                  <img
                    src={currentSilhouette.image}
                    alt={currentSilhouette.name}
                    className="w-16 h-16 rounded object-cover border border-[#E5DFD4]"
                  />
                  <div>
                    <h4 className="font-serif text-base font-semibold text-[#1F1C19]">
                      {currentSilhouette.name}
                    </h4>
                    <span className="text-xs font-mono text-[#7D7569]">
                      Base Pattern: {formatPrice(basePrice, currency)}
                    </span>
                  </div>
                </div>

                {/* Spec breakdown table */}
                <div className="mt-4 space-y-2 text-xs border-t border-b border-[#EAE3D6] py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#7D7569]">Mill Fabric:</span>
                    <span className="font-medium text-[#1F1C19] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: currentFabric.hex }} />
                      <span>{currentFabric.name}</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#7D7569]">Origin & Weight:</span>
                    <span className="font-mono text-[#1F1C19]">{currentFabric.weight}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#7D7569]">Hardware:</span>
                    <span className="font-medium text-[#1F1C19]">{currentHardware.name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#7D7569]">Monogram:</span>
                    <span className="font-mono text-[#1F1C19]">
                      {monogramEnabled && monogramText ? `${monogramText} (${threadColor})` : 'None'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#7D7569]">Pattern Drafting:</span>
                    <span className="font-medium text-[#8C6D3B]">Bespoke Made-to-Measure</span>
                  </div>
                </div>

                {/* Turnaround schedule */}
                <div className="mt-4 p-3 bg-[#FAF8F5] border border-[#EAE3D6] rounded text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-[#4A4338] font-medium">
                    <Package className="w-3.5 h-3.5 text-[#8C6D3B]" />
                    <span>Workshop Production Schedule:</span>
                  </div>
                  <p className="text-[#70685D] text-[11px] leading-relaxed">
                    Pattern drafted & cut on Day 1 • Assembled on Juki lockstitch Days 2-4 • Hand-pressed & checked Day 5.
                  </p>
                </div>
              </div>

              {/* Bottom Price & Button */}
              <div className="mt-6 pt-4 border-t border-[#ECE6DB]">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs font-mono uppercase text-[#736C61]">Total Commission Price:</span>
                  <span className="text-2xl font-mono font-bold text-[#1F1C19]">
                    {formatPrice(totalPrice, currency)}
                  </span>
                </div>

                <button
                  id="confirm-bespoke-commission-btn"
                  onClick={handleCommission}
                  className="w-full py-3.5 px-4 bg-[#23201D] hover:bg-[#3B352E] text-[#FAF8F5] text-xs font-mono uppercase tracking-widest rounded flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Commission Placed in Bag</span>
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4 text-[#C9A96E]" />
                      <span>Commission Garment to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
