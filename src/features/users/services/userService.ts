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
    try {
      console.log(`🔍 Fetching users: page=${page}, limit=${limit}`);
      const response = await apiClient.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
      
      console.log('📡 Raw API response:', response);
      console.log('📦 Response data:', response.data);
      console.log('📊 Response status:', response.status);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (!response.data) {
        console.error('❌ Response data is null/undefined');
        throw new Error('No se recibieron datos del servidor');
      }
      
      // Si la respuesta es directamente un array (sin paginación)
      if (Array.isArray(response.data)) {
        console.log('📋 Response is direct array, creating pagination wrapper');
        return {
          total: response.data.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(response.data.length / limit),
          data: response.data
        };
      }
      
      // Si la respuesta tiene la estructura esperada
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      
      console.error('❌ Unexpected response structure:', response.data);
      throw new Error('Estructura de respuesta inesperada del servidor');
      
    } catch (error) {
      console.error('❌ Error in userService.getUsers:', error);
      
      // Re-throw con más información
      if (error instanceof Error) {
        throw new Error(`Error al obtener usuarios: ${error.message}`);
      }
      throw new Error('Error desconocido al obtener usuarios');
    }
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