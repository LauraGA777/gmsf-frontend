import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";
import { PERMISSIONS, PRIVILEGES } from "@/shared/services/permissionService";
import { AgendaRouter } from "./AgendaRouter"; // Importamos el enrutador inteligente

export const scheduleRoutes = [
  {
    // Ruta principal de la agenda para todos los roles
    path: "/calendar",
    element: (
      <PermissionProtectedRoute 
        requiredModule={PERMISSIONS.HORARIOS}
        requiredPrivilege={PRIVILEGES.SCHEDULE_READ}
      >
        <AgendaRouter />
      </PermissionProtectedRoute>
    )
  },
];