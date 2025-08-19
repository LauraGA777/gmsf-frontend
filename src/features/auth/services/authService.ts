import { IRole, Role } from '@/shared/types/role';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = "https://gmsf-backend.vercel.app/auth/roles";

// Función para transformar IRole a Role (backend a frontend)
const transformRole = (iRole: IRole): Role => ({
    ...iRole,
    name: iRole.nombre,
    description: iRole.descripcion || "",
    status: iRole.estado ? "Activo" : "Inactivo",
    isActive: iRole.estado,
    permissions: iRole.permisos?.map(permission => ({
        ...permission,
        privileges: permission.privilegios?.map((privilege) => ({
            ...privilege,
            selected: false,
        })),
    })),
    // Manejar tanto los nuevos nombres como los legacy
    createdAt: iRole.fecha_creacion || iRole.createdAt,
    updatedAt: iRole.fecha_actualizacion || iRole.updatedAt,
});

// Función para verificar si el token existe y es válido
const verificarToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        // En lugar de lanzar un error, retornamos null
        return null;
    }
    return token;
};

// Crear una instancia de axios con la configuración base
const axiosInstance = axios.create({
    baseURL: API_URL + '/auth',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Crear una instancia de axios para peticiones públicas (sin autenticación)
const publicAxiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar el token a las peticiones autenticadas
axiosInstance.interceptors.request.use(
    (config) => {
        const token = verificarToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Solo manejamos el error 401 si no estamos en la página de login o reset-password
        if (error.response?.status === 401 &&
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/reset-password')) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface DatosPerfil {
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
    direccion?: string;
    genero?: string;
    tipo_documento?: string;
    numero_documento?: string;
    fecha_nacimiento?: string;
}

export interface DatosCambioContrasena {
    contrasenaActual: string;
    nuevaContrasena: string;
    confirmarContrasena: string;
}

export interface Usuario {
    id: number;
    codigo: string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
    direccion?: string;
    genero?: string;
    tipo_documento?: string;
    numero_documento?: string;
    fecha_nacimiento?: string;
    asistencias_totales?: number;
    estado?: boolean;
    id_rol: number;
}

export interface ApiResponse<T> {
    status: string;
    data: T;
}

export interface UsuarioResponse {
    usuario: Usuario;
}

export interface AuthResponse {
    token: string;
    usuario: Usuario;
}

export interface RolesResponse {
    status: string;
    data: {
        roles: IRole[];
    };
}

export const authService = {
    async login(datos: { correo: string; contrasena: string }): Promise<AuthResponse> {
        try {
            const response = await axiosInstance.post<AuthResponse>('/login', datos);
            if (response.data.token) {
                localStorage.setItem('accessToken', response.data.token);
            }
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al iniciar sesión');
        }
    },

    async logout(): Promise<void> {
        try {
            const token = verificarToken();
            if (token) {
                await axiosInstance.post('/logout', {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            
        } finally {
            localStorage.removeItem('accessToken');
        }
    },

    async recuperarContrasena(correo: string) {
        try {
            const response = await axiosInstance.post('/forgot-password', { correo });
            return response.data;
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al recuperar la contraseña');
        }
    },

    async restablecerContrasena(token: string, nuevaContrasena: string) {
        const response = await axiosInstance.post(`/reset-password/${token}`, { nuevaContrasena });
        return response.data;
    },

    async obtenerPerfil(): Promise<Usuario> {
        try {
            const token = verificarToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            const response = await axiosInstance.get<ApiResponse<UsuarioResponse>>('/profile');
            if (response.data.status === 'success' && response.data.data.usuario) {
                return response.data.data.usuario;
            }
            throw new Error('Error al obtener el perfil');
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al obtener el perfil');
        }
    },

    async cambiarContrasena(datos: DatosCambioContrasena): Promise<void> {
        try {
            const token = verificarToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            if (datos.nuevaContrasena !== datos.confirmarContrasena) {
                throw new Error('Las contraseñas no coinciden');
            }

            await axiosInstance.post('/change-password', {
                contrasenaActual: datos.contrasenaActual,
                nuevaContrasena: datos.nuevaContrasena
            });
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al cambiar la contraseña');
        }
    },

    async actualizarPerfil(datos: DatosPerfil): Promise<Usuario> {
        try {
            const token = verificarToken();
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            const response = await axiosInstance.put<{ usuario: Usuario }>('/profile', datos);
            return response.data.usuario;
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Error al actualizar el perfil');
        }
    },
    async getRoles(): Promise<Role[]> {
        try {
            const response = await publicAxiosInstance.get<RolesResponse>(`${API_BASE_URL}`);
            return response.data.data?.roles?.map((role: IRole) => transformRole(role)) || [];
        } catch (error) {
            
            throw error;
        }
    }
};