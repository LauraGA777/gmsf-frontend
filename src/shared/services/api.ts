import axios from 'axios';

// Create an Axios instance with default config
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        const currentPath = window.location.pathname;
        
        // Permitir requests sin token solo para rutas públicas
        const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
        const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
        
        if (!token && !isPublicRoute) {
            console.warn('🚫 No hay token de autenticación, redirigiendo a login');
            // Solo redirigir si no estamos ya en una ruta pública
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
            throw new Error('No hay token de autenticación');
        }
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh or 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // No refresh token, redirect to login
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Try to refresh the token
                const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data as {
                    accessToken: string;
                    refreshToken: string;
                };

                // Store the new tokens
                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }

                // Update the Authorization header
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                // Retry the original request
                return apiClient(originalRequest);
            } catch (error) {
                // If refresh fails, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

// Crear un cliente sin interceptores para requests públicos
export const publicApiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Cliente autenticado (exportación con nombre)
export const authenticatedApiClient = apiClient;

// Exportación por defecto para compatibilidad hacia atrás
export default apiClient;

// También exportar el cliente principal con el nombre "api" para el permissionService
export const api = apiClient;

