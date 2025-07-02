import { RouteObject } from "react-router-dom";
import { MembershipsPage } from "../pages/membershipsPage";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";

export const membershipsRoutes: RouteObject[] = [
    {
        path: "memberships",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Gestión de membresías" 
                requiredPrivilege="Leer"
                fallbackRoles={[1]} // Solo admin por defecto
            >
                <MembershipsPage />
            </PermissionProtectedRoute>
        )
    }
];