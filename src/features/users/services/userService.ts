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
  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  // Crear usuario
  createUser: async (userData: UserFormData): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users/register', userData);
    return response.data.data;
  },

  // Actualizar usuario
  updateUser: async (id: number, userData: Partial<UserFormData>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data;
  },

  // Desactivar usuario
  deactivateUser: async (id: number): Promise<void> => {
    await apiClient.post(`/users/${id}/deactivate`);
  },

  // Activar usuario
  activateUser: async (id: number): Promise<void> => {
    await apiClient.post(`/users/${id}/activate`);
  },

  // Eliminar usuario
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Eliminar usuario permanentemente
  deleteUserPermanently: async (id: number, motivo: string): Promise<void> => {
    await apiClient.delete(`/users/${id}/permanent`, { params: { motivo } });
  },

  // Buscar usuarios
  searchUsers: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Verificar si un número de documento ya existe
  checkDocumentExists: async (numeroDocumento: string, excludeUserId?: number): Promise<boolean> => {
    try {
      const response = await apiClient.get<ApiResponse<{ exists: boolean }>>(`/users/check-document/${encodeURIComponent(numeroDocumento)}`, {
        params: excludeUserId ? { excludeUserId } : {}
      });
      return response.data.data.exists;
    } catch (error) {
      console.error('Error checking document:', error);
      return false;
    }
  },

  // Verificar si un correo ya existe
  checkEmailExists: async (email: string, excludeUserId?: number): Promise<boolean> => {
    try {
      const response = await apiClient.get<ApiResponse<{ exists: boolean }>>(`/users/check-email/${encodeURIComponent(email)}`, {
        params: excludeUserId ? { excludeUserId } : {}
      });
      return response.data.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }
};