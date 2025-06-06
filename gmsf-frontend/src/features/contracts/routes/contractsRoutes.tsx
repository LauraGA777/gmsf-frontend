import React from "react";
import { ContractsPage } from "@/features/contracts/pages/contractsPage";
import { ProtectedRoute } from "../../auth/components/protectedRoute";

// Rutas de contratos
export const contractsRoutes = [
  {
    path: "/contracts",
    element: (
      <ProtectedRoute allowedRoles={[1, 2]}>
        <ContractsPage />
      </ProtectedRoute>
    )
  }
];