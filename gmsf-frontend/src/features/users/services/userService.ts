import axios from 'axios';
import type { User, UserFormData } from '../types/user';

const API_URL = 'http://localhost:3001/api/users';

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
    const response = await axios.get<PaginatedResponse<User>>(`${API_URL}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (id: string): Promise<User> => {
    const response = await axios.get<ApiResponse<{ usuario: User }>>(`${API_URL}/${id}`);
    return response.data.data.usuario;
  },

  // Crear usuario
  createUser: async (userData: UserFormData): Promise<User> => {
    const response = await axios.post<ApiResponse<{ user: User }>>(`${API_URL}/register`, userData);
    return response.data.data.user;
  },

  // Actualizar usuario
  updateUser: async (id: string, userData: Partial<UserFormData>): Promise<User> => {
    const response = await axios.put<ApiResponse<{ usuario: User }>>(`${API_URL}/${id}`, userData);
    return response.data.data.usuario;
  },

  // Desactivar usuario (soft delete)
  deactivateUser: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Eliminar usuario permanentemente
  deleteUserPermanently: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}/permanent`);
  },

  // Buscar usuarios
  searchUsers: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
    const response = await axios.get<PaginatedResponse<User>>(
      `${API_URL}/search?q=${query}&pagina=${page}&limite=${limit}`
    );
    return response.data;
  }
}; 