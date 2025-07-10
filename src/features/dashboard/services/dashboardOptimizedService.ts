import api from '@/shared/services/api';
import { format } from 'date-fns';

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
}

export interface DashboardStats {
  // Estadísticas de asistencia
  attendance: {
    total: number;
    today: number;
    activos: number;
    eliminados: number;
  };
  
  // Estadísticas de contratos
  contracts: {
    totalContracts: number;
    activeContracts: number;
    expiredContracts: number;
    cancelledContracts: number;
    newContracts: number;
    expiringContracts: number;
    totalRevenue: number;
    periodRevenue: number;
  };
  
  // Estadísticas de membresías
  memberships: {
    totalMemberships: number;
    activeMemberships: number;
    inactiveMemberships: number;
    newMemberships: number;
  };
  
  // Estadísticas de clientes
  clients: {
    totalClients: number;
    activeClients: number;
    inactiveClients: number;
    newClients: number;
  };
}

// Interfaces para gráficos
export interface AttendanceChartData {
  date: string;
  asistencias: number;
  label: string;
}

export interface RevenueChartData {
  date: string;
  ingresos: number;
  meta?: number;
  label: string;
}

export interface MembershipDistributionData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface OptimizedDashboardResponse {
  current: DashboardStats;
  previous: DashboardStats;
  charts: {
    attendance: AttendanceChartData[];
    revenue: RevenueChartData[];
    membershipDistribution: MembershipDistributionData[];
  };
  period: {
    type: string;
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
  };
}

export interface PeriodConfig {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  date?: string;
  month?: string;
  year?: string;
  dateFrom?: string;
  dateTo?: string;
}

class OptimizedDashboardService {
  private cache: Map<string, { data: OptimizedDashboardResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener TODOS los datos del dashboard en una sola petición HTTP optimizada
   */
  async getDashboardData(config: PeriodConfig): Promise<OptimizedDashboardResponse> {
    try {
      const cacheKey = this.generateCacheKey(config);
      const cached = this.cache.get(cacheKey);

      // Verificar si tenemos datos en caché y no han expirado
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log('📦 Using cached dashboard data');
        return cached.data;
      }

      const params = this.buildParams(config);
      console.log('🚀 Fetching optimized dashboard data with params:', params);
      
      const response = await api.get('/dashboard/optimized', { params });
      console.log('✅ Dashboard optimized response received');
      
      // Manejar la estructura de respuesta del backend (ApiResponse)
      const responseData = (response.data as any).data || (response.data as any);
      
      const result: OptimizedDashboardResponse = {
        current: {
          attendance: {
            total: responseData.current?.attendance?.total || 0,
            today: responseData.current?.attendance?.today || 0,
            activos: responseData.current?.attendance?.activos || 0,
            eliminados: responseData.current?.attendance?.eliminados || 0
          },
          contracts: {
            totalContracts: responseData.current?.contracts?.totalContracts || 0,
            activeContracts: responseData.current?.contracts?.activeContracts || 0,
            expiredContracts: responseData.current?.contracts?.expiredContracts || 0,
            cancelledContracts: responseData.current?.contracts?.cancelledContracts || 0,
            newContracts: responseData.current?.contracts?.newContracts || 0,
            expiringContracts: responseData.current?.contracts?.expiringContracts || 0,
            totalRevenue: responseData.current?.contracts?.totalRevenue || 0,
            periodRevenue: responseData.current?.contracts?.periodRevenue || 0
          },
          memberships: {
            totalMemberships: responseData.current?.memberships?.totalMemberships || 0,
            activeMemberships: responseData.current?.memberships?.activeMemberships || 0,
            inactiveMemberships: responseData.current?.memberships?.inactiveMemberships || 0,
            newMemberships: responseData.current?.memberships?.newMemberships || 0
          },
          clients: {
            totalClients: responseData.current?.clients?.totalClients || 0,
            activeClients: responseData.current?.clients?.activeClients || 0,
            inactiveClients: responseData.current?.clients?.inactiveClients || 0,
            newClients: responseData.current?.clients?.newClients || 0
          }
        },
        previous: {
          attendance: {
            total: responseData.previous?.attendance?.total || 0,
            today: responseData.previous?.attendance?.today || 0,
            activos: responseData.previous?.attendance?.activos || 0,
            eliminados: responseData.previous?.attendance?.eliminados || 0
          },
          contracts: {
            totalContracts: responseData.previous?.contracts?.totalContracts || 0,
            activeContracts: responseData.previous?.contracts?.activeContracts || 0,
            expiredContracts: responseData.previous?.contracts?.expiredContracts || 0,
            cancelledContracts: responseData.previous?.contracts?.cancelledContracts || 0,
            newContracts: responseData.previous?.contracts?.newContracts || 0,
            expiringContracts: responseData.previous?.contracts?.expiringContracts || 0,
            totalRevenue: responseData.previous?.contracts?.totalRevenue || 0,
            periodRevenue: responseData.previous?.contracts?.periodRevenue || 0
          },
          memberships: {
            totalMemberships: responseData.previous?.memberships?.totalMemberships || 0,
            activeMemberships: responseData.previous?.memberships?.activeMemberships || 0,
            inactiveMemberships: responseData.previous?.memberships?.inactiveMemberships || 0,
            newMemberships: responseData.previous?.memberships?.newMemberships || 0
          },
          clients: {
            totalClients: responseData.previous?.clients?.totalClients || 0,
            activeClients: responseData.previous?.clients?.activeClients || 0,
            inactiveClients: responseData.previous?.clients?.inactiveClients || 0,
            newClients: responseData.previous?.clients?.newClients || 0
          }
        },
        charts: {
          attendance: Array.isArray(responseData.charts?.attendance) 
            ? responseData.charts.attendance.filter((item: any) => 
                item && 
                typeof item.date === 'string' && 
                typeof item.asistencias === 'number' &&
                typeof item.label === 'string'
              )
            : [],
          revenue: Array.isArray(responseData.charts?.revenue) 
            ? responseData.charts.revenue.filter((item: any) => 
                item && 
                typeof item.date === 'string' && 
                typeof item.ingresos === 'number' &&
                typeof item.label === 'string'
              )
            : [],
          membershipDistribution: Array.isArray(responseData.charts?.membershipDistribution) 
            ? responseData.charts.membershipDistribution.filter((item: any) => 
                item && 
                typeof item.name === 'string' && 
                typeof item.value === 'number' && 
                item.value >= 0
              )
            : []
        },
        period: {
          type: responseData.period?.type || config.period,
          startDate: responseData.period?.startDate || '',
          endDate: responseData.period?.endDate || '',
          previousStartDate: responseData.period?.previousStartDate || '',
          previousEndDate: responseData.period?.previousEndDate || ''
        }
      };

      // Guardar en caché
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      console.log('💾 Dashboard data cached for future requests');
      return result;

    } catch (error) {
      console.error('❌ Error fetching optimized dashboard data:', error);
      throw new Error('Error al cargar los datos del dashboard');
    }
  }

  /**
   * Limpiar caché manualmente
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Dashboard cache cleared');
  }

  /**
   * Obtener datos del caché sin hacer petición HTTP
   */
  getCachedData(config: PeriodConfig): OptimizedDashboardResponse | null {
    const cacheKey = this.generateCacheKey(config);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    return null;
  }

  /**
   * Generar clave para caché
   */
  private generateCacheKey(config: PeriodConfig): string {
    return `dashboard_${config.period}_${config.dateFrom || ''}_${config.dateTo || ''}_${config.date || ''}_${config.month || ''}_${config.year || ''}`;
  }

  /**
   * Convertir DateRange a PeriodConfig
   */
  dateRangeToConfig(dateRange: DateRange): PeriodConfig {
    const config: PeriodConfig = {
      period: dateRange.period,
      dateFrom: format(dateRange.from, 'yyyy-MM-dd'),
      dateTo: format(dateRange.to, 'yyyy-MM-dd')
    };

    // Agregar parámetros específicos según el período
    if (dateRange.period === 'daily' || dateRange.period === 'custom') {
      config.date = format(dateRange.from, 'yyyy-MM-dd');
    } else if (dateRange.period === 'monthly') {
      config.month = (dateRange.from.getMonth() + 1).toString();
      config.year = dateRange.from.getFullYear().toString();
    } else if (dateRange.period === 'yearly') {
      config.year = dateRange.from.getFullYear().toString();
    }

    return config;
  }

  /**
   * Construir parámetros para la consulta
   */
  private buildParams(config: PeriodConfig): Record<string, string> {
    const params: Record<string, string> = {
      period: config.period
    };

    if (config.date) params.date = config.date;
    if (config.month) params.month = config.month;
    if (config.year) params.year = config.year;
    if (config.dateFrom) params.dateFrom = config.dateFrom;
    if (config.dateTo) params.dateTo = config.dateTo;

    return params;
  }
}

export default new OptimizedDashboardService(); 