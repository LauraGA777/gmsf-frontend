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
  FileText
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
import { useToast } from "@/shared/components/ui/use-toast"
import { TableSkeleton } from "@/shared/components/ui/table-skeleton"
import { EmptyState } from "@/shared/components/ui/empty-state"

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
  onAddNewContract?: () => void
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
  onAddNewContract,
}: ContractsTableProps) {
  const { user } = useAuth()
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusChangeContract, setStatusChangeContract] = useState<Contract | null>(null)
  const { toast } = useToast()

  const isAdmin = useMemo(() => user?.role === "ADMIN", [user])
  const columns = isAdmin ? 8 : 7

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
  
  const handleUpdateContract = (updates: Partial<Contract>) => {
    if (editingContract) {
      onUpdateContract(editingContract.id, updates);
      setIsEditModalOpen(false);
      setEditingContract(null);
    }
  }

  const handleStatusUpdate = (updates: Partial<Contract>) => {
    if (statusChangeContract) {
      onUpdateContract(statusChangeContract.id, updates);
      setIsStatusModalOpen(false);
      setStatusChangeContract(null);
      toast({
        title: `Estado actualizado`,
        description: `El contrato ahora está en estado: ${updates.estado}`,
        type: "success",
      })
    }
  }

  if (isLoading) {
    return <TableSkeleton columns={columns} rows={pagination.limit} />;
  }

  if (!isLoading && contracts.length === 0) {
    return (
      <EmptyState
        Icon={FileText}
        title="No se encontraron contratos"
        description="Parece que no hay contratos que coincidan con tu búsqueda."
        actionText={onAddNewContract ? "Crear Nuevo Contrato" : undefined}
        onAction={onAddNewContract}
      />
    );
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
            {contracts.map(contract => {
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
              })}
          </TableBody>
        </Table>
      </div>

      {contracts.length > 0 && (
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
              onUpdateContract={handleUpdateContract}
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
              onUpdateContract={handleStatusUpdate}
              onClose={() => {
                setIsStatusModalOpen(false)
                setStatusChangeContract(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
