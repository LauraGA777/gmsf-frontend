import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from "../../auth/components/protectedRoute";
import AttendancePage from "../pages/page";

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