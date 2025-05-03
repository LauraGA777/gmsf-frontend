import React, { createContext, useContext, useState, useEffect } from "react";
import { mockClients, mockContracts, mockMemberships, MOCK_CLIENTS } from "@/features/data/mockData";
import type { Client, Contract, Membership } from "@/shared/types";

// Interfaz para el contexto
export interface GlobalClientsContextType {
  clients: Client[];
  contracts: Contract[];
  memberships: Membership[];
  addClient: (newClient: Omit<Client, "id">) => string;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addContract: (newContract: Omit<Contract, "id">) => void;
  updateContract: (id: number, updates: Partial<Contract>) => void;
  deleteContract: (id: number) => void;
}

// Crear el contexto
export const GlobalClientsContext = createContext<GlobalClientsContextType | null>(null);

// Hook personalizado para usar el contexto
export const useGlobalClients = () => {
  const context = useContext(GlobalClientsContext);
  if (!context) {
    throw new Error('useGlobalClients debe usarse dentro de un GlobalClientsProvider');
  }
  return context;
};

// Proveedor del contexto
export const GlobalClientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para los clientes con datos iniciales
  const [clients, setClients] = useState<Client[]>(
    mockClients.map((c) => ({
      id: c.id,
      codigo: c.codigo || "",
      name: `${c.nombre || ""} ${c.apellido || ""}`,
      firstName: c.nombre,
      lastName: c.apellido,
      email: c.email || "",
      phone: c.telefono || "",
      documentType: c.tipo_documento,
      documentNumber: c.numero_documento,
      membershipType: c.membershipType,
      membershipEndDate: c.membershipEndDate,
      address: c.direccion || "",
      emergencyContact: c.contacto_emergencia || "",
      emergencyPhone: c.telefono_emergencia || "",
      birthdate: c.fecha_nacimiento ? new Date(c.fecha_nacimiento) : undefined,
      status: c.estado || "Activo",
      isBeneficiary: false,
      registrationDate: c.fecha_registro ? new Date(c.fecha_registro) : new Date()
    }))
  );

  // Estado para los contratos con datos iniciales
  const [contracts, setContracts] = useState<Contract[]>(
    mockContracts.map((c) => ({
      id: c.id,
      codigo: c.codigo || "",
      id_cliente: c.id_cliente,
      id_membresia: c.id_membresia,
      fecha_inicio: new Date(c.fecha_inicio),
      fecha_fin: new Date(c.fecha_fin),
      estado: c.estado,
      cliente_nombre: c.cliente_nombre || "",
      membresia_nombre: c.membresia_nombre || "",
      membresia_precio: c.membresia_precio || 0,
      precio_total: c.precio_total,
      cliente_documento: c.cliente_documento,
      cliente_documento_tipo: c.cliente_documento_tipo,
      fecha_registro: c.fecha_registro ? new Date(c.fecha_registro) : new Date()
    }))
  );

  // Convertir mockMemberships a tipo Membership
  const memberships: Membership[] = mockMemberships.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    descripcion: m.descripcion || "",
    duracion_dias: m.duracion_dias,
    precio: m.precio,
    estado: m.estado
  }));

  // Función para añadir un nuevo cliente
  const handleAddClient = (newClient: Omit<Client, "id">) => {
    // Generar ID único para el nuevo cliente
    const newId = Math.max(...clients.map(c => Number(c.id)), 0) + 1;
    const clientId = newId.toString();
    
    // Crear el nuevo cliente con ID y código formateado correctamente
    const clientWithId: Client = {
      ...newClient,
      id: clientId,
      codigo: `P${clientId.padStart(4, '0')}`
    };
    
    // Actualizar el estado de clientes
    setClients(prevClients => {
      // Ordenar clientes por número de código (ordenamiento numérico)
      const updatedClients = [...prevClients, clientWithId];
      return updatedClients.sort((a, b) => {
        const codeA = a.codigo ? parseInt(a.codigo.replace('P', '')) : Number(a.id);
        const codeB = b.codigo ? parseInt(b.codigo.replace('P', '')) : Number(b.id);
        return codeA - codeB;
      });
    });
    
    console.log("Nuevo cliente añadido:", clientWithId);
    return clientId;
  };

  // Función para actualizar un cliente existente
  const handleUpdateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === clientId 
          ? { ...client, ...updates } 
          : client
      )
    );
    
    console.log("Cliente actualizado:", clientId, updates);
  };

  // Función para añadir un nuevo contrato
  const handleAddContract = (newContract: Omit<Contract, "id">) => {
    // Generar ID único para el nuevo contrato
    const newId = Math.max(...contracts.map(c => c.id), 0) + 1;
    
    // Crear el nuevo contrato con ID y código formateado correctamente
    const contractWithId: Contract = {
      ...newContract,
      id: newId,
      codigo: `C${newId.toString().padStart(4, '0')}`,
    };
    
    // Actualizar el estado de contratos
    setContracts(prevContracts => {
      // Ordenar contratos por número de código (orden numérico)
      const updatedContracts = [...prevContracts, contractWithId];
      return updatedContracts.sort((a, b) => {
        const codeA = a.codigo ? parseInt(a.codigo.replace('C', '')) : a.id;
        const codeB = b.codigo ? parseInt(b.codigo.replace('C', '')) : b.id;
        return codeA - codeB;
      });
    });
    
    // Actualizar también la información de membresía en el cliente correspondiente
    const clientId = newContract.id_cliente.toString();
    const selectedMembership = memberships.find(m => m.id === newContract.id_membresia);
    
    if (selectedMembership) {
      setClients(prevClients => {
        const updatedClients = prevClients.map(client => {
          if (client.id === clientId) {
            // Actualizar el cliente con la información de la nueva membresía
            const updatedClient = {
              ...client,
              status: "Activo", // Activar al cliente
              membershipType: selectedMembership.nombre,
              membershipEndDate: newContract.fecha_fin,
            };
            
            // Actualizar también en MOCK_CLIENTS para sincronización en tiempo real
            const mockClientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
            if (mockClientIndex !== -1) {
              MOCK_CLIENTS[mockClientIndex] = {
                ...MOCK_CLIENTS[mockClientIndex],
                estado: "Activo",
                membershipType: selectedMembership.nombre,
                membershipEndDate: newContract.fecha_fin
              };
            }
            
            return updatedClient;
          }
          return client;
        });
        
        return updatedClients;
      });
    }
    
    console.log("Nuevo contrato añadido:", contractWithId);
    
    // Forzar actualización de MOCK_CLIENTS para que otros componentes detecten el cambio
    const updatedMockClients = [...MOCK_CLIENTS];
    MOCK_CLIENTS.splice(0, MOCK_CLIENTS.length, ...updatedMockClients);
  };

  // Función para actualizar un contrato existente
  const handleUpdateContract = (id: number, updates: Partial<Contract>) => {
    // Primero obtenemos el contrato actual para tener acceso a sus datos
    const currentContract = contracts.find(c => c.id === id);
    
    setContracts(prevContracts => 
      prevContracts.map(contract => 
        contract.id === id 
          ? { ...contract, ...updates } 
          : contract
      )
    );
    
    // Si estamos cambiando el estado del contrato, actualizar también el cliente correspondiente
    if (updates.estado || updates.fecha_fin || updates.id_membresia) {
      const clientId = currentContract?.id_cliente.toString();
      
      if (clientId) {
        // Preparar las actualizaciones para el cliente
        const clientUpdates: Partial<Client> = {};
        
        // Si cambia el estado
        if (updates.estado) {
          clientUpdates.status = 
            updates.estado === "Activo" ? "Activo" :
            updates.estado === "Congelado" ? "Congelado" :
            updates.estado === "Pendiente de pago" ? "Pendiente de pago" : "Inactivo";
        }
        
        // Si cambia la fecha de fin
        if (updates.fecha_fin) {
          clientUpdates.membershipEndDate = updates.fecha_fin;
        }
        
        // Si cambia la membresía
        if (updates.id_membresia) {
          const membership = memberships.find(m => m.id === updates.id_membresia);
          if (membership) {
            clientUpdates.membershipType = membership.nombre;
          }
        }
        
        // Actualizar el cliente
        if (Object.keys(clientUpdates).length > 0) {
          handleUpdateClient(clientId, clientUpdates);
          
          // Actualizar también en MOCK_CLIENTS para sincronización en tiempo real
          const mockClientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
          if (mockClientIndex !== -1) {
            if (clientUpdates.status) {
              MOCK_CLIENTS[mockClientIndex].estado = clientUpdates.status as any;
            }
            if (clientUpdates.membershipEndDate) {
              MOCK_CLIENTS[mockClientIndex].membershipEndDate = clientUpdates.membershipEndDate;
            }
            if (clientUpdates.membershipType) {
              MOCK_CLIENTS[mockClientIndex].membershipType = clientUpdates.membershipType;
            }
          }
        }
      }
    }
    
    console.log("Contrato actualizado:", id, updates);
  };

  // Función para eliminar un contrato
  const handleDeleteContract = (id: number) => {
    // Primero obtenemos el contrato que se eliminará
    const contractToDelete = contracts.find(c => c.id === id);
    
    setContracts(prevContracts => 
      prevContracts.filter(contract => contract.id !== id)
    );
    
    // Si el cliente no tiene más contratos activos, actualizar su estado
    if (contractToDelete) {
      const clientId = contractToDelete.id_cliente.toString();
      const clientHasOtherActiveContracts = contracts.some(c => 
        c.id !== id && 
        c.id_cliente.toString() === clientId && 
        c.estado === "Activo"
      );
      
      if (!clientHasOtherActiveContracts) {
        handleUpdateClient(clientId, {
          status: "Inactivo",
          membershipEndDate: new Date()
        });
        
        // Actualizar también en MOCK_CLIENTS para sincronización en tiempo real
        const mockClientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
        if (mockClientIndex !== -1) {
          MOCK_CLIENTS[mockClientIndex].estado = "Inactivo";
          MOCK_CLIENTS[mockClientIndex].membershipEndDate = new Date();
        }
      }
    }
    
    console.log("Contrato eliminado:", id);
  };

  // Valor del contexto
  const contextValue: GlobalClientsContextType = {
    clients,
    contracts,
    memberships,
    addClient: handleAddClient,
    updateClient: handleUpdateClient,
    addContract: handleAddContract,
    updateContract: handleUpdateContract,
    deleteContract: handleDeleteContract
  };

  return (
    <GlobalClientsContext.Provider value={contextValue}>
      {children}
    </GlobalClientsContext.Provider>
  );
};