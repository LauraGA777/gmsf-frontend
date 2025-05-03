import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { useGlobalClients } from "@/shared/contexts/ClientsContext"
import type { Client } from "@/shared/types"
import { ClientsTable } from "@/features/clients/components/ClientsTable"


export function ClientsPage() {
  // Usamos el contexto global para acceder a los clientes y funciones
  const { clients, updateClient, addClient } = useGlobalClients()

  // Función para actualizar un cliente
  const handleUpdateClient = (updatedClient: Client) => {
    updateClient(updatedClient.id, updatedClient)
  }

  // Función para añadir un nuevo cliente
  const handleAddClient = (newClient: Omit<Client, "id">) => {
    return addClient(newClient)
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="h-full rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <ClientsTable clients={clients} onUpdateClient={handleUpdateClient} onAddClient={handleAddClient} />
      </div>
    </ProtectedRoute>
  )
}

