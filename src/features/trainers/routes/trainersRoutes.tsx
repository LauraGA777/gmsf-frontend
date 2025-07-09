import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import { TrainersPage } from "@/features/trainers/pages/trainersPage"

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
