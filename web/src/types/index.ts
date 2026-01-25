export interface Store {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  storeId: number;
  name: string;
  category: string;
  price: string;
  quantity: number;
  sku: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreStats {
  storeId: number;
  storeName: string;
  totalProducts: number;
  totalQuantity: number;
  totalInventoryValue: number;
  outOfStockCount: number;
  lowStockCount: number;
  categoryBreakdown: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  productCount: number;
  totalQuantity: number;
  totalValue: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'quantity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductData {
  name: string;
  category: string;
  price: number;
  quantity: number;
  sku?: string;
  description?: string;
}

export interface UpdateProductData {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  sku?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
