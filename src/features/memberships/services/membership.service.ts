import axios from 'axios';
import type { Membership } from "@/shared/types";

// Configuración base de axios
const API_URL = import.meta.env.VITE_API_URL || 'https://gmsf-backend.vercel.app';

// ✅ Interfaces existentes
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface PaginatedData {
  memberships: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface QueryParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
  estado?: boolean;
}

interface SearchParams extends QueryParams {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ✅ NUEVAS interfaces para clientes
interface MyActiveMembership {
  contrato: {
    id: number;
    codigo: string;
    estado: string;
    fecha_inicio: string;
    fecha_fin: string;
  };
  membresia: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    dias_acceso: number;
    vigencia_dias: number;
    precio: number;
    precio_formato: string;
  };
  estado: {
    estado_actual: string;
    dias_transcurridos: number;
    dias_restantes: number;
    porcentaje_uso: number;
    acceso_disponible: boolean;
  };
}

interface MembershipHistoryItem {
  contrato_id: number;
  codigo_contrato: string;
  membresia: {
    nombre: string;
    descripcion: string;
    precio: number;
    precio_formato: string;
  };
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
    duracion_dias: number;
  };
  estado: string;
  estado_detallado: string;
}

interface MembershipBenefits {
  membresia: {
    nombre: string;
    descripcion: string;
    acceso_total: string;
  };
  acceso: {
    puede_ingresar: boolean;
    dias_restantes: number;
    acceso_hasta: string;
  };
  servicios_incluidos: string[];
  horarios: {
    lunes_viernes: string;
    sabados: string;
    domingos: string;
    festivos: string;
  };
}

interface ClientApiResponse<T> {
  success: boolean;
  status: string;
  message: string;
  data: T;
}

interface PaginatedHistoryResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  historial: T[];
}

// ✅ Clase mejorada del servicio de membresías
class MembershipService {
  private api;
  private clientApi;

  constructor() {
    // ✅ API para administradores (membresías CRUD)
    this.api = axios.create({
      baseURL: `${API_URL}/memberships`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // ✅ API para clientes (mi membresía)
    this.clientApi = axios.create({
      baseURL: `${API_URL}/memberships`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // ✅ Interceptor para agregar el token en ambas APIs
    const authInterceptor = (config: any) => {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    const errorInterceptor = (error: any) => {
      console.error('Error en la petición:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    };

    // Aplicar interceptors a ambas instancias
    [this.api, this.clientApi].forEach(apiInstance => {
      apiInstance.interceptors.request.use(authInterceptor, Promise.reject);
      apiInstance.interceptors.response.use(
        (response) => response,
        errorInterceptor
      );
    });
  }

  private checkAuth(): void {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
  }

  private mapApiResponseToMembership(data: any): Membership {
    const membershipData = data.membership || data;
    return {
      id: Number(membershipData.id) || 0,
      codigo: membershipData.codigo || `M${membershipData.id?.toString().padStart(3, "0")}`,
      nombre: membershipData.nombre || '',
      descripcion: membershipData.descripcion || '',
      dias_acceso: Number(membershipData.dias_acceso) || 0,
      vigencia_dias: Number(membershipData.vigencia_dias) || 0,
      precio: Number(membershipData.precio) || 0,
      fecha_creacion: membershipData.fecha_creacion || new Date().toISOString(),
      estado: Boolean(membershipData.estado)
    };
  }

  private mapMembershipToApiData(membership: Partial<Membership>) {
    return {
      nombre: membership.nombre,
      descripcion: membership.descripcion,
      precio: membership.precio,
      dias_acceso: membership.dias_acceso,
      vigencia_dias: membership.vigencia_dias
    };
  }

  // ✅ MÉTODOS EXISTENTES PARA ADMINISTRADORES
  async getMemberships(params: QueryParams = {}): Promise<PaginatedResponse<Membership>> {
    try {
      this.checkAuth();
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const url = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const response = await this.api.get<ApiResponse<PaginatedData>>(url);
      
      const apiData = response.data.data;
      return {
        data: Array.isArray(apiData.memberships) 
          ? apiData.memberships.map(this.mapApiResponseToMembership.bind(this))
          : [],
        pagination: {
          total: apiData.total || 0,
          page: apiData.page || 1,
          limit: apiData.limit || 10,
          totalPages: apiData.totalPages || 1
        }
      };
    } catch (error) {
      console.error('❌ Error en getMemberships:', error);
      throw error;
    }
  }

  async searchMemberships(params: SearchParams = {}): Promise<PaginatedResponse<Membership>> {
    try {
      this.checkAuth();
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });

      const response = await this.api.get<ApiResponse<PaginatedData>>(`/search?${searchParams.toString()}`);
      const apiData = response.data.data;
      
      return {
        data: Array.isArray(apiData.memberships) 
          ? apiData.memberships.map(this.mapApiResponseToMembership.bind(this))
          : [],
        pagination: {
          total: apiData.total || 0,
          page: apiData.page || 1,
          limit: apiData.limit || 10,
          totalPages: apiData.totalPages || 1
        }
      };
    } catch (error) {
      console.error('Error searching memberships:', error);
      throw error;
    }
  }

  async getMembershipById(id: string): Promise<Membership> {
    try {
      this.checkAuth();
      const response = await this.api.get<ApiResponse<any>>(`/${id}`);
      return this.mapApiResponseToMembership(response.data.data);
    } catch (error) {
      console.error(`Error fetching membership ${id}:`, error);
      throw error;
    }
  }

  async createMembership(membershipData: Partial<Membership>): Promise<Membership> {
    try {
      this.checkAuth();
      const apiData = this.mapMembershipToApiData(membershipData);
      const response = await this.api.post<ApiResponse<any>>("/new-membership", apiData);
      return this.mapApiResponseToMembership(response.data.data);
    } catch (error) {
      console.error('Error creating membership:', error);
      throw error;
    }
  }

  async updateMembership(id: string, membershipData: Partial<Membership>): Promise<Membership> {
    try {
      this.checkAuth();
      const apiData = this.mapMembershipToApiData(membershipData);
      const response = await this.api.put<ApiResponse<any>>(`/${id}`, apiData);
      return this.mapApiResponseToMembership(response.data.data);
    } catch (error) {
      console.error(`Error updating membership ${id}:`, error);
      throw error;
    }
  }

  async deactivateMembership(id: string): Promise<Membership> {
    try {
      this.checkAuth();
      const response = await this.api.delete<ApiResponse<any>>(`/${id}`);
      
      if (response.data.status === 'success') {
        if (response.data.data) {
          return this.mapApiResponseToMembership(response.data.data);
        }
        return {
          id: Number(id),
          codigo: '',
          nombre: '',
          descripcion: '',
          dias_acceso: 0,
          vigencia_dias: 0,
          precio: 0,
          fecha_creacion: new Date().toISOString(),
          estado: false
        };
      }
      
      throw new Error(response.data.message || 'Error al desactivar la membresía');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al desactivar la membresía');
    }
  }

  async reactivateMembership(id: string): Promise<Membership> {
    try {
      this.checkAuth();
      const response = await this.api.patch<ApiResponse<any>>(`/${id}/reactivate`);
      if (response.data.status === 'success') {
        return this.mapApiResponseToMembership(response.data.data);
      }
      throw new Error(response.data.message || 'Error al reactivar la membresía');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al reactivar la membresía');
    }
  }

  async getActiveMemberships(): Promise<Membership[]> {
    try {
      this.checkAuth();
      const response = await this.getMemberships({ estado: true, limit: 50 });
      return response.data.filter(m => m.estado);
    } catch (error) {
      console.error('Error fetching active memberships:', error);
      throw error;
    }
  }

  // ✅ NUEVOS MÉTODOS PARA CLIENTES

  /**
   * Obtener mi membresía activa
   */
  async getMyActiveMembership(): Promise<MyActiveMembership> {
    try {
      this.checkAuth();
      console.log('🔍 Obteniendo mi membresía activa...');
      
      const response = await this.clientApi.get<ClientApiResponse<MyActiveMembership>>(
        '/my-membership/active'
      );
      
      console.log('✅ Mi membresía activa obtenida:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener la membresía activa');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error al obtener mi membresía activa:', error);
      
      if (error.response?.status === 404) {
        throw new Error('No tienes una membresía activa');
      }
      
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener la membresía activa');
    }
  }

  /**
   * Obtener mi historial de membresías
   */
  async getMyMembershipHistory(page: number = 1, limit: number = 10): Promise<PaginatedHistoryResponse<MembershipHistoryItem>> {
    try {
      this.checkAuth();
      console.log(`🔍 Obteniendo mi historial de membresías - página: ${page}, límite: ${limit}`);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await this.clientApi.get<ClientApiResponse<PaginatedHistoryResponse<MembershipHistoryItem>>>(
        `/my-membership/history?${queryParams.toString()}`
      );
      
      console.log('✅ Mi historial de membresías obtenido:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener el historial de membresías');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error al obtener mi historial de membresías:', error);
      
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener el historial de membresías');
    }
  }

  /**
   * Obtener beneficios de mi membresía
   */
  async getMyMembershipBenefits(): Promise<MembershipBenefits> {
    try {
      this.checkAuth();
      console.log('🔍 Obteniendo beneficios de mi membresía...');
      
      const response = await this.clientApi.get<ClientApiResponse<MembershipBenefits>>(
        '/my-membership/benefits'
      );
      
      console.log('✅ Beneficios de mi membresía obtenidos:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener los beneficios');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error al obtener beneficios de mi membresía:', error);
      
      if (error.response?.status === 404) {
        throw new Error('No tienes una membresía activa para consultar beneficios');
      }
      
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para acceder a esta información');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener los beneficios');
    }
  }

  /**
   * Obtener estadísticas básicas de mi membresía (método adicional)
   */
  async getMyMembershipStats(): Promise<{
    dias_restantes: number;
    porcentaje_uso: number;
    estado_acceso: boolean;
    proxima_renovacion?: string;
  }> {
    try {
      const activeMembership = await this.getMyActiveMembership();
      
      return {
        dias_restantes: activeMembership.estado.dias_restantes,
        porcentaje_uso: activeMembership.estado.porcentaje_uso,
        estado_acceso: activeMembership.estado.acceso_disponible,
        proxima_renovacion: activeMembership.contrato.fecha_fin
      };
    } catch (error: any) {
      console.error('❌ Error al obtener estadísticas de mi membresía:', error);
      throw error;
    }
  }

  // ✅ MÉTODO DE VALIDACIÓN EXISTENTE
  validateMembershipData(data: Partial<Membership>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.nombre || data.nombre.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    if (!data.descripcion || data.descripcion.trim().length === 0) {
      errors.push('La descripción es requerida');
    }

    if (!data.precio || data.precio <= 0) {
      errors.push('El precio debe ser mayor a 0');
    }

    if (!data.dias_acceso || data.dias_acceso <= 0) {
      errors.push('Los días de acceso deben ser mayor a 0');
    }

    if (!data.vigencia_dias || data.vigencia_dias <= 0) {
      errors.push('Los días de vigencia deben ser mayor a 0');
    }

    if (data.vigencia_dias && data.dias_acceso && data.vigencia_dias < data.dias_acceso) {
      errors.push('Los días de vigencia deben ser mayores o iguales a los días de acceso');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ✅ MÉTODO AUXILIAR PARA DEBUGGING
  getApiConfig() {
    return {
      adminBaseURL: this.api.defaults.baseURL,
      clientBaseURL: this.clientApi.defaults.baseURL,
      hasToken: !!localStorage.getItem('accessToken')
    };
  }
}

// ✅ Exportar instancia y tipos
export const membershipService = new MembershipService();

export type {
  Membership,
  MyActiveMembership,
  MembershipHistoryItem,
  MembershipBenefits,
  PaginatedResponse,
  QueryParams,
  SearchParams
};