import axios from 'axios';
import type { Store, StoreStats, ApiResponse } from '../types';

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

export default api;
