import { RolesPage } from "@/features/roles/pages/rolesPage"
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";

export const rolesRoutes = [
  {
    path: "/roles",
    element: (
      <PermissionProtectedRoute 
        requiredModule="Gestión de roles" 
        requiredPrivilege="Leer"
        fallbackRoles={[1]}
      >
        <RolesPage />
      </PermissionProtectedRoute>
    ),
  },
]
export default rolesRoutes