import React, { useState, useEffect } from 'react';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { RefreshCw } from 'lucide-react';

interface ClassesCompletedChartProps {
  period: 'daily' | 'monthly' | 'yearly';
}

interface ChartData {
  name: string;
  clases: number;
  date: string;
}

export function ClassesCompletedChart({ period }: ClassesCompletedChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMockData = (period: string): ChartData[] => {
    const now = new Date();
    const data: ChartData[] = [];
    
    if (period === 'daily') {
      // Últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        data.push({
          name: date.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            day: 'numeric' 
          }),
          clases: Math.floor(Math.random() * 15) + 5, // 5-20 clases por día
          date: date.toISOString().split('T')[0]
        });
      }
    } else if (period === 'monthly') {
      // Últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        data.push({
          name: date.toLocaleDateString('es-ES', { 
            month: 'short',
            year: '2-digit'
          }),
          clases: Math.floor(Math.random() * 200) + 100, // 100-300 clases por mes
          date: date.toISOString().split('T')[0]
        });
      }
    } else {
      // Últimos 5 años
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        
        data.push({
          name: date.getFullYear().toString(),
          clases: Math.floor(Math.random() * 1000) + 500, // 500-1500 clases por año
          date: date.toISOString().split('T')[0]
        });
      }
    }
    
    return data;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData = generateMockData(period);
      setData(mockData);
    } catch (error) {
      console.error('Error loading classes data:', error);
      setError('Error al cargar datos de clases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const getChartTitle = () => {
    switch (period) {
      case 'daily':
        return 'Clases Completadas - Últimos 7 días';
      case 'monthly':
        return 'Clases Completadas - Últimos 6 meses';
      case 'yearly':
        return 'Clases Completadas - Últimos 5 años';
      default:
        return 'Clases Completadas';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="text-purple-600 dark:text-purple-400">
            Clases completadas: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button
            onClick={loadData}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No hay datos disponibles</p>
      </div>
    );
  }

  // Calcular estadísticas
  const total = data.reduce((sum, item) => sum + item.clases, 0);
  const average = Math.round(total / data.length);
  const max = Math.max(...data.map(item => item.clases));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getChartTitle()}
        </h3>
        <button
          onClick={loadData}
          disabled={loading}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorClases" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis 
            dataKey="name" 
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="clases"
            stroke="#8b5cf6"
            fillOpacity={1}
            fill="url(#colorClases)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <div>
          <p className="font-medium">Promedio</p>
          <p>{average}</p>
        </div>
        <div>
          <p className="font-medium">Máximo</p>
          <p>{max}</p>
        </div>
        <div>
          <p className="font-medium">Total</p>
          <p>{total}</p>
        </div>
      </div>
    </div>
  );
}
