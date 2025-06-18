import { useState, useEffect, useMemo } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Plus, Search, RefreshCw, FileSignature } from "lucide-react"
import { useGym } from "@/shared/contexts/gymContext"
import type { Contract, Client, Membership } from "@/shared/types"
import { ContractsTable } from "@/features/contracts/components/contractsTable"
import Swal from "sweetalert2"
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/shared/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { DialogTitle } from "@/shared/components/ui/dialog"
import { NewContractForm } from "@/features/contracts/components/newContractForm"

export function ContractsPage() {
  const {
    clients,
    contracts,
    memberships,
    contractsLoading,
    refreshContracts,
    createContract,
    updateContract,
    deleteContract,
  } = useGym()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  useEffect(() => {
    refreshContracts()
  }, [])

  const filteredContracts = useMemo(() => {
    let filtered = [...contracts]

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.estado === statusFilter)
    }

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(c => {
        const client = clients.find(cl => String(cl.id_persona) === String(c.id_persona))
        const membership = memberships.find(m => String(m.id) === String(c.id_membresia))

        return (
          c.codigo?.toLowerCase().includes(lowercasedTerm) ||
          client?.usuario?.nombre.toLowerCase().includes(lowercasedTerm) ||
          client?.usuario?.apellido.toLowerCase().includes(lowercasedTerm) ||
          client?.usuario?.numero_documento.toLowerCase().includes(lowercasedTerm) ||
          membership?.nombre.toLowerCase().includes(lowercasedTerm)
        )
      })
    }
    return filtered.sort((a, b) => b.id - a.id);
  }, [contracts, searchTerm, statusFilter, clients, memberships])

  const paginatedContracts = useMemo(() => {
    const startIndex = (page - 1) * limit
    return filteredContracts.slice(startIndex, startIndex + limit)
  }, [filteredContracts, page, limit])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredContracts.length / limit)
  }, [filteredContracts, limit])

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage)
    }
  }

  const handleAddContract = async (newContract: Omit<Contract, "id">) => {
    try {
      await createContract(newContract)
      Swal.fire("¡Éxito!", "Contrato agregado correctamente.", "success")
      setIsAddModalOpen(false)
      refreshContracts()
    } catch (error) {
      Swal.fire("Error", "No se pudo agregar el contrato.", "error")
    }
  }

  const handleUpdateContract = async (id: number, updates: Partial<Contract>) => {
    try {
      await updateContract(id, updates)
      Swal.fire("¡Éxito!", "Contrato actualizado correctamente.", "success")
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el contrato.", "error")
    }
  }

  const handleDeleteContract = async (id: number) => {
    try {
      await deleteContract(id)
      Swal.fire("¡Éxito!", "Contrato eliminado correctamente.", "success")
    } catch (error) {
      Swal.fire("Error", "No se pudo eliminar el contrato.", "error")
    }
  }

  const handleAddClient = (client: Omit<Client, "id">): string => {
    console.log("Adding client:", client)
    const newClientId = `temp-id-${Date.now()}`
    return newClientId
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileSignature className="h-6 w-6" />
              Contratos
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshContracts} disabled={contractsLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${contractsLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Contrato
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por código, cliente, membresía o documento..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Por vencer">Por vencer</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                    <SelectItem value="Congelado">Congelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <ContractsTable
            contracts={paginatedContracts}
            clients={clients}
            memberships={memberships}
            isLoading={contractsLoading}
            onUpdateContract={handleUpdateContract}
            onDeleteContract={handleDeleteContract}
            pagination={{
              page,
              limit,
              total: filteredContracts.length,
              totalPages,
            }}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent
          className="sm:max-w-5xl h-auto overflow-visible"
          aria-describedby="new-contract-description"
        >
          <VisuallyHidden>
            <DialogTitle>Nuevo Contrato</DialogTitle>
            <DialogDescription id="new-contract-description">
              Complete el formulario para crear un nuevo contrato.
            </DialogDescription>
          </VisuallyHidden>
          <NewContractForm
            clients={clients}
            memberships={memberships}
            onAddClient={handleAddClient}
            onAddContract={handleAddContract}
            onClose={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

