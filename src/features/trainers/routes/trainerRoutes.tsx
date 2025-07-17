import { TrainersPage } from "@/features/trainers/pages/trainersPage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";
import { PERMISSIONS, PRIVILEGES } from "@/shared/services/permissionService";

export const trainersRoutes = [
    {
        path: "/trainers",
        element: (
            <PermissionProtectedRoute 
                requiredModule={PERMISSIONS.ENTRENADORES}
                requiredPrivilege={PRIVILEGES.TRAINER_READ}
            >
                <TrainersPage />
            </PermissionProtectedRoute>
        )
    }
]; 