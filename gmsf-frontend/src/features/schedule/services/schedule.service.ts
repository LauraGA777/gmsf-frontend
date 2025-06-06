import api from '@/shared/services/api';
import { Training, TrainingResponse, TrainingsResponse, AvailabilityResponse } from '@/shared/types/training';

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
    const response = await api.get<TrainingsResponse>('/schedules', { params });
    return response.data;
  },

  // Get training by ID
  getTraining: async (id: number) => {
    const response = await api.get<TrainingResponse>(`/schedules/${id}`);
    return response.data;
  },

  // Create new training session
  createTraining: async (data: Partial<Training>) => {
    const response = await api.post<TrainingResponse>('/schedules', data);
    return response.data;
  },

  // Update training session
  updateTraining: async (id: number, data: Partial<Training>) => {
    const response = await api.put<TrainingResponse>(`/schedules/${id}`, data);
    return response.data;
  },

  // Delete/Cancel training session
  deleteTraining: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/schedules/${id}`);
    return response.data;
  },

  // Check availability for a time slot
  checkAvailability: async (params: {
    fecha_inicio: string;
    fecha_fin: string;
    id_entrenador?: number;
  }) => {
    const response = await api.get<AvailabilityResponse>('/schedules/availability', { params });
    return response.data;
  },

  // Get trainer schedule
  getTrainerSchedule: async (id: number) => {
    const response = await api.get<TrainingsResponse>(`/schedules/trainer/${id}`);
    return response.data;
  },

  // Get client schedule
  getClientSchedule: async (id: number) => {
    const response = await api.get<TrainingsResponse>(`/schedules/client/${id}`);
    return response.data;
  },

  // Get daily schedule
  getDailySchedule: async (date: string) => {
    const response = await api.get<TrainingsResponse>(`/schedules/daily/${date}`);
    return response.data;
  },

  // Get weekly schedule
  getWeeklySchedule: async (startDate: string, endDate: string) => {
    const response = await api.get<TrainingsResponse>(`/schedules/weekly`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get monthly schedule
  getMonthlySchedule: async (year: number, month: number) => {
    const response = await api.get<TrainingsResponse>(`/schedules/monthly`, {
      params: { year, month }
    });
    return response.data;
  }
};
