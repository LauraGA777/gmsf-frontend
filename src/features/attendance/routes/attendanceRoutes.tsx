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
            >
                <AttendanceRegistry />
            </PermissionProtectedRoute>
        )
    },
    {
        path: "/my-attendances/:userId",
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