import { useState } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import {
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Users
} from "lucide-react"
import { format } from "date-fns"
import { ClientDetails } from "./clientDetails"
import { EditClientModal, type UpdateClientFormValues } from "./editClientModal"
import { usePermissions } from "@/shared/hooks/usePermissions"
import { PERMISSIONS, PRIVILEGES } from "@/shared/services/permissionService"
import type { Client } from "@/shared/types/client";
import Swal from "sweetalert2"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { TableSkeleton } from "@/shared/components/ui/table-skeleton"
import { EmptyState } from "@/shared/components/ui/empty-state"

interface ClientsTableProps {
  clients: Client[]
  isLoading: boolean
  onUpdateClient: (id: number, updates: Partial<Client>) => Promise<void>
  onDeleteClient: (id: number) => void
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange: (page: number) => void;
  onAddNewClient?: () => void;
}

export function ClientsTable({ 
  clients, 
  isLoading,
  onUpdateClient,
  onDeleteClient,
  pagination,
  onPageChange,
  onAddNewClient,
}: ClientsTableProps) {
  const { hasPrivilege } = usePermissions()
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  // Verificar permisos específicos para cada acción
  const canViewDetails = hasPrivilege(PERMISSIONS.CLIENTES, PRIVILEGES.CLIENT_DETAILS)
  const canUpdateClient = hasPrivilege(PERMISSIONS.CLIENTES, PRIVILEGES.CLIENT_UPDATE)
  const canDeleteClient = hasPrivilege(PERMISSIONS.CLIENTES, PRIVILEGES.CLIENT_DELETE)
  const hasAnyAction = canViewDetails || canUpdateClient || canDeleteClient
  const columns = hasAnyAction ? 8 : 7;

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedClient(null)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedClient(null)
  }

  const handleUpdateClient = async (clientId: number, updates: UpdateClientFormValues) => {
    await onUpdateClient(clientId, updates as unknown as Partial<Client>)
    setIsEditModalOpen(false)
  }

  const handleDelete = (clientId: number) => {
    Swal.fire({
      title: `¿Estás seguro?`,
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteClient(clientId)
      }
    })
  }

  const getClientStatus = (client: Client) => {
    if (client.estado) {
      return {
        label: "Activo",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
      }
    }
    return {
      label: "Inactivo",
      color: "bg-red-100 text-red-800",
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
    }
  }

  if (isLoading) {
    return <TableSkeleton columns={columns} rows={5} />
  }

  if (clients.length === 0) {
    return (
      <EmptyState 
        Icon={Users}
        title="No se encontraron clientes"
        description="Parece que no hay clientes que coincidan con tu búsqueda."
        actionText={onAddNewClient ? "Crear Nuevo Cliente" : undefined}
        onAction={onAddNewClient}
      />
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente Titular</TableHead>
              <TableHead>Beneficiario</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Contratos</TableHead>
              <TableHead>Estado</TableHead>
              {hasAnyAction && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const status = getClientStatus(client)
              const beneficiaryInfo = client.beneficiarios && client.beneficiarios.length > 0
                ? client.beneficiarios[0].persona_beneficiaria?.usuario
                : client.usuario
              // Aseguramos el tipado correcto para contratos
              const activeContracts = (client.contratos as { estado: string }[] | undefined)?.filter((c) => c.estado === 'Activo').length || 0

              return (
                <TableRow key={client.id_persona} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{client.codigo}</TableCell>
                  <TableCell>
                    <div className="font-medium">{client.usuario?.nombre} {client.usuario?.apellido}</div>
                    <div className="text-xs text-gray-500">Titular</div>
                  </TableCell>
                  <TableCell>
                    {beneficiaryInfo?.nombre} {beneficiaryInfo?.apellido}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {client.usuario?.tipo_documento} {client.usuario?.numero_documento}
                    </div>
                    <div className="text-xs text-gray-500">
                      {client.usuario?.fecha_nacimiento
                        ? format(new Date(client.usuario.fecha_nacimiento), "dd/MM/yyyy")
                        : "Sin fecha"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{client.usuario?.correo}</div>
                    <div className="text-xs text-gray-500">{client.usuario?.telefono || "Sin teléfono"}</div>
                  </TableCell>
                  <TableCell>
                    {activeContracts > 0 ? (
                      <Badge className="bg-green-100 text-green-800">
                        {activeContracts} {activeContracts === 1 ? 'activo' : 'activos'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Sin contratos</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("flex items-center", status.color)}>
                      {status.icon}
                      <span>{status.label}</span>
                    </Badge>
                  </TableCell>
                  {hasAnyAction && (
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
                          {canViewDetails && (
                            <DropdownMenuItem onClick={() => handleViewClient(client)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                          )}
                          {canUpdateClient && (
                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canDeleteClient && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(client.id_persona)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
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

      {clients.length > 0 && (
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

      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
        />
      )}
      
      {selectedClient && selectedClient.usuario && isEditModalOpen && (
        <EditClientModal
          client={selectedClient as Client & { usuario: NonNullable<Client['usuario']> }}
          onUpdateClient={handleUpdateClient}
          onClose={handleCloseEditModal}
        />
      )}
    </>
  )
}
