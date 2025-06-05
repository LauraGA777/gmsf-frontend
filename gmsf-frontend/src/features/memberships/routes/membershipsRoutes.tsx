import { RouteObject } from "react-router-dom";
import MembershipsPage from "../pages/membershipPage";
import { ProtectedRoute } from "../../auth/components/protectedRoute";

export const membershipsRoutes: RouteObject[] = [
    {
        path: "/memberships",
        element: (
            <ProtectedRoute allowedRoles={[1]}>
                <MembershipsPage />
            </ProtectedRoute>

        )
    }
];