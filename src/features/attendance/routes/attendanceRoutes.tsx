import { RouteObject } from "react-router-dom";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import AttendanceRegistry from "../components/attendance";

export const attendanceRoutes: RouteObject[] = [
    {
        path: "/attendance",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Control de asistencia" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <AttendanceRegistry />
            </PermissionProtectedRoute>
        )
    },
];