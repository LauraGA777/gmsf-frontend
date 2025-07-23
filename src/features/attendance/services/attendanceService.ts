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
  // Obtener todas las asistencias con parámetros adicionales
  getAttendances: async (params: {
    page?: number;
    limit?: number;
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
    fecha_inicio?: string;
    fecha_fin?: string;
  } = {}): Promise<PaginatedResponse<AttendanceRecord>> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      orderBy: params.orderBy || 'fecha_uso',
      direction: params.direction || 'DESC',
      ...(params.fecha_inicio && { fecha_inicio: params.fecha_inicio }),
      ...(params.fecha_fin && { fecha_fin: params.fecha_fin })
    });

    const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
      `/attendance?${queryParams}`
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
      numero_documento: documentNumber.trim()
    });
    return response.data.data;
  },

  // Búsqueda con parámetros completos
  searchAttendances: async (params: {
    codigo_usuario?: string;
    nombre_usuario?: string;
    estado?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
  } = {}): Promise<PaginatedResponse<AttendanceRecord>> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
      orderBy: params.orderBy || 'fecha_uso',
      direction: params.direction || 'DESC',
      ...(params.codigo_usuario && { codigo_usuario: params.codigo_usuario }),
      ...(params.nombre_usuario && { nombre_usuario: params.nombre_usuario }),
      ...(params.estado && { estado: params.estado }),
      ...(params.fecha_inicio && { fecha_inicio: params.fecha_inicio }),
      ...(params.fecha_fin && { fecha_fin: params.fecha_fin })
    });

    const response = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
      `/attendance/search?${queryParams}`
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
  },

  // Obtener historial de asistencia del cliente
  getClientAttendanceHistory: async (personId: string, page: number = 1, limit: number = 20): Promise<any> => {
    const response = await apiClient.get(`/my-attendances/${personId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener estadísticas de asistencia por rango de fechas y personId
  getClientAttendanceStats: async (personId: number, startDate: string, endDate: string): Promise<any> => {
    const response = await apiClient.get(`/my-attendances/stats?personId=${personId}&startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Obtener rango de fechas por período
  getClientDateRangeByPeriod: async (period: string): Promise<any> => {
    const response = await apiClient.get(`/my-attendances/date-range?period=${period}`);
    return response.data;
  },
};