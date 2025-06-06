import api from '@/shared/services/api';
import { Training, TrainingResponse, TrainingsResponse } from '@/shared/types/training';

export const scheduleService = {
  // Get all training sessions with pagination and filters
  getTrainings: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    id_entrenador?: number;
    id_cliente?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) => {
    const response = await api.get<TrainingsResponse>('/schedule', { params });
    return response.data;
  },

  // Get training by ID
  getTraining: async (id: number) => {
    const response = await api.get<TrainingResponse>(`/schedule/${id}`);
    return response.data;
  },

  // Create new training session
  createTraining: async (data: Partial<Training>) => {
    const response = await api.post<TrainingResponse>('/schedule', data);
    return response.data;
  },

  // Update training session
  updateTraining: async (id: number, data: Partial<Training>) => {
    const response = await api.put<TrainingResponse>(`/schedule/${id}`, data);
    return response.data;
  },

  // Delete/Cancel training session
  deleteTraining: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/schedule/${id}`);
    return response.data;
  },

  // Check availability for a time slot
  checkAvailability: async (params: {
    fecha_inicio: string;
    fecha_fin: string;
    id_entrenador?: number;
  }) => {
    const response = await api.get('/schedule/availability', { params });
    return response.data;
  },

  // Get trainer schedule
  getTrainerSchedule: async (id: number) => {
    const response = await api.get<TrainingsResponse>(`/schedule/trainer/${id}`);
    return response.data;
  },

  // Get client schedule
  getClientSchedule: async (id: number) => {
    const response = await api.get<TrainingsResponse>(`/schedule/client/${id}`);
    return response.data;
  },
};
