import { RouteObject } from "react-router-dom";
import UsersPage from "../pages/usersPage";
import { ProtectedRoute } from "../../auth/components/protectedRoute";

export const userRoutes: RouteObject[] = [
    {
        path: "/users",
        element: (
        <ProtectedRoute allowedRoles={[1]}>    
        <UsersPage/>
        </ProtectedRoute>
    )
    }
];
