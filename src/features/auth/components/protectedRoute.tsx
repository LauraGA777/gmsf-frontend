// src/shared/components/ProtectedRoute.tsx
import { useAuth } from "@/shared/contexts/authContext";
import { Navigate, useLocation } from "react-router-dom";
import { ROLES } from "@/shared/contexts/authContext";
import { UserRole } from "@/shared/types/types";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[]; // Ahora UserRole es un tipo numérico
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user, hasPermission } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !hasPermission(allowedRoles.map(role => Number(role)))) {
        const userRole = Object.values(ROLES).find(r => r.id === user?.id_rol);
        return <Navigate to={userRole?.ruta || "/not-authorized"} replace />;
    }

    return <>{children}</>;
}