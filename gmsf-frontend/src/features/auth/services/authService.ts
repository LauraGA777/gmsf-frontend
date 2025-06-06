import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Crear una instancia de axios con la configuración base
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar el token a las peticiones autenticadas
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

interface DatosPerfil {
    nombre?: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    direccion?: string;
    genero?: string;
    tipo_documento?: string;
    numero_documento?: string;
    fecha_nacimiento?: string;
}

interface DatosCambioContrasena {
    contrasenaActual: string;
    nuevaContrasena: string;
    confirmarContrasena: string;
}

export const authService = {
    async register(datos: { nombre: string; correo: string; contrasena: string }) {
        const response = await axiosInstance.post('/auth/register', datos);
        return response.data;
    },

    async login(datos: { correo: string; contrasena: string }) {
        const response = await axiosInstance.post('/auth/login', datos);
        return response.data;
    },

    async logout() {
        const response = await axiosInstance.post('/auth/logout');
        return response.data;
    },

    async recuperarContrasena(correo: string) {
        const response = await axiosInstance.post('/auth/forgot-password', { correo });
        return response.data;
    },

    async restablecerContrasena(token: string, nuevaContrasena: string) {
        const response = await axiosInstance.post(`/auth/reset-password/${token}`, { nuevaContrasena });
        return response.data;
    },

    async cambiarContrasena(datos: DatosCambioContrasena) {
        // Validar que las contraseñas coincidan
        if (datos.nuevaContrasena !== datos.confirmarContrasena) {
            throw new Error('Las contraseñas no coinciden');
        }

        const response = await axiosInstance.post('/auth/change-password', {
            contrasenaActual: datos.contrasenaActual,
            nuevaContrasena: datos.nuevaContrasena
        });
        return response.data;
    },

    async obtenerPerfil() {
        const response = await axiosInstance.get('/auth/profile');
        return response.data;
    },

    async actualizarPerfil(datos: DatosPerfil) {
        const response = await axiosInstance.put('/auth/profile', datos);
        return response.data;
    }
};