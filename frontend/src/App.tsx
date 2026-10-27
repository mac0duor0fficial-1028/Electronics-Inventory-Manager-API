import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, PackageX, AlertTriangle, Cpu } from 'lucide-react';
import { Product, ProductInput } from './types';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  isDemoModeActive,
  setDemoModeActive,
  getApiBaseUrl,
} from './api';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { ProductDetail } from './components/ProductDetail';
import { ProductForm } from './components/ProductForm';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(isDemoModeActive());
  const [errorState, setErrorState] = useState<{
    type: 'network' | '404' | '422' | '500' | 'unknown' | null;
    message: string;
  } | null>(null);

  // Focus states
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Compute derived selectedProduct safely
  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;

  // Modal toggle states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications list
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, type, title, description }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Inventory List
  const fetchInventory = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setErrorState(null);

    try {
      const data = await getProducts();
      setProducts(data);

      // If selected product is no longer present in refreshed catalog, close detail
      if (selectedProductId && !data.some((p) => p.id === selectedProductId)) {
        setSelectedProductId(null);
      }
    } catch (error: any) {
      console.error('Fetch Inventory Error:', error);

      // Fall back to Demo Mode automatically if server is unreachable
      if (!isDemoModeActive()) {
        setDemoModeActive(true);
        setIsDemo(true);
        addToast(
          'info',
          'Switched to Demo Mode',
          "We couldn't connect to your live server, so we switched you to the demo sandbox to keep the app functional."
        );
        try {
          const fallbackData = await getProducts();
          setProducts(fallbackData);
          if (selectedProductId && !fallbackData.some((p) => p.id === selectedProductId)) {
            setSelectedProductId(null);
          }
          setIsLoading(false);
          return;
        } catch (fbError) {
          console.error('Fallback fetch failed:', fbError);
        }
      }

      let errorType: 'network' | '404' | '422' | '500' | 'unknown' = 'unknown';
      let message = 'An unexpected problem occurred while loading the inventory.';

      if (error.status) {
        if (error.status === 404) {
          errorType = '404';
          message = 'The inventory catalog could not be found on the server.';
        } else if (error.status === 422) {
          errorType = '422';
          message = 'The server rejected the request because the item details are invalid.';
        } else if (error.status >= 500) {
          errorType = '500';
          message = 'The server is experiencing a temporary problem. Please try again shortly.';
        } else {
          message = `Server Error (${error.status}): A problem occurred.`;
        }
      } else if (error.message && (error.message.includes('reach the server') || error.message.includes('Network failure') || error.message.includes('connect'))) {
        errorType = 'network';
        message = 'We could not reach the server. If you are using Live Mode, please ensure your backend server is turned on and running.';
      } else if (error instanceof Error) {
        message = error.message;
      }

      setErrorState({ type: errorType, message });
      addToast('error', 'Update Failed', 'Could not refresh the inventory list.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProductId, addToast]);

  // Load initially
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Trigger when navbar mode (demo/live) toggles or base URL changes
  const handleModeChange = (newDemoMode?: boolean) => {
    const activeDemo = newDemoMode !== undefined ? newDemoMode : isDemoModeActive();
    setDemoModeActive(activeDemo);
    setIsDemo(activeDemo);
    setSelectedProductId(null);
    setProducts([]);
    fetchInventory();
    addToast(
      'info',
      activeDemo ? 'Switched to Demo Mode' : 'Switched to Live Database',
      activeDemo
        ? 'Using offline demo space.'
        : 'Connecting directly to your live server.'
    );
  };

  // Create Product handler
  const handleCreateProduct = async (input: ProductInput) => {
    const created = await createProduct(input);
    setProducts((prev) => [...prev, created]);
    setIsFormOpen(false);
    addToast('success', 'Product Added', `"${created.name}" was successfully added to your inventory.`);
  };

  // Update Product handler
  const handleUpdateProduct = async (input: ProductInput) => {
    if (!productToEdit) return;
    const updated = await updateProduct(productToEdit.id, input);

    // Update in state list
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    setProductToEdit(null);
    setIsFormOpen(false);
    addToast('success', 'Product Saved', `The details for "${updated.name}" have been successfully updated.`);
  };

  // Save/Form Submit Dispatcher
  const handleFormSubmit = async (input: ProductInput) => {
    if (productToEdit) {
      await handleUpdateProduct(input);
    } else {
      await handleCreateProduct(input);
    }
  };

  // Initiate Delete click
  const handleDeleteTrigger = (id: number) => {
    const p = products.find((x) => x.id === id);
    if (p) {
      setProductToDelete(p);
      setIsDeleteModalOpen(true);
    }
  };

  // Confirm delete handler
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      await deleteProduct(productToDelete.id);

      // Remove from states
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      if (selectedProductId === productToDelete.id) {
        setSelectedProductId(null);
      }

      addToast('success', 'Product Deleted', `"${productToDelete.name}" has been successfully removed from your inventory.`);
      setIsDeleteModalOpen(false);
      setTimeout(() => {
        setProductToDelete(null);
      }, 300);
    } catch (error: any) {
      console.error('Delete product failed:', error);
      addToast(
        'error',
        'Delete Failed',
        error.message || 'We could not delete the product. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTrigger = (product: Product) => {
    setSelectedProductId(null);
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F3EDE6]/40 flex flex-col font-sans selection:bg-[#7A1E2C]/10 selection:text-[#7A1E2C]">
      {/* Top sticky Navigation */}
      <Navbar
        isDemo={isDemo}
        onModeToggle={handleModeChange}
        isSyncing={isLoading && products.length > 0}
        onRefresh={() => fetchInventory(true)}
        apiError={errorState && errorState.type === 'network' ? errorState.message : null}
      />

      {/* Main Body Grid */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {isLoading && products.length === 0 ? (
            /* Immersive Loading State */
            <motion.div
              key="loading-viewport"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[50vh] flex flex-col items-center justify-center py-20"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-burgundy/10 border-t-[#7A1E2C] rounded-full animate-spin" />
                <Cpu className="w-6 h-6 text-[#7A1E2C] absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-6 tracking-tight">
                Loading Inventory Catalog...
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Fetching the latest items from our system
              </p>
            </motion.div>
          ) : errorState && products.length === 0 ? (
            /* Immersive Error View */
            <motion.div
              key="error-viewport"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-[50vh] py-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-5 border border-rose-150">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                API Connection Failed
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {errorState.message}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button
                  id="error-retry-btn"
                  onClick={() => fetchInventory()}
                  className="px-4 py-2 bg-[#7A1E2C] hover:bg-[#601520] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Connection
                </button>
                {errorState.type === 'network' && (
                  <button
                    id="error-sandbox-fallback-btn"
                    onClick={() => {
                      localStorage.setItem('inventory_demo_mode', 'true');
                      handleModeChange();
                    }}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Launch Demo Sandbox Mode
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            /* Fully Populated dashboard workspace */
            <motion.div
              key="workspace-viewport"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Summary Dashboard Panels */}
              <Dashboard products={products} />

              {/* Grid content */}
              <div className="grid grid-cols-1 gap-6">
                {/* Catalog table & control system */}
                <ProductList
                  products={products}
                  onSelect={(p) => setSelectedProductId(p.id)}
                  onEdit={handleEditTrigger}
                  onDelete={handleDeleteTrigger}
                  onAddClick={() => {
                    setProductToEdit(null);
                    setIsFormOpen(true);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Side Drawer details overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProductId(null)}
            onEdit={handleEditTrigger}
            onDelete={handleDeleteTrigger}
          />
        )}
      </AnimatePresence>

      {/* Overlay modal Form drawer (Add / Edit) */}
      <ProductForm
        isOpen={isFormOpen}
        product={productToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setProductToEdit(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Overlay Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <DeleteConfirmationModal
            product={productToDelete}
            isDeleting={isDeleting}
            onConfirm={handleDeleteConfirm}
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setTimeout(() => {
                setProductToDelete(null);
              }, 300);
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Notifications Toaster */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
