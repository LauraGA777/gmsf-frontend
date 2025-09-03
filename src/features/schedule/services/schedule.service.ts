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

  // Get schedule for a specific client (used in client view)
  getClientSchedule: async (clientPersonId: number) => {
    const response = await api.get<{ data: any[]; success: boolean; message: string }>(`/schedules/client/${clientPersonId}`);
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
    const response = await api.post<AvailabilityResponse>('/schedules/availability', params);
    return response.data;
  },

  // Get trainer schedule
  getTrainerSchedule: async (id: number) => {
    const response = await api.get<TrainingsResponse>(`/schedules/trainer/${id}`);
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
  },

  // Get active trainers - Using the dedicated active trainers endpoint
  getActiveTrainers: async () => {
    try {
      const response = await api.get<{data: any[], success: boolean, message: string}>('/schedules/active-trainers');
      
      // The data comes from response.data.data due to ApiResponse.success structure
      const trainers = response.data.data || [];
      const mappedTrainers = trainers.map((trainer: any) => ({
        id: trainer.id,
        codigo: trainer.codigo,
        especialidad: trainer.especialidad,
        estado: trainer.estado,
        usuario: {
          id: trainer.usuario.id,
          nombre: trainer.usuario.nombre,
          apellido: trainer.usuario.apellido,
          correo: trainer.usuario.correo,
          telefono: trainer.usuario.telefono || null
        }
      }));

      return { data: mappedTrainers };
    } catch (error) {
      console.error('Error fetching active trainers:', error);
      return { data: [] };
    }
  },

  // Get active clients - Using the dedicated active clients endpoint
  getActiveClients: async () => {
    try {
      const response = await api.get<{data: any[], success: boolean, message: string}>('/schedules/active-clients');
      
      // The data comes from response.data.data due to ApiResponse.success structure
      const clients = response.data.data || [];
      const mappedClients = clients.map((client: any) => ({
        id: client.id,
        codigo: client.codigo,
        estado: client.estado,
        usuario: {
          id: client.usuario.id,
          nombre: client.usuario.nombre,
          apellido: client.usuario.apellido,
          correo: client.usuario.correo,
          telefono: client.usuario.telefono || null
        }
      }));

      return { data: mappedClients };
    } catch (error) {
      console.error('Error fetching active clients:', error);
      return { data: [] };
    }
  },

  // === MÉTODOS ESPECÍFICOS PARA CLIENTES ===

  // Get available time slots for clients to book
  getAvailableTimeSlots: async (fecha: string, id_entrenador?: number) => {
    try {
      const params: any = { fecha };
      if (id_entrenador) {
        params.id_entrenador = id_entrenador;
      }

      const response = await api.get<{
        data: Array<{
          hora: string;
          disponible: boolean;
          razon?: string;
          entrenadores: Array<{
            id: number;
            codigo: string;
            especialidad: string;
            estado: boolean;
            usuario: {
              id: number;
              nombre: string;
              apellido: string;
              correo: string;
              telefono?: string;
            };
          }>;
        }>;
        success: boolean;
        message: string;
      }>('/schedules/client/available-slots', { params });

      return response.data;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw error;
    }
  },

  // Book training for client (restricted)
  bookTrainingForClient: async (data: {
    titulo?: string;
    descripcion?: string;
    fecha_inicio: string;
    fecha_fin: string;
    id_entrenador: number;
    notas?: string;
  }) => {
    try {
      const response = await api.post<TrainingResponse>('/schedules/client/book', data);
      return response.data;
    } catch (error) {
      console.error('Error booking training for client:', error);
      throw error;
    }
  },
};
