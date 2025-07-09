import { ContractsPage } from "@/features/contracts/pages/contractsPage";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";

// Rutas de contratos
export const contractsRoutes = [
  {
    path: "/contracts",
    element: (
      <PermissionProtectedRoute 
        requiredModule="CONTRATOS" 
        requiredPrivilege="CONTRACT_READ"
        // ✅ Solo permisos de BD - Sin fallbacks
      >
        <ContractsPage />
      </PermissionProtectedRoute>
    )
  }
];