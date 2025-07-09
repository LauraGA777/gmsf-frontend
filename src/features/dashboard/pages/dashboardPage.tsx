import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { 
  Users, 
  FileText, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  CalendarDays
} from 'lucide-react';

// Servicios
import dashboardService, { DashboardStats, DateRange } from '@/features/dashboard/services/dashboardService';
import { formatCOP } from '@/shared/lib/formatCop';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface DashboardPageProps {
  className?: string;
}

export default function DashboardPage({ className }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Rango de fechas fijo para este mes
  const [selectedDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: 'Mes actual',
    period: 'monthly'
  });

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        period: selectedDateRange.period,
        dateFrom: format(selectedDateRange.from, 'yyyy-MM-dd'),
        dateTo: format(selectedDateRange.to, 'yyyy-MM-dd')
      };

      const data = await dashboardService.getDashboardStats(config);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Renderizar tarjetas de estadísticas
  const renderStatsCards = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!stats) return null;

    const cards = [
      {
        title: 'Asistencias',
        value: stats.attendance.today,
        total: stats.attendance.total,
        icon: <Activity className="h-8 w-8 text-blue-600" />,
        bgColor: 'bg-blue-50',
        subtitle: 'hoy'
      },
      {
        title: 'Contratos',
        value: stats.contracts.activeContracts,
        total: stats.contracts.totalContracts,
        icon: <FileText className="h-8 w-8 text-green-600" />,
        bgColor: 'bg-green-50',
        subtitle: 'activos'
      },
      {
        title: 'Ingresos',
        value: formatCOP(stats.contracts.totalRevenue),
        total: null,
        icon: <DollarSign className="h-8 w-8 text-purple-600" />,
        bgColor: 'bg-purple-50',
        subtitle: 'totales'
      },
      {
        title: 'Membresías',
        value: stats.memberships.activeMemberships,
        total: stats.memberships.totalMemberships,
        icon: <CreditCard className="h-8 w-8 text-orange-600" />,
        bgColor: 'bg-orange-50',
        subtitle: 'activas'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                    {card.total && (
                      <p className="text-xs text-gray-400">de {card.total} totales</p>
                    )}
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Renderizar resumen de contratos
  const renderContractSummary = () => {
    if (loading || !stats) return null;

    const contractData = [
      { label: 'Activos', value: stats.contracts.activeContracts, color: 'bg-green-100 text-green-800' },
      { label: 'Vencidos', value: stats.contracts.expiredContracts, color: 'bg-red-100 text-red-800' },
      { label: 'Cancelados', value: stats.contracts.cancelledContracts, color: 'bg-gray-100 text-gray-800' },
      { label: 'Próximos a vencer', value: stats.contracts.expiringContracts, color: 'bg-yellow-100 text-yellow-800' }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estado de Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {contractData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <Badge className={`${item.color} border-0`}>
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar resumen de clientes
  const renderClientSummary = () => {
    if (loading || !stats) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total de clientes</span>
              <span className="text-2xl font-bold text-gray-900">{stats.clients.totalClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Activos</span>
              <Badge className="bg-green-100 text-green-800 border-0">
                {stats.clients.activeClients}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nuevos en {selectedDateRange.label.toLowerCase()}</span>
              <Badge className="bg-blue-100 text-blue-800 border-0">
                {stats.clients.newClients}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Panel de control del gimnasio</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                {format(selectedDateRange.from, 'MMM yyyy')}
              </span>
            </div>
            <Button
              onClick={loadStats}
              disabled={loading}
              className="bg-black hover:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderContractSummary()}
          {renderClientSummary()}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </div>
      </div>
    </div>
  );
}
