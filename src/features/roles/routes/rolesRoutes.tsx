import { RolesPage } from "@/features/roles/pages/rolesPage"
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";

export const rolesRoutes = [
  {
    path: "/roles",
    element: (
      <PermissionProtectedRoute 
        requiredModule="SISTEMA" 
        requiredPrivilege="SYSTEM_VIEW_ROLES"
        // ✅ Solo usuarios con permisos específicos de gestión de roles en BD
      >
        <RolesPage />
      </PermissionProtectedRoute>
    ),
  },
]
export default rolesRoutes