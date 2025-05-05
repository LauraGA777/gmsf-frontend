import { RouteObject } from "react-router-dom";
import ProfileEditorPage from "../pages/editProfilePage";
import UsersPage from "../pages/usersPage";
import { ProtectedRoute } from "../../auth/components/protectedRoute";

export const userRoutes: RouteObject[] = [
    {
        path: "/edit-profile",
        element: (
        <ProfileEditorPage />
    )
    },
    {
        path: "/users",
        element: (
        <ProtectedRoute allowedRoles={[1]}>    
        <UsersPage/>
        </ProtectedRoute>
    )
    }
];
