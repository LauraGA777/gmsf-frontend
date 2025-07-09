import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Badge } from '@/shared/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RevenueData {
  date: string;
  ingresos: number;
  meta?: number;
  label: string;
}

interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  loading?: boolean;
  currency?: string;
}

export function RevenueChart({ 
  data, 
  title = "Ingresos", 
  period, 
  loading,
  currency = "COP"
}: RevenueChartProps) {
  if (loading) {
    return (
      <div className="p-6 h-[400px]">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">Cargando datos...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[280px] bg-gray-50 rounded-xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-200 rounded-full mb-4"></div>
            <div className="h-4 bg-emerald-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const total = data.reduce((sum, item) => sum + item.ingresos, 0);
  const average = data.length > 0 ? Math.round(total / data.length) : 0;
  const max = Math.max(...data.map(item => item.ingresos));
  const min = Math.min(...data.map(item => item.ingresos));

  // Calcular tendencia
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.ingresos, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.ingresos, 0) / secondHalf.length;
  const trend = secondHalfAvg > firstHalfAvg ? 'up' : 'down';
  const trendPercentage = firstHalfAvg > 0 ? Math.abs(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100) : 0;

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-emerald-600">
            <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
            Ingresos: {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.meta && (
            <p className="text-blue-600">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Meta: {formatCurrency(payload[0].payload.meta)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      {/* Header del gráfico */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">Rendimiento financiero</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{trendPercentage.toFixed(1)}%
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">
                <TrendingDown className="h-3 w-3 mr-1" />
                -{trendPercentage.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
        
        {/* Mini estadísticas */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-lg font-bold text-emerald-600">{formatCurrency(total)}</div>
            <div className="text-xs text-emerald-600 font-medium">Total</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{formatCurrency(average)}</div>
            <div className="text-xs text-blue-600 font-medium">Promedio</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{formatCurrency(max)}</div>
            <div className="text-xs text-purple-600 font-medium">Máximo</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{formatCurrency(min)}</div>
            <div className="text-xs text-orange-600 font-medium">Mínimo</div>
          </div>
        </div>
      </div>
      
      {/* Gráfico */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={customTooltip} />
            
            {/* Línea de referencia para el promedio */}
            <ReferenceLine 
              y={average} 
              stroke="#6b7280" 
              strokeDasharray="5 5" 
              label={{ value: "Promedio", position: "topRight", fontSize: 10, fill: '#6b7280' }}
            />
            
            <Bar 
              dataKey="ingresos" 
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              fillOpacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Período: {data.length} {period === 'daily' ? 'días' : period === 'weekly' ? 'semanas' : period === 'monthly' ? 'meses' : 'años'}</span>
          </div>
          <div>
            Actualizado: {format(new Date(), 'HH:mm', { locale: es })}
          </div>
        </div>
      </div>
    </div>
  );
} 