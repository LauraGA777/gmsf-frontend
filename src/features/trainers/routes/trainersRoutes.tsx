import { TrainersPage } from "@/features/trainers/pages/trainersPage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";

export const trainersRoutes = [
  {
    path: "trainers",
    element: (
      <PermissionProtectedRoute 
        requiredModule="ENTRENADORES" 
        requiredPrivilege="TRAINER_READ"
        // ✅ Solo permisos de BD - Sin fallbacks
      >
        <TrainersPage />
      </PermissionProtectedRoute>
    ),
  },
]
