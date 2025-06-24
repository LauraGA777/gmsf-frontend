import { useState, useEffect } from "react"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Plus, Search, RefreshCw, FileSignature } from "lucide-react"
import { useGym } from "@/shared/contexts/gymContext"
import type { Contract, Client, Membership } from "@/shared/types"
import { ContractsTable } from "@/features/contracts/components/contractsTable"
import { NewContractForm } from "@/features/contracts/components/newContractForm"
import { useToast } from "@/shared/components/ui/use-toast"

export function ContractsPage() {
  const {
    clients,
    contracts,
    memberships,
    contractsLoading,
    contractsPagination,
    refreshContracts,
    createContract,
    updateContract,
    deleteContract,
  } = useGym()

  const { toast } = useToast()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const limit = 10; // Or get from context if it can change

  useEffect(() => {
    const estado = statusFilter === "all" ? undefined : statusFilter
    refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
  }, [page, debouncedSearchTerm, statusFilter, refreshContracts])

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= contractsPagination.totalPages) {
      setPage(newPage)
    }
  }

  const handleAddContract = async (newContract: Omit<Contract, "id">) => {
    try {
      await createContract(newContract)
      toast({ title: "¡Éxito!", description: "Contrato agregado correctamente.", type: "success" })
      setIsAddModalOpen(false)
      // Refresh current page
      const estado = statusFilter === "all" ? undefined : statusFilter
      refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar el contrato.", type: "error" })
    }
  }

  const handleUpdateContract = async (id: number, updates: Partial<Contract>) => {
    try {
      await updateContract(id, updates)
      toast({ title: "¡Éxito!", description: "Contrato actualizado correctamente.", type: "success" })
      // Refresh current page
      const estado = statusFilter === "all" ? undefined : statusFilter
      refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el contrato.", type: "error" })
    }
  }

  const handleDeleteContract = async (id: number) => {
    try {
      await deleteContract(id)
      toast({ title: "¡Éxito!", description: "Contrato eliminado correctamente.", type: "success" })
      // Refresh current page
      const estado = statusFilter === "all" ? undefined : statusFilter
      refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el contrato.", type: "error" })
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
            contracts={contracts}
            clients={clients}
            memberships={memberships}
            isLoading={contractsLoading}
            onUpdateContract={handleUpdateContract}
            onDeleteContract={handleDeleteContract}
            pagination={{
              page,
              limit,
              total: contractsPagination.total,
              totalPages: contractsPagination.totalPages,
            }}
            onPageChange={handlePageChange}
            onAddNewContract={() => setIsAddModalOpen(true)}
          />
        </CardContent>
      </Card>

      <NewContractForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // Refresh current page after adding contract
          const estado = statusFilter === "all" ? undefined : statusFilter;
          refreshContracts({ page, limit, search: debouncedSearchTerm, estado });
        }}
      />
    </div>
  )
}

