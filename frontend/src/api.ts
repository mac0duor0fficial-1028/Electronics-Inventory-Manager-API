import { Product, ProductInput, ApiValidationErrorResponse } from './types';

// Read from Vite env variable or default to a standard placeholder
const DEFAULT_API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000';

let apiBaseUrl = localStorage.getItem('inventory_api_base_url') || DEFAULT_API_URL;
let isDemoMode = localStorage.getItem('inventory_demo_mode') !== 'false'; // Default to true in preview for an interactive sandbox

export function getApiBaseUrl(): string {
  return apiBaseUrl;
}

export function setApiBaseUrl(url: string) {
  apiBaseUrl = url;
  localStorage.setItem('inventory_api_base_url', url);
}

export function isDemoModeActive(): boolean {
  return isDemoMode;
}

export function setDemoModeActive(active: boolean) {
  isDemoMode = active;
  localStorage.setItem('inventory_demo_mode', String(active));
}

// Custom error classes for handling REST API errors
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Local storage helper for Demo Mode
const DEMO_STORAGE_KEY = 'inventory_demo_products';
const INITIAL_DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Pro Audio Studio Headphones',
    description: 'High-fidelity reference monitor headphones with 45mm neodymium drivers, perfect for mixing, mastering, and everyday critical listening.',
    price: 149.99,
    quantity: 12
  },
  {
    id: 2,
    name: 'Mechanical Gaming Keyboard',
    description: 'Ultra-responsive mechanical keyboard with clicky blue switches, customizable RGB backlighting, and solid aircraft-grade aluminum frame.',
    price: 89.95,
    quantity: 25
  },
  {
    id: 3,
    name: 'Curved UltraWide Monitor 34"',
    description: 'Immersive 34-inch curved monitor featuring a crisp WQHD resolution, high 144Hz refresh rate, and premium color accuracy for professional work and gaming.',
    price: 459.99,
    quantity: 5
  },
  {
    id: 4,
    name: 'Supercharged USB-C Docking Station',
    description: '14-in-1 multi-port hub featuring triple-monitor output, dual HDMI, DisplayPort, 100W Power Delivery, and gigabit ethernet.',
    price: 119.99,
    quantity: 8
  },
  {
    id: 5,
    name: 'Active Noise Cancelling Earbuds',
    description: 'True wireless earbuds with hybrid active noise cancellation, ambient passthrough mode, and up to 30 hours of continuous playback with charging case.',
    price: 79.99,
    quantity: 0
  }
];

function getDemoProducts(): Product[] {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
    return INITIAL_DEMO_PRODUCTS;
  }
  return JSON.parse(stored);
}

function saveDemoProducts(products: Product[]) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(products));
}

// Delay helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to validate input mirroring Pydantic rules
function validateProductInput(input: ProductInput): ApiValidationErrorResponse | null {
  const errors: ApiValidationErrorResponse['detail'] = [];

  if (!input.name || input.name.trim() === '') {
    errors.push({
      loc: ['body', 'name'],
      msg: 'field required and cannot be empty',
      type: 'value_error.missing'
    });
  }

  if (!input.description || input.description.trim() === '') {
    errors.push({
      loc: ['body', 'description'],
      msg: 'field required and cannot be empty',
      type: 'value_error.missing'
    });
  }

  if (input.price === undefined || input.price === null || isNaN(input.price)) {
    errors.push({
      loc: ['body', 'price'],
      msg: 'field required',
      type: 'value_error.missing'
    });
  } else if (input.price < 0) {
    errors.push({
      loc: ['body', 'price'],
      msg: 'ensure this value is greater than or equal to 0',
      type: 'value_error.number.not_ge'
    });
  }

  if (input.quantity === undefined || input.quantity === null || isNaN(input.quantity)) {
    errors.push({
      loc: ['body', 'quantity'],
      msg: 'field required',
      type: 'value_error.missing'
    });
  } else {
    if (!Number.isInteger(input.quantity)) {
      errors.push({
        loc: ['body', 'quantity'],
        msg: 'ensure this value is a valid integer',
        type: 'value_error.integer'
      });
    } else if (input.quantity < 0) {
      errors.push({
        loc: ['body', 'quantity'],
        msg: 'ensure this value is greater than or equal to 0',
        type: 'value_error.number.not_ge'
      });
    }
  }

  return errors.length > 0 ? { detail: errors } : null;
}

// Standard typed REST API Calls (Live) and Local Storage fallback (Demo)
export async function getProducts(): Promise<Product[]> {
  if (isDemoMode) {
    await delay(600);
    return getDemoProducts();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/products`);
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('We could not reach the server. If you are using Live Mode, please ensure your backend server is turned on and running.');
  }
}

export async function getProduct(id: number): Promise<Product> {
  if (isDemoMode) {
    await delay(400);
    const products = getDemoProducts();
    const product = products.find(p => p.id === id);
    if (!product) {
      throw new ApiError(404, `Product with ID ${id} not found`);
    }
    return product;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(404, `Product with ID ${id} not found`);
      }
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('We could not reach the server. Please check your connection or try again.');
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  if (isDemoMode) {
    await delay(700);
    // Mirror FastAPI validation check
    const validationError = validateProductInput(input);
    if (validationError) {
      throw new ApiError(422, 'Validation Error', validationError);
    }

    const products = getDemoProducts();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: newId,
      name: input.name.trim(),
      description: input.description.trim(),
      price: Number(input.price),
      quantity: Number(input.quantity)
    };
    saveDemoProducts([...products, newProduct]);
    return newProduct;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 422) {
        throw new ApiError(422, 'Validation Error', errorData);
      }
      throw new ApiError(response.status, errorData?.message || `HTTP error! status: ${response.status}`, errorData);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('We could not reach the server. Please check your connection or try again.');
  }
}

export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  if (isDemoMode) {
    await delay(700);
    // Mirror FastAPI validation check
    const validationError = validateProductInput(input);
    if (validationError) {
      throw new ApiError(422, 'Validation Error', validationError);
    }

    const products = getDemoProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new ApiError(404, `Product with ID ${id} not found`);
    }

    const updatedProduct: Product = {
      id,
      name: input.name.trim(),
      description: input.description.trim(),
      price: Number(input.price),
      quantity: Number(input.quantity)
    };

    const newProducts = [...products];
    newProducts[index] = updatedProduct;
    saveDemoProducts(newProducts);
    return updatedProduct;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 422) {
        throw new ApiError(422, 'Validation Error', errorData);
      }
      if (response.status === 404) {
        throw new ApiError(404, `Product with ID ${id} not found`);
      }
      throw new ApiError(response.status, errorData?.message || `HTTP error! status: ${response.status}`, errorData);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('We could not reach the server. Please check your connection or try again.');
  }
}

export async function deleteProduct(id: number): Promise<void> {
  if (isDemoMode) {
    await delay(600);
    const products = getDemoProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new ApiError(404, `Product with ID ${id} not found`);
    }
    saveDemoProducts(products.filter(p => p.id !== id));
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (response.status === 404) {
        throw new ApiError(404, `Product with ID ${id} not found`);
      }
      throw new ApiError(response.status, errorData?.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('We could not reach the server. Please check your connection or try again.');
  }
}
