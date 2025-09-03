import api from "@/shared/services/api";
import type { 
  Client, 
  ClientFormData, 
  EmergencyContact, 
  EmergencyContactFormData 
} from "@/shared/types";

interface ClientsResponse {
  data: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

interface ClientResponse {
  data: Client;
  message: string;
}

interface EmergencyContactsResponse {
  data: EmergencyContact[];
  message: string;
}

export const clientService = {
  // Verificar autenticación
  checkAuth() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
  },

  // Get all clients with pagination and filters
  getClients: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    estado?: boolean;
    id_titular?: number;
  }) => {
    clientService.checkAuth();
    const response = await api.get<ClientsResponse>("/clients", { params });
    return response.data;
  },

  // Get client by ID
  getClient: async (id: number) => {
    clientService.checkAuth();
    const response = await api.get<ClientResponse>(`/clients/${id}`);
    return response.data;
  },

  // Create new client
  createClient: async (data: ClientFormData) => {
    clientService.checkAuth();
    const response = await api.post<ClientResponse>("/clients", data);
    return response.data;
  },

  // Update client
  updateClient: async (id: number, data: Partial<ClientFormData>) => {
    clientService.checkAuth();
    const response = await api.put<ClientResponse>(`/clients/${id}`, data);
    return response.data;
  },

  // Delete client (soft delete - set estado to false)
  deleteClient: async (id: number) => {
    clientService.checkAuth();
    const response = await api.delete<{ success: boolean; message: string }>(`/clients/${id}`);
    return response.data;
  },

  // Get client beneficiaries
  getBeneficiaries: async (id: number) => {
    clientService.checkAuth();
    const response = await api.get<ClientsResponse>(`/clients/${id}/beneficiaries`);
    return response.data;
  },

  // Check if a user exists by document
  checkUserByDocument: async (tipo_documento: string, numero_documento: string): Promise<{ userExists: boolean; userData: any | null }> => {
    clientService.checkAuth();
    try {
      const response = await api.get<{ data: { userExists: boolean; userData: any | null } }>(`/clients/check-user/${tipo_documento}/${numero_documento}`);
      return response.data.data;
    } catch (error) {
      // Si hay error, asumir que el usuario no existe
      console.warn('Error checking user by document:', error);
      return { userExists: false, userData: null };
    }
  },

  // Get client emergency contacts
  getEmergencyContacts: async (id: number) => {
    clientService.checkAuth();
    const response = await api.get<EmergencyContactsResponse>(`/clients/${id}/emergency-contacts`);
    return response.data;
  },

  // Add emergency contact
  addEmergencyContact: async (clientId: number, contactData: EmergencyContactFormData) => {
    clientService.checkAuth();
    const response = await api.post<{ data: EmergencyContact; message: string }>(`/clients/${clientId}/emergency-contacts`, contactData);
    return response.data;
  },

  // Update emergency contact
  updateEmergencyContact: async (clientId: number, contactId: number, contactData: Partial<EmergencyContactFormData>) => {
    clientService.checkAuth();
    const response = await api.put<{ data: EmergencyContact; message: string }>(`/clients/${clientId}/emergency-contacts/${contactId}`, contactData);
    return response.data;
  },

  // Delete emergency contact
  deleteEmergencyContact: async (clientId: number, contactId: number) => {
    clientService.checkAuth();
    const response = await api.delete<{ success: boolean; message: string }>(`/clients/${clientId}/emergency-contacts/${contactId}`);
    return response.data;
  },

  // Validate client data before creation
  validateClientData: (data: ClientFormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validate user data if provided
    if (data.usuario) {
      if (!data.usuario.nombre) {
        errors.push('El nombre es requerido');
      }

      if (!data.usuario.apellido) {
        errors.push('El apellido es requerido');
      }

      if (!data.usuario.correo) {
        errors.push('El correo electrónico es requerido');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.usuario.correo)) {
        errors.push('El correo electrónico no tiene un formato válido');
      }

      if (!data.usuario.numero_documento) {
        errors.push('El número de documento es requerido');
      }

      if (!data.usuario.tipo_documento) {
        errors.push('El tipo de documento es requerido');
      }

      if (data.usuario.fecha_nacimiento) {
        const birthDate = new Date(data.usuario.fecha_nacimiento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 15) {
          errors.push('El cliente debe tener al menos 15 años');
        }
      }

      if (data.usuario.telefono && !/^\d{7,15}$/.test(data.usuario.telefono)) {
        errors.push('El número de teléfono debe tener entre 7 y 15 dígitos');
      }
    }

    // Validate emergency contacts
    if (data.contactos_emergencia) {
      data.contactos_emergencia.forEach((contact, index) => {
        if (!contact.nombre_contacto) {
          errors.push(`El nombre del contacto de emergencia ${index + 1} es requerido`);
        }

        if (!contact.telefono_contacto) {
          errors.push(`El teléfono del contacto de emergencia ${index + 1} es requerido`);
        } else if (!/^\d{7,15}$/.test(contact.telefono_contacto)) {
          errors.push(`El teléfono del contacto de emergencia ${index + 1} debe tener entre 7 y 15 dígitos`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Get all active clients (for dropdowns, etc.)
  getActiveClients: async () => {
    clientService.checkAuth();
    const response = await api.get<ClientsResponse>('/clients', {
      params: {
        estado: true,
        limit: 1000 // Get many for dropdowns
      }
    });
    return response.data;
  },

  // Get clients without beneficiaries (eligible to be titulars)
  getEligibleTitulars: async () => {
    clientService.checkAuth();
    const response = await api.get<ClientsResponse>('/clients', {
      params: {
        estado: true,
        id_titular: undefined, // Only clients without titular (not beneficiaries themselves)
        limit: 1000
      }
    });
    return response.data;
  },

  // Create beneficiary for an existing client
  createBeneficiary: async (titularId: number, beneficiaryData: ClientFormData) => {
    clientService.checkAuth();
    const beneficiaryWithTitular: ClientFormData = {
      ...beneficiaryData,
      id_titular: titularId,
      relacion: beneficiaryData.relacion || 'Beneficiario',
    };
    
    const response = await api.post<ClientResponse>('/clients', beneficiaryWithTitular);
    return response.data;
  },

  // Search clients by various criteria
  searchClients: async (searchTerm: string) => {
    clientService.checkAuth();
    const response = await api.get<ClientsResponse>('/clients', {
      params: {
        search: searchTerm,
        limit: 50 // Reasonable limit for search results
      }
    });
    return response.data;
  },

  // Get client statistics
  getClientStats: async () => {
    try {
      clientService.checkAuth();
      // This could be a separate endpoint in the future
      const response = await api.get<ClientsResponse>('/clients', {
        params: { limit: 1000 }
      });

      const clients = response.data.data;
      const stats = {
        total: clients.length,
        active: clients.filter(c => c.estado === true).length,
        inactive: clients.filter(c => c.estado === false).length,
        withBeneficiaries: clients.filter(c => c.beneficiarios && c.beneficiarios.length > 0).length,
        beneficiaries: clients.filter(c => c.id_titular).length,
      };

      return stats;
    } catch (error) {
      console.error('Error getting client stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        withBeneficiaries: 0,
        beneficiaries: 0,
      };
    }
  }
};
