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

// ✅ Interfaz para un item de asistencia del usuario
interface UserAttendanceItem {
  id: number;
  fecha_uso: string;
  hora_registro: string;
  estado: string;
  fecha_registro: string;
  contrato: {
    codigo: string;
    membresia: {
      nombre: string;
    };
  };
}

// ✅ Interfaz para la respuesta de asistencias del usuario
interface UserAttendanceResponse {
  success: boolean;
  message: string;
  data: UserAttendanceItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ✅ Interfaz para las estadísticas
interface AttendanceStats {
  currentPeriod: number;
  goal: number;
  averagePerWeek: number;
  streak: number;
  totalAttendances: number;
  attendancesByMonth: Record<string, number>;
  mostActiveDay: string | null;
}

// ✅ Funciones auxiliares fuera del objeto (para evitar problemas con 'this')
const calculateAveragePerWeek = (attendances: UserAttendanceItem[], startDate: string, endDate: string): number => {
  if (attendances.length === 0) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  return attendances.length / Math.max(diffWeeks, 1);
};

const calculateStreak = (attendances: UserAttendanceItem[]): number => {
  if (!attendances || attendances.length === 0) return 0;
  
  // Filtrar solo asistencias activas y ordenar por fecha descendente
  const activeAttendances = attendances
    .filter((a: UserAttendanceItem) => a.estado === 'Activo')
    .sort((a: UserAttendanceItem, b: UserAttendanceItem) => 
      new Date(b.fecha_uso).getTime() - new Date(a.fecha_uso).getTime()
    );
  
  if (activeAttendances.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Resetear horas para comparación de fechas
  
  // Agrupar asistencias por fecha
  const attendancesByDate = new Map<string, number>();
  activeAttendances.forEach((attendance: UserAttendanceItem) => {
    const dateKey = attendance.fecha_uso;
    attendancesByDate.set(dateKey, (attendancesByDate.get(dateKey) || 0) + 1);
  });
  
  // Calcular racha desde hoy hacia atrás
  while (true) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    
    if (attendancesByDate.has(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const groupAttendancesByMonth = (attendances: UserAttendanceItem[]): Record<string, number> => {
  const groupedByMonth: Record<string, number> = {};
  
  attendances.forEach((attendance: UserAttendanceItem) => {
    const date = new Date(attendance.fecha_uso);
    const monthKey = format(date, 'yyyy-MM');
    groupedByMonth[monthKey] = (groupedByMonth[monthKey] || 0) + 1;
  });
  
  return groupedByMonth;
};

const getMostActiveDay = (attendances: UserAttendanceItem[]): string | null => {
  if (attendances.length === 0) return null;
  
  const dayCount: Record<string, number> = {};
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  attendances.forEach((attendance: UserAttendanceItem) => {
    const date = new Date(attendance.fecha_uso);
    const dayName = dayNames[date.getDay()];
    dayCount[dayName] = (dayCount[dayName] || 0) + 1;
  });
  
  let mostActiveDay: string | null = null;
  let maxCount = 0;
  
  for (const [day, count] of Object.entries(dayCount)) {
    if (count > maxCount) {
      maxCount = count;
      mostActiveDay = day;
    }
  }
  
  return mostActiveDay;
};

// ✅ Función para obtener todas las asistencias del usuario
const getAllUserAttendances = async (userId: string): Promise<UserAttendanceItem[]> => {
  try {
    console.log(`🔍 Obteniendo todas las asistencias para usuario: ${userId}`);
    
    let allAttendances: UserAttendanceItem[] = [];
    let currentPage = 1;
    let hasMorePages = true;
    const limit = 100; // Obtener de a 100 para reducir llamadas
    
    while (hasMorePages) {
      const response = await apiClient.get<UserAttendanceResponse>(
        `/attendance/my-attendances/${userId}?page=${currentPage}&limit=${limit}`
      );
      
      if (response.data && response.data.data) {
        allAttendances = [...allAttendances, ...response.data.data];
        
        // Verificar si hay más páginas
        hasMorePages = currentPage < response.data.pagination.totalPages;
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }
    
    console.log('✅ Total de asistencias obtenidas:', allAttendances.length);
    return allAttendances;
  } catch (error) {
    console.error('❌ Error al obtener todas las asistencias:', error);
    throw error;
  }
};

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

  // Obtener detalles de una asistencia
  getAttendanceDetails: async (id: number): Promise<AttendanceRecord> => {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error("ID de asistencia inválido: debe ser un número")
    }
    const response = await apiClient.get<ApiResponse<AttendanceRecord>>(`/attendance/${numericId}`);
    return response.data.data;
  },

  // Registrar nueva asistencia
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

  // Eliminar registro de asistencia
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

  // ✅ Obtener historial de asistencia del usuario con tipos corregidos
  getUserAttendanceHistory: async (userId: string, page: number = 1, limit: number = 20): Promise<UserAttendanceResponse> => {
    try {
      console.log(`🔍 Obteniendo historial de asistencias para usuario: ${userId}, página: ${page}, límite: ${limit}`);
      
      const response = await apiClient.get<UserAttendanceResponse>(
        `/attendance/my-attendances/${userId}?page=${page}&limit=${limit}`
      );
      
      console.log('📡 Respuesta del servidor:', response.status);
      console.log('📦 Datos de asistencias:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener historial de asistencias:', error);
      throw error;
    }
  },

  // ✅ Obtener todas las asistencias del usuario
  getAllUserAttendances,

  // ✅ Obtener estadísticas calculadas con tipos corregidos
  getUserAttendanceStats: async (userId: number, startDate: string, endDate: string): Promise<{ data: AttendanceStats }> => {
    try {
      console.log(`🔍 Calculando estadísticas para usuario: ${userId}`);
      
      // Obtener todas las asistencias del usuario
      const allAttendances = await getAllUserAttendances(userId.toString());
      
      // Filtrar por rango de fechas
      const filteredAttendances = allAttendances.filter((attendance: UserAttendanceItem) => {
        const attendanceDate = new Date(attendance.fecha_uso);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return attendanceDate >= start && attendanceDate <= end && attendance.estado === 'Activo';
      });

      // Calcular estadísticas
      const stats: AttendanceStats = {
        currentPeriod: filteredAttendances.length,
        goal: 12, // Meta por defecto
        averagePerWeek: calculateAveragePerWeek(filteredAttendances, startDate, endDate),
        streak: calculateStreak(allAttendances),
        totalAttendances: allAttendances.filter((a: UserAttendanceItem) => a.estado === 'Activo').length,
        attendancesByMonth: groupAttendancesByMonth(filteredAttendances),
        mostActiveDay: getMostActiveDay(filteredAttendances)
      };

      return {
        data: stats
      };
    } catch (error) {
      console.error('❌ Error al calcular estadísticas:', error);
      return {
        data: {
          currentPeriod: 0,
          goal: 0,
          averagePerWeek: 0,
          streak: 0,
          totalAttendances: 0,
          attendancesByMonth: {},
          mostActiveDay: null
        }
      };
    }
  },

  // ✅ Método para obtener rangos de fecha (sin usar 'this')
  getUserDateRangeByPeriod: (period: 'weekly' | 'monthly' | 'yearly'): Promise<{ startDate: string; endDate: string }> => {
    const today = new Date();
    
    switch (period) {
      case 'weekly':
        const startOfWeekDate = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar para que la semana empiece en lunes
        startOfWeekDate.setDate(today.getDate() + diff);
        
        const endOfWeekDate = new Date(startOfWeekDate);
        endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
        
        return Promise.resolve({
          startDate: format(startOfWeekDate, 'yyyy-MM-dd'),
          endDate: format(endOfWeekDate, 'yyyy-MM-dd')
        });
      
      case 'monthly':
        const startOfMonthDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        return Promise.resolve({
          startDate: format(startOfMonthDate, 'yyyy-MM-dd'),
          endDate: format(endOfMonthDate, 'yyyy-MM-dd')
        });
      
      case 'yearly':
        const startOfYearDate = new Date(today.getFullYear(), 0, 1);
        const endOfYearDate = new Date(today.getFullYear(), 11, 31);
        
        return Promise.resolve({
          startDate: format(startOfYearDate, 'yyyy-MM-dd'),
          endDate: format(endOfYearDate, 'yyyy-MM-dd')
        });
      
      default:
        return Promise.reject(new Error('Período no válido'));
    }
  }
};

// ✅ Exportar también las funciones auxiliares si necesitas usarlas en otros lugares
export {
  calculateAveragePerWeek,
  calculateStreak,
  groupAttendancesByMonth,
  getMostActiveDay,
  getAllUserAttendances
};

// ✅ Exportar tipos para usar en otros archivos
export type {
  UserAttendanceItem,
  UserAttendanceResponse,
  AttendanceStats
};