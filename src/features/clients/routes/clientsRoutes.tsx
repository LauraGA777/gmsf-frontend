import React from "react";
import { ClientsPage } from "@/features/clients/pages/clientsPage";
import { ProtectedRoute } from "../../auth/components/protectedRoute";

// Rutas de clientes
export const clientsRoutes = [
    {
        path: "/clients",
        element: (
            <ProtectedRoute allowedRoles={[1, 2]}>
                <ClientsPage />
            </ProtectedRoute>
        )
    }
];