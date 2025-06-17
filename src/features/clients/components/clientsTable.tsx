import { useState, useEffect, useMemo } from "react"
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
  Trash2
} from "lucide-react"
import { format } from "date-fns"
import { ClientDetails } from "./clientDetails"
import { EditClientModal } from "./editClientModal"
import { RenewMembershipModal } from "./renewMembershipModal"
import { useAuth } from "@/shared/contexts/authContext"
import type { Client } from "@/shared/types/client"
import Swal from "sweetalert2"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn, daysRemaining } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import { NewClientForm } from "./newClientForm"

interface ClientsTableProps {
  clients: Client[]
  isLoading: boolean
  onUpdateClient: (id: number, updates: Partial<Client>) => Promise<void>
  onDeleteClient: (id: number) => Promise<void>
  onAddClient: () => void
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onSearch: (term: string) => void
}

export function ClientsTable({ 
  clients, 
  isLoading,
  onUpdateClient,
  onDeleteClient,
  onAddClient,
  pagination,
  onPageChange,
  onSearch,
}: ClientsTableProps) {
  const { user } = useAuth()
  const [displayedClients, setDisplayedClients] = useState<Client[]>([])
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  const clientsPerPage = 10

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user])

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm)
    }, 500) // Debounce search
    return () => clearTimeout(handler)
  }, [searchTerm, onSearch])

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

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedClient(null);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClient(null);
  };

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

  const handleUpdateClient = async (clientId: number, updates: Partial<Client>) => {
    await onUpdateClient(clientId, updates);
    setIsEditModalOpen(false);
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

  const handleDeleteClient = async (client: Client) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar a ${client.usuario?.nombre}?`,
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteClient(client.id_persona);
      }
    });
  };

  const handleNewClient = () => {
    setIsNewModalOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
        {isAdmin && (
          <Button onClick={handleNewClient} className="bg-black hover:bg-gray-800">
            <UserPlus className="h-4 w-4 mr-2" />
            Crear Cliente
          </Button>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo, documento..."
            className="w-full h-9 pl-9"
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <Button variant="default" size="sm" onClick={() => setSearchTerm("")} className="h-9" disabled={!searchTerm || isLoading}>
          Limpiar
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Beneficiarios</TableHead>
              <TableHead>Estado</TableHead>
              {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : clients.length > 0 ? (
              getPaginatedClients().map((client) => {
                const status = getClientStatus(client)
                return (
                  <TableRow key={client.id_persona} className="hover:bg-gray-50">
                    <TableCell>{client.codigo}</TableCell>
                    <TableCell className="font-medium">
                      {client.usuario?.nombre} {client.usuario?.apellido}
                    </TableCell>
                    <TableCell>
                      {client.usuario?.tipo_documento} {client.usuario?.numero_documento}
                    </TableCell>
                    <TableCell>{client.usuario?.correo}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{client.beneficiarios?.length || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(status.color, "text-white")}>{status.label}</Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewClient(client)} title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditClient(client)} title="Editar cliente">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClient(client)} title="Eliminar cliente" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8">
                  <p className="text-lg font-medium">No se encontraron clientes</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Página {pagination.page} de {pagination.totalPages}. Total: {pagination.total} clientes.
        </div>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={handleCloseViewModal}>
        <DialogContent className="sm:max-w-2xl">
          {selectedClient && <ClientDetails client={selectedClient} onClose={handleCloseViewModal} />}
        </DialogContent>
      </Dialog>
      
      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
          {selectedClient && (
            <EditClientModal
              client={selectedClient}
              onUpdateClient={handleUpdateClient}
              onClose={handleCloseEditModal}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* New Client Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <NewClientForm
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSuccess={() => {
            onAddClient();
            setIsNewModalOpen(false);
          }}
        />
      </Dialog>
    </>
  )
}
