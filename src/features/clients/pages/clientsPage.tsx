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
import { ClientsTable } from "../components/clientsTable";
import { useToast } from "@/shared/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isNewBeneficiaryOpen, setIsNewBeneficiaryOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    let filtered = [...clients];

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

    const clientsWithContracts = filtered.map(client => ({
      ...client,
      contratos: getClientContracts(client.id_persona)
    }));

    setFilteredClients(clientsWithContracts);
  }, [clients, searchTerm, statusFilter, getClientContracts]);

  const getStatusBadge = (estado: UIClient['status']) => {
    const statusConfig = {
      'Activo': { color: 'bg-green-100 text-green-800', label: 'Activo' },
      'Inactivo': { color: 'bg-gray-100 text-gray-800', label: 'Inactivo' },
      'Congelado': { color: 'bg-blue-100 text-blue-800', label: 'Congelado' },
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

  const handleUpdateClient = async (clientId: number, updates: Partial<Client>) => {
    try {
      await updateClient(clientId, updates);
      await refreshClients();
      setEditingClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar el cliente.', type: 'error' });
    }
  };

  const handleViewContracts = (clientUI: UIClient) => {
    const dbClient = clients.find(c => c.id_persona.toString() === clientUI.id);
    if (dbClient) {
      navigate(`/clients/${dbClient.id_persona}/contracts`);
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

        toast({
          title: '¡Éxito!',
          description: `Cliente ${dbClient.estado ? 'desactivado' : 'activado'} correctamente`,
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error updating client status:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el estado del cliente',
        type: 'error',
      });
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    try {
      await deleteClientFromContext(clientId);
      await refreshClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar el cliente.', type: 'error' });
    }
  };

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pagination = {
    total: filteredClients.length,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: Math.ceil(filteredClients.length / itemsPerPage)
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
            onClick={() => handleDeleteClient(Number(client.id))}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <CardTitle>Gestión de Clientes</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refreshClients()} disabled={clientsLoading}>
              <RefreshCw className={`h-4 w-4 ${clientsLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setIsNewClientOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nombre, documento, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ClientsTable
            clients={paginatedClients}
            isLoading={clientsLoading}
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            pagination={pagination}
            onPageChange={setCurrentPage}
            onAddNewClient={() => setIsNewClientOpen(true)}
          />

        </CardContent>
      </Card>

      {isNewClientOpen && (
        <NewClientForm
          isOpen={isNewClientOpen}
          onClose={() => setIsNewClientOpen(false)}
          onCreateClient={createClient}
          onSuccess={refreshClients}
        />
      )}

      {editingClient && isEditClientOpen && (
        <EditClientModal
          client={editingClient}
          onClose={() => {
            setEditingClient(null)
            setIsEditClientOpen(false)
          }}
          onUpdateClient={handleUpdateClient}
        />
      )}

      {selectedClient && isDetailsOpen && (
        <ClientDetails
          client={selectedClient}
          onClose={() => setIsDetailsOpen(false)}
        />
      )}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}

