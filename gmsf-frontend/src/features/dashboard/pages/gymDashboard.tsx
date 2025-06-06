import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useGym } from "@/shared/contexts/gymContext";
import {
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
  UserPlus,
  Plus,
  Eye,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { Contract, Client } from "@/shared/types";
import { mapDbClientToUiClient } from "@/shared/types";

export function GymDashboard() {
  const {
    clients,
    contracts,
    memberships,
    stats,
    clientsLoading,
    contractsLoading,
    refreshAll,
    getClientContracts,
    navigateToClientContracts,
    navigateToContractClient,
  } = useGym();

  const [expiringContracts, setExpiringContracts] = useState<Contract[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);

  useEffect(() => {
    // Calculate expiring contracts (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiring = contracts.filter(contract => {
      const endDate = new Date(contract.fecha_fin);
      const today = new Date();
      return (
        contract.estado === 'Activo' && 
        endDate <= thirtyDaysFromNow &&
        endDate >= today
      );
    }).sort((a, b) => new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime());
    
    setExpiringContracts(expiring.slice(0, 5)); // Top 5 expiring

    // Get recent clients (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recent = clients.filter(client => 
      new Date(client.fecha_registro) >= sevenDaysAgo
    ).sort((a, b) => new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime());
    
    setRecentClients(recent.slice(0, 5)); // Top 5 recent
  }, [contracts, clients]);

  const getContractDaysRemaining = (endDate: Date) => {
    return differenceInDays(endDate, new Date());
  };

  const getUrgencyColor = (daysRemaining: number) => {
    if (daysRemaining <= 7) return "bg-red-100 text-red-800";
    if (daysRemaining <= 15) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard del Gimnasio</h1>
          <p className="text-gray-600">Resumen general y gestión integral</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={clientsLoading || contractsLoading}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeClients} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeContracts} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              De contratos activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.expiringContracts}
            </div>
            <p className="text-xs text-muted-foreground">
              Próximos 30 días
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Contratos por Vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringContracts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">No hay contratos próximos a vencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expiringContracts.map((contract) => {
                  const daysRemaining = getContractDaysRemaining(new Date(contract.fecha_fin));
                  const client = clients.find(c => c.id_persona === contract.id_persona);
                  
                  return (
                    <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {client?.usuario?.nombre} {client?.usuario?.apellido}
                        </p>
                        <p className="text-sm text-gray-500">
                          {contract.membresia?.nombre}
                        </p>
                        <p className="text-xs text-gray-400">
                          Vence: {format(new Date(contract.fecha_fin), "dd/MM/yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getUrgencyColor(daysRemaining)}>
                          {daysRemaining} días
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigateToContractClient(contract.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                <Button variant="outline" className="w-full">
                  Ver todos los contratos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Clientes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentClients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No hay clientes recientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClients.map((client) => {
                  const clientContracts = getClientContracts(client.id_persona);
                  const hasActiveContract = clientContracts.some(c => c.estado === 'Activo');
                  
                  return (
                    <div key={client.id_persona} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {client.usuario?.nombre} {client.usuario?.apellido}
                        </p>
                        <p className="text-sm text-gray-500">
                          {client.usuario?.correo}
                        </p>
                        <p className="text-xs text-gray-400">
                          Registrado: {format(new Date(client.fecha_registro), "dd/MM/yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasActiveContract ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Con contrato
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Sin contrato
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigateToClientContracts(client.id_persona)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                <Button variant="outline" className="w-full">
                  Ver todos los clientes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col gap-2">
              <UserPlus className="h-6 w-6" />
              <span>Nuevo Cliente</span>
            </Button>
            
            <Button className="h-20 flex flex-col gap-2">
              <Plus className="h-6 w-6" />
              <span>Nuevo Contrato</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span>Ver Agenda</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Membership Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumen de Membresías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {memberships.map((membership) => {
              const membershipContracts = contracts.filter(c => 
                c.id_membresia === membership.id && c.estado === 'Activo'
              );
              
              return (
                <div key={membership.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{membership.nombre}</h3>
                  <p className="text-sm text-gray-600 mb-2">{membership.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">
                      ${membership.precio.toLocaleString()}
                    </span>
                    <Badge>
                      {membershipContracts.length} activos
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 