import React from "react";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { MyContractPage } from "@/features/clients/pages/MyContractPage";

export const clientRoutes = [
  {
    path: "my-contract",
    element: (
      <ProtectedRoute allowedRoles={["client"]}>
        <MyContractPage />
      </ProtectedRoute>
    )
  }
];