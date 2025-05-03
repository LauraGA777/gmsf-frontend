import React from "react";
import { ClientsTable } from "@/features/clients/components/ClientsTable";
import { ClientDetails } from "@/features/clients/components/ClientDetails";
import { EditClientModal } from "@/features/clients/components/EditClientModal";
import { RenewMembershipModal } from "@/features/clients/components/RenewMembershipModal";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useGlobalClients } from "@/shared/contexts/ClientsContext";

// Componente contenedor para clientes que usa el contexto global
export const ClientsContainer = () => {
    // Usar el contexto global en lugar de estado local
    const { clients, updateClient, addClient } = useGlobalClients();

    // Función para manejar actualizaciones de clientes usando el contexto global
    const handleUpdateClient = (clientId: string, updates: Partial<Client>) => {
        updateClient(clientId, updates);
    };

    return (
        <ClientsTable
            clients={clients}
            onUpdateClient={handleUpdateClient}
            onAddClient={addClient}
        />
    );
};

export const clientsRoutes = [
    {
        path: "clients",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <ClientsContainer />
            </ProtectedRoute>
        )
    }
];