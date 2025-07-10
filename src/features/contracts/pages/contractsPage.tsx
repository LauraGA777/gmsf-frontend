import { useState, useEffect } from "react"
import { useDebounce } from "@/shared/hooks/useDebounce"
import { usePermissions } from "@/shared/hooks/usePermissions"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Plus, Search, RefreshCw, FileSignature, MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react"
import { useGym } from "@/shared/contexts/gymContext"
import type { Contract } from "@/shared/types"
import { NewContractForm } from "@/features/contracts/components/newContractForm"
import { ContractDetails } from "@/features/contracts/components/contractDetails"
import { EditContractModal } from "@/features/contracts/components/editContractModal"
import { ChangeStatusModal } from "@/features/contracts/components/ChangeStatusModal"
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
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
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

  const { hasModuleAccess, hasPrivilege } = usePermissions()
  
  // Permisos específicos para contratos
  const canViewContracts = hasModuleAccess("CONTRATOS")
  const canCreateContract = hasPrivilege("CONTRATOS", "CONTRACT_CREATE")
  const canUpdateContract = hasPrivilege("CONTRATOS", "CONTRACT_UPDATE")
  const canDeleteContract = hasPrivilege("CONTRATOS", "CONTRACT_DELETE")
  const canViewDetails = hasPrivilege("CONTRATOS", "CONTRACT_DETAILS")

  const { toast } = useToast()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const limit = 10

  // Estados para modales
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusChangeContract, setStatusChangeContract] = useState<Contract | null>(null)

  useEffect(() => {
    if (canViewContracts) {
      const estado = statusFilter === "all" ? undefined : statusFilter
      refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
    }
  }, [page, debouncedSearchTerm, statusFilter, refreshContracts, canViewContracts])

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= contractsPagination.totalPages) {
      setPage(newPage)
    }
  }

  const handleAddContract = async (newContract: Omit<Contract, "id">) => {
    if (!canCreateContract) {
      toast({ 
        title: "Sin permisos", 
        description: "No tienes permisos para crear contratos.", 
        variant: "destructive" 
      })
      return
    }

    try {
      await createContract(newContract)
      toast({ title: "¡Éxito!", description: "Contrato agregado correctamente." })
      setIsAddModalOpen(false)
      const estado = statusFilter === "all" ? undefined : statusFilter
      refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar el contrato.", variant: "destructive" })
    }
  }

  const handleViewContract = (contract: Contract) => {
    if (!canViewDetails) {
      toast({ 
        title: "Sin permisos", 
        description: "No tienes permisos para ver detalles de contratos.", 
        variant: "destructive" 
      })
      return
    }
    setSelectedContract(contract)
    setIsViewModalOpen(true)
  }

  const handleEditContract = (contract: Contract) => {
    if (!canUpdateContract) {
      toast({ 
        title: "Sin permisos", 
        description: "No tienes permisos para editar contratos.", 
        variant: "destructive" 
      })
      return
    }
    setEditingContract(contract)
    setIsEditModalOpen(true)
  }

  const handleToggleContractStatus = (contract: Contract) => {
    if (!canUpdateContract) {
      toast({ 
        title: "Sin permisos", 
        description: "No tienes permisos para cambiar estado de contratos.", 
        variant: "destructive" 
      })
      return
    }
    setStatusChangeContract(contract)
    setIsStatusModalOpen(true)
  }

  const handleUpdateContract = async (contractId: number, updates: Partial<Contract>) => {
    try {
      await updateContract(contractId, updates)
      toast({ title: "¡Éxito!", description: "Contrato actualizado correctamente." })
      const estado = statusFilter === "all" ? undefined : statusFilter
      refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo actualizar el contrato.", variant: "destructive" })
    }
  }

  const handleDeleteContract = async (contract: Contract) => {
    if (!canDeleteContract) {
      toast({ 
        title: "Sin permisos", 
        description: "No tienes permisos para eliminar contratos.", 
        variant: "destructive" 
      })
      return
    }

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
        toast({ title: "¡Éxito!", description: "Contrato eliminado correctamente." })
        const estado = statusFilter === "all" ? undefined : statusFilter
        refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
      } catch (error) {
        toast({ title: "Error", description: "No se pudo eliminar el contrato.", variant: "destructive" })
      }
    }
  }

  const getClientName = (personaId: number) => {
    const client = clients.find(c => c.id_persona === personaId)
    if (!client) return "Cliente no encontrado"
    return `${client.usuario?.nombre || ''} ${client.usuario?.apellido || ''}`.trim()
  }

  const getClientDocument = (personaId: number) => {
    const client = clients.find(c => c.id_persona === personaId)
    if (!client || !client.usuario) return ""
    return `${client.usuario.tipo_documento || ''} ${client.usuario.numero_documento || ''}`.trim()
  }

  const getMembershipName = (membershipId: number) => {
    const contractWithMembership = contracts.find(c => c.id_membresia === membershipId && c.membresia)
    return contractWithMembership?.membresia?.nombre || "Membresía no encontrada"
  }

  const getMembershipPrice = (membershipId: number): number => {
    const contractWithPrice = contracts.find(c => c.id_membresia === membershipId && c.membresia_precio)
    return contractWithPrice ? parseFloat(String(contractWithPrice.membresia_precio)) : 0
  }

  const getStatusBadge = (estado: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
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

  // 🚫 Pantalla de acceso denegado
  if (!canViewContracts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileSignature className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Acceso Denegado</h3>
            <p className="text-red-600 mb-4">No tienes permisos para ver los contratos del sistema.</p>
            <p className="text-sm text-gray-500">Contacta al administrador si necesitas acceso.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* // Estado vacío
  if (contracts.length === 0 && !contractsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FileSignature className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contratos registrados</h3>
            <p className="text-gray-500 mb-4">Comience agregando el primer contrato al sistema</p>
            {canCreateContract && (
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-black hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Contrato
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } */

  // DEBUG: Log de datos para identificar problemas
  console.log('🔍 DEBUG - Contracts Page:')
  console.log('Contracts:', contracts.length)
  console.log('Memberships:', memberships.length)
  console.log('Clients:', clients.length)
  console.log('Sample contract:', contracts[0])
  console.log('Sample membership:', memberships[0])

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
          {canCreateContract && (
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-black hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contrato
            </Button>
          )}
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
                        <div className="font-medium">{getClientName(contract.id_persona)}</div>
                        <div className="text-xs text-gray-500">{getClientDocument(contract.id_persona)}</div>
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
                        {formatCOP(getMembershipPrice(contract.id_membresia))}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract.estado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(canViewDetails || canUpdateContract || canDeleteContract) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canViewDetails && (
                                <DropdownMenuItem onClick={() => handleViewContract(contract)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalles
                                </DropdownMenuItem>
                              )}
                              {canUpdateContract && (
                                <DropdownMenuItem onClick={() => handleEditContract(contract)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {canUpdateContract && (
                                <DropdownMenuItem onClick={() => handleToggleContractStatus(contract)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Cambiar estado
                                </DropdownMenuItem>
                              )}
                              {canDeleteContract && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteContract(contract)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin acciones</span>
                        )}
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
      {canCreateContract && (
        <NewContractForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            const estado = statusFilter === "all" ? undefined : statusFilter
            refreshContracts({ page, limit, search: debouncedSearchTerm, estado })
          }}
        />
      )}

      {/* Modal para ver detalles */}
      {selectedContract && (
        <ContractDetails
          contract={selectedContract}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedContract(null)
          }}
        />
      )}

      {/* Modal para editar contrato */}
      {editingContract && (
        <Dialog open={isEditModalOpen} onOpenChange={() => {
          setIsEditModalOpen(false)
          setEditingContract(null)
        }}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>
              <VisuallyHidden>Editar Contrato</VisuallyHidden>
            </DialogTitle>
            <EditContractModal
              contract={editingContract}
              memberships={memberships}
              onUpdateContract={(updates) => {
                handleUpdateContract(editingContract.id, updates)
                setIsEditModalOpen(false)
                setEditingContract(null)
              }}
              onClose={() => {
                setIsEditModalOpen(false)
                setEditingContract(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Modal para cambiar estado */}
      {statusChangeContract && (
        <Dialog open={isStatusModalOpen} onOpenChange={() => {
          setIsStatusModalOpen(false)
          setStatusChangeContract(null)
        }}>
          <DialogContent>
            <ChangeStatusModal
              contract={statusChangeContract}
              onUpdateContract={(updates) => {
                handleUpdateContract(statusChangeContract.id, updates)
                setIsStatusModalOpen(false)
                setStatusChangeContract(null)
              }}
              onClose={() => {
                setIsStatusModalOpen(false)
                setStatusChangeContract(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

