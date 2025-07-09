import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import DashboardPage from "@/features/dashboard/pages/dashboardPage";

export const dashboardRoutes = [
    {
        path: "dashboard",
        element: (
            <PermissionProtectedRoute 
                requiredModule="ASISTENCIAS" 
                requiredPrivilege="ASIST_STATS"
                // ✅ Solo permisos de BD - El backend decide quien puede ver estadísticas
            >
                <DashboardPage />
            </PermissionProtectedRoute>
        )
    }
];