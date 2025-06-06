// src/features/auth/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "../types/index"; // Asegúrate de importar el tipo User correct
import { authService } from '../../features/auth/services/authService';

// Tipos
interface AuthResponse {
    status: string;
    menssage: string;
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        nombre: string;
        correo: string;
        id_rol: number;
    }
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    login: (correo: string, contrasena: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    hasPermission: (requiredRoles: number[]) => boolean;
}

interface NormalizedUser {
    id: number;
    nombre: string;
    correo: string;
    id_rol: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const initializeAuth = () => {
            const storedUser = localStorage.getItem("user");
            const storedAccessToken = localStorage.getItem("accessToken");
            const storedRefreshToken = localStorage.getItem("refreshToken");
            
            if (storedUser && storedAccessToken && storedRefreshToken) {
                try {
                    const parsedUser = JSON.parse(storedUser) as User;
                    setUser(parsedUser);
                    setAccessToken(storedAccessToken);
                    setRefreshToken(storedRefreshToken);
                } catch (error) {
                    localStorage.removeItem("user");
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && user && location.pathname === "/") {
            redirectBasedOnRole(user.id_rol);
        }
    }, [isLoading, user, location, navigate]);

    const redirectBasedOnRole = (roleId: number) => {
        const role = Object.values(ROLES).find(r => r.id === roleId);
        if (role) {
            navigate(role.ruta);
        } else {
            navigate("/");
            console.warn("Rol no reconocido:", roleId);
        }
    };

    const login = async (correo: string, contrasena: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, contrasena })
            });

            if (!response.ok) {
                throw new Error('Credenciales incorrectas');
            }

            const authData = await response.json();
            console.log('Respuesta completa de la API:', authData); // Para depuración
            
            // Extraer datos del usuario de la respuesta
            const userData = authData.data?.user || authData.user || {};
            const tokens = {
                accessToken: authData.data?.accessToken || authData.accessToken,
                refreshToken: authData.data?.refreshToken || authData.refreshToken
            };

            // Validar que tengamos los tokens necesarios
            if (!tokens.accessToken || !tokens.refreshToken) {
                console.error('Tokens no encontrados en la respuesta:', authData);
                throw new Error('Error en la autenticación: tokens no recibidos');
            }

            // Validar que tengamos los datos básicos del usuario
            if (!userData || typeof userData !== 'object') {
                console.error('Datos de usuario no encontrados en la respuesta:', authData);
                throw new Error('Datos de usuario no encontrados en la respuesta');
            }

            // Normalizar la estructura de datos del usuario
            const normalizedUser: NormalizedUser = {
                id: userData.id,
                nombre: userData.nombre || userData.nombre_usuario || '',
                correo: userData.correo || correo,
                id_rol: userData.id_rol || userData.rol_id || null
            };

            // Validar que tengamos los campos requeridos
            const requiredFields = ['id', 'id_rol'];
            const missingFields = requiredFields.filter(field => normalizedUser[field] === undefined || normalizedUser[field] === null);
            
            if (missingFields.length > 0) {
                console.error('Faltan campos requeridos en los datos del usuario:', {
                    missingFields,
                    userData: normalizedUser,
                    originalData: authData
                });
                throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
            }

            // Crear la estructura normalizada para handleSuccessfulLogin
            const normalizedData = {
                ...authData,
                ...tokens,
                user: normalizedUser
            };

            handleSuccessfulLogin(normalizedData as AuthResponse, normalizedUser.correo);
            return { success: true };
        } catch (error) {
            console.error('Error detallado durante el inicio de sesión:', {
                mensaje: error instanceof Error ? error.message : 'Error desconocido',
                tipo: error instanceof Error ? error.name : typeof error,
                error: error
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error al iniciar sesión"
            };
        }
    };

    const handleSuccessfulLogin = (authData: AuthResponse, correo: string) => { 
        // Validar que el rol sea uno de los permitidos usando type assertion
        const validRoles = ["admin", 1 ,2, 3] as const;
        if (!validRoles.includes(authData.user.id_rol as typeof validRoles[number])) {
            console.error("Rol no válido:", authData.user.id_rol);
            throw new Error("Rol de usuario no válido");
        }

        const roleKey = Object.keys(ROLES).find(
            key => ROLES[key as keyof typeof ROLES].id === authData.user.id_rol
        ) as keyof typeof ROLES;

        if (!roleKey) {
            console.error("No se pudo determinar el rol del usuario");
            throw new Error("Rol de usuario no válido");
        }

        const userWithRole: User = {
            id: authData.user.id.toString(),
            nombre: authData.user.nombre,
            correo: correo, 
            id_rol: authData.user.id_rol,
            role: roleKey,
            clientId: authData.user.id_rol === ROLES.CLIENTE.id ? authData.user.id.toString() : undefined
        };

        setUser(userWithRole);
        setAccessToken(authData.accessToken);
        setRefreshToken(authData.refreshToken);
        
        localStorage.setItem("user", JSON.stringify(userWithRole));
        localStorage.setItem("accessToken", authData.accessToken);
        localStorage.setItem("refreshToken", authData.refreshToken);
        
        redirectBasedOnRole(authData.user.id_rol);
    };

    const logout = async () => {
        try {
            // 1. Llamar al endpoint de logout en la API
            await authService.logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            // 2. Limpiar el estado local independientemente de la respuesta del servidor
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setAccessToken(null);
            setRefreshToken(null);
            // 3. Redirigir al login
            navigate('/login');
        }
    };

    const hasPermission = (requiredRoles: number[]): boolean => {
        if (!user) return false;
        const userRole = Object.values(ROLES).find(r => r.id === user.id_rol);
        if (!userRole) return false;
        return requiredRoles.includes(userRole.id);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                accessToken,
                refreshToken,
                login,
                logout,
                hasPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// Constantes de roles para usar en la aplicación
export const ROLES = {
    ADMIN: {
        id: 1,
        nombre: "admin",
        ruta: "/dashboard",
        permisos: ["ver_usuarios", "editar_usuarios", "ver_estadisticas"]
    },
    ENTRENADOR: {
        id: 2,
        nombre: "entrenador",
        ruta: "/trainer",
        permisos: ["ver_clientes", "editar_rutinas", "ver_horarios"]
    },
    CLIENTE: {
        id: 3,
        nombre: "cliente",
        ruta: "/client",
        permisos: ["ver_perfil", "ver_rutinas", "ver_membresia"]
    }
} as const;