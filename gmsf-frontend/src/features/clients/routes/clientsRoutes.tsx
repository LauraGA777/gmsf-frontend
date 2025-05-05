import React from "react";
import { ClientsTable } from "@/features/clients/components/clientsTable";
import { ProtectedRoute } from "../../auth/components/protectedRoute"
import { useGlobalClients } from "@/shared/contexts/clientsContext";

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
        path: "/clients",
        element: (
            <ProtectedRoute allowedRoles={[1,2]}>
                <ClientsContainer />
            </ProtectedRoute>
        )
    }
];