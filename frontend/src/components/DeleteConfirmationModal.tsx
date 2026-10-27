import { motion } from 'motion/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface DeleteConfirmationModalProps {
  product: Product | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  product,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-slate-900/60"
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 flex flex-col"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
              <AlertTriangle className="h-5 w-5 text-rose-600" aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight" id="delete-modal-title">
                Remove Product
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete <span className="font-bold text-slate-950">"{product.name}"</span>?
                  This will completely remove this item and all of its stock records from the active system.
                </p>
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                  ⚠️ This action is final and cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
          <button
            id="cancel-delete-btn"
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="inline-flex w-full justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors outline-none sm:w-auto cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex w-full justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors focus:ring-2 focus:ring-rose-500/20 outline-none sm:w-auto flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Product
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
