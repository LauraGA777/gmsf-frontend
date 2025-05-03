import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/table"
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/shared/components/dialog"
import {
  Plus,
  Search,
  Eye,
  RefreshCw,
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
} from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { NewContractForm } from "./NewContractForm"
import { ContractDetails } from "@/features/contracts/components/ContractDetails"
import { useAuth } from "@/shared/contexts/AuthContext"
import type { Contract, Client, Membership } from "@/shared/types"
import Swal from "sweetalert2"
import { formatCOP } from "@/shared/utils/utils"
import { Badge } from "@/shared/components/badge"
import { EditContractModal } from "./EditContractModal"
import { DialogTitle } from "@/shared/components/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface ContractsTableProps {
  contracts: Contract[]
  memberships: Membership[]
  clients: Client[]
  onAddContract: (contract: Omit<Contract, "id">) => void
  onUpdateContract: (id: number, updates: Partial<Contract>) => void
  onDeleteContract: (id: number) => void
  onAddClient: (client: Omit<Client, "id">) => string
}

interface ContractFilters {
  cliente: string
  membresia: string
  estado: string
  fechaRange: DateRange | undefined
}

export function ContractsTable({
  contracts,
  memberships,
  clients,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  onAddClient,
}: ContractsTableProps) {
  const { user } = useAuth()
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ContractFilters>({
    cliente: "",
    membresia: "",
    estado: "",
    fechaRange: { from: undefined, to: undefined },
  })
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)
  // Actualizar los estados de contrato para que coincidan con la base de datos
  const [statusFilter, setStatusFilter] = useState<string>("")

  const contractsPerPage = 10

  // Filtrar contratos según el rol del usuario y los criterios de búsqueda
  useEffect(() => {
    let filtered = [...contracts]

    // Si es cliente, solo mostrar sus contratos
    if (user?.role === "client" && user.clientId) {
      filtered = filtered.filter((contract) => contract.id_cliente.toString() === user.clientId)
    }

    // Aplicar filtro de búsqueda global
    if (filters.cliente) {
      const searchTerm = filters.cliente.toLowerCase()
      filtered = filtered.filter((contract) => {
        // Buscar en todos los campos posibles
        return (
          // Código y cliente
          (contract.codigo && contract.codigo.toLowerCase().includes(searchTerm)) ||
          (contract.cliente_nombre && contract.cliente_nombre.toLowerCase().includes(searchTerm)) ||
          (contract.cliente_documento && contract.cliente_documento.toLowerCase().includes(searchTerm)) ||
          // Membresía
          (contract.membresia_nombre && contract.membresia_nombre.toLowerCase().includes(searchTerm)) ||
          // Estado (búsqueda exacta para estados)
          (contract.estado && contract.estado.toLowerCase().includes(searchTerm)) ||
          // Fechas
          format(new Date(contract.fecha_inicio), "dd/MM/yyyy").includes(searchTerm) ||
          format(new Date(contract.fecha_fin), "dd/MM/yyyy").includes(searchTerm) ||
          // Precio
          (contract.membresia_precio !== undefined && contract.membresia_precio.toString().includes(searchTerm))
        )
      })
    }

    // Aplicar filtro por estado si está seleccionado
    if (filters.estado) {
      filtered = filtered.filter((contract) => contract.estado === filters.estado)
    }

    // Aplicar filtro por membresía si está seleccionado
    if (filters.membresia) {
      filtered = filtered.filter((contract) => contract.membresia_nombre === filters.membresia)
    }

    // Aplicar filtro por rango de fechas si está seleccionado
    if (filters.fechaRange && filters.fechaRange.from) {
      const fromDate = filters.fechaRange.from
      const toDate = filters.fechaRange.to || fromDate
      
      filtered = filtered.filter((contract) => {
        const contractStartDate = new Date(contract.fecha_inicio)
        return contractStartDate >= fromDate && contractStartDate <= toDate
      })
    }

    // Ordenar contratos por número de código (ordenamiento numérico)
    filtered.sort((a, b) => {
      const codeA = a.codigo ? parseInt(a.codigo.replace('C', '')) : a.id;
      const codeB = b.codigo ? parseInt(b.codigo.replace('C', '')) : b.id;
      return codeA - codeB;
    });

    setFilteredContracts(filtered)
    setCurrentPage(1) // Reset to first page on filter change
  }, [contracts, user, filters])

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract)
    setIsViewModalOpen(true)
  }

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract)
    setIsEditModalOpen(true)
  }

  const handleToggleContractStatus = (contract: Contract) => {
    // Crear un array con los posibles estados
    const statusOptions = ["Activo", "Cancelado", "Vencido", "Por vencer", "Congelado", "Pendiente de pago"]

    // Mostrar un diálogo para seleccionar el nuevo estado
    Swal.fire({
      title: "Cambiar estado del contrato",
      text: `Selecciona el nuevo estado para el contrato ${contract.codigo || contract.id}`,
      input: "select",
      inputOptions: {
        Activo: "Activo",
        Cancelado: "Cancelado",
        Vencido: "Vencido",
        "Por vencer": "Por vencer",
        Congelado: "Congelado",
        "Pendiente de pago": "Pendiente de pago",
      },
      inputValue: contract.estado,
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Cambiar estado",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return "Debes seleccionar un estado"
        }
        if (value === contract.estado) {
          return "El contrato ya tiene este estado"
        }
        return null
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newStatus = result.value as
          | "Activo"
          | "Cancelado"
          | "Vencido"
          | "Por vencer"
          | "Congelado"
          | "Pendiente de pago"

        // Actualizar el contrato con el nuevo estado
        onUpdateContract(contract.id, { estado: newStatus })

        // La actualización del estado del cliente ahora se maneja directamente 
        // en el componente contenedor (src/components/contracts/routes/index.tsx)
        // para mantener sincronizados los estados

        // Mostrar mensaje de éxito
        Swal.fire({
          title: `Estado actualizado`,
          text: `El contrato ahora está en estado: ${newStatus}`,
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        })
      }
    })
  }

  const handleDeleteContract = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas eliminar este contrato? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      timer: 15000, // Longer timer for confirmation dialogs
      timerProgressBar: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteContract(id)

        Swal.fire({
          title: "Contrato eliminado",
          text: "El contrato ha sido eliminado exitosamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        })
      }
    })
  }

  const handleRenewContract = (contract: Contract) => {
    // Encontrar la membresía correspondiente
    const membership = memberships.find((m) => m.id === contract.id_membresia)

    if (!membership) {
      Swal.fire({
        title: "Error",
        text: "No se encontró la membresía asociada a este contrato.",
        icon: "error",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      })
      return
    }

    // Calcular nueva fecha de fin basada en la duración de la membresía
    const newStartDate = new Date(contract.fecha_fin)
    const newEndDate = new Date(newStartDate)
    newEndDate.setDate(newEndDate.getDate() + membership.duracion_dias)

    Swal.fire({
      title: "Renovar contrato",
      html: `
      <div class="text-left p-3 bg-gray-50 rounded-lg mb-3 text-sm">
        <p class="mb-2">¿Deseas renovar este contrato por ${membership.duracion_dias} días más?</p>
        <p class="mb-1"><strong>Membresía:</strong> ${membership.nombre}</p>
        <p class="mb-1"><strong>Precio:</strong> ${formatCOP(membership.precio)}</p>
        <p class="mb-1"><strong>Nueva fecha de inicio:</strong> ${format(newStartDate, "dd/MM/yyyy")}</p>
        <p><strong>Nueva fecha de fin:</strong> ${format(newEndDate, "dd/MM/yyyy")}</p>
      </div>
    `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, renovar",
      cancelButtonText: "Cancelar",
      timer: 15000, // Longer timer for confirmation dialogs
      timerProgressBar: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Crear un nuevo contrato como renovación
        const newContract: Omit<Contract, "id"> = {
          id_cliente: contract.id_cliente,
          id_membresia: contract.id_membresia,
          fecha_inicio: newStartDate,
          fecha_fin: newEndDate,
          estado: "Activo",
          cliente_nombre: contract.cliente_nombre,
          membresia_nombre: contract.membresia_nombre,
          membresia_precio: contract.membresia_precio,
          precio_total: contract.membresia_precio || membership.precio,
          cliente_documento: contract.cliente_documento,
          cliente_documento_tipo: contract.cliente_documento_tipo,
          fecha_registro: new Date(),
        }

        // Añadir el nuevo contrato
        onAddContract(newContract)

        // Mostrar mensaje de éxito
        Swal.fire({
          title: "Contrato renovado",
          text: "El contrato ha sido renovado exitosamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        })
      }
    })
  }

  const getPaginatedContracts = () => {
    const startIndex = (currentPage - 1) * contractsPerPage
    const endIndex = startIndex + contractsPerPage
    // Los contratos ya vienen ordenados del useEffect
    return filteredContracts.slice(startIndex, endIndex)
  }

  // Actualizar la función getContractStatus para incluir los nuevos estados
  const getContractStatus = (contract: Contract) => {
    switch (contract.estado) {
      case "Cancelado":
        return {
          label: "Cancelado",
          color: "bg-red-50 text-red-800 border-red-100",
          icon: <Ban className="h-3.5 w-3.5 mr-1" />,
        }
      case "Vencido":
        return {
          label: "Vencido",
          color: "bg-gray-50 text-gray-800 border-gray-100",
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
        }
      case "Por vencer":
        return {
          label: "Por vencer",
          color: "bg-yellow-50 text-yellow-800 border-yellow-100",
          icon: <Clock className="h-3.5 w-3.5 mr-1" />,
        }
      case "Congelado":
        return {
          label: "Congelado",
          color: "bg-blue-50 text-blue-800 border-blue-100",
          icon: <Snowflake className="h-3.5 w-3.5 mr-1" />,
        }
      case "Pendiente de pago":
        return {
          label: "Pendiente de pago",
          color: "bg-orange-50 text-orange-800 border-orange-100",
          icon: <CreditCard className="h-3.5 w-3.5 mr-1" />,
        }
      default:
        return {
          label: "Activo",
          color: "bg-green-50 text-green-800 border-green-100",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
        }
    }
  }

  // Simplificar la función handleFilterChange
  const handleFilterChange = (key: keyof ContractFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleDateRangeChange = (range: DateRange) => {
    setFilters((prev) => ({ ...prev, fechaRange: range }))
  }

  const clearFilters = () => {
    setFilters({
      cliente: "",
      membresia: "",
      estado: "",
      fechaRange: { from: undefined, to: undefined },
    })
  }

  const handleUpdateContract = (id: number, updates: Partial<Contract>) => {
    onUpdateContract(id, updates)
  }

  // Obtener membresías únicas para el filtro
  const uniqueMemberships = Array.from(new Set(memberships.map((m) => m.nombre)))

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contratos de Membresía</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Mostrando {filteredContracts.length} de {contracts.length} contratos
          </div>
          {user?.role === "admin" && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-black hover:bg-gray-800" size="sm">
                  <Plus className="h-4 w-4" />
                  Nuevo Contrato
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-5xl h-auto overflow-visible" aria-describedby="new-contract-description">
                <VisuallyHidden>
                  <DialogTitle>Nuevo Contrato</DialogTitle>
                  <DialogDescription id="new-contract-description">Complete el formulario para crear un nuevo contrato.</DialogDescription>
                </VisuallyHidden>
                <NewContractForm
                  clients={clients}
                  memberships={memberships}
                  onAddClient={onAddClient}
                  onAddContract={onAddContract}
                  onClose={() => setIsAddModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={filters.cliente}
            onChange={(e) => handleFilterChange("cliente", e.target.value)}
            placeholder="Buscar en todos los campos (cliente, código, membresía, fechas, estado...)"
            className="w-full h-9 pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => handleFilterChange("cliente", "")}
          className="h-9"
          disabled={!filters.cliente}
        >
          Limpiar
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CÓDIGO</TableHead>
              <TableHead>CLIENTE</TableHead>
              <TableHead>MEMBRESÍA</TableHead>
              <TableHead>INICIO</TableHead>
              <TableHead>FIN</TableHead>
              <TableHead>ESTADO</TableHead>
              <TableHead className="text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedContracts().length > 0 ? (
              getPaginatedContracts().map((contract) => {
                const status = getContractStatus(contract)
                return (
                  <TableRow key={contract.id} className="hover:bg-gray-50">
                    <TableCell>{contract.codigo || `C${contract.id.toString().padStart(4, "0")}`}</TableCell>
                    <TableCell className="font-medium">{contract.cliente_nombre}</TableCell>
                    <TableCell>
                      <div>{contract.membresia_nombre}</div>
                      <div className="text-xs text-gray-500">{formatCOP(contract.membresia_precio || 0)}</div>
                    </TableCell>
                    <TableCell>{format(new Date(contract.fecha_inicio), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{format(new Date(contract.fecha_fin), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={`flex items-center ${status.color}`} style={{ pointerEvents: "none" }}>
                        {status.icon}
                        <span>{status.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewContract(contract)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditContract(contract)}
                          title="Editar membresía"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {contract.estado === "Activo" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRenewContract(contract)}
                            title="Renovar contrato"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}

                        {user?.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleContractStatus(contract)}
                            title="Cambiar estado"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron contratos</p>
                    <p className="text-sm">Intenta con otros criterios de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {filteredContracts.length > contractsPerPage && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * contractsPerPage + 1} -{" "}
            {Math.min(currentPage * contractsPerPage, filteredContracts.length)} de {filteredContracts.length} contratos
          </div>

          <nav className="flex space-x-1" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, Math.ceil(filteredContracts.length / contractsPerPage)) }, (_, i) => {
              const pageNumber = i + 1
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}

            {Math.ceil(filteredContracts.length / contractsPerPage) > 5 && (
              <>
                <span className="flex h-8 w-8 items-center justify-center text-sm">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(Math.ceil(filteredContracts.length / contractsPerPage))}
                >
                  {Math.ceil(filteredContracts.length / contractsPerPage)}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage(Math.min(Math.ceil(filteredContracts.length / contractsPerPage), currentPage + 1))
              }
              disabled={currentPage === Math.ceil(filteredContracts.length / contractsPerPage)}
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}

      {/* Modal para ver detalles del contrato */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-lg" aria-describedby="contract-details-description">
          <VisuallyHidden>
            <DialogTitle>Detalles del Contrato</DialogTitle>
            <DialogDescription id="contract-details-description">Información detallada del contrato seleccionado.</DialogDescription>
          </VisuallyHidden>
          {selectedContract && (
            <ContractDetails
              contract={selectedContract}
              memberships={memberships}
              clients={clients}
              onClose={() => setIsViewModalOpen(false)}
              onRenew={handleRenewContract}
              onCancel={(id) => handleToggleContractStatus(selectedContract)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para editar membresía del contrato */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg" aria-describedby="edit-contract-description">
          <VisuallyHidden>
            <DialogTitle>Editar Contrato</DialogTitle>
            <DialogDescription id="edit-contract-description">Modifique la información del contrato según sea necesario.</DialogDescription>
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
    </>
  )
}
