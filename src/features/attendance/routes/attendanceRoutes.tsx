import { RouteObject } from "react-router-dom";
import AttendancePage from "../pages/index";
import { ProtectedRoute } from "../../auth/components/protectedRoute";

export const attendanceRoutes: RouteObject[] = [
    {
        path: "/attendance",
        element: (
            <ProtectedRoute allowedRoles={[1]}>
                <AttendancePage />
            </ProtectedRoute>
        )
    },
];