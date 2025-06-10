import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  User, 
  Phone,
  Mail,
  MoreHorizontal,
  RefreshCw,
  UserPlus,
  Edit,
  Eye,
  Trash2,
  UserCheck,
  FileText,
  CreditCard,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useGym } from "@/shared/contexts/gymContext";
import { NewClientForm } from "@/features/clients/components/newClientForm";
import type { Client, UIClient } from "@/shared/types";
import { mapDbClientToUiClient } from "@/shared/types";
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

export function ClientsPage() {
  const {
    clients,
    clientsLoading,
    refreshClients,
    updateClient,
    deleteClient,
    getClientContracts,
    createContractForClient,
    memberships,
    navigateToClientContracts
  } = useGym();

  const [filteredClients, setFilteredClients] = useState<UIClient[]>([]);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewBeneficiaryOpen, setIsNewBeneficiaryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);


  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, statusFilter]);

  const filterClients = () => {
    try {
      // Map clients to UI format
      const mappedClients = clients.map(client => {
        try {
          return mapDbClientToUiClient(client);
        } catch (err) {
          console.warn('Error mapping client:', client, err);
          return null;
        }
      }).filter(Boolean) as UIClient[];

      let filtered = [...mappedClients];

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(client => 
          client.name.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term) ||
          client.documentNumber.toLowerCase().includes(term) ||
          client.codigo.toLowerCase().includes(term) ||
          client.phone?.toLowerCase().includes(term) ||
          client.beneficiaryName?.toLowerCase().includes(term) ||
          client.beneficiaryDocumentNumber?.toLowerCase().includes(term)
        );
      }

      // Filter by status
      if (statusFilter !== "all") {
        filtered = filtered.filter(client => client.status === statusFilter);
      }

      setFilteredClients(filtered);
    } catch (error) {
      console.error('Error filtering clients:', error);
      setFilteredClients([]);
    }
  };

  const getStatusBadge = (estado: UIClient['status']) => {
    const statusConfig = {
      'Activo': { color: 'bg-green-100 text-green-800', label: 'Activo' },
      'Inactivo': { color: 'bg-gray-100 text-gray-800', label: 'Inactivo' },
      'Congelado': { color: 'bg-blue-100 text-blue-800', label: 'Congelado' },
      'Pendiente de pago': { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente de pago' },
    };

    const config = statusConfig[estado] || statusConfig['Activo'];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const handleViewDetails = (clientUI: UIClient) => {
    const dbClient = clients.find(c => c.id_persona.toString() === clientUI.id);
    if (dbClient) {
      setSelectedClient(dbClient);
      setIsDetailsOpen(true);
    }
  };

  const handleEditClient = (clientUI: UIClient) => {
    const dbClient = clients.find(c => c.id_persona.toString() === clientUI.id);
    if (dbClient) {
      setEditingClient(dbClient);
      setIsNewClientOpen(true);
    }
  };



  const handleViewContracts = (clientUI: UIClient) => {
    const dbClient = clients.find(c => c.id_persona.toString() === clientUI.id);
    if (dbClient) {
      navigateToClientContracts(dbClient.id_persona);
    }
  };

  const handleToggleClientStatus = async (clientUI: UIClient) => {
    const dbClient = clients.find(c => c.id_persona.toString() === clientUI.id);
    if (!dbClient) return;

    try {
      const result = await Swal.fire({
        title: 'Cambiar estado del cliente',
        text: `¿Está seguro de ${dbClient.estado ? 'desactivar' : 'activar'} a ${clientUI.name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#6b7280',
        confirmButtonText: dbClient.estado ? 'Desactivar' : 'Activar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        await updateClient(dbClient.id_persona, {
          estado: !dbClient.estado
        });

        Swal.fire({
          title: '¡Éxito!',
          text: `Cliente ${dbClient.estado ? 'desactivado' : 'activado'} correctamente`,
          icon: 'success',
          confirmButtonColor: '#000',
        });
      }
    } catch (error) {
      console.error('Error updating client status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar el estado del cliente',
        icon: 'error',
        confirmButtonColor: '#000',
      });
    }
  };

  const handleDeleteClient = async (clientUI: UIClient) => {
    const dbClient = clients.find(c => c.id_persona.toString() === clientUI.id);
    if (!dbClient) return;

    try {
      await deleteClient(dbClient.id_persona);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };



  const ClientActionsMenu = ({ client }: { client: UIClient }) => {

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleViewDetails(client)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEditClient(client)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleToggleClientStatus(client)}>
            <UserCheck className="mr-2 h-4 w-4" />
            {client.status === 'Activo' ? 'Desactivar' : 'Activar'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDeleteClient(client)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-gray-600">Gestión de clientes y beneficiarios</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshClients}
            disabled={clientsLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${clientsLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsNewBeneficiaryOpen(true)}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Beneficiario
          </Button>
          <Button
            onClick={() => setIsNewClientOpen(true)}
            className="bg-black hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
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
                  placeholder="Buscar por nombre, email, documento o código..."
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
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Congelado">Congelado</SelectItem>
                <SelectItem value="Pendiente de pago">Pendiente de pago</SelectItem>
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Contratos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron clientes</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => {
                    const dbClient = clients.find(c => c.id_persona.toString() === client.id);
                    const clientContracts = dbClient ? getClientContracts(dbClient.id_persona) : [];
                    const activeContracts = clientContracts.filter(c => c.estado === 'Activo');
                    
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">
                          {client.codigo}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {client.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {client.firstName && client.lastName ? `${client.firstName} ${client.lastName}` : client.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {client.documentType} {client.documentNumber}
                            </span>
                            <span className="text-sm text-gray-500">
                              {client.birthDate ? format(client.birthDate, "dd/MM/yyyy", { locale: es }) : 'Sin fecha'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </span>
                            {client.phone && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {clientContracts.length > 0 ? (
                            <div className="flex flex-col">
                              <Badge 
                                className={activeContracts.length > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {activeContracts.length} activos
                              </Badge>
                              <span className="text-xs text-gray-500 mt-1">
                                {clientContracts.length} total
                              </span>
                            </div>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              Sin contratos
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(client.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ClientActionsMenu client={client} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Client Modal */}
      <NewClientForm
        isOpen={isNewClientOpen}
        onClose={() => {
          setIsNewClientOpen(false);
          setEditingClient(null);
        }}
        onSuccess={refreshClients}
        editingClient={editingClient || undefined}
      />

      {/* New Beneficiary Modal */}
      <NewClientForm
        isOpen={isNewBeneficiaryOpen}
        onClose={() => setIsNewBeneficiaryOpen(false)}
        onSuccess={refreshClients}
        isBeneficiary={true}
      />



      {/* Client Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalles del Cliente
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Código</Label>
                  <p className="text-lg font-semibold">{selectedClient.codigo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedClient.estado ? 'Activo' : 'Inactivo')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nombre Completo</Label>
                  <p className="font-medium">
                    {selectedClient.usuario?.nombre} {selectedClient.usuario?.apellido}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Documento</Label>
                  <p className="font-medium">
                    {selectedClient.usuario?.tipo_documento} {selectedClient.usuario?.numero_documento}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="font-medium">{selectedClient.usuario?.correo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                  <p className="font-medium">{selectedClient.usuario?.telefono || 'No registrado'}</p>
                </div>
              </div>

              {selectedClient.usuario?.direccion && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dirección</Label>
                  <p className="font-medium">{selectedClient.usuario.direccion}</p>
                </div>
              )}

              {/* Client Contracts */}
              {(() => {
                const clientContracts = getClientContracts(selectedClient.id_persona);
                return clientContracts.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Contratos</Label>
                    <div className="mt-2 space-y-2">
                      {clientContracts.map((contract) => (
                        <div key={contract.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{contract.membresia?.nombre}</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(contract.fecha_inicio), "dd/MM/yyyy", { locale: es })} - {format(new Date(contract.fecha_fin), "dd/MM/yyyy", { locale: es })}
                              </p>
                            </div>
                            <Badge className={
                              contract.estado === 'Activo' ? "bg-green-100 text-green-800" :
                              contract.estado === 'Vencido' ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {contract.estado}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Registro</Label>
                  <p className="text-sm">
                    {format(selectedClient.fecha_registro, "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Última Actualización</Label>
                  <p className="text-sm">
                    {format(selectedClient.fecha_actualizacion, "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

