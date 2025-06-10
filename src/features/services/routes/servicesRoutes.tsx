import { ProtectedRoute } from "../../auth/components/protectedRoute";
import { ServicesPage } from "@/features/services/pages/servicesPage"

export const servicesRoutes = [
  {
    path: "services",
    element: (
      <ProtectedRoute allowedRoles={[1, 2]}>
        <ServicesPage />
      </ProtectedRoute>
    ),
  },
]
