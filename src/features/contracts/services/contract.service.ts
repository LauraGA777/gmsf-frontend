import api from '@/shared/services/api';
import type { 
  Contract, 
  ContractFormData, 
  ContractHistory 
} from '@/shared/types';

interface ContractsResponse {
  data: Contract[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

interface ContractResponse {
  data: Contract;
  message: string;
}

interface ContractHistoryResponse {
  data: ContractHistory[];
  message: string;
}

export const contractService = {
  // Verificar autenticación
  checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
  },

  // Get all contracts with pagination and filters
  getContracts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    id_persona?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) => {
    contractService.checkAuth();
    const response = await api.get<ContractsResponse>('/contracts', { params });
    return response.data;
  },

  // Get contract by ID
  getContract: async (id: number) => {
    contractService.checkAuth();
    const response = await api.get<ContractResponse>(`/contracts/${id}`);
    return response.data;
  },

  // Create new contract
  createContract: async (data: ContractFormData) => {
    contractService.checkAuth();
    // Auto-generate contract code
    const contractData = {
      ...data,
      codigo: `C${Date.now().toString().slice(-4)}`, // Temporary code, backend should generate
    };
    
    const response = await api.post<ContractResponse>('/contracts', contractData);
    return response.data;
  },

  // Update contract
  updateContract: async (id: number, data: Partial<Contract & { motivo?: string }>) => {
    contractService.checkAuth();
    const response = await api.put<ContractResponse>(`/contracts/${id}`, data);
    return response.data;
  },

  // Delete/Cancel contract
  deleteContract: async (id: number) => {
    contractService.checkAuth();
    const response = await api.delete<{ success: boolean; message: string }>(`/contracts/${id}`);
    return response.data;
  },

  // Get contract history
  getContractHistory: async (id: number) => {
    contractService.checkAuth();
    const response = await api.get<ContractHistoryResponse>(`/contracts/${id}/history`);
    return response.data;
  },

  // Calculate end date based on membership validity
  calculateEndDate: (startDate: Date, validityDays: number): Date => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + validityDays);
    return endDate;
  },

  // Validate contract data before creation
  validateContractData: (data: ContractFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.id_persona) {
      errors.push('Debe seleccionar un cliente');
    }

    if (!data.id_membresia) {
      errors.push('Debe seleccionar una membresía');
    }

    if (!data.fecha_inicio) {
      errors.push('Debe especificar una fecha de inicio');
    } else {
      // Create date objects at midnight UTC to avoid timezone issues
      const startDate = new Date(data.fecha_inicio);
      startDate.setUTCHours(0, 0, 0, 0);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      if (startDate < today) {
        errors.push('La fecha de inicio no puede ser anterior a hoy');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Check if client has active contracts
  checkClientActiveContracts: async (clientId: number) => {
    contractService.checkAuth();
    const response = await api.get<ContractsResponse>('/contracts', {
      params: {
        id_persona: clientId,
        estado: 'Activo',
        limit: 1
      }
    });
    
    // Also check for frozen contracts
    const frozenResponse = await api.get<ContractsResponse>('/contracts', {
      params: {
        id_persona: clientId,
        estado: 'Congelado',
        limit: 1
      }
    });
    
    const hasActiveContract = response.data.data.length > 0;
    const hasFrozenContract = frozenResponse.data.data.length > 0;
    
    return {
      hasActiveContract: hasActiveContract || hasFrozenContract,
      activeContract: hasActiveContract ? response.data.data[0] : (hasFrozenContract ? frozenResponse.data.data[0] : null),
      contractType: hasActiveContract ? 'Activo' : (hasFrozenContract ? 'Congelado' : null)
    };
  },

  // Get active contracts for a client
  getActiveContractsByClient: async (clientId: number) => {
    contractService.checkAuth();
    const response = await api.get<ContractsResponse>('/contracts', {
      params: {
        id_persona: clientId,
        estado: 'Activo'
      }
    });
    return response.data;
  },

  // Get contracts expiring soon
  getExpiringContracts: async (days: number = 30) => {
    contractService.checkAuth();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const response = await api.get<ContractsResponse>('/contracts', {
      params: {
        estado: 'Activo',
        fecha_fin: endDate.toISOString().split('T')[0]
      }
    });
    return response.data;
  }
};
