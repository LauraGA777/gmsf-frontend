import { useRoutes, Navigate } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { useAuth } from "../contexts/authContext";
import { AppLayout } from "../layout/appLayout";
import { NotFoundPage } from "../pages/NotFoundPage";
import { NotAuthorizedPage } from "../pages/NotAuthorizedPage";
import { ProtectedRoute } from "@/features/auth/components/protectedRoute";

export default function AppRoutes() {
    const { isAuthenticated, user, isLoading, isInitialized, error } = useAuth();

    // Función de redirección dinámica basada en authContext mejorado
    const getRedirectPath = () => {
        if (!user) return "/login";
        
        // Si hay error en la inicialización, ir a landing por defecto
        if (error) {
            console.warn("⚠️ Error en inicialización, redirigiendo a landing:", error);
            return "/landing";
        }
        
        // Todos los roles redirigen a la landing page
        return "/landing";
    };

    // ✅ CONFIGURACIÓN CORREGIDA: Ruta raíz siempre redirije a landing si no está autenticado
    const indexRoute = {
        path: "/",
        element: isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <Navigate to="/landing" replace />
    };

    // ✅ CONFIGURACIÓN CORREGIDA: Rutas privadas completamente protegidas
    const privateRoutesWrapper = {
        path: "/",
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
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

    // ✅ CONFIGURACIÓN CORREGIDA: Combina todas las rutas de manera segura
    const routes = [
        indexRoute,
        // Rutas públicas (landing, login, etc.) - NO protegidas
        ...publicRoutes,
        // Rutas privadas - COMPLETAMENTE protegidas
        privateRoutesWrapper,
        // Ruta comodín global para cualquier otra ruta no encontrada (fuera del layout privado)
        {
            path: "*",
            element: <NotFoundPage />
        }
    ];

    const routing = useRoutes(routes);

    // Early return después de todos los hooks
    if (isLoading || !isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">Cargando sistema...</p>
                    <p className="text-sm text-gray-500">Por favor, espere un momento.</p>
                </div>
            </div>
        );
    }

    return routing;
}