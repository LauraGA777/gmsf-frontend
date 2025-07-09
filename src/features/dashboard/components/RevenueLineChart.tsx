import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DollarSign, TrendingUp, Target, Calendar } from 'lucide-react';
import { formatCOP } from '@/shared/lib/formatCop';

interface RevenueData {
  date: string;
  ingresos: number;
  meta?: number;
  label: string;
}

interface RevenueLineChartProps {
  data: RevenueData[];
  loading?: boolean;
  title?: string;
}

export function RevenueLineChart({ 
  data, 
  loading = false, 
  title = "Tendencia de Ingresos" 
}: RevenueLineChartProps) {
  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-green-200 rounded-full mb-4"></div>
          <div className="h-4 bg-green-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay datos de ingresos disponibles</p>
          <p className="text-xs text-gray-400 mt-1">Verifica la conexión con la base de datos</p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalRevenue = data.reduce((sum, item) => sum + (item.ingresos || 0), 0);
  const averageRevenue = totalRevenue / data.length;
  const maxRevenue = Math.max(...data.map(item => item.ingresos || 0));
  const minRevenue = Math.min(...data.map(item => item.ingresos || 0));
  const totalMeta = data.reduce((sum, item) => sum + (item.meta || 0), 0);
  const metaAchievement = totalMeta > 0 ? (totalRevenue / totalMeta) * 100 : 0;

  // Determinar tendencia
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + (item.ingresos || 0), 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + (item.ingresos || 0), 0) / secondHalf.length;
  const trendDirection = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable';
  const trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-green-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Ingresos: {formatCOP(data.ingresos)}</span>
            </p>
            {data.meta && (
              <p className="text-blue-600 flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>Meta: {formatCOP(data.meta)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{data.length} días analizados</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className={`h-3 w-3 ${trendDirection === 'up' ? 'text-green-600' : trendDirection === 'down' ? 'text-red-600' : 'text-gray-600'}`} />
          <span className={`text-xs font-medium ${trendDirection === 'up' ? 'text-green-700' : trendDirection === 'down' ? 'text-red-700' : 'text-gray-700'}`}>
            {trendDirection === 'up' ? '+' : trendDirection === 'down' ? '-' : ''}{Math.abs(trendPercentage).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Estadísticas mini */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="text-sm font-bold text-green-600">{formatCOP(totalRevenue)}</div>
          <div className="text-xs text-green-600 font-medium">Total</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-sm font-bold text-blue-600">{formatCOP(averageRevenue)}</div>
          <div className="text-xs text-blue-600 font-medium">Promedio</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="text-sm font-bold text-purple-600">{formatCOP(maxRevenue)}</div>
          <div className="text-xs text-purple-600 font-medium">Máximo</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <div className="text-sm font-bold text-orange-600">{metaAchievement.toFixed(1)}%</div>
          <div className="text-xs text-orange-600 font-medium">Meta</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[300px] bg-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="metaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCOP(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
            {totalMeta > 0 && (
              <Area
                type="monotone"
                dataKey="meta"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#metaGradient)"
                dot={false}
                activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Información adicional */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>Período: {data[0]?.label} - {data[data.length - 1]?.label}</span>
        </div>
        <div className="text-xs text-gray-500">
          Rango: {formatCOP(minRevenue)} - {formatCOP(maxRevenue)}
        </div>
      </div>
    </div>
  );
} 