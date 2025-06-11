import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  DollarSign,
  MoreHorizontal,
  RefreshCw,
  FileText,
  Pause,
  RotateCcw,
  Ban,
  Eye,
  Users,
  FileSignature,
  Edit
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useGym } from "@/shared/contexts/gymContext"
import { NewContractForm } from "@/features/contracts/components/newContractForm"
import type { Contract, Membership } from "@/shared/types"
import Swal from "sweetalert2"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Label } from "@/components/ui/label"
import { EditContractModal } from "@/features/contracts/components/editContractModal"
import { ContractDetails } from "@/features/contracts/components/contractDetails"

export function ContractsPage() {
  const {
    contracts,
    contractsLoading,
    refreshContracts,
    updateContract,
    deleteContract,
    getContractClient,
    navigateToContractClient,
    memberships,
  } = useGym();

  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [isNewContractOpen, setIsNewContractOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    filterContracts()
  }, [contracts, searchTerm, statusFilter])

  const filterContracts = () => {
    let filtered = [...contracts]

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(contract => 
        contract.codigo.toLowerCase().includes(term) ||
        contract.persona?.usuario?.nombre?.toLowerCase().includes(term) ||
        contract.persona?.usuario?.apellido?.toLowerCase().includes(term) ||
        contract.membresia?.nombre?.toLowerCase().includes(term) ||
        contract.persona?.usuario?.numero_documento?.toLowerCase().includes(term)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(contract => contract.estado === statusFilter)
    }

    setFilteredContracts(filtered)
  }

  const getStatusBadge = (estado: Contract['estado']) => {
    const statusConfig = {
      'Activo': { color: 'bg-green-100 text-green-800', label: 'Activo' },
      'Congelado': { color: 'bg-blue-100 text-blue-800', label: 'Congelado' },
      'Vencido': { color: 'bg-red-100 text-red-800', label: 'Vencido' },
      'Cancelado': { color: 'bg-gray-100 text-gray-800', label: 'Cancelado' },
      'Por vencer': { color: 'bg-yellow-100 text-yellow-800', label: 'Por vencer' },
    }

    const config = statusConfig[estado] || statusConfig['Activo']
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract)
    setIsDetailsOpen(true)
  }

  const handleEditContract = (contract: Contract) => {
    setContractToEdit(contract)
    setIsEditModalOpen(true)
  }

  const handleViewClient = (contract: Contract) => {
    navigateToContractClient(contract.id)
  }

  const handleCancelContract = async (contract: Contract) => {
    try {
      const result = await Swal.fire({
        title: '¿Está seguro de cancelar el contrato?',
        text: `Esta acción cambiará el estado del contrato ${contract.codigo} a "Cancelado".`,
        icon: 'warning',
        input: 'textarea',
        inputLabel: 'Motivo de la cancelación',
        inputPlaceholder: 'Escriba el motivo...',
        inputValidator: (value) => {
          if (!value) {
            return 'Debe proporcionar un motivo'
          }
        },
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, mantener contrato',
        stopKeydownPropagation: false
      });
  
      if (result.isConfirmed) {
        if (result.value) {
          await updateContract(contract.id, { estado: 'Cancelado', motivo: result.value });
          Swal.fire('Cancelado', 'El contrato ha sido cancelado.', 'success');
          refreshContracts();
        }
      }
    } catch (error) {
      console.error('Error canceling contract:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cancelar el contrato.',
        icon: 'error',
        stopKeydownPropagation: false,
        timer: 5000,
        timerProgressBar: true
      })
    }
  }

  const ContractActionsMenu = ({ contract }: { contract: Contract }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleViewDetails(contract)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditContract(contract)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleCancelContract(contract)}
          className="text-red-600"
        >
          <Ban className="mr-2 h-4 w-4" />
          Cancelar Contrato
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contratos</h1>
          <p className="text-gray-600">Gestión de contratos de membresías</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshContracts}
            disabled={contractsLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${contractsLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => setIsNewContractOpen(true)}
            className="bg-black hover:bg-gray-800"
          >
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Congelado">Congelado</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
                <SelectItem value="Por vencer">Por vencer</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
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
            Lista de Contratos ({filteredContracts.length})
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
                {filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron contratos</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.codigo}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {contract.persona?.usuario?.nombre} {contract.persona?.usuario?.apellido}
                          </span>
                          <span className="text-sm text-gray-500">
                            {contract.persona?.codigo} - {contract.persona?.usuario?.numero_documento}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {contract.membresia?.nombre}
                          </span>
                          <span className="text-sm text-gray-500">
                            {contract.membresia?.codigo} - {contract.membresia?.vigencia_dias} días
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(contract.fecha_inicio, "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {format(contract.fecha_fin, "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ${contract.membresia_precio.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(contract.estado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ContractActionsMenu contract={contract} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* New Contract Modal */}
      <NewContractForm
        isOpen={isNewContractOpen}
        onClose={() => setIsNewContractOpen(false)}
        onSuccess={refreshContracts}
      />

      {/* Contract Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Detalles del Contrato
            </DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <ContractDetails contract={selectedContract} onClose={() => setIsDetailsOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Contract Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent 
          onPointerDownOutside={(e) => {
            if ((e.target as HTMLElement)?.closest('.swal2-container')) {
                e.preventDefault();
            }
          }}
          className="sm:max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Edit className="h-6 w-6" />
              Editar Contrato
            </DialogTitle>
            <DialogDescription>
              Modifique la membresía, fecha de inicio o estado. Los demás campos se calculan automáticamente.
            </DialogDescription>
          </DialogHeader>
          {contractToEdit && (
            <EditContractModal
              contract={contractToEdit}
              memberships={memberships}
              onUpdateContract={async (updatedData) => {
                try {
                  await updateContract(contractToEdit.id, updatedData)
                  Swal.fire("Guardado", "Los cambios han sido guardados.", "success")
                  setIsEditModalOpen(false)
                  refreshContracts()
                } catch (error) {
                  console.error("Error al actualizar el contrato:", error);
                  Swal.fire({
                    title: "Error",
                    text: "No se pudieron guardar los cambios. Intente de nuevo.",
                    icon: "error",
                    stopKeydownPropagation: false,
                    timer: 5000,
                    timerProgressBar: true
                  })
                }
              }}
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

