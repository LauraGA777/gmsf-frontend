import React from "react";
import { ContractsTable } from "@/features/contracts/components/ContractsTable";
import { ContractDetails } from "@/features/contracts/components/ContractDetails";
import { EditContractModal } from "@/features/contracts/components/EditContractModal";
import { NewContractForm } from "@/features/contracts/components/NewContractForm";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { useGlobalClients } from "@/shared/contexts/ClientsContext";

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
        path: "contracts",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <ContractsContainer />
            </ProtectedRoute>
        )
    }
];