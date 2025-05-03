import React from "react";
import { ClientsTable } from "../ClientsTable";
import { ClientDetails } from "../ClientDetails";
import { EditClientModal } from "../EditClientModal";
import { RenewMembershipModal } from "../RenewMembershipModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useGlobalClients } from "@/context/ClientsContext";

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