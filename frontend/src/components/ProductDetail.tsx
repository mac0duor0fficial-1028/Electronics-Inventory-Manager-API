import { motion } from 'motion/react';
import { X, Calendar, DollarSign, Archive, HelpCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export function ProductDetail({ product, onClose, onEdit, onDelete }: ProductDetailProps) {
  if (!product) return null;

  const totalValue = product.price * product.quantity;

  return (
    <div className="fixed inset-0 z-40 flex justify-end" id="product-detail-container">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 transition-opacity"
      />

      {/* Drawer content */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-[#F3EDE6] h-full shadow-2xl flex flex-col z-10 border-l border-burgundy/10"
      >
        {/* Header */}
        <div className="bg-[#7A1E2C] text-white px-6 py-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-widest text-cream/80">Device Specifications</span>
            <h2 className="text-xl font-bold tracking-tight mt-0.5 truncate max-w-[280px]">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-cream hover:text-white hover:bg-white/10 transition-colors p-1.5 rounded-full"
            aria-label="Close details panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-xl p-5 border border-[#7A1E2C]/5 shadow-sm">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">DESCRIPTION</span>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                <DollarSign className="w-4 h-4 text-[#7A1E2C]" />
                <span className="text-xs font-semibold">UNIT PRICE</span>
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">MSRP Currency: USD</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                <Archive className="w-4 h-4 text-[#7A1E2C]" />
                <span className="text-xs font-semibold">STOCK QUANTITY</span>
              </div>
              <div>
                <span className={`text-xl font-bold ${product.quantity === 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {product.quantity}
                </span>
                <span className="block mt-0.5">
                  {product.quantity === 0 ? (
                    <span className="text-xs text-rose-600 font-medium">Out of stock</span>
                  ) : product.quantity <= 5 ? (
                    <span className="text-xs text-amber-600 font-medium">Reorder soon</span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">In stock</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Total Value Block */}
          <div className="bg-white rounded-xl p-5 border border-[#7A1E2C]/5 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-400">TOTAL INVENTORY VALUE</span>
              <span className="text-xs text-slate-400">Price × Quantity</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-extrabold text-[#7A1E2C]">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {product.quantity} units × ${product.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Guidelines/Audit Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-xs text-slate-500 flex gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-normal">
              This item is part of your live inventory catalog. Any changes or deletions you make here will immediately update the active stock listing for all team members.
            </p>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-white border-t border-slate-200 px-6 py-5 flex gap-3">
          <button
            id="detail-edit-btn"
            onClick={() => onEdit(product)}
            className="flex-1 py-2.5 px-4 bg-[#7A1E2C] hover:bg-[#601520] text-white text-sm font-semibold rounded-lg transition-all shadow-sm focus:ring-2 focus:ring-[#7A1E2C]/20 outline-none"
          >
            Edit Product
          </button>
          <button
            id="detail-delete-btn"
            onClick={() => onDelete(product.id)}
            className="flex-1 py-2.5 px-4 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-sm font-semibold rounded-lg transition-all shadow-sm outline-none"
          >
            Delete Product
          </button>
        </div>
      </motion.div>
    </div>
  );
}
