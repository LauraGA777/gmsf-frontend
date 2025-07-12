import { RouteObject } from "react-router-dom";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";
import ClientAttendanceView from "../pages/attendaceViewClient";
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
        path: "/attendance/:id",
        element: (
            <PermissionProtectedRoute 
                requiredModule="ASISTENCIAS" 
                requiredPrivilege="ASIST_READ">
                    <ClientAttendanceView/>
                </PermissionProtectedRoute>
        )
    },
    {
        path: "/my-attendance",
        element: (
            <PermissionProtectedRoute 
                requiredModule="ASISTENCIAS" 
                requiredPrivilege="ASIST_READ"
            >
                <MyAttendancePage />
            </PermissionProtectedRoute>
        )
    }
];