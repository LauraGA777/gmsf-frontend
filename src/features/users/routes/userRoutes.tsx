import { RouteObject } from "react-router-dom";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import ProfilePage from "@/features/auth/pages/profilePage";
import UsersPage from "../pages/usersPage";

export const userRoutes: RouteObject[] = [
    {
        path: "/users",
        element: (
            <PermissionProtectedRoute 
                requiredModule="USUARIOS" 
                requiredPrivilege="USER_READ"
                // ✅ Solo permisos de BD - Sin fallbacks
            >    
                <UsersPage/>
            </PermissionProtectedRoute>
        )
    },
    {
        path: "/profile",
        element: (
            <PermissionProtectedRoute 
                requiredModule="USUARIOS" 
                requiredPrivilege="USER_DETAILS"
                // ✅ Perfil accesible según permisos de BD - Sin excepciones por rol
            >    
                <ProfilePage/>
            </PermissionProtectedRoute>
        )
    }
];
