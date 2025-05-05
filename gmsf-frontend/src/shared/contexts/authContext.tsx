// src/features/auth/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "../types/index"; // Asegúrate de importar el tipo User correct

// Tipos
interface AuthResponse {
    mensaje: string;
    accessToken: string;
    refreshToken: string;
    usuario: {
        id: number;
        nombre: string;
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

            const authData: AuthResponse = await response.json();
            handleSuccessfulLogin(authData, correo); // Pasar el correo como segundo argumento
            return { success: true };
        } catch (error) {
            console.error("Error durante el inicio de sesión:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error al iniciar sesión"
            };
        }
    };

    const handleSuccessfulLogin = (authData: AuthResponse, correo: string) => { // Añadir parámetro correo
        // Validar que el rol sea uno de los permitidos usando type assertion
        const validRoles = [1, 2, 3] as const;
        if (!validRoles.includes(authData.usuario.id_rol as typeof validRoles[number])) {
            console.error("Rol no válido:", authData.usuario.id_rol);
            throw new Error("Rol de usuario no válido");
        }

        const roleKey = Object.keys(ROLES).find(
            key => ROLES[key as keyof typeof ROLES].id === authData.usuario.id_rol
        ) as keyof typeof ROLES;

        if (!roleKey) {
            console.error("No se pudo determinar el rol del usuario");
            throw new Error("Rol de usuario no válido");
        }

        const userWithRole: User = {
            id: authData.usuario.id.toString(),
            nombre: authData.usuario.nombre,
            correo: correo, // Usar el correo que recibimos como parámetro
            id_rol: authData.usuario.id_rol,
            role: roleKey,
            clientId: authData.usuario.id_rol === ROLES.CLIENTE.id ? authData.usuario.id.toString() : undefined
        };

        setUser(userWithRole);
        setAccessToken(authData.accessToken);
        setRefreshToken(authData.refreshToken);
        
        localStorage.setItem("user", JSON.stringify(userWithRole));
        localStorage.setItem("accessToken", authData.accessToken);
        localStorage.setItem("refreshToken", authData.refreshToken);
        
        redirectBasedOnRole(authData.usuario.id_rol);
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
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
        nombre: "Administrador",
        ruta: "/dashboard",
        permisos: ["ver_usuarios", "editar_usuarios", "ver_estadisticas"]
    },
    ENTRENADOR: {
        id: 2,
        nombre: "Entrenador",
        ruta: "/trainer",
        permisos: ["ver_clientes", "editar_rutinas", "ver_horarios"]
    },
    CLIENTE: {
        id: 3,
        nombre: "Cliente",
        ruta: "/client",
        permisos: ["ver_perfil", "ver_rutinas", "ver_membresia"]
    }
} as const;