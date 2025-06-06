import apiClient from '@/shared/services/api';
import type { User, UserFormData } from '../types/user';

interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

export const userService = {
  // Obtener todos los usuarios
  getUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ usuario: User }>>(`/users/${id}`);
    return response.data.data.usuario;
  },

  // Crear usuario
  createUser: async (userData: UserFormData): Promise<User> => {
    const response = await apiClient.post<ApiResponse<{ user: User }>>('/users/register', userData);
    return response.data.data.user;
  },

  // Actualizar usuario
  updateUser: async (id: string, userData: Partial<UserFormData>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<{ usuario: User }>>(`/users/${id}`, userData);
    return response.data.data.usuario;
  },

  // Desactivar usuario (soft delete)
  deactivateUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Eliminar usuario permanentemente
  deleteUserPermanently: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}/permanent`);
  },

  // Buscar usuarios
  searchUsers: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  }
};