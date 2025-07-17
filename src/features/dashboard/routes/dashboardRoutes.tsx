import DashboardOptimizedPage from "@/features/dashboard/pages/dashboardOptimizedPage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";

export const dashboardRoutes = [
    {
        path: "dashboard",
        element: (
            <PermissionProtectedRoute 
                requiredModule="ASISTENCIAS" 
                requiredPrivilege="ASIST_STATS"
                emergencyBypass={true}
                // ✅ Bypass temporal para administrador mientras se configuran los permisos en BD
            >
                <DashboardOptimizedPage />
            </PermissionProtectedRoute>
        )
    }
];