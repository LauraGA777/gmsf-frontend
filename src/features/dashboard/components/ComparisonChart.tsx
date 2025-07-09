import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ComparisonData {
  period: string;
  currentPeriod: number;
  previousPeriod: number;
  label: string;
  growth: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  title?: string;
  metric: 'attendance' | 'revenue' | 'contracts';
  loading?: boolean;
  currentPeriodLabel?: string;
  previousPeriodLabel?: string;
}

export function ComparisonChart({ 
  data, 
  title = "Comparación de Períodos", 
  metric,
  loading,
  currentPeriodLabel = "Período Actual",
  previousPeriodLabel = "Período Anterior"
}: ComparisonChartProps) {
  if (loading) {
    return (
      <Card className="w-full h-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estadísticas
  const totalCurrent = data.reduce((sum, item) => sum + item.currentPeriod, 0);
  const totalPrevious = data.reduce((sum, item) => sum + item.previousPeriod, 0);
  const averageGrowth = data.reduce((sum, item) => sum + item.growth, 0) / data.length;
  const totalGrowth = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious) * 100 : 0;

  // Formatear valores según la métrica
  const formatValue = (value: number) => {
    if (metric === 'revenue') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    return value.toString();
  };

  const getMetricColor = () => {
    switch (metric) {
      case 'attendance': return { current: '#3b82f6', previous: '#93c5fd' };
      case 'revenue': return { current: '#10b981', previous: '#86efac' };
      case 'contracts': return { current: '#8b5cf6', previous: '#c4b5fd' };
      default: return { current: '#6b7280', previous: '#d1d5db' };
    }
  };

  const colors = getMetricColor();

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              {currentPeriodLabel}: {formatValue(data.currentPeriod)}
            </p>
            <p className="text-sm">
              <span className="inline-block w-3 h-3 bg-blue-300 rounded-full mr-2"></span>
              {previousPeriodLabel}: {formatValue(data.previousPeriod)}
            </p>
            <p className={`text-sm font-medium ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Crecimiento: {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {totalGrowth >= 0 ? (
              <Badge className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{totalGrowth.toFixed(1)}%
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">
                <TrendingDown className="h-3 w-3 mr-1" />
                {totalGrowth.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
        
        {/* Estadísticas de resumen */}
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{formatValue(totalCurrent)}</div>
            <div className="text-xs text-gray-500">{currentPeriodLabel}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-600">{formatValue(totalPrevious)}</div>
            <div className="text-xs text-gray-500">{previousPeriodLabel}</div>
          </div>
          <div className="text-center">
            <div className={`text-xl font-bold ${averageGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {averageGrowth >= 0 ? '+' : ''}{averageGrowth.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Crecimiento Promedio</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => metric === 'revenue' ? formatValue(value) : value}
              />
              <Tooltip content={customTooltip} />
              <Legend />
              
              <Bar 
                dataKey="previousPeriod" 
                fill={colors.previous}
                name={previousPeriodLabel}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="currentPeriod" 
                fill={colors.current}
                name={currentPeriodLabel}
                radius={[2, 2, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="growth" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="% Crecimiento"
                yAxisId="right"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {data.length} períodos comparados
              </span>
            </div>
            <div>
              Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 