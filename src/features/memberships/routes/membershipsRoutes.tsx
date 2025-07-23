import { RouteObject } from "react-router-dom";
import { MembershipsPage } from "../pages/membershipsPage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";

export const membershipsRoutes: RouteObject[] = [
    {
        path: "memberships",
        element: (
            <PermissionProtectedRoute 
                requiredModule="MEMBRESIAS" 
                requiredPrivilege="MEMBERSHIP_READ"
                // ✅ Solo permisos de BD - Sin fallbacks
            >
                <MembershipsPage />
            </PermissionProtectedRoute>
        )
    }
];