import { createContext, useContext, useState, useEffect } from "react";
import { clientService } from "@/features/clients/services/client.service";
import { contractService } from "@/features/contracts/services/contract.service";
import type { Client, Contract } from "@/shared/types";
import { mapDbClientToUiClient, mapDbContractToUiContract } from "@/shared/types";

interface ClientsContextType {
    clients: Client[];
    contracts: Contract[];
    loading: boolean;
    error: string | null;
    refreshClients: () => Promise<void>;
    refreshContracts: () => Promise<void>;
}

export const GlobalClientsContext = createContext<ClientsContextType | null>(null);

export const useGlobalClients = () => {
    const context = useContext(GlobalClientsContext);
    if (!context) {
        throw new Error("useGlobalClients must be used within a GlobalClientsProvider");
    }
    return context;
};

export const GlobalClientsProvider = ({ children }: { children: React.ReactNode }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshClients = async () => {
        try {
            setLoading(true);
            const response = await clientService.getClients({});
            
            // Verificar que la respuesta tiene la estructura esperada
            const clientsData = response?.data || [];
            if (Array.isArray(clientsData)) {
                // Filtrar clientes válidos antes de mapear
                const validClients = clientsData.filter(client => 
                    client && (client.id_persona || client.id)
                );
                
                // Mapear clientes de forma segura
                const mappedClients = validClients.map(client => {
                    try {
                        return mapDbClientToUiClient(client);
                    } catch (err) {
                        console.warn('Error mapping client:', client, err);
                        return null;
                    }
                }).filter(Boolean); // Remover nulls
                
                setClients(mappedClients);
                setError(null);
            } else {
                console.warn('Clients response is not an array:', response);
                setClients([]);
                setError("Formato de respuesta de clientes inválido");
            }
        } catch (err) {
            setError("Error al cargar los clientes");
            console.error("Error loading clients:", err);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const refreshContracts = async () => {
        try {
            setLoading(true);
            const response = await contractService.getContracts();
            
            // Verificar que la respuesta tiene la estructura esperada
            const contractsData = response?.data?.data || response?.data || [];
            if (Array.isArray(contractsData)) {
                // Filtrar contratos válidos antes de mapear
                const validContracts = contractsData.filter(contract => 
                    contract && contract.id
                );
                
                // Mapear contratos de forma segura
                const mappedContracts = validContracts.map(contract => {
                    try {
                        return mapDbContractToUiContract(contract);
                    } catch (err) {
                        console.warn('Error mapping contract:', contract, err);
                        return null;
                    }
                }).filter(Boolean); // Remover nulls
                
                setContracts(mappedContracts);
                setError(null);
            } else {
                console.warn('Contracts response is not an array:', response);
                setContracts([]);
                setError("Formato de respuesta de contratos inválido");
            }
        } catch (err) {
            setError("Error al cargar los contratos");
            console.error("Error loading contracts:", err);
            setContracts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Cargar datos de forma independiente para evitar que un error afecte al otro
                await Promise.allSettled([refreshClients(), refreshContracts()]);
            } catch (err) {
                console.error("Error loading initial data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <GlobalClientsContext.Provider
            value={{
                clients,
                contracts,
                loading,
                error,
                refreshClients,
                refreshContracts,
            }}
        >
            {children}
        </GlobalClientsContext.Provider>
    );
};