import { ProtectedRoute } from "../../auth/components/protectedRoute";
import { RolesPage } from "@/features/roles/pages/rolesPage"

export const rolesRoutes = [
  {
    path: "/roles",
    element: (
      <ProtectedRoute allowedRoles={[1]}>
        <RolesPage />
      </ProtectedRoute>
    ),
  },
]
export default rolesRoutes