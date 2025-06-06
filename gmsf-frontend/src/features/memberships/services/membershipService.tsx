import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Interfaces basadas en el modelo y validadores del backend
export interface Membresia {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    dias_acceso: number;
    vigencia_dias: number;
    precio: number;
    fecha_creacion: Date;
    estado: boolean;
}

export interface MembresiaFormateada extends Omit<Membresia, 'estado'> {
    estado: 'Activo' | 'Inactivo';
    acceso: string;
    precio_formato?: string;
}

export interface QueryParams {
    page?: string;
    limit?: string;
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
    estado?: string;
}

export interface SearchParams extends QueryParams {
    codigo?: string;
    nombre?: string;
    descripcion?: string;
}

export interface CreateMembershipData {
    nombre: string;
    descripcion: string;
    precio: number;
    dias_acceso: number;
    vigencia_dias: number;
}

export interface UpdateMembershipData extends CreateMembershipData {}

export interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    memberships: T[];
}

// Crear instancia de axios
const axiosInstance = axios.create({
    baseURL: API_URL + '/membresias',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar el token
axiosInstance.interceptors.request.use(
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

export const membershipService = {
    // Obtener todas las membresías con paginación
    async obtenerMembresias(params: QueryParams = {}): Promise<PaginatedResponse<MembresiaFormateada>> {
        try {
            const response = await axiosInstance.get<ApiResponse<PaginatedResponse<MembresiaFormateada>>>('/', { params });
            if (response.data.status === 'success') {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Error al obtener las membresías');
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al obtener las membresías');
        }
    },

    // Buscar membresías
    async buscarMembresias(params: SearchParams): Promise<PaginatedResponse<MembresiaFormateada>> {
        try {
            const response = await axiosInstance.get<ApiResponse<PaginatedResponse<MembresiaFormateada>>>('/buscar', { params });
            if (response.data.status === 'success') {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Error al buscar membresías');
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al buscar membresías');
        }
    },

    // Obtener detalles de una membresía
    async obtenerDetallesMembresia(id: number): Promise<MembresiaFormateada> {
        try {
            const response = await axiosInstance.get<ApiResponse<{ membership: MembresiaFormateada }>>(`/${id}`);
            if (response.data.status === 'success') {
                return response.data.data.membership;
            }
            throw new Error(response.data.message || 'Error al obtener los detalles de la membresía');
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al obtener los detalles de la membresía');
        }
    },

    // Crear nueva membresía
    async crearMembresia(datos: CreateMembershipData): Promise<MembresiaFormateada> {
        try {
            const response = await axiosInstance.post<ApiResponse<{ membership: MembresiaFormateada }>>('/', datos);
            if (response.data.status === 'success') {
                return response.data.data.membership;
            }
            throw new Error(response.data.message || 'Error al crear la membresía');
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al crear la membresía');
        }
    },

    // Actualizar membresía
    async actualizarMembresia(id: number, datos: UpdateMembershipData): Promise<MembresiaFormateada> {
        try {
            const response = await axiosInstance.put<ApiResponse<{ membership: MembresiaFormateada }>>(`/${id}`, datos);
            if (response.data.status === 'success') {
                return response.data.data.membership;
            }
            throw new Error(response.data.message || 'Error al actualizar la membresía');
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al actualizar la membresía');
        }
    },

    // Desactivar membresía
    async desactivarMembresia(id: number): Promise<MembresiaFormateada> {
        try {
            const response = await axiosInstance.post<ApiResponse<{ membership: MembresiaFormateada }>>(`/${id}/desactivar`);
            if (response.data.status === 'success') {
                return response.data.data.membership;
            }
            throw new Error(response.data.message || 'Error al desactivar la membresía');
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al desactivar la membresía');
        }
    },

    // Reactivar membresía
    async reactivarMembresia(id: number): Promise<MembresiaFormateada> {
        try {
            const response = await axiosInstance.post<ApiResponse<{ membership: MembresiaFormateada }>>(`/${id}/reactivar`);
            if (response.data.status === 'success') {
                return response.data.data.membership;
            }
            throw new Error(response.data.message || 'Error al reactivar la membresía');
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al reactivar la membresía');
        }
    }
};
