import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../auth/components/protectedRoute";
import AttendanceRegistry from "../components/attendance";

export const attendanceRoutes: RouteObject[] = [
    {
        path: "/attendance",
        element: (
            <ProtectedRoute allowedRoles={[1]}>
                <AttendanceRegistry />
            </ProtectedRoute>
        )
    },
];