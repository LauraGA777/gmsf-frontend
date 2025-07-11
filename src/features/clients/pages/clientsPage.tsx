import { useState, useEffect, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Plus, 
  Search, 
  Users, 
  MoreHorizontal,
  RefreshCw,
  Edit,
  Eye,
  Trash2,
  Power,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { useGym } from "@/shared/contexts/gymContext";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { PERMISSIONS, PRIVILEGES } from "@/shared/services/permissionService";
import { NewClientForm, type CreateClientFormValues } from "@/features/clients/components/newClientForm";
import { EditClientModal, EditClientFormValues } from "@/features/clients/components/editClientModal";
import { ClientDetails } from "../components/clientDetails";
import type { Client, Contract } from "@/shared/types/client";
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useToast } from "@/shared/components/ui/use-toast";

type ClientWithContracts = Client & { contratos?: Contract[] };

export function ClientsPage() {
  const {
    clients,
    clientsLoading,
    refreshClients,
    updateClient,
    deleteClient: deleteClientFromContext,
    getClientContracts,
    createClient
  } = useGym();

  const { hasPrivilege } = usePermissions();
  
  const canViewClients = hasPrivilege(PERMISSIONS.CLIENTES, PRIVILEGES.CLIENT_READ);
  const canCreateClient = hasPrivilege(PERMISSIONS.CLIENTES, PRIVILEGES.CLIENT_CREATE);
  const canUpdateClient = hasPrivilege(PERMISSIONS.CLIENTES, PRIVILEGES.CLIENT_UPDATE);
  const canDeleteClient = hasPrivilege(PERMISSIONS.CLIENTES, PRIVILEGES.CLIENT_DELETE);
  const canViewDetails = hasPrivilege(PERMISSIONS.CLIENTES, PRIVILEGES.CLIENT_DETAILS);
  
  console.log("Client permissions:", {
    canViewClients,
    canCreateClient,
    canUpdateClient,
    canDeleteClient,
    canViewDetails
  });
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientWithContracts[]>([]);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasFilters, setHasFilters] = useState(false);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const memoizedRefreshClients = useCallback(() => {
    refreshClients();
  }, [refreshClients]);

  useEffect(() => {
    memoizedRefreshClients();
  }, [memoizedRefreshClients]);

  useEffect(() => {
    const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "all";
    setHasFilters(hasActiveFilters);
    
    if (hasActiveFilters) {
      setAllClients(clients);
    } else {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, clients]);

  useEffect(() => {
    const filterClients = () => {
      let dataToFilter = hasFilters ? allClients : clients;
      let filtered = [...dataToFilter];
  
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(client => 
          `${client.usuario?.nombre} ${client.usuario?.apellido}`.toLowerCase().includes(term) ||
          client.usuario?.correo?.toLowerCase().includes(term) ||
          client.usuario?.numero_documento?.toLowerCase().includes(term) ||
          client.codigo?.toLowerCase().includes(term)
        );
      }
  
      if (statusFilter !== "all") {
        filtered = filtered.filter(client => (client.estado ? "Activo" : "Inactivo") === statusFilter);
      }
  
      const clientsWithContracts: ClientWithContracts[] = filtered.map(client => ({
        ...client,
        contratos: getClientContracts(client.id_persona)
      }));
  
      setFilteredClients(clientsWithContracts);
      
      if (hasFilters) {
        setTotalPages(Math.ceil(clientsWithContracts.length / itemsPerPage));
      } else {
        setTotalPages(Math.ceil(clients.length / itemsPerPage));
      }
    };
    filterClients();
  }, [clients, allClients, searchTerm, statusFilter, hasFilters, getClientContracts]);

  const getStatusBadge = (estado: boolean) => {
    return estado ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
    );
  };

  const handleViewDetails = (client: Client) => {
    console.log("handleViewDetails called with client:", client);
    setSelectedClient(client);
    setIsDetailsOpen(true);
    console.log("Details modal should be open. isDetailsOpen:", true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditClientOpen(true);
  };

  const handleUpdateClient = async (clientId: number, updates: EditClientFormValues) => {
    try {
      await updateClient(clientId, updates);
      setEditingClient(null);
      setIsEditClientOpen(false);
      
      toast({
        title: '¡Éxito!',
        description: 'Cliente actualizado correctamente',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar el cliente.', variant: 'destructive' });
    }
  };

  const handleToggleClientStatus = async (client: Client) => {
    const result = await Swal.fire({
      title: client.estado ? "¿Desactivar cliente?" : "¿Activar cliente?",
      text: client.estado 
        ? `¿Está seguro que desea desactivar a ${client.usuario?.nombre} ${client.usuario?.apellido}?`
        : `¿Está seguro que desea activar a ${client.usuario?.nombre} ${client.usuario?.apellido}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6B7280",
      confirmButtonText: client.estado ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await updateClient(client.id_persona, {
          estado: !client.estado
        });

        toast({
          title: '¡Éxito!',
          description: `Cliente ${client.estado ? 'desactivado' : 'activado'} correctamente`,
          variant: 'default',
        });
      } catch (error) {
        console.error('Error updating client status:', error);
        toast({
          title: 'Error',
          description: 'Error al actualizar el estado del cliente',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteClient = async (client: Client) => {
    const result = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: `¿Está seguro que desea eliminar a ${client.usuario?.nombre} ${client.usuario?.apellido}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await deleteClientFromContext(client.id_persona);
        await refreshClients();
        
        toast({
          title: '¡Éxito!',
          description: 'Cliente eliminado correctamente',
          variant: 'default',
        });
      } catch (error) {
        console.error('Error deleting client:', error);
        toast({ title: 'Error', description: 'No se pudo eliminar el cliente.', variant: 'destructive' });
      }
    }
  };

  const handleCreateClient = async (data: CreateClientFormValues) => {
    try {
      await createClient(data);
    } catch (error) {
      console.error("Error al crear cliente desde la página", error);
      // El toast de error ya se muestra en NewClientForm, pero podemos agregar uno genérico si es necesario.
    }
  };

  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* if (clients.length === 0 && !clientsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes registrados</h3>
            <p className="text-gray-500 mb-4">Comience agregando el primer cliente al sistema</p>
            {canCreateClient && (
              <Button onClick={() => setIsNewClientOpen(true)} className="bg-black hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } */

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-600">Gestión de clientes del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refreshClients()} disabled={clientsLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${clientsLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {canCreateClient && (
            <Button onClick={() => setIsNewClientOpen(true)} className="bg-black hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
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
                  placeholder="Buscar por nombre, documento, código..."
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
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
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
                  {(canViewDetails || canUpdateClient || canDeleteClient) && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron clientes</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => {
                    const beneficiaryInfo = client.beneficiarios && client.beneficiarios.length > 0
                      ? client.beneficiarios[0].persona_beneficiaria?.usuario
                      : client.usuario
                    const activeContracts = client.contratos?.filter((c: Contract) => c.estado === 'Activo').length || 0

                    return (
                      <TableRow key={client.id_persona}>
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
                          {getStatusBadge(client.estado)}
                        </TableCell>
                        <TableCell className="text-right">
                          {(canViewDetails || canUpdateClient || canDeleteClient) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canViewDetails && (
                                <DropdownMenuItem onClick={() => {
                                  console.log("Ver detalles clicked for client:", client.id_persona);
                                  handleViewDetails(client);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver detalles
                                </DropdownMenuItem>
                              )}
                              {canUpdateClient && (
                                <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {canUpdateClient && (
                                <DropdownMenuItem onClick={() => handleToggleClientStatus(client)}>
                                  {client.estado ? (
                                    <Power className="w-4 h-4 mr-2" />
                                  ) : (
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                  )}
                                  {client.estado ? "Desactivar" : "Activar"}
                                </DropdownMenuItem>
                              )}
                              {canDeleteClient && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClient(client)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1 || clientsLoading}
          >
            Anterior
          </Button>
          <span className="py-2 px-3 text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || clientsLoading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <>
          {console.log("Rendering ClientDetails with:", { selectedClient, isDetailsOpen })}
          <ClientDetails
            client={selectedClient}
            isOpen={isDetailsOpen}
            onClose={() => {
              console.log("Closing details modal");
              setIsDetailsOpen(false);
            }}
          />
        </>
      )}

      {/* New Client Modal */}
      <NewClientForm
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onCreateClient={handleCreateClient}
        onSuccess={refreshClients}
      />

      {/* Edit Client Modal */}
      {editingClient && isEditClientOpen && (
        <EditClientModal
          client={editingClient as Client & { usuario: NonNullable<Client['usuario']>}}
          onClose={() => {
            setEditingClient(null)
            setIsEditClientOpen(false)
          }}
          onUpdateClient={handleUpdateClient}
        />
      )}
    </div>
  );
}

