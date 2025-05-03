import { useState, useEffect } from "react"
import { ContractsTable } from "@/features/contracts/components/ContractsTable"
import { useAuth } from "@/shared/contexts/AuthContext"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import type { Contract, Client } from "@/shared/types"
import { MOCK_CLIENTS, MOCK_MEMBERSHIPS, MOCK_CONTRACTS } from "@/features/data/mockData"
import Swal from "sweetalert2"

export function ContractsPage() {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)

  // Listen for changes in MOCK_CLIENTS to keep the local state in sync
  useEffect(() => {
    setClients([...MOCK_CLIENTS])
  }, [])

  const handleAddClient = (newClient: Omit<Client, "id">): string => {
    const maxId = Math.max(...clients.map((c) => Number.parseInt(c.id)), 0)
    const id = (maxId + 1).toString().padStart(4, "0")
    const clientToAdd = { ...newClient, id }
    const completeClient: Client = {
      ...clientToAdd,
      status: clientToAdd.status || "Activo",
      membershipType: clientToAdd.membershipType || "",
      membershipEndDate: clientToAdd.membershipEndDate || null,
    }

    // Actualizar la lista de clientes
    setClients([...clients, completeClient])

    // En una aplicación real, aquí se actualizaría un estado global o se haría una llamada a la API
    // para que el cambio se refleje en todos los componentes que usan estos datos

    // Actualizar MOCK_CLIENTS para que otros componentes puedan acceder a los datos actualizados
    MOCK_CLIENTS.push(completeClient)

    return id
  }

  const handleAddContract = (newContract: Omit<Contract, "id">) => {
    const id = Math.max(0, ...contracts.map((c) => c.id)) + 1
    const contractToAdd = { ...newContract, id }
    setContracts([...contracts, contractToAdd])

    // Update the client's membership information based on the new contract
    const clientId = newContract.id_cliente.toString()
    const clientIndex = clients.findIndex((c) => c.id === clientId)

    if (clientIndex !== -1) {
      const updatedClient = {
        ...clients[clientIndex],
        membershipType: newContract.membresia_nombre,
        membershipEndDate: newContract.fecha_fin,
        status: "Activo",
      }

      const updatedClients = [...clients]
      updatedClients[clientIndex] = updatedClient
      setClients(updatedClients)

      // Update the MOCK_CLIENTS array as well
      const mockClientIndex = MOCK_CLIENTS.findIndex((c) => c.id === clientId)
      if (mockClientIndex !== -1) {
        MOCK_CLIENTS[mockClientIndex] = updatedClient
      }

      // Mostrar mensaje de confirmación
      Swal.fire({
        title: "Contrato creado exitosamente",
        text: `El cliente ${updatedClient.nombre} ${updatedClient.apellido} ahora puede agendar entrenamientos con su membresía ${newContract.membresia_nombre}`,
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      })
    }
  }

  const handleUpdateContract = (id: number, updatedData: Partial<Contract>) => {
    const contractIndex = contracts.findIndex((c) => c.id === id)

    if (contractIndex !== -1) {
      const updatedContract = { ...contracts[contractIndex], ...updatedData }
      const updatedContracts = [...contracts]
      updatedContracts[contractIndex] = updatedContract
      setContracts(updatedContracts)

      // If the contract status or membership details changed, update the client information
      if (updatedData.estado || updatedData.membresia_nombre || updatedData.fecha_fin) {
        const clientId = contracts[contractIndex].id_cliente.toString()
        const clientIndex = clients.findIndex((c) => c.id === clientId)

        if (clientIndex !== -1) {
          const updatedClient = { ...clients[clientIndex] }

          if (updatedData.membresia_nombre) {
            updatedClient.membershipType = updatedData.membresia_nombre
          }

          if (updatedData.fecha_fin) {
            updatedClient.membershipEndDate = updatedData.fecha_fin
          }

          if (updatedData.estado) {
            updatedClient.status = updatedData.estado === "Activo" ? "Activo" : "Inactivo"
          }

          const updatedClients = [...clients]
          updatedClients[clientIndex] = updatedClient
          setClients(updatedClients)

          // Update the MOCK_CLIENTS array as well
          const mockClientIndex = MOCK_CLIENTS.findIndex((c) => c.id === clientId)
          if (mockClientIndex !== -1) {
            MOCK_CLIENTS[mockClientIndex] = updatedClient
          }
        }
      }
    }
  }

  const handleDeleteContract = (id: number) => {
    const contractToDelete = contracts.find((c) => c.id === id)
    setContracts(contracts.filter((contract) => contract.id !== id))

    // If this was the client's only active contract, update their status
    if (contractToDelete) {
      const clientId = contractToDelete.id_cliente.toString()
      const clientContracts = contracts.filter(
        (c) => c.id_cliente.toString() === clientId && c.id !== id && c.estado === "Activo",
      )

      if (clientContracts.length === 0) {
        const clientIndex = clients.findIndex((c) => c.id === clientId)

        if (clientIndex !== -1) {
          const updatedClient = {
            ...clients[clientIndex],
            status: "Inactivo",
            membershipEndDate: null,
          }

          const updatedClients = [...clients]
          updatedClients[clientIndex] = updatedClient
          setClients(updatedClients)

          // Update the MOCK_CLIENTS array as well
          const mockClientIndex = MOCK_CLIENTS.findIndex((c) => c.id === clientId)
          if (mockClientIndex !== -1) {
            MOCK_CLIENTS[mockClientIndex] = updatedClient
          }
        }
      }
    }
  }

  // Update contracts when a client's status changes
  useEffect(() => {
    // Find inactive clients
    const inactiveClientIds = clients
      .filter((client) => client.status === "Inactivo")
      .map((client) => Number(client.id))

    // Update contracts for inactive clients
    const updatedContracts = contracts.map((contract) => {
      if (inactiveClientIds.includes(contract.id_cliente) && contract.estado === "Activo") {
        return {
          ...contract,
          estado: "Cancelado",
        }
      }
      return contract
    })

    // Only update if there are changes
    if (JSON.stringify(updatedContracts) !== JSON.stringify(contracts)) {
      setContracts(updatedContracts)
    }
  }, [clients])

  return (
    <ProtectedRoute allowedRoles={["admin", "client"]}>
      <div className="h-full rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
        <ContractsTable
          contracts={contracts}
          memberships={MOCK_MEMBERSHIPS}
          clients={clients}
          onAddContract={handleAddContract}
          onUpdateContract={handleUpdateContract}
          onDeleteContract={handleDeleteContract}
          onAddClient={handleAddClient}
        />
      </div>
    </ProtectedRoute>
  )
}

