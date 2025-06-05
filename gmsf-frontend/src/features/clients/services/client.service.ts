import api from "@/shared/services/api";
import {
  Client,
  ClientResponse,
  ClientsResponse,
} from "@/shared/types/client";

export const clientService = {
  // Get all clients with pagination and filters
  getClients: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: boolean;
    id_titular?: number;
  }) => {
    const response = await api.get<ClientsResponse>("/clients", { params });
    return response.data;
  },

  // Get client by ID
  getClient: async (id: number) => {
    const response = await api.get<ClientResponse>(`/clients/${id}`);
    return response.data;
  },

  // Create new client
  createClient: async (data: Partial<Client>) => {
    const response = await api.post<ClientResponse>("/clients", data);
    return response.data;
  },

  // Update client
  updateClient: async (id: number, data: Partial<Client>) => {
    const response = await api.put<ClientResponse>(`/clients/${id}`, data);
    return response.data;
  },

  // Delete client
  deleteClient: async (id: number) => {
    const response = await api.delete<{ success: boolean }>(`/clients/${id}`);
    return response.data;
  },

  // Get client beneficiaries
  getBeneficiaries: async (id: number) => {
    const response = await api.get<ClientsResponse>(
      `/clients/${id}/beneficiaries`
    );
    return response.data;
  },
};
