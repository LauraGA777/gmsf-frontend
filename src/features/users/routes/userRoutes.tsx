import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../auth/components/protectedRoute";
import ProfilePage from "@/features/auth/pages/profilePage";
import UsersPage from "../pages/usersPage";

export const userRoutes: RouteObject[] = [
    {
        path: "/users",
        element: (
        <ProtectedRoute allowedRoles={[1]}>    
        <UsersPage/>
        </ProtectedRoute>
    )
    },
    {
        path: "/profile",
        element: (
        <ProtectedRoute allowedRoles={[1, 2, 3]}>    
        <ProfilePage/>
        </ProtectedRoute>
    )
    }
];
