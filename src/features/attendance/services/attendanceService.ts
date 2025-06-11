import apiClient from '@/shared/services/api';
import { AttendanceRecord } from "@/shared/types/types"
import { format } from "date-fns"

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

export const attendanceService = {
  // Obtener todas las asistencias (requiere autenticación y ser admin o entrenador)
  getAttendances: async (page = 1, limit = 10): Promise<PaginatedResponse<AttendanceRecord>> => {
    const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
      `/attendance?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Obtener detalles de una asistencia (requiere autenticación y ser admin o entrenador)
  getAttendanceDetails: async (id: number): Promise<AttendanceRecord> => {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error("ID de asistencia inválido: debe ser un número")
    }
    const response = await apiClient.get<ApiResponse<AttendanceRecord>>(`/attendance/${numericId}`);
    return response.data.data;
  },

  // Registrar nueva asistencia (requiere autenticación y ser admin o entrenador)
  registerAttendance: async (documentNumber: string): Promise<AttendanceRecord> => {
    if (!documentNumber || !documentNumber.trim()) {
      throw new Error("El número de documento es requerido")
    }

    const response = await apiClient.post<ApiResponse<AttendanceRecord>>('/attendance/register', {
      numero_documento: documentNumber.trim(),
      documento: documentNumber.trim(),
      fecha_uso: format(new Date(), "yyyy-MM-dd"),
      hora_registro: format(new Date(), "HH:mm:ss"),
    });
    return response.data.data;
  },

  // Buscar asistencias (requiere autenticación y ser admin o entrenador)
  searchAttendances: async (query: string, page = 1, limit = 10): Promise<PaginatedResponse<AttendanceRecord>> => {
    const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
      `/attendance/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Eliminar registro de asistencia (solo admin)
  deleteAttendance: async (id: number): Promise<void> => {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error("ID de asistencia inválido: debe ser un número")
    }
    await apiClient.delete(`/attendance/delete/${numericId}`);
  },

  // Obtener estadísticas de asistencia
  getAttendanceStats: async (date: Date): Promise<{
    total: number;
    activos: number;
    eliminados: number;
  }> => {
    const response = await apiClient.get<ApiResponse<{
      total: number;
      activos: number;
      eliminados: number;
    }>>(`/attendance/stats?date=${format(date, "yyyy-MM-dd")}`);
    return response.data.data;
  }
}; 