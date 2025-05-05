import { ProtectedRoute } from "../../auth/components/protectedRoute"
import { useGlobalClients } from "@/shared/contexts/clientsContext"
import type { Client } from "@/shared/types"
import { ClientsTable } from "@/features/clients/components/clientsTable"

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
    <ProtectedRoute allowedRoles={[1]}>
      <div className="h-full rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <ClientsTable clients={clients} onUpdateClient={handleUpdateClient} onAddClient={handleAddClient} />
      </div>
    </ProtectedRoute>
  )
}

