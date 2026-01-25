import axios from 'axios';
import type {
  Store,
  StoreStats,
  ApiResponse,
  Product,
  PaginatedResponse,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const storesApi = {
  getAll: async (): Promise<Store[]> => {
    const response = await api.get<ApiResponse<Store[]>>('/stores');
    return response.data.data;
  },

  getById: async (id: number): Promise<Store> => {
    const response = await api.get<ApiResponse<Store>>(`/stores/${id}`);
    return response.data.data;
  },

  getStats: async (id: number): Promise<StoreStats> => {
    const response = await api.get<ApiResponse<StoreStats>>(`/stores/${id}/stats`);
    return response.data.data;
  },

  create: async (data: { name: string; address?: string; phone?: string }): Promise<Store> => {
    const response = await api.post<ApiResponse<Store>>('/stores', data);
    return response.data.data;
  },

  update: async (id: number, data: { name?: string; address?: string; phone?: string }): Promise<Store> => {
    const response = await api.put<ApiResponse<Store>>(`/stores/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/stores/${id}`);
  },
};

export const productsApi = {
  getByStore: async (
    storeId: number,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<ApiResponse<PaginatedResponse<Product>>>(
      `/stores/${storeId}/products?${params.toString()}`
    );
    return response.data.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  create: async (storeId: number, data: CreateProductData): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>(
      `/stores/${storeId}/products`,
      data
    );
    return response.data.data;
  },

  update: async (id: number, data: UpdateProductData): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  updateStock: async (id: number, quantity: number): Promise<Product> => {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/stock`, {
      quantity,
    });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export default api;
