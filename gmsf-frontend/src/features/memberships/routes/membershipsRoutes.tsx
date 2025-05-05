import { RouteObject } from "react-router-dom";
import MembershipsPage from "../pages/index";
import EditMembershipsPage from "../pages/edit";
import { ProtectedRoute } from "../../auth/components/protectedRoute";

export const membershipsRoutes: RouteObject[] = [
    {
        path: "/memberships",
        element: (
            <ProtectedRoute allowedRoles={[1]}>
                <MembershipsPage />
            </ProtectedRoute>

        )
    },
    {
        path: "memberships/nueva",
        element: (
            <ProtectedRoute allowedRoles={[1]}>
                <EditMembershipsPage />
            </ProtectedRoute>
        )
    },
    {
        path: "memberships/:id",
        element: (
            <ProtectedRoute allowedRoles={[1]}>
                <EditMembershipsPage />
            </ProtectedRoute>
        )
    }
];