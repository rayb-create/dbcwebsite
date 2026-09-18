import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Minus, 
  Check
} from 'lucide-react';
import { Product, Currency } from '../../types';
import { formatPrice } from '../../utils/format';
import { saveProductToDb } from '../../services/db';
import { useAdminLanguage } from '../../context/AdminLanguageContext';

interface InventoryTabProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  currency: Currency;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ products, onUpdateProduct, currency }) => {
  const { t, isRtl } = useAdminLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAdjustStock = async (product: Product, delta: number) => {
    const currentStock = typeof product.stock === 'number' ? product.stock : 50;
    const newStock = Math.max(0, currentStock + delta);
    const updated: Product = {
      ...product,
      stock: newStock,
      inStock: newStock > 0,
    };
    onUpdateProduct(updated);
    await saveProductToDb(updated);
    showToast(`${product.name}: ${newStock} ${t.invUnits}`);
  };

  const handleSetStockDirect = async (product: Product, newStock: number) => {
    const validStock = Math.max(0, newStock);
    const updated: Product = {
      ...product,
      stock: validStock,
      inStock: validStock > 0,
    };
    onUpdateProduct(updated);
    await saveProductToDb(updated);
    showToast(`${product.name}: ${validStock} ${t.invUnits}`);
  };

  const handleToggleStockStatus = async (product: Product) => {
    const nextInStock = product.inStock === false;
    const currentStock = typeof product.stock === 'number' ? product.stock : 50;
    const updated: Product = {
      ...product,
      inStock: nextInStock,
      stock: nextInStock && currentStock === 0 ? 25 : currentStock,
    };
    onUpdateProduct(updated);
    await saveProductToDb(updated);
    showToast(`${product.name}: ${nextInStock ? t.prodInStock : t.prodOutOfStock}`);
  };

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    const stock = typeof p.stock === 'number' ? p.stock : 50;
    const isAvailable = p.inStock !== false && stock > 0;

    if (stockStatusFilter === 'out_of_stock' && isAvailable) return false;
    if (stockStatusFilter === 'in_stock' && (!isAvailable || stock <= 5)) return false;
    if (stockStatusFilter === 'low_stock' && (!isAvailable || stock > 5)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalStockUnits = products.reduce((acc, p) => acc + (typeof p.stock === 'number' ? p.stock : 50), 0);
  const outOfStockCount = products.filter((p) => p.inStock === false || (p.stock ?? 50) === 0).length;
  const lowStockCount = products.filter((p) => (p.inStock ?? true) && (p.stock ?? 50) > 0 && (p.stock ?? 50) <= 5).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F1D1A] text-white px-4 py-2.5 rounded-lg shadow-xl border border-[#C9A96E]/40 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#C9A96E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5]">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#1F1C19] flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#8C6D3B]" />
            <span>{t.invTitle}</span>
          </h2>
          <p className="text-xs text-[#7C756B] font-mono mt-0.5">
            {t.invSubtitle}
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#E2DAD0] shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-[#7C756B]">{t.prodTableStock}</span>
          <div className="font-mono text-2xl font-bold text-[#1F1C19] mt-1">{totalStockUnits} {t.invUnits}</div>
          <span className="text-[10px] text-[#8C6D3B] font-mono mt-0.5 block">{t.catItemsCount(products.length)}</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2DAD0] shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-[#7C756B]">{t.invFilterOutOfStock}</span>
          <div className={`font-mono text-2xl font-bold mt-1 ${outOfStockCount > 0 ? 'text-rose-600' : 'text-[#1F1C19]'}`}>
            {outOfStockCount}
          </div>
          <span className="text-[10px] text-[#7C756B] font-mono mt-0.5 block">{t.invOutOfStockWarning}</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2DAD0] shadow-2xs">
          <span className="text-[11px] font-mono uppercase text-[#7C756B]">{t.invFilterLowStock}</span>
          <div className={`font-mono text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-[#1F1C19]'}`}>
            {lowStockCount}
          </div>
          <span className="text-[10px] text-[#7C756B] font-mono mt-0.5 block">{t.invLowStockWarning}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D5]">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#7C756B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.invSearchPlaceholder}
            className="w-full bg-transparent text-xs font-mono placeholder-[#8C8377] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-[#DDD4C5] rounded px-2.5 py-1.5 text-xs text-[#1F1C19] focus:outline-none"
          >
            <option value="all">{t.prodCategoryFilterAll}</option>
            <option value="hoodies">Hoodies</option>
            <option value="joggers">Joggers</option>
            <option value="tracksuits">Tracksuits</option>
            <option value="longsleeves">Longsleeves</option>
            <option value="tees">T-shirts</option>
            <option value="outerwear">Outerwear</option>
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="bg-white border border-[#DDD4C5] rounded px-2.5 py-1.5 text-xs text-[#1F1C19] focus:outline-none"
          >
            <option value="all">{t.invFilterAllStocks}</option>
            <option value="in_stock">{t.invFilterInStock}</option>
            <option value="low_stock">{t.invFilterLowStock}</option>
            <option value="out_of_stock">{t.invFilterOutOfStock}</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E2DAD0] rounded-xl overflow-hidden shadow-2xs">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#8C6D3B]">
              <Boxes className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-base font-bold text-[#1F1C19]">
              {t.invNoItemsFound}
            </h4>
            <p className="text-xs text-[#7C756B] max-w-sm mx-auto font-mono">
              {t.invNoItemsDesc}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs font-mono`}>
              <thead className="bg-[#FAF8F5] border-b border-[#EAE3D5] text-[#7C756B] uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t.invTableArticle}</th>
                  <th className="py-3 px-4">{t.invTableCategory}</th>
                  <th className="py-3 px-4">{t.invTablePrice}</th>
                  <th className="py-3 px-4 text-center">{t.invTableStockQty}</th>
                  <th className="py-3 px-4 text-center">{t.invTableCustomerStatus}</th>
                  <th className={`py-3 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>{t.invTableQuickActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5]">
              {filteredProducts.map((p) => {
                const stock = typeof p.stock === 'number' ? p.stock : 50;
                const isOutOfStock = p.inStock === false || stock === 0;
                const isLowStock = !isOutOfStock && stock <= 5;

                return (
                  <tr key={p.id} className="hover:bg-[#FCFAF8] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=300&q=80'}
                          alt={p.name}
                          className="w-10 h-12 object-cover rounded border border-[#DDD4C5]"
                        />
                        <div>
                          <div className="font-semibold text-[#1F1C19] text-xs font-sans">{p.name}</div>
                          <div className="text-[10px] text-[#7C756B] mt-0.5">{p.fabric}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 uppercase text-[#8C6D3B] font-bold text-[10px]">
                      {p.category}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1F1C19]">
                      {formatPrice(p.price, currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-[#FAF8F5] border border-[#DDD4C5] rounded-md px-2 py-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(p, -1)}
                          className="p-1 hover:bg-[#EAE3D5] rounded text-[#1F1C19] cursor-pointer"
                          title="-1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => handleSetStockDirect(p, parseInt(e.target.value) || 0)}
                          className="w-12 text-center bg-transparent font-bold text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(p, 1)}
                          className="p-1 hover:bg-[#EAE3D5] rounded text-[#1F1C19] cursor-pointer"
                          title="+1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>{t.prodOutOfStock}</span>
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{t.invFilterLowStock} ({stock})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.prodInStock}</span>
                        </span>
                      )}
                    </td>
                    <td className={`py-3 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                      <button
                        type="button"
                        onClick={() => handleToggleStockStatus(p)}
                        className={`px-3 py-1.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer border ${
                          isOutOfStock
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                            : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {isOutOfStock ? t.invMarkInStock : t.invMarkOutOfStock}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
