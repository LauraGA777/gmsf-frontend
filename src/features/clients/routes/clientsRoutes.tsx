import { ClientsPage } from "@/features/clients/pages/clientsPage";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";

// Rutas de clientes
export const clientsRoutes = [
    {
        path: "/clients",
        element: (
            <PermissionProtectedRoute 
                requiredModule="CLIENTES" 
                requiredPrivilege="CLIENT_READ"
                // ✅ Solo permisos de BD - Sin fallbacks
            >
                <ClientsPage />
            </PermissionProtectedRoute>
        )
    }
];