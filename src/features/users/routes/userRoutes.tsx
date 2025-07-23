import { RouteObject } from "react-router-dom";
import ProfilePage from "@/features/auth/pages/profilePage";
import UsersPage from "../pages/usersPage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";

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
        element: <ProfilePage/>
    }
];
