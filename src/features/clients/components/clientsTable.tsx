import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import {
  Eye,
  Edit,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Power,
  Search,
  ChevronLeft,
  ChevronRight,
  Snowflake,
  AlertCircle,
  CreditCard,
  Users,
  UserPlus,
} from "lucide-react"
import { format } from "date-fns"
import { ClientDetails } from "./clientDetails"
import { EditClientModal } from "./editClientModal"
import { RenewMembershipModal } from "./renewMembershipModal"
import { useAuth } from "@/shared/contexts/authContext"
import type { Client } from "@/shared/types"
import Swal from "sweetalert2"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn, daysRemaining } from "@/shared/lib/utils"

interface ClientsTableProps {
  clients: Client[]
  onUpdateClient: (id: string, updates: Partial<Client>) => void
  onAddClient?: (newClient: Omit<Client, "id">) => string
}

export function ClientsTable({ clients, onUpdateClient, onAddClient }: ClientsTableProps) {
  const { user } = useAuth()
  const [displayedClients, setDisplayedClients] = useState<Client[]>([])
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  const clientsPerPage = 10

  // Filtrar clientes según el rol del usuario y los criterios de búsqueda
  useEffect(() => {
    let filtered = [...clients]

    // Si es cliente, solo mostrar su propio perfil
    if (user?.role === "CLIENTE" && user.clientId) {
      filtered = filtered.filter((client) => client.id === user.clientId)
    }

    // Aplicar filtro de búsqueda global
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((client) => {
        // Búsqueda por estado específico (verificar primero)
        if (
          (term === "activo" && client.status === "Activo") ||
          (term === "inactivo" && client.status === "Inactivo") ||
          (term === "congelado" && client.status === "Congelado") ||
          (term === "pendiente de pago" && client.status === "Pendiente de pago") ||
          (term === "vencido" && client.membershipEndDate && new Date(client.membershipEndDate) < new Date()) ||
          (term === "por vencer" &&
            client.membershipEndDate &&
            daysRemaining(client.membershipEndDate) <= 7 &&
            daysRemaining(client.membershipEndDate) > 0) ||
          (term === "sin membresía" && !client.membershipEndDate)
        ) {
          return true
        }

        // Buscar en todos los campos posibles
        return (
          // Información básica
          (client.codigo && client.codigo.toLowerCase().includes(term)) ||
          (client.name && client.name.toLowerCase().includes(term)) ||
          (client.firstName && client.firstName.toLowerCase().includes(term)) ||
          (client.lastName && client.lastName.toLowerCase().includes(term)) ||
          (client.documentType && client.documentType.toLowerCase().includes(term)) ||
          (client.documentNumber && client.documentNumber.toLowerCase().includes(term)) ||
          (client.email && client.email.toLowerCase().includes(term)) ||
          (client.phone && client.phone.toLowerCase().includes(term)) ||
          (client.address && client.address.toLowerCase().includes(term)) ||
          // Membresía
          (client.membershipType && client.membershipType.toLowerCase().includes(term)) ||
          (client.status && client.status.toLowerCase().includes(term)) ||
          // Beneficiario
          (client.beneficiaryName && client.beneficiaryName.toLowerCase().includes(term)) ||
          (client.beneficiaryRelation && client.beneficiaryRelation.toLowerCase().includes(term)) ||
          (client.beneficiaryDocumentNumber && client.beneficiaryDocumentNumber.toLowerCase().includes(term)) ||
          (client.beneficiaryEmail && client.beneficiaryEmail.toLowerCase().includes(term)) ||
          (client.beneficiaryPhone && client.beneficiaryPhone.toLowerCase().includes(term))
        )
      })
    }

    setDisplayedClients(filtered)
    setCurrentPage(1) // Reset to first page on filter change
  }, [clients, user, searchTerm])

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
    // Crear un array con los posibles estados
    const statusOptions = ["Activo", "Inactivo", "Congelado", "Pendiente de pago"]

    // Mostrar un diálogo para seleccionar el nuevo estado
    Swal.fire({
      title: "Cambiar estado del cliente",
      text: `Selecciona el nuevo estado para ${client.name}`,
      input: "select",
      inputOptions: {
        Activo: "Activo",
        Inactivo: "Inactivo",
        Congelado: "Congelado",
        "Pendiente de pago": "Pendiente de pago",
      },
      inputValue: client.status,
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Cambiar estado",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return "Debes seleccionar un estado"
        }
        if (value === client.status) {
          return "El cliente ya tiene este estado"
        }
        return null
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newStatus = result.value as "Activo" | "Inactivo" | "Congelado" | "Pendiente de pago"

        // Actualizar el cliente con el nuevo estado
        onUpdateClient(client.id, { status: newStatus });

        Swal.fire({
          title: `Estado actualizado`,
          text: `El cliente ahora está en estado: ${newStatus}`,
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  const handleSubmitRenewal = (clientId: string, updates: Partial<Client>) => {
    onUpdateClient(clientId, updates);
    
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

  const handleUpdateClient = (clientId: string, updates: Partial<Client>) => {
    if (selectedClient && clientId === selectedClient.id) {
      onUpdateClient(clientId, updates);
      setIsEditModalOpen(false);
    }
  }

  const handleViewBeneficiary = (client: Client) => {
    if (client.beneficiaryName) {
      Swal.fire({
        title: "Información del Beneficiario",
        html: `
          <div class="text-left p-3 bg-gray-50 rounded-lg mb-3 text-sm">
            <p class="mb-2"><strong>Nombre:</strong> ${client.beneficiaryName}</p>
            ${client.beneficiaryEmail ? `<p class="mb-2"><strong>Email:</strong> ${client.beneficiaryEmail}</p>` : ''}
            ${client.beneficiaryPhone ? `<p class="mb-2"><strong>Teléfono:</strong> ${client.beneficiaryPhone}</p>` : ''}
            ${client.beneficiaryDocumentNumber ? `<p class="mb-2"><strong>Documento:</strong> ${client.beneficiaryDocumentNumber}</p>` : ''}
            ${client.beneficiaryRelation ? `<p class="mb-2"><strong>Relación:</strong> ${client.beneficiaryRelation}</p>` : ''}
          </div>
        `,
        icon: "info",
        confirmButtonColor: "#000",
        confirmButtonText: "Cerrar",
        width: '500px'
      })
    } else {
      Swal.fire({
        title: "Sin beneficiario",
        text: "Este cliente no tiene beneficiario asignado.",
        icon: "info",
        confirmButtonColor: "#000",
        confirmButtonText: "Cerrar"
      })
    }
  }

  const handleEditBeneficiary = (client: Client) => {
    if (!client.beneficiaryName) {
      Swal.fire({
        title: "Sin beneficiario",
        text: "Este cliente no tiene beneficiario asignado. ¿Deseas editar el cliente principal?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#000",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Editar cliente",
        cancelButtonText: "Cancelar"
      }).then((result) => {
        if (result.isConfirmed) {
          handleEditClient(client)
        }
      })
      return
    }

    // Si tiene beneficiario, abrir modal para editar información del beneficiario
    handleEditClient(client)
  }

  const getPaginatedClients = () => {
    const startIndex = (currentPage - 1) * clientsPerPage
    const endIndex = startIndex + clientsPerPage
    return displayedClients.slice(startIndex, endIndex)
  }

  // Actualizar la función getClientStatus para incluir los nuevos estados
  const getClientStatus = (client: Client) => {
    // Primero verificamos el estado explícito del cliente
    switch (client.status) {
      case "Inactivo":
        return {
          label: "Inactivo",
          color: "bg-red-50 text-red-800 border-red-100",
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
        }
      case "Congelado":
        return {
          label: "Congelado",
          color: "bg-blue-50 text-blue-800 border-blue-100",
          icon: <Snowflake className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
        }
      case "Pendiente de pago":
        return {
          label: "Pendiente de pago",
          color: "bg-orange-50 text-orange-800 border-orange-100",
          icon: <CreditCard className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
        }
    }

    // Si el cliente está activo, verificamos el estado de su membresía
    if (!client.membershipEndDate) {
      return {
        label: "Sin membresía",
        color: "bg-gray-50 text-gray-800 border-gray-100",
        icon: <AlertCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(client.membershipEndDate)
    endDate.setHours(0, 0, 0, 0)

    if (endDate < today) {
      return {
        label: "Vencido",
        color: "bg-gray-50 text-gray-800 border-gray-100",
        icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
      }
    }

    const days = daysRemaining(client.membershipEndDate)

    if (days <= 7) {
      return {
        label: `Por vencer (${days} días)`,
        color: "bg-yellow-50 text-yellow-800 border-yellow-100",
        icon: <Clock className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
      }
    }

    return {
      label: "Activo",
      color: "bg-green-50 text-green-800 border-green-100",
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" aria-hidden="true" />,
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Personas</h2>
        <div className="text-sm text-gray-500">
          Mostrando {displayedClients.length} de {clients.length} clientes
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email, documento, membresía o estado"
            className="w-full h-9 pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button variant="default" size="sm" onClick={() => setSearchTerm("")} className="h-9" disabled={!searchTerm}>
          Limpiar
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CÓDIGO</TableHead>
              <TableHead>NOMBRE</TableHead>
              <TableHead>DOCUMENTO</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>MEMBRESÍA</TableHead>
              <TableHead>BENEFICIARIO</TableHead>
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
                    <TableCell>{client.codigo || `P${client.id.toString().padStart(4, "0")}`}</TableCell>
                    <TableCell className="font-medium">
                      <div>{client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : client.name}</div>
                      <div className="text-xs text-gray-500">
                        {client.phone && (
                          <span>📞 {client.phone}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.documentType || "CC"} {client.documentNumber || ""}</div>
                      <div className="text-xs text-gray-500">Documento</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.email}</div>
                      <div className="text-xs text-gray-500">Correo electrónico</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.membershipType || "Sin membresía"}</div>
                      {client.membershipEndDate && (
                        <div className="text-xs text-gray-500">
                          Vence: {format(new Date(client.membershipEndDate), "dd/MM/yyyy")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.beneficiaryName ? (
                        <div>
                          <div className="font-medium text-sm">{client.beneficiaryName}</div>
                          <div className="text-xs text-gray-500">
                            {client.beneficiaryRelation && <span>{client.beneficiaryRelation}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">Sin beneficiario</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                          status.color,
                        )}
                      >
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewClient(client)}
                          title="Ver detalles del cliente"
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

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewBeneficiary(client)}
                          title="Ver beneficiario"
                          aria-label="Ver información del beneficiario"
                        >
                          <Users className="h-4 w-4" aria-hidden="true" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditBeneficiary(client)}
                          title="Editar beneficiario"
                          aria-label="Editar información del beneficiario"
                        >
                          <UserPlus className="h-4 w-4" aria-hidden="true" />
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

                        {user?.role === "ADMIN" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleClientStatus(client)}
                            title="Cambiar estado"
                            aria-label="Cambiar estado del cliente"
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
                    <Search className="h-8 w-8 mb-2 opacity-30" />
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
      {displayedClients.length > clientsPerPage && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * clientsPerPage + 1} -{" "}
            {Math.min(currentPage * clientsPerPage, displayedClients.length)} de {displayedClients.length} clientes
          </div>

          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <VisuallyHidden>Anterior</VisuallyHidden>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>

            {Array.from({ length: Math.min(5, Math.ceil(displayedClients.length / clientsPerPage)) }, (_, i) => {
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

            {Math.ceil(displayedClients.length / clientsPerPage) > 5 && (
              <>
                <span className="flex h-8 w-8 items-center justify-center text-sm">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(Math.ceil(displayedClients.length / clientsPerPage))}
                  aria-label={`Página ${Math.ceil(displayedClients.length / clientsPerPage)}`}
                >
                  {Math.ceil(displayedClients.length / clientsPerPage)}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage(Math.min(Math.ceil(displayedClients.length / clientsPerPage), currentPage + 1))
              }
              disabled={currentPage === Math.ceil(displayedClients.length / clientsPerPage)}
              aria-label="Página siguiente"
            >
              <VisuallyHidden>Siguiente</VisuallyHidden>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del cliente */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-lg" aria-describedby="client-details-description">
          <VisuallyHidden>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription id="client-details-description">Información detallada del cliente seleccionado.</DialogDescription>
          </VisuallyHidden>
          {selectedClient && <ClientDetails client={selectedClient} onClose={() => setIsViewModalOpen(false)} />}
        </DialogContent>
      </Dialog>

      {/* Modal para editar cliente */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-4xl" aria-describedby="edit-client-description">
          <VisuallyHidden>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription id="edit-client-description">Modifique la información del cliente según sea necesario.</DialogDescription>
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
          {selectedClient && isRenewModalOpen && (
            <RenewMembershipModal
              client={selectedClient}
              onSubmit={handleSubmitRenewal}
              onClose={() => setIsRenewModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
