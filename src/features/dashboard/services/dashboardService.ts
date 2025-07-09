import api from '@/shared/services/api';
import { format, eachDayOfInterval } from 'date-fns';

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

export interface PeriodConfig {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  date?: string;
  month?: string;
  year?: string;
  dateFrom?: string;
  dateTo?: string;
}

class DashboardService {
  // Obtener estadísticas completas del dashboard en una sola llamada
  async getDashboardStats(config: PeriodConfig): Promise<DashboardStats> {
    try {
      const params = this.buildParams(config);
      console.log('🔍 Fetching dashboard stats with params:', params);
      
      const response = await api.get('/dashboard/stats', { params });
      
      console.log('📊 Dashboard stats response:', response.data);
      
      // Manejar la estructura de respuesta del backend (ApiResponse)
      const data = (response.data as any).data || (response.data as any);
      
      const result: DashboardStats = {
        attendance: {
          total: data.attendance?.total || 0,
          today: data.attendance?.today || 0,
          activos: data.attendance?.activos || 0,
          eliminados: data.attendance?.eliminados || 0
        },
        contracts: {
          totalContracts: data.contracts?.totalContracts || 0,
          activeContracts: data.contracts?.activeContracts || 0,
          expiredContracts: data.contracts?.expiredContracts || 0,
          cancelledContracts: data.contracts?.cancelledContracts || 0,
          newContracts: data.contracts?.newContracts || 0,
          expiringContracts: data.contracts?.expiringContracts || 0,
          totalRevenue: data.contracts?.totalRevenue || 0,
          periodRevenue: data.contracts?.periodRevenue || 0
        },
        memberships: {
          totalMemberships: data.memberships?.totalMemberships || 0,
          activeMemberships: data.memberships?.activeMemberships || 0,
          inactiveMemberships: data.memberships?.inactiveMemberships || 0,
          newMemberships: data.memberships?.newMemberships || 0
        },
        clients: {
          totalClients: data.clients?.totalClients || 0,
          activeClients: data.clients?.activeClients || 0,
          inactiveClients: data.clients?.inactiveClients || 0,
          newClients: data.clients?.newClients || 0
        }
      };
      
      console.log('✅ Processed dashboard stats:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw new Error('Error al cargar las estadísticas del dashboard');
    }
  }

  // Generar datos de gráfico de asistencias basados en datos reales
  async getAttendanceChartData(dateRange: DateRange): Promise<AttendanceChartData[]> {
    try {
      // Generar datos para cada día del rango
      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const chartData: AttendanceChartData[] = [];

      // Limitar a máximo 30 días para evitar demasiados requests
      const limitedDays = days.slice(0, 30);

      for (const day of limitedDays) {
        try {
          const params = {
            period: 'daily',
            date: format(day, 'yyyy-MM-dd')
          };
          const response = await api.get('/dashboard/stats', { params });
          const data = (response.data as any).data || (response.data as any);
          
          chartData.push({
            date: format(day, 'yyyy-MM-dd'),
            asistencias: data.attendance?.total || 0,
            label: format(day, 'dd/MM')
          });
        } catch (error) {
          // Si falla para un día específico, usar 0
          chartData.push({
            date: format(day, 'yyyy-MM-dd'),
            asistencias: 0,
            label: format(day, 'dd/MM')
          });
        }
      }

      return chartData;
    } catch (error) {
      console.error('Error fetching attendance chart data:', error);
      return this.generateMockAttendanceData(dateRange);
    }
  }

  // Generar datos de gráfico de ingresos basados en datos reales
  async getRevenueChartData(dateRange: DateRange): Promise<RevenueChartData[]> {
    try {
      // Generar datos para cada día del rango
      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      const chartData: RevenueChartData[] = [];

      // Limitar a máximo 30 días para evitar demasiados requests
      const limitedDays = days.slice(0, 30);

      for (const day of limitedDays) {
        try {
          const params = {
            period: 'daily',
            date: format(day, 'yyyy-MM-dd')
          };
          const response = await api.get('/dashboard/stats', { params });
          const data = (response.data as any).data || (response.data as any);
          
          chartData.push({
            date: format(day, 'yyyy-MM-dd'),
            ingresos: data.contracts?.periodRevenue || 0,
            meta: 300000, // Meta fija por ahora
            label: format(day, 'dd/MM')
          });
        } catch (error) {
          // Si falla para un día específico, usar 0
          chartData.push({
            date: format(day, 'yyyy-MM-dd'),
            ingresos: 0,
            meta: 300000,
            label: format(day, 'dd/MM')
          });
        }
      }

      return chartData;
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      return this.generateMockRevenueData(dateRange);
    }
  }

  // Generar datos de distribución de membresías basados en datos reales
  async getMembershipDistributionData(dateRange: DateRange): Promise<MembershipDistributionData[]> {
    try {
      const config = this.dateRangeToConfig(dateRange);
      const params = this.buildParams(config);
      const response = await api.get('/memberships/stats', { params });
      const data = (response.data as any).data || (response.data as any);
      
      if (data.popularMemberships && data.popularMemberships.length > 0) {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
        const total = data.popularMemberships.reduce((sum: number, m: any) => sum + m.activeContracts, 0);
        
        return data.popularMemberships.map((membership: any, index: number) => ({
          name: membership.nombre,
          value: membership.activeContracts,
          percentage: total > 0 ? (membership.activeContracts / total) * 100 : 0,
          color: colors[index % colors.length]
        }));
      }
      
      return this.generateMockMembershipDistribution();
    } catch (error) {
      console.error('Error fetching membership distribution data:', error);
      return this.generateMockMembershipDistribution();
    }
  }

  // Convertir DateRange a PeriodConfig
  private dateRangeToConfig(dateRange: DateRange): PeriodConfig {
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

  // Generar datos mock para fallback
  private generateMockAttendanceData(dateRange: DateRange): AttendanceChartData[] {
    const data: AttendanceChartData[] = [];
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const points = Math.min(daysDiff + 1, 30);
    
    for (let i = 0; i < points; i++) {
      const date = new Date(dateRange.from);
      date.setDate(date.getDate() + i);
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        asistencias: Math.floor(Math.random() * 50) + 20,
        label: format(date, 'dd/MM')
      });
    }
    
    return data;
  }

  private generateMockRevenueData(dateRange: DateRange): RevenueChartData[] {
    const data: RevenueChartData[] = [];
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const points = Math.min(daysDiff + 1, 30);
    
    for (let i = 0; i < points; i++) {
      const date = new Date(dateRange.from);
      date.setDate(date.getDate() + i);
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        ingresos: Math.floor(Math.random() * 500000) + 100000,
        meta: 300000,
        label: format(date, 'dd/MM')
      });
    }
    
    return data;
  }

  private generateMockMembershipDistribution(): MembershipDistributionData[] {
    const memberships = [
      { name: 'Básica', value: 45, color: '#3b82f6' },
      { name: 'Premium', value: 25, color: '#10b981' },
      { name: 'VIP', value: 15, color: '#f59e0b' },
      { name: 'Estudiante', value: 10, color: '#8b5cf6' },
      { name: 'Familiar', value: 5, color: '#ef4444' }
    ];

    const total = memberships.reduce((sum, m) => sum + m.value, 0);
    
    return memberships.map(membership => ({
      ...membership,
      percentage: (membership.value / total) * 100
    }));
  }

  // Construir parámetros para la consulta
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

export default new DashboardService(); 