import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import { TrainersPage } from "@/features/trainers/pages/trainersPage"

export const trainersRoutes = [
  {
    path: "trainers",
    element: (
      <PermissionProtectedRoute 
        requiredModule="Gestión de entrenadores" 
        requiredPrivilege="Leer"
        fallbackRoles={[1]}
      >
        <TrainersPage />
      </PermissionProtectedRoute>
    ),
  },
]
