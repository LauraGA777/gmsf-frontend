import api from "@/shared/services/api";
import {
  Contract,
  ContractResponse,
  ContractsResponse,
} from "@/shared/types/contract";

export const contractService = {
  // Get all contracts with pagination and filters
  getContracts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: string;
    id_persona?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
  }) => {
    const response = await api.get<ContractsResponse>("/contracts", { params });
    return response.data;
  },

  // Get contract by ID
  getContract: async (id: number) => {
    const response = await api.get<ContractResponse>(`/contracts/${id}`);
    return response.data;
  },

  // Create new contract
  createContract: async (data: Partial<Contract>) => {
    const response = await api.post<ContractResponse>("/contracts", data);
    return response.data;
  },

  // Update contract
  updateContract: async (id: number, data: Partial<Contract>) => {
    const response = await api.put<ContractResponse>(`/contracts/${id}`, data);
    return response.data;
  },

  // Delete/Cancel contract
  deleteContract: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/contracts/${id}`);
    return response.data;
  },

  // Renew contract
  renewContract: async (data: {
    id_contrato: number;
    id_membresia: number;
    fecha_inicio: string;
    fecha_fin: string;
    membresia_precio: number;
  }) => {
    const response = await api.post<ContractResponse>("/contracts/renew", data);
    return response.data;
  },

  // Freeze contract
  freezeContract: async (data: { id_contrato: number; motivo: string }) => {
    const response = await api.post<ContractResponse>(
      "/contracts/freeze",
      data
    );
    return response.data;
  },

  // Get contract history
  getContractHistory: async (id: number) => {
    const response = await api.get(`/contracts/${id}/history`);
    return response.data;
  },
};
