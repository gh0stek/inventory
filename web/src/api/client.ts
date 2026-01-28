import axios from "axios";
import type {
  Store,
  StoreStats,
  Product,
  PaginatedResponse,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
} from "../types";

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const storesApi = {
  getAll: async () => {
    const response = await api.get<Store[]>("/stores");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Store>(`/stores/${id}`);
    return response.data;
  },

  getStats: async (id: number) => {
    const response = await api.get<StoreStats>(`/stores/${id}/stats`);
    return response.data;
  },

  create: async (data: { name: string; address?: string; phone?: string }) => {
    const response = await api.post<Store>("/stores", data);
    return response.data;
  },

  update: async (
    id: number,
    data: { name?: string; address?: string; phone?: string },
  ) => {
    const response = await api.put<Store>(`/stores/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/stores/${id}`);
  },
};

export const productsApi = {
  getByStore: async (storeId: number, filters?: ProductFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<PaginatedResponse<Product>>(
      `/stores/${storeId}/products?${params.toString()}`,
    );
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (storeId: number, data: CreateProductData) => {
    const response = await api.post<Product>(
      `/stores/${storeId}/products`,
      data,
    );
    return response.data;
  },

  update: async (id: number, data: UpdateProductData) => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  updateStock: async (id: number, quantity: number) => {
    const response = await api.patch<Product>(`/products/${id}/stock`, {
      quantity,
    });
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/products/${id}`);
  },
};

export default api;
