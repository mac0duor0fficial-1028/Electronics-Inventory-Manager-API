import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, Eye, Edit, Trash2, SlidersHorizontal, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddClick: () => void;
}

type SortField = 'price' | 'quantity' | 'none';
type SortDirection = 'asc' | 'desc';

export function ProductList({ products, onSelect, onEdit, onDelete, onAddClick }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'low' | 'out'>('all');

  // Handle Sort cycling
  const handleSort = (field: 'price' | 'quantity') => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField('none');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and Sort products client-side
  const processedProducts = useMemo(() => {
    let result = [...products];

    // 1. Filter by search term (case-insensitive by name)
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    // 2. Filter by stock level option
    if (stockFilter === 'instock') {
      result = result.filter(p => p.quantity > 0);
    } else if (stockFilter === 'low') {
      result = result.filter(p => p.quantity > 0 && p.quantity <= 5);
    } else if (stockFilter === 'out') {
      result = result.filter(p => p.quantity === 0);
    }

    // 3. Sort
    if (sortField !== 'none') {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [products, searchTerm, sortField, sortDirection, stockFilter]);

  // Truncate description safely
  const truncateText = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-2xl border border-burgundy/10 shadow-sm overflow-hidden flex flex-col">
      {/* Controls Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Search electronics by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#7A1E2C] focus:ring-2 focus:ring-[#7A1E2C]/10 transition-all text-slate-800"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7A1E2C]" />
            <span>Stock Status:</span>
            <select
              id="stock-filter-select"
              value={stockFilter}
              onChange={(e: any) => setStockFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 outline-none focus:border-[#7A1E2C] focus:ring-1 focus:ring-[#7A1E2C]/10"
            >
              <option value="all">All Items</option>
              <option value="instock">In Stock</option>
              <option value="low">Low Stock (≤ 5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>
          </div>

          <button
            id="header-add-product-btn"
            onClick={onAddClick}
            className="px-4 py-1.5 bg-[#7A1E2C] hover:bg-[#601520] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Table & List View */}
      <div className="overflow-x-auto">
        {processedProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#F3EDE6] text-[#7A1E2C] flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Electronics Found</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {products.length === 0
                ? 'Your inventory catalog is currently empty. Get started by registering a new device!'
                : 'No items match your search. Try checking your filters or typing a different name.'}
            </p>
            {products.length === 0 && (
              <button
                onClick={onAddClick}
                className="mt-4 px-4 py-2 bg-[#7A1E2C] hover:bg-[#601520] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Create First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden md:table" id="inventory-table">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/30">
                  <th className="py-4 px-6">Device Name</th>
                  <th className="py-4 px-6">Specifications & Details</th>
                  <th className="py-4 px-6 text-right cursor-pointer select-none hover:text-[#7A1E2C] transition-colors" onClick={() => handleSort('price')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Unit Price</span>
                      {sortField === 'price' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right cursor-pointer select-none hover:text-[#7A1E2C] transition-colors" onClick={() => handleSort('quantity')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Quantity</span>
                      {sortField === 'quantity' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                <AnimatePresence initial={false}>
                  {processedProducts.map((product) => {
                    const isOutOfStock = product.quantity === 0;
                    const isLowStock = product.quantity > 0 && product.quantity <= 5;

                    return (
                      <motion.tr
                        key={product.id}
                        layoutId={`row-${product.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="group hover:bg-slate-50/70 transition-colors duration-150 cursor-pointer"
                        onClick={() => onSelect(product)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelect(product);
                          }
                        }}
                      >
                        <td className="py-4 px-6 font-medium text-slate-900">
                          <span className="font-bold group-hover:text-[#7A1E2C] transition-colors">
                            {product.name}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 max-w-xs xl:max-w-md truncate">
                          {truncateText(product.description)}
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-slate-900 font-mono">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono">
                          <div className="flex flex-col items-end">
                            <span className={`font-semibold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                              {product.quantity}
                            </span>
                            {isOutOfStock ? (
                              <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5 font-sans font-semibold">Out of Stock</span>
                            ) : isLowStock ? (
                              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 font-sans font-semibold">Low Stock</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              title="View Details"
                              onClick={() => onSelect(product)}
                              className="p-1.5 text-slate-400 hover:text-[#7A1E2C] hover:bg-[#F3EDE6] rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              title="Edit"
                              onClick={() => onEdit(product)}
                              className="p-1.5 text-slate-400 hover:text-[#7A1E2C] hover:bg-[#F3EDE6] rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => onDelete(product.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>

            {/* Mobile Cards List View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden" id="inventory-list-mobile">
              <AnimatePresence initial={false}>
                {processedProducts.map((product) => {
                  const isOutOfStock = product.quantity === 0;
                  const isLowStock = product.quantity > 0 && product.quantity <= 5;

                  return (
                    <motion.div
                      key={product.id}
                      layoutId={`mobile-card-${product.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => onSelect(product)}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-[#7A1E2C] transition-all cursor-pointer flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-950 text-sm leading-tight">
                            {product.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900 block font-mono">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">unit price</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-500">Qty:</span>
                          <span className={`text-xs font-mono font-extrabold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                            {product.quantity}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-[9px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-semibold">Out of Stock</span>
                          ) : isLowStock ? (
                            <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">Low Stock</span>
                          ) : null}
                        </div>

                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelect(product)}
                            className="p-2 text-slate-400 hover:text-[#7A1E2C] hover:bg-[#F3EDE6] rounded-lg"
                            aria-label="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(product)}
                            className="p-2 text-slate-400 hover:text-[#7A1E2C] hover:bg-[#F3EDE6] rounded-lg"
                            aria-label="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(product.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Footer stats */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
        <span>Showing {processedProducts.length} of {products.length} electronics</span>
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-[#7A1E2C] hover:underline font-semibold">
            Clear search filter
          </button>
        )}
      </div>
    </div>
  );
}
