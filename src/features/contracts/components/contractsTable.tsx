import { useState, useMemo } from "react"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/shared/components/ui/dialog"
import {
  Plus,
  Eye,
  Ban,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Power,
  Snowflake,
  CreditCard,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { NewContractForm } from "./newContractForm"
import { ContractDetails } from "@/features/contracts/components/contractDetails"
import { useAuth } from "@/shared/contexts/authContext"
import type { Contract, Client, Membership } from "@/shared/types"
import Swal from "sweetalert2"
import { formatCOP, cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { EditContractModal } from "./editContractModal"
import { ChangeStatusModal } from "./ChangeStatusModal"
import { DialogTitle } from "@/shared/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

interface ContractsTableProps {
  contracts: Contract[]
  memberships: Membership[]
  clients: Client[]
  isLoading: boolean
  onUpdateContract: (id: number, updates: Partial<Contract>) => void
  onDeleteContract: (id: number) => void
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange: (page: number) => void
}

export function ContractsTable({
  contracts = [],
  memberships = [],
  clients = [],
  isLoading,
  onUpdateContract,
  onDeleteContract,
  pagination,
  onPageChange,
}: ContractsTableProps) {
  const { user } = useAuth()
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusChangeContract, setStatusChangeContract] = useState<Contract | null>(null)

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user])

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract)
    setIsViewModalOpen(true)
  }

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract)
    setIsEditModalOpen(true)
  }

  const handleToggleContractStatus = (contract: Contract) => {
    setStatusChangeContract(contract)
    setIsStatusModalOpen(true)
  }

  const handleDeleteContract = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas eliminar este contrato? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(result => {
      if (result.isConfirmed) {
        onDeleteContract(id)
      }
    })
  }

  const getContractStatus = (contract: Contract) => {
    switch (contract.estado) {
      case "Cancelado":
        return {
          label: "Cancelado",
          color: "bg-red-100 text-red-800",
          icon: <Ban className="h-3.5 w-3.5 mr-1" />,
        }
      case "Vencido":
        return {
          label: "Vencido",
          color: "bg-gray-100 text-gray-800",
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
        }
      case "Por vencer":
        return {
          label: "Por vencer",
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
        }
      case "Congelado":
        return {
          label: "Congelado",
          color: "bg-blue-100 text-blue-800",
          icon: <Snowflake className="h-3.5 w-3.5 mr-1" />,
        }
      default:
        return {
          label: "Activo",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
        }
    }
  }
  
  const handleUpdateContract = (id: number, updates: Partial<Contract>) => {
    onUpdateContract(id, updates);
    setIsEditModalOpen(false);
  }

  const handleStatusUpdate = (id: number, updates: Partial<Contract>) => {
    onUpdateContract(id, updates);
    Swal.fire({
      title: `Estado actualizado`,
      text: `El contrato ahora está en estado: ${updates.estado}`,
      icon: "success",
      confirmButtonColor: "#000",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    })
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
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
              {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : contracts.length > 0 ? (
              contracts.map(contract => {
                const status = getContractStatus(contract)
                const client = clients.find(c => c.id_persona === contract.id_persona)
                const membership = memberships.find(
                  m => String(m.id) === String(contract.id_membresia)
                )
                return (
                  <TableRow key={contract.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {contract.codigo || `C${String(contract.id).padStart(4, "0")}`}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {client?.usuario?.nombre} {client?.usuario?.apellido}
                      </div>
                      <div className="text-xs text-gray-500">
                        {client?.usuario?.tipo_documento || "CC"} {client?.usuario?.numero_documento || ""}
                      </div>
                    </TableCell>
                    <TableCell>{membership?.nombre}</TableCell>
                    <TableCell>{format(new Date(contract.fecha_inicio), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{format(new Date(contract.fecha_fin), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{formatCOP(contract.membresia_precio || 0)}</TableCell>
                    <TableCell>
                      <Badge className={cn("flex items-center", status.color)}>
                        {status.icon}
                        <span>{status.label}</span>
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewContract(contract)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditContract(contract)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleContractStatus(contract)}>
                              <Power className="mr-2 h-4 w-4" />
                              Cambiar estado
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteContract(contract.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8">
                  <p className="text-lg font-medium">No se encontraron contratos</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Página {pagination.page} de {pagination.totalPages}. Total: {pagination.total} contratos.
        </div>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Modal para ver detalles del contrato */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <VisuallyHidden>
            <DialogTitle>Detalles del Contrato</DialogTitle>
            <DialogDescription>
              Información detallada del contrato seleccionado.
            </DialogDescription>
          </VisuallyHidden>
          {selectedContract && (
            <ContractDetails
              contract={selectedContract}
              onClose={() => setIsViewModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para editar membresía del contrato */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-3xl" aria-describedby="edit-contract-description">
          <VisuallyHidden>
            <DialogTitle>Editar Contrato</DialogTitle>
            <DialogDescription id="edit-contract-description">
              Modifique la información del contrato según sea necesario.
            </DialogDescription>
          </VisuallyHidden>
          {editingContract && (
            <EditContractModal
              contract={editingContract}
              memberships={memberships}
              onUpdateContract={(updatedData) => {
                handleUpdateContract(editingContract.id, updatedData)
              }}
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal para cambiar estado del contrato */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          {statusChangeContract && (
            <ChangeStatusModal
              contract={statusChangeContract}
              onUpdateContract={(updatedData) => {
                handleStatusUpdate(statusChangeContract.id, updatedData)
              }}
              onClose={() => setIsStatusModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
