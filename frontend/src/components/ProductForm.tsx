import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Product, ProductInput } from '../types';
import { ApiError } from '../api';

interface ProductFormProps {
  isOpen: boolean;
  product: Product | null; // Null means creating, otherwise editing
  onClose: () => void;
  onSubmit: (input: ProductInput) => Promise<void>;
}

interface FormErrors {
  name?: string;
  description?: string;
  price?: string;
  quantity?: string;
  general?: string;
}

export function ProductForm({ isOpen, product, onClose, onSubmit }: ProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when editing product opens
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name);
        setDescription(product.description);
        setPrice(String(product.price));
        setQuantity(String(product.quantity));
      } else {
        setName('');
        setDescription('');
        setPrice('');
        setQuantity('');
      }
      setErrors({});
    }
  }, [isOpen, product]);

  // Client-side quick check
  const validateForm = (): boolean => {
    const localErrors: FormErrors = {};

    if (!name.trim()) {
      localErrors.name = 'Product name is required';
    }

    if (!description.trim()) {
      localErrors.description = 'Description is required';
    }

    if (!price.trim()) {
      localErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum)) {
        localErrors.price = 'Price must be a valid number';
      } else if (priceNum < 0) {
        localErrors.price = 'Price must be greater than or equal to 0';
      }
    }

    if (!quantity.trim()) {
      localErrors.quantity = 'Quantity is required';
    } else {
      const quantNum = parseFloat(quantity);
      if (!Number.isInteger(quantNum) || isNaN(quantNum)) {
        localErrors.quantity = 'Quantity must be a valid integer';
      } else if (quantNum < 0) {
        localErrors.quantity = 'Quantity must be greater than or equal to 0';
      }
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate locally first
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload: ProductInput = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
      };

      await onSubmit(payload);
    } catch (error) {
      const apiErrors: FormErrors = {};

      if (error instanceof ApiError) {
        if (error.status === 422) {
          // FastAPI returns standard pydantic errors in detail field
          const detail = error.data?.detail;
          if (Array.isArray(detail)) {
            detail.forEach((err: any) => {
              const field = err.loc[err.loc.length - 1]; // last item holds field name e.g. "price"
              if (['name', 'description', 'price', 'quantity'].includes(field)) {
                apiErrors[field as keyof FormErrors] = err.msg;
              } else {
                apiErrors.general = err.msg || 'A validation error occurred.';
              }
            });
          } else {
            apiErrors.general = 'Validation failed on API server.';
          }
        } else {
          apiErrors.general = `Server returned status ${error.status}: ${error.message}`;
        }
      } else if (error instanceof Error) {
        apiErrors.general = error.message;
      } else {
        apiErrors.general = 'An unexpected error occurred.';
      }

      setErrors(apiErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="form-modal-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 transition-opacity"
          />

          {/* Form Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative bg-[#F3EDE6] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-burgundy/10 z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-[#7A1E2C] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold tracking-tight" id="form-modal-title">
                {product ? 'Edit Electronics Record' : 'Register New Device'}
              </h3>
              <button
                onClick={onClose}
                className="text-cream/80 hover:text-white hover:bg-white/10 transition-colors p-1 rounded-full"
                aria-label="Close form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* General server error */}
              {errors.general && (
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-2 items-start" role="alert">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="font-semibold">Submission Failure:</span> {errors.general}
                  </div>
                </div>
              )}

              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="prod-name" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="prod-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Studio Active Subwoofer 10-inch"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "prod-name-error" : undefined}
                  className={`w-full bg-white px-3 py-2.5 rounded-lg border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#7A1E2C] focus:ring-[#7A1E2C]/20'
                  }`}
                />
                {errors.name && (
                  <span id="prod-name-error" className="text-xs text-rose-600 font-medium flex gap-1 items-center" role="alert">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="prod-description" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Specifications Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="prod-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide technical specifications, brand info, warranty, and compatibility details..."
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "prod-desc-error" : undefined}
                  className={`w-full bg-white px-3 py-2.5 rounded-lg border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.description
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#7A1E2C] focus:ring-[#7A1E2C]/20'
                  }`}
                />
                {errors.description && (
                  <span id="prod-desc-error" className="text-xs text-rose-600 font-medium flex gap-1 items-center" role="alert">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.description}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prod-price" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Unit Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-[11px] text-slate-400 text-sm font-medium">$</span>
                    <input
                      id="prod-price"
                      type="number"
                      step="any"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      aria-invalid={!!errors.price}
                      aria-describedby={errors.price ? "prod-price-error" : undefined}
                      className={`w-full bg-white pl-7 pr-3 py-2.5 rounded-lg border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.price
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-[#7A1E2C] focus:ring-[#7A1E2C]/20'
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <span id="prod-price-error" className="text-xs text-rose-600 font-medium flex gap-1 items-center" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.price}
                    </span>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prod-quantity" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="prod-quantity"
                    type="number"
                    step="1"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    aria-invalid={!!errors.quantity}
                    aria-describedby={errors.quantity ? "prod-quant-error" : undefined}
                    className={`w-full bg-white px-3 py-2.5 rounded-lg border text-slate-800 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.quantity
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-[#7A1E2C] focus:ring-[#7A1E2C]/20'
                    }`}
                  />
                  {errors.quantity && (
                    <span id="prod-quant-error" className="text-xs text-rose-600 font-medium flex gap-1 items-center" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.quantity}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 leading-normal">
                Fields marked with <span className="text-rose-500 font-semibold">*</span> are required. The price must be a valid number (such as 19.99), and the quantity must be a whole number (such as 5).
              </div>

              {/* Submit panel */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  id="form-cancel-btn"
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 bg-white text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer outline-none"
                >
                  Cancel
                </button>
                <button
                  id="form-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#7A1E2C] hover:bg-[#601520] text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer outline-none shadow-sm focus:ring-2 focus:ring-[#7A1E2C]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {product ? 'Apply Updates' : 'Add to Inventory'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
