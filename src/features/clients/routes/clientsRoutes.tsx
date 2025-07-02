import { ClientsPage } from "@/features/clients/pages/clientsPage";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";

// Rutas de clientes
export const clientsRoutes = [
    {
        path: "/clients",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Gestión de clientes" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <ClientsPage />
            </PermissionProtectedRoute>
        )
    }
];