import React from "react";
import { ContractsTable } from "../ContractsTable";
import { ContractDetails } from "../ContractDetails";
import { EditContractModal } from "../EditContractModal";
import { NewContractForm } from "../NewContractForm";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useGlobalClients } from "@/context/ClientsContext";

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