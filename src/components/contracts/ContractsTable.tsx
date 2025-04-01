"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Eye,
  RefreshCw,
  Ban,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Power,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { NewContractForm } from "./NewContractForm"
import { ContractDetails } from "./ContractDetails"
import { useAuth } from "@/context/AuthContext"
import type { Contract, Client, Membership } from "@/types"
import Swal from "sweetalert2"
import { formatCOP } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { EditContractModal } from "./EditContractModal"
import { DialogTitle } from "@/components/ui/dialog"
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

    // Aplicar filtros de búsqueda
    if (filters.cliente) {
      const searchTerm = filters.cliente.toLowerCase()
      filtered = filtered.filter((contract) => {
        // Buscar por nombre del cliente
        if (contract.cliente_nombre?.toLowerCase().includes(searchTerm)) {
          return true
        }

        // Buscar por código del contrato
        if (contract.codigo && contract.codigo.toLowerCase().includes(searchTerm)) {
          return true
        }

        // Buscar por documento del cliente
        if (contract.cliente_documento && contract.cliente_documento.toLowerCase().includes(searchTerm)) {
          return true
        }

        return false
      })
    }

    if (filters.membresia && filters.membresia !== "all") {
      filtered = filtered.filter(
        (contract) =>
          contract.id_membresia.toString() === filters.membresia || contract.membresia_nombre === filters.membresia,
      )
    }

    if (filters.estado && filters.estado !== "all") {
      filtered = filtered.filter((contract) => contract.estado === filters.estado)
    }

    if (filters.fechaRange.from && filters.fechaRange.to) {
      const fromDate = new Date(filters.fechaRange.from)
      const toDate = new Date(filters.fechaRange.to)

      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(23, 59, 59, 999)

      filtered = filtered.filter((contract) => {
        const startDate = new Date(contract.fecha_inicio)
        return startDate >= fromDate && startDate <= toDate
      })
    }

    setFilteredContracts(filtered)
    setCurrentPage(1) // Reset to first page on filter change
  }, [contracts, user, filters, clients])

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract)
    setIsViewModalOpen(true)
  }

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract)
    setIsEditModalOpen(true)
  }

  const handleToggleContractStatus = (contract: Contract) => {
    const newStatus = contract.estado === "Activo" ? "Cancelado" : "Activo"
    const action = newStatus === "Activo" ? "activar" : "cancelar"

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${action} este contrato? ${newStatus === "Cancelado" ? "Esta acción afectará el estado del cliente." : ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "Activo" ? "#10b981" : "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "No, mantener como está",
      timer: 15000,
      timerProgressBar: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onUpdateContract(contract.id, { estado: newStatus })

        Swal.fire({
          title: `Contrato ${newStatus === "Activo" ? "activado" : "cancelado"}`,
          text: `El contrato ha sido ${newStatus === "Activo" ? "activado" : "cancelado"} exitosamente.`,
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
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
          cliente_documento: contract.cliente_documento,
          cliente_documento_tipo: contract.cliente_documento_tipo,
        }

        onAddContract(newContract)

        Swal.fire({
          title: "Contrato renovado",
          text: "El contrato ha sido renovado exitosamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  const getPaginatedContracts = () => {
    const startIndex = (currentPage - 1) * contractsPerPage
    const endIndex = startIndex + contractsPerPage
    return filteredContracts.slice(startIndex, endIndex)
  }

  // Actualizar la función getContractStatus para usar los estados correctos
  const getContractStatus = (contract: Contract) => {
    if (contract.estado === "Cancelado") {
      return {
        label: "Cancelado",
        color: "bg-red-100 text-red-800",
        icon: <Ban className="h-3.5 w-3.5 mr-1" />,
      }
    }

    if (contract.estado === "Vencido") {
      return {
        label: "Vencido",
        color: "bg-gray-100 text-gray-800",
        icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
      }
    }

    if (contract.estado === "Por vencer") {
      return {
        label: "Por vencer",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-3.5 w-3.5 mr-1" />,
      }
    }

    return {
      label: "Activo",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
    }
  }

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
      fechaRange: { from: null, to: null },
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
              <DialogContent className="sm:max-w-5xl h-auto overflow-visible">
                <VisuallyHidden>
                  <DialogTitle>Nuevo Contrato</DialogTitle>
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
            placeholder="Buscar por nombre del cliente o código"
            className="w-full h-9 pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
          className="h-9 flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          {isAdvancedFilterOpen ? "Ocultar filtros" : "Más filtros"}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={clearFilters}
          className="h-9"
          disabled={
            !filters.cliente &&
            filters.membresia === "" &&
            filters.estado === "" &&
            !filters.fechaRange.from &&
            !filters.fechaRange.to
          }
        >
          Limpiar
        </Button>
      </div>

      {isAdvancedFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-1 block">Membresía</label>
            <Select value={filters.membresia} onValueChange={(value) => handleFilterChange("membresia", value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todas las membresías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las membresías</SelectItem>
                {uniqueMemberships.map((membership) => (
                  <SelectItem key={membership} value={membership}>
                    {membership}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Estado</label>
            {/* Actualizar el filtro de estado */}
            <Select value={filters.estado} onValueChange={(value) => handleFilterChange("estado", value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Por vencer">Por vencer</SelectItem>
                <SelectItem value="Vencido">Vencido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Rango de fechas</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                    {filters.fechaRange.from ? (
                      format(filters.fechaRange.from, "dd/MM/yyyy")
                    ) : (
                      <span>Fecha inicial</span>
                    )}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.fechaRange.from || undefined}
                    onSelect={(date) => handleDateRangeChange({ ...filters.fechaRange, from: date })}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                    {filters.fechaRange.to ? format(filters.fechaRange.to, "dd/MM/yyyy") : <span>Fecha final</span>}
                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.fechaRange.to || undefined}
                    onSelect={(date) => handleDateRangeChange({ ...filters.fechaRange, to: date })}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar filtros activos */}
      {(filters.cliente ||
        filters.membresia !== "" ||
        filters.estado !== "" ||
        filters.fechaRange.from ||
        filters.fechaRange.to) && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {filters.cliente && (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                Cliente: {filters.cliente}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => handleFilterChange("cliente", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.membresia && filters.membresia !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                Membresía: {filters.membresia}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => handleFilterChange("membresia", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.estado && filters.estado !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                Estado: {filters.estado}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => handleFilterChange("estado", "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {(filters.fechaRange.from || filters.fechaRange.to) && (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                Fechas: {filters.fechaRange.from ? format(filters.fechaRange.from, "dd/MM/yyyy") : "Inicio"} -
                {filters.fechaRange.to ? format(filters.fechaRange.to, "dd/MM/yyyy") : "Fin"}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => handleFilterChange("fechaRange", { from: null, to: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
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
                    <TableCell>{contract.id.toString().padStart(4, "0")}</TableCell>
                    <TableCell>{contract.codigo || `C${contract.id.toString().padStart(4, "0")}`}</TableCell>
                    <TableCell className="font-medium">{contract.cliente_nombre}</TableCell>
                    <TableCell>
                      <div>{contract.membresia_nombre}</div>
                      <div className="text-xs text-gray-500">{formatCOP(contract.membresia_precio || 0)}</div>
                    </TableCell>
                    <TableCell>{format(new Date(contract.fecha_inicio), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{format(new Date(contract.fecha_fin), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge className={`flex items-center ${status.color}`}>
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
                            title={contract.estado === "Activo" ? "Cancelar contrato" : "Activar contrato"}
                            className={
                              contract.estado === "Cancelado"
                                ? "text-green-600 hover:text-green-700"
                                : "text-red-600 hover:text-red-700"
                            }
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
        <DialogContent className="sm:max-w-lg">
          <VisuallyHidden>
            <DialogTitle>Detalles del Contrato</DialogTitle>
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
        <DialogContent className="sm:max-w-lg">
          <VisuallyHidden>
            <DialogTitle>Editar Contrato</DialogTitle>
          </VisuallyHidden>
          {editingContract && (
            <EditContractModal
              contract={editingContract}
              memberships={memberships}
              onUpdateContract={(updatedData) => {
                handleUpdateContract(editingContract.id, updatedData)
                setIsEditModalOpen(false)
              }}
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

