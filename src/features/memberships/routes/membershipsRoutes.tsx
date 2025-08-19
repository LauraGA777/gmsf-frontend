import { RouteObject } from "react-router-dom";
import { MembershipsPage } from "../pages/membershipsPage";
import { MyMembershipPage } from "../pages/myMembershipPage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";

export const membershipsRoutes: RouteObject[] = [
    {
        path: "/memberships",
        element: (
            <PermissionProtectedRoute 
                requiredModule="MEMBRESIAS" 
                requiredPrivilege="MEMBERSHIP_READ"
            >
                <MembershipsPage />
            </PermissionProtectedRoute>
        )
    },
    {
        path: "/my-membership",
        element: (
            <PermissionProtectedRoute
                requiredModule="MEMBRESIAS"
                requiredPrivilege="MEMBERSHIP_READ"
            >
                <MyMembershipPage />
            </PermissionProtectedRoute>
        )
    }
];