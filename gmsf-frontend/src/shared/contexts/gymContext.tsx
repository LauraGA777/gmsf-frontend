import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clientService } from '@/features/clients/services/client.service';
import { contractService } from '@/features/contracts/services/contract.service';
import { membershipService } from '@/features/memberships/services/membership.service';
import type { Client, Contract, Membership } from '@/shared/types';
import Swal from 'sweetalert2';

interface GymContextType {
  // Data
  clients: Client[];
  contracts: Contract[];
  memberships: Membership[];
  
  // Loading states
  clientsLoading: boolean;
  contractsLoading: boolean;
  membershipsLoading: boolean;
  
  // Stats
  stats: {
    totalClients: number;
    activeClients: number;
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number;
    revenue: number;
  };
  
  // Actions
  refreshAll: () => Promise<void>;
  refreshClients: () => Promise<void>;
  refreshContracts: () => Promise<void>;
  refreshMemberships: () => Promise<void>;
  
  // Client actions
  createClient: (data: any) => Promise<Client>;
  updateClient: (id: number, data: any) => Promise<Client>;
  deleteClient: (id: number) => Promise<void>;
  
  // Contract actions
  createContract: (data: any) => Promise<Contract>;
  updateContract: (id: number, data: any) => Promise<Contract>;
  deleteContract: (id: number) => Promise<void>;
  
  // Cross-reference actions
  getClientContracts: (clientId: number) => Contract[];
  getContractClient: (contractId: number) => Client | undefined;
  createContractForClient: (clientId: number, membershipId: number, startDate: string) => Promise<Contract>;
  
  // Navigation helpers
  navigateToClientContracts: (clientId: number) => void;
  navigateToContractClient: (contractId: number) => void;
  registerNavigation: (callbacks: {
    toClients?: () => void;
    toContracts?: () => void;
  }) => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  
  // Loading states
  const [clientsLoading, setClientsLoading] = useState(false);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  
  // Navigation state
  const [navigationCallbacks, setNavigationCallbacks] = useState<{
    toClients?: (clientId?: number) => void;
    toContracts?: (contractId?: number) => void;
  }>({});

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.estado === true).length;
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.estado === 'Activo').length;
    
    // Calculate expiring contracts (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringContracts = contracts.filter(c => 
      c.estado === 'Activo' && 
      new Date(c.fecha_fin) <= thirtyDaysFromNow &&
      new Date(c.fecha_fin) >= new Date()
    ).length;
    
    // Calculate revenue from active contracts
    const revenue = contracts
      .filter(c => c.estado === 'Activo')
      .reduce((total, contract) => total + contract.membresia_precio, 0);
    
    return {
      totalClients,
      activeClients,
      totalContracts,
      activeContracts,
      expiringContracts,
      revenue
    };
  }, [clients, contracts]);

  // Load data functions
  const refreshClients = useCallback(async () => {
    try {
      setClientsLoading(true);
      const response = await clientService.getClients({ limit: 1000 });
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  const refreshContracts = useCallback(async () => {
    try {
      setContractsLoading(true);
      const response = await contractService.getContracts({ limit: 1000 });
      setContracts(response.data);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setContractsLoading(false);
    }
  }, []);

  const refreshMemberships = useCallback(async () => {
    try {
      console.log('🔄 Iniciando carga de membresías...');
      setMembershipsLoading(true);
      const response = await membershipService.getMemberships({ limit: 1000 });
      console.log('✅ Respuesta de membresías recibida:', response);
      console.log('📊 Cantidad de membresías:', response.data?.length || 0);
      setMemberships(response.data);
    } catch (error) {
      console.error('❌ Error loading memberships:', error);
      console.error('🔍 Error details:', (error as any)?.response?.data || (error as any)?.message);
    } finally {
      setMembershipsLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshClients(),
      refreshContracts(),
      refreshMemberships()
    ]);
  }, [refreshClients, refreshContracts, refreshMemberships]);

  // Client actions
  const createClient = useCallback(async (data: any): Promise<Client> => {
    try {
      const response = await clientService.createClient(data);
      await refreshClients(); // Refresh to get updated data
      
      Swal.fire({
        title: '¡Cliente creado!',
        text: '¿Deseas crear un contrato para este cliente?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Crear Contrato',
        cancelButtonText: 'Después',
      }).then((result) => {
        if (result.isConfirmed && navigationCallbacks.toContracts) {
          navigationCallbacks.toContracts();
        }
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [refreshClients, navigationCallbacks]);

  const updateClient = useCallback(async (id: number, data: any): Promise<Client> => {
    try {
      const response = await clientService.updateClient(id, data);
      await refreshClients();
      await refreshContracts(); // Contracts might be affected
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [refreshClients, refreshContracts]);

  const deleteClient = useCallback(async (id: number): Promise<void> => {
    try {
      // Check if client has active contracts
      const clientContracts = contracts.filter(c => 
        c.id_persona === id && c.estado === 'Activo'
      );
      
      if (clientContracts.length > 0) {
        const result = await Swal.fire({
          title: 'Cliente tiene contratos activos',
          text: `Este cliente tiene ${clientContracts.length} contrato(s) activo(s). ¿Qué deseas hacer?`,
          icon: 'warning',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonColor: '#000',
          denyButtonColor: '#dc2626',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Solo desactivar cliente',
          denyButtonText: 'Cancelar contratos también',
          cancelButtonText: 'Cancelar operación',
        });

        if (result.isConfirmed) {
          // Just deactivate client
          await clientService.deleteClient(id);
          await refreshClients();
        } else if (result.isDenied) {
          // Cancel contracts first, then deactivate client
          for (const contract of clientContracts) {
            await contractService.deleteContract(contract.id);
          }
          await clientService.deleteClient(id);
          await refreshAll();
        }
      } else {
        await clientService.deleteClient(id);
        await refreshClients();
      }
    } catch (error) {
      throw error;
    }
  }, [contracts, refreshClients, refreshAll]);

  // Contract actions
  const createContract = useCallback(async (data: any): Promise<Contract> => {
    try {
      const response = await contractService.createContract(data);
      await refreshContracts();
      await refreshClients(); // Client status might change
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [refreshContracts, refreshClients]);

  const updateContract = useCallback(async (id: number, data: any): Promise<Contract> => {
    try {
      const response = await contractService.updateContract(id, data);
      await refreshContracts();
      await refreshClients(); // Client status might change
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [refreshContracts, refreshClients]);

  const deleteContract = useCallback(async (id: number): Promise<void> => {
    try {
      await contractService.deleteContract(id);
      await refreshContracts();
      await refreshClients(); // Client status might change
    } catch (error) {
      throw error;
    }
  }, [refreshContracts, refreshClients]);

  // Cross-reference functions
  const getClientContracts = useCallback((clientId: number): Contract[] => {
    return contracts.filter(c => c.id_persona === clientId);
  }, [contracts]);

  const getContractClient = useCallback((contractId: number): Client | undefined => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return undefined;
    return clients.find(c => c.id_persona === contract.id_persona);
  }, [contracts, clients]);

  const createContractForClient = useCallback(async (
    clientId: number, 
    membershipId: number, 
    startDate: string
  ): Promise<Contract> => {
    try {
      const membership = memberships.find(m => Number(m.id) === membershipId);
      if (!membership) {
        throw new Error('Membresía no encontrada');
      }

      const contractData = {
        id_persona: clientId,
        id_membresia: membershipId,
        fecha_inicio: startDate,
        membresia_precio: membership.precio,
      };

      const response = await contractService.createContract(contractData);
      await refreshContracts();
      await refreshClients();
      
      Swal.fire({
        title: '¡Contrato creado exitosamente!',
        text: `Contrato para ${membership.nombre} creado correctamente`,
        icon: 'success',
        confirmButtonColor: '#000',
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }, [memberships, refreshContracts, refreshClients]);

  // Navigation helpers
  const navigateToClientContracts = useCallback((clientId: number) => {
    if (navigationCallbacks.toContracts) {
      navigationCallbacks.toContracts();
      // Set a client filter in contracts view
      localStorage.setItem('gym-filter-client-id', clientId.toString());
    }
  }, [navigationCallbacks]);

  const navigateToContractClient = useCallback((contractId: number) => {
    if (navigationCallbacks.toClients) {
      const contract = contracts.find(c => c.id === contractId);
      if (contract) {
        navigationCallbacks.toClients();
        // Set a client highlight in clients view
        localStorage.setItem('gym-highlight-client-id', contract.id_persona.toString());
      }
    }
  }, [navigationCallbacks, contracts]);

  // Register navigation callbacks
  const registerNavigation = useCallback((callbacks: {
    toClients?: (clientId?: number) => void;
    toContracts?: (contractId?: number) => void;
  }) => {
    setNavigationCallbacks(callbacks);
  }, []);

  // Load initial data
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const value: GymContextType = {
    // Data
    clients,
    contracts,
    memberships,
    
    // Loading states
    clientsLoading,
    contractsLoading,
    membershipsLoading,
    
    // Stats
    stats,
    
    // Actions
    refreshAll,
    refreshClients,
    refreshContracts,
    refreshMemberships,
    
    // Client actions
    createClient,
    updateClient,
    deleteClient,
    
    // Contract actions
    createContract,
    updateContract,
    deleteContract,
    
    // Cross-reference actions
    getClientContracts,
    getContractClient,
    createContractForClient,
    
    // Navigation helpers
    navigateToClientContracts,
    navigateToContractClient,
    registerNavigation,
  };

  return (
    <GymContext.Provider value={value}>
      {children}
    </GymContext.Provider>
  );
}; 