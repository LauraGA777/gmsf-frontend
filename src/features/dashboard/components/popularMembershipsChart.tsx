import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MembershipData {
  id: number;
  nombre: string;
  precio: number;
  activeContracts: number;
}

interface PopularMembershipsChartProps {
  data: MembershipData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function PopularMembershipsChart({ data }: PopularMembershipsChartProps) {
  // Transformar los datos para el gráfico
  const chartData = data.map((membership, index) => ({
    name: membership.nombre,
    value: membership.activeContracts,
    color: COLORS[index % COLORS.length],
    precio: membership.precio
  }));

  // Calcular el total de contratos activos
  const totalContracts = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalContracts) * 100).toFixed(1);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Contratos activos: {data.value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Porcentaje: {percentage}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Precio: ${data.precio.toLocaleString('es-CO')}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <ul className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No hay datos de membresías disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {totalContracts}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total contratos activos
        </p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => 
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-2">
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Más popular
          </p>
          {chartData.length > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: chartData[0].color }}
              />
              <span className="text-gray-600 dark:text-gray-400">
                {chartData[0].name} ({chartData[0].value} contratos)
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Más cara
          </p>
          {chartData.length > 0 && (
            <div className="flex items-center gap-2">
              {(() => {
                const mostExpensive = chartData.reduce((max, item) => 
                  item.precio > max.precio ? item : max
                );
                return (
                  <>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: mostExpensive.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                      {mostExpensive.name} (${mostExpensive.precio.toLocaleString('es-CO')})
                    </span>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}