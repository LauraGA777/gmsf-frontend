import { ContractsPage } from "@/features/contracts/pages/contractsPage";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";

// Rutas de contratos
export const contractsRoutes = [
  {
    path: "/contracts",
    element: (
      <PermissionProtectedRoute 
        requiredModule="Gestión de contratos" 
        requiredPrivilege="Leer"
        fallbackRoles={[1, 2]} // Admin y entrenadores
      >
        <ContractsPage />
      </PermissionProtectedRoute>
    )
  }
];