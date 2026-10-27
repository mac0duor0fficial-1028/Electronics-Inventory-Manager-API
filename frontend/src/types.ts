export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export type ProductInput = Omit<Product, 'id'>;

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiValidationErrorResponse {
  detail: ValidationErrorDetail[];
}

export interface ApiGeneralErrorResponse {
  message?: string;
  error?: string;
}
