import { useState, useEffect } from "react"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Plus, Search, RefreshCw, FileSignature, MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react"
import { useGym } from "@/shared/contexts/gymContext"
import type { Contract, Client, Membership } from "@/shared/types"
import { NewContractForm } from "@/features/contracts/components/newContractForm"
import { useToast } from "@/shared/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Swal from "sweetalert2"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { formatCOP } from "@/shared/lib/formatCop"

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
  const limit = 10

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

  const handleDeleteContract = async (contract: Contract) => {
    const result = await Swal.fire({
      title: "¿Eliminar contrato?",
      text: `¿Está seguro que desea eliminar el contrato ${contract.codigo}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    })

    if (result.isConfirmed) {
      try {
        await deleteContract(contract.id)
        toast({ title: "¡Éxito!", description: "Contrato eliminado correctamente.", type: "success" })
        // Refresh current page
        const estado = statusFilter === "all" ? undefined : statusFilter
        refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
      } catch (error) {
        toast({ title: "Error", description: "No se pudo eliminar el contrato.", type: "error" })
      }
    }
  }

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id_persona === clientId)
    if (!client) return "Cliente no encontrado"
    return `${client.usuario?.nombre} ${client.usuario?.apellido}`
  }

  const getClientDocument = (clientId: number) => {
    const client = clients.find(c => c.id_persona === clientId)
    if (!client) return ""
    return `${client.usuario?.tipo_documento} ${client.usuario?.numero_documento}`
  }

  const getMembershipName = (membershipId: number) => {
    const membership = memberships.find(m => m.id === membershipId)
    return membership?.nombre || "Membresía no encontrada"
  }

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      'Activo': { color: 'bg-green-100 text-green-800', label: 'Activo' },
      'Por vencer': { color: 'bg-yellow-100 text-yellow-800', label: 'Por vencer' },
      'Vencido': { color: 'bg-red-100 text-red-800', label: 'Vencido' },
      'Cancelado': { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' },
      'Congelado': { color: 'bg-blue-100 text-blue-800', label: 'Congelado' },
    }

    const config = statusConfig[estado] || statusConfig['Activo']
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  if (contracts.length === 0 && !contractsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileSignature className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contratos registrados</h3>
            <p className="text-gray-500 mb-4">Comience agregando el primer contrato al sistema</p>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Contrato
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-gray-600">Gestión de contratos del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              const estado = statusFilter === "all" ? undefined : statusFilter
              refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
            }} 
            disabled={contractsLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${contractsLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-black hover:bg-gray-800">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
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
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Por vencer">Por vencer</SelectItem>
                <SelectItem value="Vencido">Vencidos</SelectItem>
                <SelectItem value="Cancelado">Cancelados</SelectItem>
                <SelectItem value="Congelado">Congelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Lista de Contratos ({contractsPagination.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contractsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Membresía</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileSignature className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron contratos</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.codigo}</TableCell>
                      <TableCell>
                        <div className="font-medium">{getClientName(contract.id_cliente)}</div>
                        <div className="text-xs text-gray-500">{getClientDocument(contract.id_cliente)}</div>
                      </TableCell>
                      <TableCell>{getMembershipName(contract.id_membresia)}</TableCell>
                      <TableCell>
                        {contract.fecha_inicio 
                          ? format(new Date(contract.fecha_inicio), "dd/MM/yyyy", { locale: es })
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {contract.fecha_fin 
                          ? format(new Date(contract.fecha_fin), "dd/MM/yyyy", { locale: es })
                          : "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCOP(contract.precio)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract.estado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('Ver detalles', contract)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Editar', contract)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteContract(contract)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {contractsPagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || contractsLoading}
          >
            Anterior
          </Button>
          <span className="py-2 px-3 text-sm">
            Página {page} de {contractsPagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === contractsPagination.totalPages || contractsLoading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* New Contract Modal */}
      <NewContractForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          const estado = statusFilter === "all" ? undefined : statusFilter;
          refreshContracts({ page, limit, search: debouncedSearchTerm, estado });
        }}
      />
    </div>
  )
}

