import { RouteObject } from "react-router-dom";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";
import AttendanceRegistry from "../components/attendance";
import { MyAttendancePage } from "../pages/myAttendancePage";

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
    {
        path: "/my-attendance/:id",
        element: (
            <PermissionProtectedRoute 
                requiredModule="ASISTENCIAS" 
                requiredPrivilege="ASIST_CLIENT_INFO"
            >
                <MyAttendancePage />
            </PermissionProtectedRoute>
        )
    }
];