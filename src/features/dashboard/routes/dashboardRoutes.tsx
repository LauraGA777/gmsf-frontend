import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import DashboardPage from "@/features/dashboard/pages/dashboardPage";

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
                <DashboardPage />
            </PermissionProtectedRoute>
        )
    }
];