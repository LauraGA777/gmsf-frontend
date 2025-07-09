import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Crown, AlertCircle } from 'lucide-react';
import { formatCOP } from '@/shared/lib/formatCop';

interface MembershipData {
  id: number;
  nombre: string;
  precio: number;
  activeContracts: number;
}

interface PopularMembershipsChartProps {
  data: MembershipData[];
  loading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function PopularMembershipsChart({ data, loading }: PopularMembershipsChartProps) {
  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-orange-200 rounded-full mb-4"></div>
          <div className="h-4 bg-orange-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay datos de membresías disponibles</p>
          <p className="text-xs text-gray-400 mt-1">Verifica la conexión con la base de datos</p>
        </div>
      </div>
    );
  }

  // Filtrar datos válidos y transformar para el gráfico
  const validData = data.filter(membership => 
    membership && 
    typeof membership.nombre === 'string' && 
    typeof membership.activeContracts === 'number' && 
    membership.activeContracts > 0 &&
    typeof membership.precio === 'number' &&
    membership.precio > 0
  );

  if (validData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay membresías con contratos activos</p>
          <p className="text-xs text-gray-400 mt-1">Los datos pueden estar siendo procesados</p>
        </div>
      </div>
    );
  }

  // Transformar los datos para el gráfico
  const chartData = validData.map((membership, index) => ({
    name: membership.nombre || `Membresía ${index + 1}`,
    value: membership.activeContracts || 0,
    color: COLORS[index % COLORS.length],
    precio: membership.precio || 0
  }));

  // Calcular el total de contratos activos
  const totalContracts = chartData.reduce((sum, item) => sum + (item.value || 0), 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalContracts > 0 ? ((data.value / totalContracts) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Contratos: {data.value}</p>
          <p className="text-sm text-gray-600">Porcentaje: {percentage}%</p>
          <p className="text-sm text-gray-600">Precio: {formatCOP(data.precio)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="mt-4 space-y-2">
        {payload.map((entry: any, index: number) => {
          const percentage = totalContracts > 0 ? ((entry.payload.value / totalContracts) * 100).toFixed(1) : '0.0';
          return (
            <div key={`item-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {entry.value}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">{entry.payload.value}</div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Calcular estadísticas con validación
  const mostPopular = chartData.reduce((max, item) => 
    (item.value || 0) > (max.value || 0) ? item : max, chartData[0]);
  
  const mostExpensive = chartData.reduce((max, item) => 
    (item.precio || 0) > (max.precio || 0) ? item : max, chartData[0]);

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Membresías Populares</h3>
            <p className="text-xs text-gray-500">Total: {totalContracts} contratos</p>
          </div>
        </div>
        {mostPopular && (
          <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
            <Crown className="h-3 w-3 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">
              {mostPopular.name}
            </span>
          </div>
        )}
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">
            {mostPopular?.value || 0}
          </div>
          <div className="text-xs text-blue-600 font-medium">Más Popular</div>
          <div className="text-xs text-gray-500 truncate" title={mostPopular?.name}>
            {mostPopular?.name || 'N/A'}
          </div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">
            {formatCOP(mostExpensive?.precio || 0)}
          </div>
          <div className="text-xs text-green-600 font-medium">Más Cara</div>
          <div className="text-xs text-gray-500 truncate" title={mostExpensive?.name}>
            {mostExpensive?.name || 'N/A'}
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[200px] bg-gray-50 rounded-lg p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Información adicional */}
      <div className="text-center p-2 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600">
          Mostrando {chartData.length} de {data.length} membresías con contratos activos
        </div>
      </div>
    </div>
  );
}