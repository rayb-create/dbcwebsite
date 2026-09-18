import React, { useState } from 'react';
import { X, Sparkles, Scissors, Send, User, Bot, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'tailor';
  text: string;
  recommendedProductId?: string;
}

interface WorkshopStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const WorkshopStylistModal: React.FC<WorkshopStylistModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'tailor',
      text: "Greetings from the cutting room. I am DBC Workshop's master tailor assistant. Whether you need advice on fabric weights, made-to-measure adjustments, or pairing silhouettes, how can I assist your wardrobe today?",
    },
  ]);
  const [inputText, setInputText] = useState('');

  const promptSuggestions = [
    'What fabric is best for warm or humid weather?',
    'How should the pleated trousers break on boots or loafers?',
    'Can I machine wash the heavy Irish Linen Chore Coat?',
    'What is the difference between Ready-to-Wear and Made-to-Measure?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Generate intelligent artisan tailor responses
    setTimeout(() => {
      let reply = '';
      let recommendedId: string | undefined = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('warm') || lower.includes('humid') || lower.includes('summer')) {
        reply = "For high temperatures and humidity, our Matka Raw Silk Camp Shirt and Baird McNutt Heavy Linen are unbeatable. Natural slubbed fibers conduct heat away from the body while resisting cling.";
        recommendedId = 'chore-coat-linen';
      } else if (lower.includes('pleated') || lower.includes('trouser') || lower.includes('break')) {
        reply = "For our high-rise double-pleated trousers, we recommend a 'no-break' or 'slight quarter break' with a 2-inch turn-up cuff. This allows the high-twist tropical wool to drape with a clean vertical line over loafers or dress boots.";
        recommendedId = 'sartorial-pleated-trousers';
      } else if (lower.includes('wash') || lower.includes('care') || lower.includes('linen')) {
        reply = "Yes! Baird McNutt Irish linen actually softens and becomes more luxurious with washing. We recommend washing in cold water on a gentle cycle, then line drying. Iron while slightly damp if you want a crisp finish, or embrace the natural casual drape.";
        recommendedId = 'chore-coat-linen';
      } else if (lower.includes('made-to-measure') || lower.includes('ready-to-wear') || lower.includes('m2m')) {
        reply = "Ready-to-wear follows standard European proportional grading (XS-XL). With Made-to-Measure, our master patternmaker drafts custom allowances specifically for your chest, waist, sleeve, and inseam measurements—ideal if you have broad shoulders or specific leg lengths.";
      } else if (lower.includes('denim') || lower.includes('kuroki')) {
        reply = "Our Kuroki Field Overshirt uses raw shuttle-loomed 13.5oz denim with authentic red selvedge ID. Wear it as an outer layer over henleys or oxford shirts; it breaks in with authentic honeycombs over 3-6 months.";
        recommendedId = 'selvedge-field-overshirt';
      } else {
        reply = `Thank you for consulting our workshop. For your specifications, we recommend exploring our small-batch collections tailored with French seams and natural horn hardware. Would you like assistance with custom sizing or fabric swatches?`;
        recommendedId = 'chore-coat-linen';
      }

      const tailorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'tailor',
        text: reply,
        recommendedProductId: recommendedId,
      };

      setMessages((prev) => [...prev, tailorMsg]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-6 h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#23201D] text-[#FAF8F5] border-b border-[#3B352E]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A96E]" />
            <div>
              <h2 className="font-serif text-lg font-medium tracking-wide">
                Atelier Tailor & Styling Assistant
              </h2>
              <p className="text-[10px] font-mono text-[#B3AAA0] uppercase tracking-wider">
                Expert Fabric Sourcing & Sartorial Consultation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs font-sans">
          {messages.map((m) => {
            const isTailor = m.sender === 'tailor';
            const recProduct = m.recommendedProductId 
              ? products.find((p) => p.id === m.recommendedProductId) 
              : null;

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isTailor ? 'justify-start' : 'justify-end'}`}
              >
                {isTailor && (
                  <div className="w-7 h-7 rounded-full bg-[#23201D] text-[#C9A96E] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded leading-relaxed ${
                      isTailor
                        ? 'bg-white text-[#2C2825] border border-[#E0D7C9] shadow-xs'
                        : 'bg-[#23201D] text-[#FAF8F5]'
                    }`}
                  >
                    <p>{m.text}</p>
                  </div>

                  {recProduct && (
                    <div className="p-2.5 bg-[#F2EDE4] border border-[#DDD4C5] rounded flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={recProduct.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                          alt={recProduct.name}
                          className="w-10 h-12 object-cover rounded border border-[#DDD4C5]"
                        />
                        <div>
                          <span className="font-serif font-semibold text-[#1F1C19] block line-clamp-1">
                            {recProduct.name}
                          </span>
                          <span className="font-mono text-[10px] text-[#7C756B]">
                            {recProduct.fabricWeight}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProduct(recProduct);
                        }}
                        className="px-2.5 py-1 bg-[#23201D] text-white text-[11px] font-mono rounded hover:bg-[#3D3730] transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
                      >
                        <span>View Piece</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {!isTailor && (
                  <div className="w-7 h-7 rounded-full bg-[#8C6D3B] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pre-set Tailoring Prompts */}
        <div className="px-4 py-2 bg-[#F3EEE6] border-t border-[#E0D7C9] flex gap-2 overflow-x-auto whitespace-nowrap text-[11px] font-mono">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-white hover:bg-[#23201D] hover:text-white text-[#4A4338] rounded border border-[#DDD4C5] transition-colors cursor-pointer flex-shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#E0D7C9] flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask our master tailor about sizing, cloth weights, styling..."
            className="flex-1 px-3 py-2 text-xs bg-[#FAF8F5] border border-[#DDD4C5] rounded focus:outline-none focus:border-black text-[#2C2825]"
          />
          <button
            onClick={() => handleSend()}
            className="px-4 py-2 bg-[#23201D] text-white text-xs font-mono rounded hover:bg-[#3D3730] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Consult</span>
          </button>
        </div>
      </div>
    </div>
  );
};
