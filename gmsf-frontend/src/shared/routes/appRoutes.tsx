import { useRoutes, Navigate } from "react-router-dom";
import { publicRoutes } from "../routes/publicRoutes";
import { privateRoutes } from "../routes/privateRoutes";
import { useAuth } from "../contexts/authContext";
import { AppLayout } from "../layout/appLayout";
import { NotFoundPage } from "../pages/NotFoundPage";

export default function AppRoutes() {
    const { isAuthenticated, user, isLoading } = useAuth();

    // Ruta de redirección según el rol del usuario
    const getRedirectPath = () => {
        if (!user) return "/login";
        switch (user.id_rol) {
            case 1: // admin
                return "/dashboard";
            case 2: // entrenador
                return "/trainer";
            case 3: // cliente
                return "/client";
            default:
                return "/login";
        }
    };

    // Configura la ruta principal con redirección
    const indexRoute = {
        path: "/",
        element: isLoading ? (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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