import { RouteObject } from "react-router-dom";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import ProfilePage from "@/features/auth/pages/profilePage";
import UsersPage from "../pages/usersPage";

export const userRoutes: RouteObject[] = [
    {
        path: "/users",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Gestión de usuarios" 
                requiredPrivilege="Leer"
                fallbackRoles={[1]} // Admin siempre tiene acceso
            >    
                <UsersPage/>
            </PermissionProtectedRoute>
        )
    },
    {
        path: "/profile",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Panel de control" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2, 3, 4]} // Todos los usuarios pueden ver su perfil
            >    
                <ProfilePage/>
            </PermissionProtectedRoute>
        )
    }
];
