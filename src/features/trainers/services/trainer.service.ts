import api from "@/shared/services/api";
import type { TrainerFormData, PaginatedTrainersResponse, SingleTrainerResponse } from "@/shared/types/trainer";
import type { User } from "@/shared/types";

export const trainerService = {
  // Verificar autenticación
  checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // Idealmente, esto debería redirigir al login o ser manejado por un interceptor de axios
      throw new Error('No hay token de autenticación');
    }
  },

  // Obtener todos los entrenadores con paginación y filtros
  getTrainers: async (params?: {
    pagina?: number;
    limite?: number;
    q?: string;
    estado?: boolean;
    orden?: string;
    direccion?: 'ASC' | 'DESC';
  }): Promise<PaginatedTrainersResponse> => {
    trainerService.checkAuth();
    const response = await api.get<{success: boolean, message: string, data: PaginatedTrainersResponse}>("/trainers", { params });
    return response.data.data;
  },

  // Obtener un entrenador por su ID
  getTrainerById: async (id: number): Promise<SingleTrainerResponse> => {
    trainerService.checkAuth();
    const response = await api.get<{success: boolean, message: string, data: SingleTrainerResponse}>(`/trainers/${id}`);
    return response.data.data;
  },

  // Crear un nuevo entrenador
  createTrainer: async (data: TrainerFormData): Promise<SingleTrainerResponse> => {
    trainerService.checkAuth();
    const response = await api.post<{success: boolean, message: string, data: SingleTrainerResponse}>("/trainers", data);
    return response.data.data;
  },

  // Actualizar un entrenador
  updateTrainer: async (id: number, data: Partial<TrainerFormData>): Promise<SingleTrainerResponse> => {
    trainerService.checkAuth();
    const response = await api.put<{success: boolean, message: string, data: SingleTrainerResponse}>(`/trainers/${id}`, data);
    return response.data.data;
  },

  // Activar un entrenador
  activateTrainer: async (id: number): Promise<{ message: string }> => {
    trainerService.checkAuth();
    const response = await api.patch<{success: boolean, message: string, data: { message: string }}>(`/trainers/${id}/activate`);
    return response.data.data;
  },
  
  // Desactivar un entrenador
  deactivateTrainer: async (id: number): Promise<{ message:string }> => {
    trainerService.checkAuth();
    const response = await api.patch<{success: boolean, message: string, data: { message: string }}>(`/trainers/${id}/deactivate`);
    return response.data.data;
  },

  // Eliminar un entrenador (hard delete)
  deleteTrainer: async (id: number): Promise<{ message: string }> => {
    trainerService.checkAuth();
    const response = await api.delete<{success: boolean, message: string, data: { message: string }}>(`/trainers/${id}`);
    return response.data.data;
  },
  
  // Verificar si un usuario existe por documento (usando el endpoint genérico de usuarios)
  checkUserByDocument: async (tipo_documento: string, numero_documento: string): Promise<{ userExists: boolean; isTrainer: boolean; userData: User | null }> => {
    trainerService.checkAuth();
    const response = await api.get<{success: boolean, message: string, data: { userExists: boolean; isTrainer: boolean; userData: User | null }}>(`/users/check-document`, { params: { tipo_documento, numero_documento } });
    return response.data.data;
  },
}; 