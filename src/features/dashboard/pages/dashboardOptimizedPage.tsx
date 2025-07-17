import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { 
  Users, 
  FileText, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// Servicios optimizados
import optimizedDashboardService, { 
  DateRange, 
  OptimizedDashboardResponse
} from '@/features/dashboard/services/dashboardOptimizedService';
import { formatCOP } from '@/shared/lib/formatCop';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Componentes del dashboard
import { DateRangeFilter } from '@/features/dashboard/components/DateRangeFilter';
import { MembershipDistributionChart } from '@/features/dashboard/components/MembershipDistributionChart';
import { PopularMembershipsChart } from '@/features/dashboard/components/popularMembershipsChart';
import { AttendanceBarChart } from '@/features/dashboard/components/AttendanceBarChart';
import { RevenueLineChart } from '@/features/dashboard/components/RevenueLineChart';
import { ContractStatusChart } from '@/features/dashboard/components/ContractStatusChart';

interface DashboardPageProps {
  className?: string;
}

interface KPIData {
  title: string;
  value: string | number;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export default function DashboardOptimizedPage({ className }: DashboardPageProps) {
  const [dashboardData, setDashboardData] = useState<OptimizedDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Rango de fechas con filtro
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: 'Este mes',
    period: 'monthly'
  });

  // Cargar estadísticas optimizadas en UNA SOLA petición
  const loadOptimizedStats = async (clearCache = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Limpiar caché si es necesario
      if (clearCache) {
        optimizedDashboardService.clearCache();
      }
      
      const config = optimizedDashboardService.dateRangeToConfig(selectedDateRange);
      console.log('🚀 Loading optimized dashboard data...');
      
      const data = await optimizedDashboardService.getDashboardData(config);
      console.log('📊 Dashboard data received:', data);
      console.log('📈 Charts data:', data.charts);
      console.log('🏷️ Membership distribution:', data.charts?.membershipDistribution);
      
      setDashboardData(data);
      setLastUpdate(new Date());
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (err) {
      console.error('❌ Error loading optimized stats:', err);
      setError('Error al cargar las estadísticas. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular cambio porcentual
  const calculateChange = (current: number, previous: number): { change: number; type: 'increase' | 'decrease' | 'neutral' } => {
    if (previous === 0) return { change: 0, type: 'neutral' };
    
    const change = ((current - previous) / previous) * 100;
    
    if (change > 0) return { change, type: 'increase' };
    if (change < 0) return { change: Math.abs(change), type: 'decrease' };
    return { change: 0, type: 'neutral' };
  };

  // Determinar el estado de un KPI
  const getKPIStatus = (title: string, value: number, changeType: string): 'success' | 'warning' | 'error' | 'info' => {
    if (title.includes('Vencidos') || title.includes('Cancelados')) {
      return value > 0 ? 'error' : 'success';
    }
    if (title.includes('Ingresos') || title.includes('Contratos Activos') || title.includes('Nuevos')) {
      return changeType === 'increase' ? 'success' : changeType === 'decrease' ? 'warning' : 'info';
    }
    return 'info';
  };

  useEffect(() => {
    loadOptimizedStats();
  }, [selectedDateRange]);

  // Manejar cambio de rango de fechas
  const handleDateRangeChange = (newRange: DateRange) => {
    setSelectedDateRange(newRange);
  };

  // Generar KPIs con comparación
  const generateKPIs = (): KPIData[] => {
    if (!dashboardData) return [];

    const { current, previous } = dashboardData;

    const kpis: KPIData[] = [
      {
        title: 'Asistencias',
        value: current.attendance?.total || 0,
        previousValue: previous.attendance?.total || 0,
        icon: <Activity className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        description: 'Total de asistencias registradas'
      },
      {
        title: 'Contratos Activos',
        value: current.contracts?.activeContracts || 0,
        previousValue: previous.contracts?.activeContracts || 0,
        icon: <FileText className="h-5 w-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        description: 'Contratos vigentes'
      },
      {
        title: 'Ingresos',
        value: formatCOP(current.contracts?.periodRevenue || 0),
        previousValue: previous.contracts?.periodRevenue || 0,
        icon: <DollarSign className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        description: 'Ingresos del período'
      },
      {
        title: 'Membresías Activas',
        value: current.memberships?.activeMemberships || 0,
        previousValue: previous.memberships?.activeMemberships || 0,
        icon: <CreditCard className="h-5 w-5" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        description: 'Membresías vigentes'
      },
      {
        title: 'Nuevos Clientes',
        value: current.clients?.newClients || 0,
        previousValue: previous.clients?.newClients || 0,
        icon: <Users className="h-5 w-5" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        description: 'Clientes registrados'
      },
    ];

    return kpis.map(kpi => {
      const currentValue = typeof kpi.value === 'string' ? kpi.previousValue || 0 : kpi.value;
      const changeData = calculateChange(currentValue, kpi.previousValue || 0);
      const status = getKPIStatus(kpi.title, currentValue, changeData.type);
      
      return {
        ...kpi,
        change: changeData.change,
        changeType: changeData.type,
        status
      };
    });
  };

  // Renderizar KPIs estilo Power BI
  const renderKPIs = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const kpis = generateKPIs();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => {
          const borderColor = kpi.status === 'success' ? 'border-l-green-500' : 
                            kpi.status === 'warning' ? 'border-l-yellow-500' : 
                            kpi.status === 'error' ? 'border-l-red-500' : 'border-l-blue-500';
          
          return (
            <Card key={index} className={`hover:shadow-md transition-all duration-200 border-l-4 ${borderColor} bg-white`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${kpi.bgColor}`}>
                        <div className={kpi.color}>
                          {kpi.icon}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 truncate">
                        {kpi.title}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {kpi.value}
                      </div>
                      
                      {kpi.change !== undefined && (
                        <div className="flex items-center gap-1">
                          {kpi.changeType === 'increase' && (
                            <ArrowUp className="h-3 w-3 text-green-500" />
                          )}
                          {kpi.changeType === 'decrease' && (
                            <ArrowDown className="h-3 w-3 text-red-500" />
                          )}
                          {kpi.changeType === 'neutral' && (
                            <Minus className="h-3 w-3 text-gray-500" />
                          )}
                          <span className={`text-xs font-medium ${
                            kpi.changeType === 'increase' ? 'text-green-600' : 
                            kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {kpi.change.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {kpi.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador de estado */}
                  <div className="ml-2">
                    {kpi.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {kpi.status === 'warning' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {kpi.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                    {kpi.status === 'info' && <div className="h-4 w-4" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="p-6 space-y-6">
        {/* Header optimizado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Panel de rendimiento
            </h1>
            <p className="text-sm text-gray-600">
              Análisis de rendimiento con carga súper rápida
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <DateRangeFilter
              selectedRange={selectedDateRange}
              onRangeChange={handleDateRangeChange}
            />
            <Button
              onClick={() => loadOptimizedStats(true)}
              disabled={loading}
              size="sm"
              className="h-8 px-3"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
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

        {/* KPIs principales */}
        {renderKPIs()}

        {/* Tabs para análisis detallado */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="memberships" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Membresías
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Análisis
            </TabsTrigger>
          </TabsList>

          {/* Tab: Resumen */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Asistencias */}
              <Card className="bg-white shadow-sm min-h-[500px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Asistencias por Día
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AttendanceBarChart 
                    data={dashboardData?.charts?.attendance || []}
                    loading={loading}
                    title="Tendencia de Asistencias"
                  />
                </CardContent>
              </Card>

              {/* Gráfico de Ingresos */}
              <Card className="bg-white shadow-sm min-h-[500px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Tendencia de Ingresos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueLineChart 
                    data={dashboardData?.charts?.revenue || []}
                    loading={loading}
                    title="Evolución de Ingresos"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Membresías */}
          <TabsContent value="memberships" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribución Donut */}
              <Card className="bg-white shadow-sm min-h-[600px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Distribución de Membresías
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MembershipDistributionChart 
                    data={dashboardData?.charts?.membershipDistribution || []}
                    loading={loading}
                    title="Distribución Actual"
                  />
                </CardContent>
              </Card>

              {/* Membresías Populares */}
              <Card className="bg-white shadow-sm min-h-[600px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Membresías Populares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PopularMembershipsChart 
                    data={(dashboardData?.charts?.membershipDistribution || []).map((item, index) => ({
                      id: index, // Usar el índice como ID numérico
                      nombre: item.name || 'Membresía',
                      precio: 50000, // TODO: Debería venir del backend
                      activeContracts: item.value || 0
                    }))}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Análisis */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estado de Contratos */}
              <Card className="bg-white shadow-sm min-h-[500px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    Estado de Contratos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractStatusChart 
                    data={dashboardData?.current?.contracts || {
                      activeContracts: 0,
                      expiredContracts: 0,
                      cancelledContracts: 0,
                      expiringContracts: 0
                    }}
                    loading={loading}
                    title="Análisis de Contratos"
                  />
                </CardContent>
              </Card>

              {/* Estadísticas Detalladas */}
              <Card className="bg-white shadow-sm min-h-[500px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Resumen Ejecutivo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Ingresos */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Ingresos del período</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          {formatCOP(dashboardData?.current?.contracts?.periodRevenue || 0)}
                        </span>
                      </div>
                      <div className="text-xs text-green-600">
                        Total acumulado: {formatCOP(dashboardData?.current?.contracts?.totalRevenue || 0)}
                      </div>
                    </div>

                    {/* Asistencias */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Asistencias registradas</span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">
                          {dashboardData?.current?.attendance?.total || 0}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600">
                        Activas: {dashboardData?.current?.attendance?.activos || 0} | Hoy: {dashboardData?.current?.attendance?.today || 0}
                      </div>
                    </div>

                    {/* Membresías */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">Membresías disponibles</span>
                        </div>
                        <span className="text-xl font-bold text-purple-600">
                          {dashboardData?.current?.memberships?.totalMemberships || 0}
                        </span>
                      </div>
                      <div className="text-xs text-purple-600">
                        Activas: {dashboardData?.current?.memberships?.activeMemberships || 0} | Nuevas: {dashboardData?.current?.memberships?.newMemberships || 0}
                      </div>
                    </div>

                    {/* Clientes */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-700">Base de clientes</span>
                        </div>
                        <span className="text-xl font-bold text-indigo-600">
                          {dashboardData?.current?.clients?.totalClients || 0}
                        </span>
                      </div>
                      <div className="text-xs text-indigo-600">
                        Activos: {dashboardData?.current?.clients?.activeClients || 0} | Nuevos: {dashboardData?.current?.clients?.newClients || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer mejorado con métricas de rendimiento */}
        <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              <span>Última actualización: {format(lastUpdate, 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Optimizado - 1 petición HTTP</span>
            </div>
            <div className="flex items-center gap-1">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 