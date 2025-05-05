import React from "react";
import { ProtectedRoute } from "../../auth/components/protectedRoute"
import { MyContractPage } from "@/features/clients/pages/myContractPage";

export const clientRoutes = [
  {
    path: "/my-contract",
    element: (
      <ProtectedRoute allowedRoles={[3]}>
        <MyContractPage />
      </ProtectedRoute>
    )
  }
];