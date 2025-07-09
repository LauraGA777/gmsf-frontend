import api from '@/shared/services/api';
import { DateRange } from '@/features/dashboard/components/DateRangeFilter';
import { format } from 'date-fns';

export interface DashboardStats {
  // Estadísticas de asistencia
  attendance: {
    total: number;
    activos: number;
    eliminados: number;
    date: string;
  };
  
  // Estadísticas de contratos
  contracts: {
    totalContracts: number;
    activeContracts: number;
    expiredContracts: number;
    cancelledContracts: number;
    newContracts: number;
    totalRevenue: number;
    periodRevenue: number;
    recentContracts: Array<{
      id: number;
      codigo: string;
      membresia_precio: number;
      fecha_inicio: string;
      fecha_fin: string;
      estado: string;
      persona: {
        usuario: {
          nombre: string;
          apellido: string;
        };
      };
      membresia: {
        nombre: string;
        precio: number;
      };
    }>;
  };
  
  // Estadísticas de membresías
  memberships: {
    totalMemberships: number;
    activeMemberships: number;
    inactiveMemberships: number;
    newMemberships: number;
    popularMemberships: Array<{
      id: number;
      nombre: string;
      precio: number;
      activeContracts: number;
    }>;
  };
}

// Nuevas interfaces para gráficos
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
  // Nuevos campos para rangos personalizados
  dateFrom?: string;
  dateTo?: string;
}

class DashboardService {
  // Obtener estadísticas completas del dashboard
  async getDashboardStats(config: PeriodConfig): Promise<DashboardStats> {
    try {
      const [attendanceStats, contractStats, membershipStats] = await Promise.all([
        this.getAttendanceStats(config),
        this.getContractStats(config),
        this.getMembershipStats(config)
      ]);

      return {
        attendance: attendanceStats,
        contracts: contractStats,
        memberships: membershipStats
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Error al cargar las estadísticas del dashboard');
    }
  }

  // Obtener estadísticas de asistencia
  private async getAttendanceStats(config: PeriodConfig) {
    try {
      const params = this.buildParams(config);
      const response = await api.get(`/attendance/stats`, { params });
      const data = response.data as any;
      return data.data || data;
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
      return {
        total: 0,
        activos: 0,
        eliminados: 0,
        date: new Date().toISOString()
      };
    }
  }

  // Obtener estadísticas de contratos
  private async getContractStats(config: PeriodConfig) {
    try {
      const params = this.buildParams(config);
      const response = await api.get(`/contracts/stats`, { params });
      const data = response.data as any;
      return data.data || data;
    } catch (error) {
      console.error('Error fetching contract stats:', error);
      return {
        totalContracts: 0,
        activeContracts: 0,
        expiredContracts: 0,
        cancelledContracts: 0,
        newContracts: 0,
        totalRevenue: 0,
        periodRevenue: 0,
        recentContracts: []
      };
    }
  }

  // Obtener estadísticas de membresías
  private async getMembershipStats(config: PeriodConfig) {
    try {
      const params = this.buildParams(config);
      const response = await api.get(`/memberships/stats`, { params });
      const data = response.data as any;
      return data.data || data;
    } catch (error) {
      console.error('Error fetching membership stats:', error);
      return {
        totalMemberships: 0,
        activeMemberships: 0,
        inactiveMemberships: 0,
        newMemberships: 0,
        popularMemberships: []
      };
    }
  }

  // Nuevos métodos para datos de gráficos
  async getAttendanceChartData(dateRange: DateRange): Promise<AttendanceChartData[]> {
    try {
      const config = this.dateRangeToConfig(dateRange);
      const params = this.buildParams(config);
      const response = await api.get('/attendance/chart', { params });
      const data = response.data as any;
      return data.data || data || [];
    } catch (error) {
      console.error('Error fetching attendance chart data:', error);
      return this.generateMockAttendanceData(dateRange);
    }
  }

  async getRevenueChartData(dateRange: DateRange): Promise<RevenueChartData[]> {
    try {
      const config = this.dateRangeToConfig(dateRange);
      const params = this.buildParams(config);
      const response = await api.get('/contracts/revenue-chart', { params });
      const data = response.data as any;
      return data.data || data || [];
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      return this.generateMockRevenueData(dateRange);
    }
  }

  async getMembershipDistributionData(dateRange: DateRange): Promise<MembershipDistributionData[]> {
    try {
      const config = this.dateRangeToConfig(dateRange);
      const params = this.buildParams(config);
      const response = await api.get('/memberships/distribution', { params });
      const data = response.data as any;
      return data.data || data || [];
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
    const points = Math.min(daysDiff + 1, 30); // Máximo 30 puntos
    
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