import { SchedulePage } from "@/features/schedule/pages/SchedulePage";
import { ClientSchedulePage } from "@/features/schedule/pages/ClientSchedulePage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";

export const scheduleRoutes = [
  {
    path: "/schedule",
    element: (
      <PermissionProtectedRoute 
        requiredModule="HORARIOS" 
        requiredPrivilege="SCHEDULE_READ"
        // ✅ Solo permisos de BD - Sin fallbacks
      >
        <SchedulePage />
      </PermissionProtectedRoute>
    )
  },
  {
    path: "/calendar",
    element: (
      <PermissionProtectedRoute 
        requiredModule="HORARIOS" 
        requiredPrivilege="SCHEDULE_READ"
        // ✅ Solo permisos de BD - Sin fallbacks
      >
        <SchedulePage />
      </PermissionProtectedRoute>
    )
  },
  {
    path: "/client-schedule",
    element: (
      <PermissionProtectedRoute 
        requiredModule="HORARIOS" 
        requiredPrivilege="CLIENT_SCHEDULE_READ"
        // ✅ Solo permisos de BD - Sin fallbacks
      >
        <ClientSchedulePage />
      </PermissionProtectedRoute>
    )
  },
];