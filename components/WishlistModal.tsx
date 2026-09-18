import React from 'react';
import { X, Heart, ShoppingBag, Trash2, Scissors } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/format';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  currency: Currency;
  onRemoveFromWishlist: (id: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  currency,
  onRemoveFromWishlist,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#D5CABB] rounded shadow-2xl overflow-hidden my-6 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#23201D] text-[#FAF8F5] border-b border-[#3B352E]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#C9A96E] fill-[#C9A96E]" />
            <h2 className="font-serif text-lg font-medium tracking-wide">
              Saved Workshop Pieces ({savedProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#B3AAA0] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {savedProducts.length === 0 ? (
            <div className="py-12 text-center text-[#7D7569] space-y-2">
              <Heart className="w-8 h-8 text-[#CCC3B6] mx-auto" />
              <p className="font-serif text-base text-[#2C2825]">No saved garments yet</p>
              <p className="text-xs max-w-xs mx-auto">
                Click the heart icon on any garment in our workshop collection to save it for later review or custom sizing.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 bg-white border border-[#E5DFD4] rounded flex items-center justify-between gap-4 text-xs"
                >
                  <div 
                    onClick={() => {
                      onClose();
                      onSelectProduct(prod);
                    }}
                    className="flex items-center gap-3.5 cursor-pointer flex-1"
                  >
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                      alt={prod.name}
                      className="w-14 h-16 object-cover rounded border border-[#E2DAD0]"
                    />
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#1F1C19] hover:text-[#8C6D3B] transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-[#6D6559] text-[11px] line-clamp-1">{prod.fabric}</p>
                      <span className="font-mono text-xs font-semibold text-[#1F1C19] mt-0.5 block">
                        {formatPrice(prod.price, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectProduct(prod);
                      }}
                      className="px-3 py-1.5 bg-[#23201D] text-white text-[11px] font-mono uppercase tracking-wider rounded hover:bg-[#3D3730] transition-colors cursor-pointer"
                    >
                      Tailor / Add
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(prod.id)}
                      className="p-1.5 text-[#968E82] hover:text-[#A34338] transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
