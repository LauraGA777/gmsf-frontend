import axios from 'axios';
import type { Membership } from "@/shared/types";

// Configuración base de axios
const API_URL = import.meta.env.VITE_API_URL || 'https://gmsf-backend.vercel.app';

// Interfaces
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

// Clase base para el servicio de membresías
class MembershipService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/memberships`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para agregar el token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Error en la petición:', error);
        if (error.response?.status === 401) {
          // Manejar error de autenticación
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
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
      id: membershipData.id?.toString() || '',
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
          ? apiData.memberships.map(this.mapApiResponseToMembership)
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
          ? apiData.memberships.map(this.mapApiResponseToMembership)
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
      
      // Verificar si la respuesta es exitosa
      if (response.data.status === 'success') {
        // Si la respuesta incluye datos de la membresía, los mapeamos
        if (response.data.data) {
          return this.mapApiResponseToMembership(response.data.data);
        }
        // Si no hay datos pero la operación fue exitosa, devolvemos la membresía con estado false
        return {
          id,
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
      // Usar un límite más razonable o paginación
      const response = await this.getMemberships({ estado: true, limit: 50 });
      return response.data.filter(m => m.estado);
    } catch (error) {
      console.error('Error fetching active memberships:', error);
      throw error;
    }
  }

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
}

export const membershipService = new MembershipService(); 