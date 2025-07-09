import { RouteObject } from "react-router-dom";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";
import AttendanceRegistry from "../components/attendance";

export const attendanceRoutes: RouteObject[] = [
    {
        path: "/attendance",
        element: (
            <PermissionProtectedRoute 
                requiredModule="ASISTENCIAS" 
                requiredPrivilege="ASIST_READ"
                // ✅ Solo permisos de BD - Sin fallbacks
            >
                <AttendanceRegistry />
            </PermissionProtectedRoute>
        )
    },
];