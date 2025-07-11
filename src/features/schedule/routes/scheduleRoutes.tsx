import { SchedulePage } from "@/features/schedule/pages/SchedulePage";
import { ClientSchedulePage } from "@/features/schedule/pages/ClientSchedulePage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";
import { PERMISSIONS, PRIVILEGES } from "@/shared/services/permissionService";

export const scheduleRoutes = [
  {
    path: "/schedule",
    element: (
      <PermissionProtectedRoute 
        requiredModule={PERMISSIONS.HORARIOS}
        requiredPrivilege={PRIVILEGES.SCHEDULE_READ}
      >
        <SchedulePage />
      </PermissionProtectedRoute>
    )
  },
  {
    path: "/calendar",
    element: (
      <PermissionProtectedRoute 
        requiredModule={PERMISSIONS.HORARIOS}
        requiredPrivilege={PRIVILEGES.SCHEDULE_READ}
      >
        <SchedulePage />
      </PermissionProtectedRoute>
    )
  },
  {
    path: "/client-schedule",
    element: (
      <PermissionProtectedRoute 
        requiredModule={PERMISSIONS.HORARIOS}
        requiredPrivilege={PRIVILEGES.SCHEDULE_CLIENT_VIEW}
      >
        <ClientSchedulePage />
      </PermissionProtectedRoute>
    )
  },
];