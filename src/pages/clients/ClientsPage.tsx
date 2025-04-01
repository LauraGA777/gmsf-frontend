"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { ClientsTable } from "@/components/clients/ClientsTable"
import type { Client } from "@/types"

// Importamos los datos de ejemplo de clientes que se usan en ContractsPage
// En una aplicación real, esto vendría de un contexto global o una API
import { MOCK_CLIENTS } from "@/data/mockData"

export function ClientsPage() {
  // Usamos el mismo conjunto de datos que se usa en ContractsPage
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)

  // Actualizar los clientes cuando MOCK_CLIENTS cambie (por ejemplo, cuando se añade un nuevo contrato)
  useEffect(() => {
    setClients([...MOCK_CLIENTS])
  }, [])

  const handleUpdateClient = (updatedClient: Client) => {
    // Actualizar el cliente en el estado local
    setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))

    // Actualizar también en MOCK_CLIENTS para mantener la sincronización
    const index = MOCK_CLIENTS.findIndex((c) => c.id === updatedClient.id)
    if (index !== -1) {
      MOCK_CLIENTS[index] = updatedClient
    }
  }

  const handleAddClient = (newClient: Omit<Client, "id">) => {
    // Generar un nuevo ID (en producción, esto vendría del backend)
    const newId = (Number(clients[clients.length - 1]?.id || "0") + 1).toString().padStart(4, "0")

    const clientToAdd = {
      ...newClient,
      id: newId,
    }

    // Añadir al estado local
    setClients([...clients, clientToAdd])

    // Añadir también a MOCK_CLIENTS
    MOCK_CLIENTS.push(clientToAdd)

    return newId
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="h-full rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <ClientsTable clients={clients} onUpdateClient={handleUpdateClient} onAddClient={handleAddClient} />
      </div>
    </ProtectedRoute>
  )
}

