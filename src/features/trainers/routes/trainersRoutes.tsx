import { ProtectedRoute } from "../../auth/components/protectedRoute";
import { TrainersPage } from "@/features/trainers/pages/trainersPage"

export const trainersRoutes = [
  {
    path: "trainers",
    element: (
      <ProtectedRoute allowedRoles={[1]}>
        <TrainersPage />
      </ProtectedRoute>
    ),
  },
]
