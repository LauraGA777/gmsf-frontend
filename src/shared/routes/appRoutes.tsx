import { useRoutes, Navigate } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { useAuth } from "../contexts/authContext";
import { AppLayout } from "../layout/appLayout";
import { NotFoundPage } from "../pages/NotFoundPage";
import { NotAuthorizedPage } from "../pages/NotAuthorizedPage";

export default function AppRoutes() {
    const { isAuthenticated, user, isLoading, isInitialized, error } = useAuth();

    // Función de redirección dinámica basada en authContext mejorado
    const getRedirectPath = () => {
        if (!user) return "/login";
        
        // Si hay error en la inicialización, ir al dashboard por defecto
        if (error) {
            console.warn("⚠️ Error en inicialización, redirigiendo a dashboard:", error);
            return "/dashboard";
        }
        
        // Permitir que el authContext maneje la redirección automáticamente
        // Solo proporcionar fallback básico aquí
        switch (user.id_rol) {
            case 1: // admin
                return "/dashboard";
            case 2: // entrenador
                return "/dashboard"; // Cambiado para usar dashboard unificado
            case 3: // cliente
                return "/client";
            case 4: // beneficiario
                return "/client";
            default:
                console.warn("⚠️ Rol no reconocido en AppRoutes:", user.id_rol);
                return "/dashboard";
        }
    };

    // Configura la ruta principal con redirección mejorada
    const indexRoute = {
        path: "/",
        element: isLoading ? (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-3 text-gray-600">Cargando sistema...</p>
            </div>
        ) : (
            <Navigate to={getRedirectPath()} replace />
        )
    };

    // Configura la wrapper para rutas privadas
    const privateRoutesWrapper = {
        path: "/",
        element: isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />,
        children: [
            ...privateRoutes,
            // Ruta para acceso no autorizado
            {
                path: "/not-authorized",
                element: <NotAuthorizedPage />
            },
            // Ruta comodín para cualquier otra ruta no encontrada dentro del layout
            {
                path: "*",
                element: <NotFoundPage />
            }
        ]
    };

    // Combina todas las rutas
    const routes = [
        indexRoute,
        privateRoutesWrapper,
        ...publicRoutes,
        // Ruta comodín global para cualquier otra ruta no encontrada (fuera del layout privado)
        {
            path: "*",
            element: <NotFoundPage />
        }
    ];

    return useRoutes(routes);
}