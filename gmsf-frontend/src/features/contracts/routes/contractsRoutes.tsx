import React from "react";
import { ContractsTable } from "@/features/contracts/components/contractsTable";
import { ProtectedRoute } from "../../auth/components/protectedRoute"
import { useGlobalClients } from "@/shared/contexts/clientsContext";

// Componente contenedor para contratos que usa el contexto global
export const ContractsContainer = () => {
    // Usar el contexto global en lugar de estado local
    const { 
        clients, 
        contracts, 
        memberships,
        addClient,
        updateClient,
        addContract,
        updateContract,
        deleteContract
    } = useGlobalClients();

    return (
        <ContractsTable
            contracts={contracts}
            onUpdateContract={updateContract}
            memberships={memberships}
            clients={clients}
            onAddContract={addContract}
            onDeleteContract={deleteContract}
            onAddClient={addClient}
        />
    );
};

// Rutas de contratos utilizando el contenedor
export const contractsRoutes = [
    {
        path: "/contracts",
        element: (
            <ProtectedRoute allowedRoles={[1, 2]}>
                <ContractsContainer />
            </ProtectedRoute>
        )
    }
];