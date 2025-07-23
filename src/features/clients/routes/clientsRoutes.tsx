import { ClientsPage } from "@/features/clients/pages/clientsPage";
import { MyContractPage } from "@/features/contracts/pages/myContractPage";
import { PermissionProtectedRoute } from "@/shared/routes/PermissionProtectedRoute";

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
    },
    {
        path: "/my-contract",
        element: (
            <PermissionProtectedRoute 
                requiredModule="CONTRATOS" 
                requiredPrivilege="CONTRACT_READ"
                // ✅ Solo permisos de BD - Sin fallbacks
            >
                <MyContractPage />
            </PermissionProtectedRoute>
        )
    }
];