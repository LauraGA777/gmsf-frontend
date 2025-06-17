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
import { EditClientModal } from "@/features/clients/components/editClientModal";
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
import { ClientDetails } from "../components/clientDetails";

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
    navigateToClientContracts,
    createClient
  } = useGym();

  const [filteredClients, setFilteredClients] = useState<UIClient[]>([]);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewBeneficiaryOpen, setIsNewBeneficiaryOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
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
      setIsEditClientOpen(true);
    }
  };

  const handleUpdateClient = async (clientId: number, updates: any) => {
    try {
      await updateClient(clientId, updates);
      await refreshClients();
      setIsEditClientOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al actualizar el cliente',
        icon: 'error',
        confirmButtonColor: '#000',
      });
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
    <div className="container mx-auto py-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Clientes
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsNewClientOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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

      {/* Modales */}
      <NewClientForm
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onCreateClient={createClient}
        onSuccess={() => {
          refreshClients();
          setIsNewClientOpen(false);
        }}
      />

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onUpdateClient={handleUpdateClient}
          onClose={() => {
            setIsEditClientOpen(false);
            setEditingClient(null);
          }}
        />
      )}

      {selectedClient && (
        <ClientDetails
          client={selectedClient}
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

