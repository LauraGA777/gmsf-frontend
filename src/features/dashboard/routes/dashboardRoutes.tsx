import React from "react";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import DashboardPage from "@/features/dashboard/pages/dashboardPage";

export const dashboardRoutes = [
    {
        path: "dashboard",
        element: (
            <PermissionProtectedRoute 
                requiredModule="ASISTENCIAS" 
                requiredPrivilege="ASIST_STATS"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <DashboardPage />
            </PermissionProtectedRoute>
        )
    }
];