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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
