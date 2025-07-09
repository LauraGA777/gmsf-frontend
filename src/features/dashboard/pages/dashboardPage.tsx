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
  TrendingDown,
  Activity,
  Crown,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';

// Nuevos componentes
import { DateRangeFilter, DateRange } from '@/features/dashboard/components/DateRangeFilter';
import { AttendanceChart } from '@/features/dashboard/components/attendanceChart';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { MembershipDistributionChart } from '@/features/dashboard/components/MembershipDistributionChart';

// Servicios
import dashboardService, { DashboardStats, AttendanceChartData, RevenueChartData, MembershipDistributionData } from '@/features/dashboard/services/dashboardService';
import { formatCOP } from '@/shared/lib/formatCop';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface DashboardPageProps {
  className?: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  attendanceData: AttendanceChartData[];
  revenueData: RevenueChartData[];
  membershipData: MembershipDistributionData[];
  loading: boolean;
  error: string | null;
  chartsLoading: boolean;
}

export default function DashboardPage({ className }: DashboardPageProps) {
  // Estado del dashboard
  const [state, setState] = useState<DashboardState>({
    stats: null,
    attendanceData: [],
    revenueData: [],
    membershipData: [],
    loading: true,
    error: null,
    chartsLoading: true
  });

  // Rango de fechas inicial (este mes)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: 'Este mes',
    period: 'monthly'
  });

  // Cargar estadísticas básicas
  const loadDashboardStats = async (dateRange: DateRange) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const config = {
        period: dateRange.period,
        dateFrom: format(dateRange.from, 'yyyy-MM-dd'),
        dateTo: format(dateRange.to, 'yyyy-MM-dd')
      };

      const stats = await dashboardService.getDashboardStats(config);
      setState(prev => ({ ...prev, stats, loading: false }));
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error al cargar las estadísticas del dashboard',
        stats: {
          attendance: { total: 0, activos: 0, eliminados: 0, date: new Date().toISOString() },
          contracts: { 
            totalContracts: 0, activeContracts: 0, expiredContracts: 0, 
            cancelledContracts: 0, newContracts: 0, totalRevenue: 0, 
            periodRevenue: 0, recentContracts: [] 
          },
          memberships: { 
            totalMemberships: 0, activeMemberships: 0, inactiveMemberships: 0, 
            newMemberships: 0, popularMemberships: [] 
          }
        }
      }));
    }
  };

  // Cargar datos de gráficos
  const loadChartsData = async (dateRange: DateRange) => {
    try {
      setState(prev => ({ ...prev, chartsLoading: true }));
      
      const [attendanceData, revenueData, membershipData] = await Promise.all([
        dashboardService.getAttendanceChartData(dateRange),
        dashboardService.getRevenueChartData(dateRange),
        dashboardService.getMembershipDistributionData(dateRange)
      ]);

      setState(prev => ({ 
        ...prev, 
        attendanceData, 
        revenueData, 
        membershipData, 
        chartsLoading: false 
      }));
    } catch (error) {
      console.error('Error loading charts data:', error);
      setState(prev => ({ ...prev, chartsLoading: false }));
    }
  };

  // Manejar cambio de rango de fechas
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setSelectedDateRange(newDateRange);
    loadDashboardStats(newDateRange);
    loadChartsData(newDateRange);
  };

  // Refrescar todo
  const refreshAll = () => {
    loadDashboardStats(selectedDateRange);
    loadChartsData(selectedDateRange);
  };

  // Efectos
  useEffect(() => {
    loadDashboardStats(selectedDateRange);
    loadChartsData(selectedDateRange);
  }, []);

  // Renderizar KPI cards
  const renderKPICards = () => {
    if (state.loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (!state.stats) return null;

    const cards = [
      {
        title: 'Asistencias',
        value: state.stats.attendance.total,
        icon: <Activity className="h-8 w-8" />,
        color: 'text-blue-600',
        bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
        iconBg: 'bg-blue-500/20',
        change: state.stats.attendance.activos > 0 ? '+' : '',
        changeValue: state.stats.attendance.activos,
        subtitle: `${state.stats.attendance.activos} activas hoy`
      },
      {
        title: 'Contratos',
        value: state.stats.contracts.totalContracts,
        icon: <FileText className="h-8 w-8" />,
        color: 'text-emerald-600',
        bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        iconBg: 'bg-emerald-500/20',
        change: state.stats.contracts.newContracts > 0 ? '+' : '',
        changeValue: state.stats.contracts.newContracts,
        subtitle: `${state.stats.contracts.activeContracts} activos`
      },
      {
        title: 'Ingresos',
        value: formatCOP(state.stats.contracts.totalRevenue),
        icon: <DollarSign className="h-8 w-8" />,
        color: 'text-purple-600',
        bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
        iconBg: 'bg-purple-500/20',
        change: state.stats.contracts.periodRevenue > 0 ? '+' : '',
        changeValue: formatCOP(state.stats.contracts.periodRevenue),
        subtitle: 'del período actual'
      },
      {
        title: 'Membresías',
        value: state.stats.memberships.totalMemberships,
        icon: <CreditCard className="h-8 w-8" />,
        color: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
        iconBg: 'bg-orange-500/20',
        change: state.stats.memberships.newMemberships > 0 ? '+' : '',
        changeValue: state.stats.memberships.newMemberships,
        subtitle: `${state.stats.memberships.activeMemberships} activas`
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bgColor} rounded-full -translate-y-16 translate-x-16 opacity-10`}></div>
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg} ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-3xl font-bold ${card.color} leading-none`}>
                      {typeof card.value === 'string' ? (
                        <span className="text-2xl">{card.value}</span>
                      ) : (
                        card.value
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    className={`${
                      card.change === '+' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                    } border-0 font-medium`}
                  >
                    {card.change === '+' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {card.change}{card.changeValue}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="space-y-8 p-6">
        {/* Header mejorado */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600 text-lg">Panel de control del gimnasio</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">{selectedDateRange.label}</span>
              </div>
              <Button
                onClick={refreshAll}
                disabled={state.loading || state.chartsLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${(state.loading || state.chartsLoading) ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert mejorado */}
        {state.error && (
          <Alert className="border-red-200 bg-red-50 rounded-xl shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700 font-medium">
              {state.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Sidebar de filtros */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <DateRangeFilter
                selectedRange={selectedDateRange}
                onRangeChange={handleDateRangeChange}
                loading={state.loading || state.chartsLoading}
              />
            </div>
          </div>

          {/* Área principal de contenido */}
          <div className="xl:col-span-4 space-y-8">
            {/* KPI Cards */}
            {renderKPICards()}

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <AttendanceChart
                  data={state.attendanceData}
                  title="Tendencia de Asistencias"
                  period={selectedDateRange.period}
                  loading={state.chartsLoading}
                />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <RevenueChart
                  data={state.revenueData}
                  title="Ingresos por Período"
                  period={selectedDateRange.period}
                  loading={state.chartsLoading}
                />
              </div>
            </div>

            {/* Sección inferior */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Gráfico de membresías */}
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <MembershipDistributionChart
                  data={state.membershipData}
                  title="Distribución de Membresías"
                  loading={state.chartsLoading}
                />
              </div>
              
              {/* Panel lateral de información */}
              <div className="space-y-6">
                {/* Contratos recientes */}
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-blue-900">
                      <Target className="h-5 w-5 text-blue-600" />
                      Contratos Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {state.loading ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-2/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {state.stats?.contracts.recentContracts.slice(0, 3).map((contract, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {contract.persona.usuario.nombre} {contract.persona.usuario.apellido}
                                  </p>
                                  <p className="text-sm text-gray-500">{contract.membresia.nombre}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{formatCOP(contract.membresia_precio)}</p>
                                <Badge 
                                  className={`text-xs ${
                                    contract.estado === 'activo' ? 'bg-emerald-100 text-emerald-700' : 
                                    contract.estado === 'vencido' ? 'bg-red-100 text-red-700' : 
                                    'bg-yellow-100 text-yellow-700'
                                  } border-0`}
                                >
                                  {contract.estado}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Membresías populares */}
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-900">
                      <Crown className="h-5 w-5 text-purple-600" />
                      Top Membresías
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {state.loading ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {state.stats?.memberships.popularMemberships.slice(0, 3).map((membership, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                                }`}>
                                  <span className={`text-sm font-bold ${
                                    index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : 'text-orange-600'
                                  }`}>
                                    {index + 1}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{membership.nombre}</p>
                                  <p className="text-sm text-gray-500">{membership.activeContracts} contratos</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{formatCOP(membership.precio)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer informativo mejorado */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="font-medium">
                  Período: {selectedDateRange.label}
                </span>
                <span className="text-gray-400">•</span>
                <span>
                  {format(selectedDateRange.from, 'dd/MM/yyyy')} - {format(selectedDateRange.to, 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-green-500" />
              <span>
                Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
