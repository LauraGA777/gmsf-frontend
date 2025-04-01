"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  Eye,
  Edit,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Power,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ClientDetails } from "./ClientDetails"
import { EditClientModal } from "./EditClientModal"
import { RenewMembershipModal } from "./RenewMembershipModal"
import { useAuth } from "@/context/AuthContext"
import type { Client } from "@/types"
import Swal from "sweetalert2"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn, daysRemaining } from "@/lib/utils"

interface ClientsTableProps {
  clients: Client[]
  onUpdateClient: (updatedClient: Client) => void
  onAddClient?: (newClient: Omit<Client, "id">) => string
}

export function ClientsTable({ clients, onUpdateClient, onAddClient }: ClientsTableProps) {
  const { user } = useAuth()
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [membershipFilter, setMembershipFilter] = useState("")
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false)

  const clientsPerPage = 10

  // Filtrar clientes según el rol del usuario y los criterios de búsqueda
  useEffect(() => {
    let filtered = [...clients]

    // Si es cliente, solo mostrar su propio perfil
    if (user?.role === "client" && user.clientId) {
      filtered = filtered.filter((client) => client.id === user.clientId)
    }

    // Aplicar filtros de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (client) =>
          (client.firstName && client.firstName.toLowerCase().includes(term)) ||
          (client.lastName && client.lastName.toLowerCase().includes(term)) ||
          (client.name && client.name.toLowerCase().includes(term)) ||
          client.email.toLowerCase().includes(term) ||
          (client.documentNumber && client.documentNumber.toLowerCase().includes(term)) ||
          (client.phone && client.phone.toLowerCase().includes(term)) ||
          (client.codigo && client.codigo.toLowerCase().includes(term)),
      )
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter)
    }

    if (membershipFilter && membershipFilter !== "all") {
      filtered = filtered.filter((client) => client.membershipType === membershipFilter)
    }

    setFilteredClients(filtered)
    setCurrentPage(1) // Reset to first page on filter change
  }, [clients, user, searchTerm, statusFilter, membershipFilter])

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setIsViewModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleRenewMembership = (client: Client) => {
    setSelectedClient(client)
    setIsRenewModalOpen(true)
  }

  const handleToggleClientStatus = (client: Client) => {
    const newStatus = client.status === "Activo" ? "Inactivo" : "Activo"
    const action = newStatus === "Activo" ? "activar" : "desactivar"

    Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Deseas ${action} a este cliente? ${newStatus === "Inactivo" ? "Esto afectará sus contratos activos." : ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "Activo" ? "#10b981" : "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "Cancelar",
      timer: 15000,
      timerProgressBar: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedClient = {
          ...client,
          status: newStatus,
        }
        onUpdateClient(updatedClient)

        Swal.fire({
          title: `Cliente ${newStatus === "Activo" ? "activado" : "desactivado"}`,
          text: `El cliente ha sido ${newStatus === "Activo" ? "activado" : "desactivado"} exitosamente.`,
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  const handleSubmitRenewal = (updatedClient: Client) => {
    onUpdateClient(updatedClient)
    setIsRenewModalOpen(false)

    Swal.fire({
      title: "Membresía renovada",
      text: "La membresía ha sido renovada exitosamente.",
      icon: "success",
      confirmButtonColor: "#000",
      timer: 5000,
      timerProgressBar: true,
    })
  }

  const handleUpdateClient = (updates: Partial<Client>) => {
    if (selectedClient) {
      const updatedClient = {
        ...selectedClient,
        ...updates,
      }
      onUpdateClient(updatedClient)
      setIsEditModalOpen(false)
    }
  }

  const getPaginatedClients = () => {
    const startIndex = (currentPage - 1) * clientsPerPage
    const endIndex = startIndex + clientsPerPage
    return filteredClients.slice(startIndex, endIndex)
  }

  // Actualizar la función getClientStatus para usar los estados correctos de la base de datos
  const getClientStatus = (client: Client) => {
    if (client.status === "Inactivo") {
      return {
        label: "Inactivo",
        color: "bg-red-100 text-red-800",
        icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
      }
    }

    if (!client.membershipEndDate) {
      return {
        label: "Sin membresía",
        color: "bg-gray-100 text-gray-800",
        icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(client.membershipEndDate)
    endDate.setHours(0, 0, 0, 0)

    if (endDate < today) {
      return {
        label: "Vencido",
        color: "bg-gray-100 text-gray-800",
        icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
      }
    }

    const days = daysRemaining(client.membershipEndDate)

    if (days <= 7) {
      return {
        label: `Por vencer (${days} días)`,
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
      }
    }

    return {
      label: "Activo",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
    }
  }

  // Obtener membresías únicas para el filtro
  const uniqueMemberships = Array.from(new Set(clients.map((c) => c.membershipType).filter(Boolean)))

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setMembershipFilter("")
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <div className="text-sm text-gray-500">
          Mostrando {filteredClients.length} de {clients.length} clientes
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email, documento o teléfono"
            className="w-full h-9 pl-9"
            aria-label="Buscar clientes"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
          className="h-9 flex items-center gap-1"
          aria-expanded={isAdvancedFilterOpen}
          aria-controls="advanced-filters"
        >
          <Filter className="h-4 w-4" aria-hidden="true" />
          {isAdvancedFilterOpen ? "Ocultar filtros" : "Más filtros"}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={clearFilters}
          className="h-9"
          disabled={!searchTerm && !statusFilter && !membershipFilter}
        >
          Limpiar
        </Button>
      </div>

      <div
        id="advanced-filters"
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg",
          !isAdvancedFilterOpen && "hidden",
        )}
      >
        <div>
          <label htmlFor="status-filter" className="text-sm font-medium mb-1 block">
            Estado
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter" className="h-9">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="membership-filter" className="text-sm font-medium mb-1 block">
            Membresía
          </label>
          <Select value={membershipFilter} onValueChange={setMembershipFilter}>
            <SelectTrigger id="membership-filter" className="h-9">
              <SelectValue placeholder="Todas las membresías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las membresías</SelectItem>
              {uniqueMemberships.map(
                (membership) =>
                  membership && (
                    <SelectItem key={membership} value={membership}>
                      {membership}
                    </SelectItem>
                  ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mostrar filtros activos */}
      {(searchTerm || statusFilter || membershipFilter) && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Filtros activos:</span>
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
              Búsqueda: {searchTerm}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 p-0"
                onClick={() => setSearchTerm("")}
                aria-label="Eliminar filtro de búsqueda"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            </Badge>
          )}
          {statusFilter && statusFilter !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
              Estado: {statusFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 p-0"
                onClick={() => setStatusFilter("")}
                aria-label="Eliminar filtro de estado"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            </Badge>
          )}
          {membershipFilter && membershipFilter !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
              Membresía: {membershipFilter}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 p-0"
                onClick={() => setMembershipFilter("")}
                aria-label="Eliminar filtro de membresía"
              >
                <X className="h-3 w-3" aria-hidden="true" />
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
              <TableHead>NOMBRE</TableHead>
              <TableHead>DOCUMENTO</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>MEMBRESÍA</TableHead>
              <TableHead>ESTADO</TableHead>
              <TableHead className="text-right">ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedClients().length > 0 ? (
              getPaginatedClients().map((client) => {
                const status = getClientStatus(client)
                return (
                  <TableRow key={client.id} className="hover:bg-gray-50">
                    <TableCell>{client.id}</TableCell>
                    <TableCell>{client.codigo || `P${client.id.toString().padStart(4, "0")}`}</TableCell>
                    <TableCell className="font-medium">
                      {client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : client.name}
                    </TableCell>
                    <TableCell>
                      {client.documentType || "CC"} {client.documentNumber || ""}
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      {client.membershipType || "Sin membresía"}
                      {client.membershipEndDate && (
                        <div className="text-xs text-gray-500">
                          Vence: {format(new Date(client.membershipEndDate), "dd/MM/yyyy")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("flex items-center", status.color)}>
                        {status.icon}
                        <span>{status.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewClient(client)}
                          title="Ver detalles"
                          aria-label="Ver detalles del cliente"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClient(client)}
                          title="Editar cliente"
                          aria-label="Editar cliente"
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>

                        {client.status === "Activo" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRenewMembership(client)}
                            title="Renovar membresía"
                            aria-label="Renovar membresía"
                          >
                            <RefreshCw className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}

                        {user?.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleClientStatus(client)}
                            title={client.status === "Activo" ? "Desactivar cliente" : "Activar cliente"}
                            aria-label={client.status === "Activo" ? "Desactivar cliente" : "Activar cliente"}
                            className={
                              client.status === "Inactivo"
                                ? "text-green-600 hover:text-green-700"
                                : "text-red-600 hover:text-red-700"
                            }
                          >
                            <Power className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search className="h-8 w-8 mb-2 opacity-30" aria-hidden="true" />
                    <p className="text-lg font-medium">No se encontraron clientes</p>
                    <p className="text-sm">Intenta con otros criterios de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {filteredClients.length > clientsPerPage && (
        <div className="mt-4 flex flex-wrap items-center justify-between">
          <div className="text-sm text-gray-500 mb-2 md:mb-0">
            Mostrando {(currentPage - 1) * clientsPerPage + 1} -{" "}
            {Math.min(currentPage * clientsPerPage, filteredClients.length)} de {filteredClients.length} clientes
          </div>

          <nav className="flex space-x-1" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            {Array.from({ length: Math.min(5, Math.ceil(filteredClients.length / clientsPerPage)) }, (_, i) => {
              const pageNumber = i + 1
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(pageNumber)}
                  aria-label={`Página ${pageNumber}`}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </Button>
              )
            })}

            {Math.ceil(filteredClients.length / clientsPerPage) > 5 && (
              <>
                <span className="flex h-8 w-8 items-center justify-center text-sm">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(Math.ceil(filteredClients.length / clientsPerPage))}
                  aria-label={`Página ${Math.ceil(filteredClients.length / clientsPerPage)}`}
                >
                  {Math.ceil(filteredClients.length / clientsPerPage)}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage(Math.min(Math.ceil(filteredClients.length / clientsPerPage), currentPage + 1))
              }
              disabled={currentPage === Math.ceil(filteredClients.length / clientsPerPage)}
              aria-label="Página siguiente"
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      )}

      {/* Modal para ver detalles del cliente */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <VisuallyHidden>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </VisuallyHidden>
          {selectedClient && <ClientDetails client={selectedClient} onClose={() => setIsViewModalOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Modal para editar cliente */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-4xl">
          <VisuallyHidden>
            <DialogTitle>Editar Cliente</DialogTitle>
          </VisuallyHidden>
          {selectedClient && (
            <EditClientModal
              client={selectedClient}
              onUpdateClient={handleUpdateClient}
              onClose={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para renovar membresía */}
      <Dialog open={isRenewModalOpen} onOpenChange={setIsRenewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <VisuallyHidden>
            <DialogTitle>Renovar Membresía</DialogTitle>
          </VisuallyHidden>
          {selectedClient && <RenewMembershipModal client={selectedClient} onSubmit={handleSubmitRenewal} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

