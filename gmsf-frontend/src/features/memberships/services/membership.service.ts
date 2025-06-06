import { api } from "@/shared/services/api";
import type { Membership } from "@/shared/types";

// Interface para parámetros de consulta
interface QueryParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
  estado?: boolean;
}

// Interface para parámetros de búsqueda
interface SearchParams {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  estado?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

// Interface para respuesta paginada
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Mapear respuesta de la API al formato del frontend
const mapApiResponseToMembership = (data: any): Membership => {
  // Manejar respuesta anidada si existe
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
};

// Mapear datos del frontend al formato de la API
const mapMembershipToApiData = (membership: Partial<Membership>) => {
  return {
    nombre: membership.nombre,
    descripcion: membership.descripcion,
    precio: membership.precio,
    dias_acceso: membership.dias_acceso,
    vigencia_dias: membership.vigencia_dias
  };
};

class MembershipService {
  // Obtener todas las membresías con paginación
  async getMemberships(params: QueryParams = {}): Promise<PaginatedResponse<Membership>> {
    try {
      console.log('🎯 MembershipService: Obteniendo membresías con parámetros:', params);
      
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.orderBy) searchParams.append('orderBy', params.orderBy);
      if (params.direction) searchParams.append('direction', params.direction);
      if (params.estado !== undefined) searchParams.append('estado', params.estado.toString());

      const url = `/memberships${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      console.log('🌐 URL de la petición:', url);
      
      const response = await api.get(url);
      console.log('📥 Respuesta completa de la API:', response);
      console.log('📊 Datos de respuesta:', response.data);
      
      const apiData = response.data.data;
      console.log('📦 Datos extraídos:', apiData);
      
      const result = {
        data: Array.isArray(apiData.memberships) 
          ? apiData.memberships.map(mapApiResponseToMembership)
          : [],
        pagination: {
          total: apiData.total || 0,
          page: apiData.page || 1,
          limit: apiData.limit || 10,
          totalPages: apiData.totalPages || 1
        }
      };
      
      console.log('✅ Resultado final procesado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en getMemberships:', error);
      console.error('🔍 Detalles del error:', (error as any)?.response?.data);
      throw error;
    }
  }

  // Buscar membresías
  async searchMemberships(params: SearchParams = {}): Promise<PaginatedResponse<Membership>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.codigo) searchParams.append('codigo', params.codigo);
      if (params.nombre) searchParams.append('nombre', params.nombre);
      if (params.descripcion) searchParams.append('descripcion', params.descripcion);
      if (params.estado !== undefined) searchParams.append('estado', params.estado.toString());
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.orderBy) searchParams.append('orderBy', params.orderBy);
      if (params.direction) searchParams.append('direction', params.direction);

      const url = `/memberships/search?${searchParams.toString()}`;
      const response = await api.get(url);
      
      const apiData = response.data.data;
      return {
        data: Array.isArray(apiData.memberships) 
          ? apiData.memberships.map(mapApiResponseToMembership)
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

  // Obtener una membresía por ID
  async getMembershipById(id: string): Promise<Membership> {
    try {
      const response = await api.get(`/memberships/${id}`);
      return mapApiResponseToMembership(response.data.data);
    } catch (error) {
      console.error(`Error fetching membership ${id}:`, error);
      throw error;
    }
  }

  // Crear nueva membresía
  async createMembership(membershipData: Partial<Membership>): Promise<Membership> {
    try {
      const apiData = mapMembershipToApiData(membershipData);
      const response = await api.post("/memberships/new-membership", apiData);
      return mapApiResponseToMembership(response.data.data);
    } catch (error) {
      console.error('Error creating membership:', error);
      throw error;
    }
  }

  // Actualizar membresía
  async updateMembership(id: string, membershipData: Partial<Membership>): Promise<Membership> {
    try {
      const apiData = mapMembershipToApiData(membershipData);
      const response = await api.put(`/memberships/${id}`, apiData);
      return mapApiResponseToMembership(response.data.data);
    } catch (error) {
      console.error(`Error updating membership ${id}:`, error);
      throw error;
    }
  }

  // Desactivar membresía
  async deactivateMembership(id: string): Promise<Membership> {
    try {
      const response = await api.delete(`/memberships/${id}`);
      return mapApiResponseToMembership(response.data.data);
    } catch (error) {
      console.error(`Error deactivating membership ${id}:`, error);
      throw error;
    }
  }

  // Reactivar membresía
  async reactivateMembership(id: string): Promise<Membership> {
    try {
      const response = await api.patch(`/memberships/${id}/reactivate`);
      return mapApiResponseToMembership(response.data.data);
    } catch (error) {
      console.error(`Error reactivating membership ${id}:`, error);
      throw error;
    }
  }

  // Obtener membresías activas (para selects)
  async getActiveMemberships(): Promise<Membership[]> {
    try {
      const response = await this.getMemberships({ estado: true, limit: 1000 });
      return response.data.filter(m => m.estado);
    } catch (error) {
      console.error('Error fetching active memberships:', error);
      throw error;
    }
  }

  // Validar datos de membresía
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