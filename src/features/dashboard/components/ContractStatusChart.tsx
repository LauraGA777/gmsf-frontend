import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface ContractStatusData {
  status: string;
  count: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface ContractStatusChartProps {
  data: {
    activeContracts: number;
    expiredContracts: number;
    cancelledContracts: number;
    expiringContracts: number;
  };
  loading?: boolean;
  title?: string;
}

export function ContractStatusChart({ 
  data, 
  loading = false, 
  title = "Estado de Contratos" 
}: ContractStatusChartProps) {
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

  // Preparar datos para el gráfico
  const chartData: ContractStatusData[] = [
    {
      status: 'Activos',
      count: data.activeContracts || 0,
      color: '#10b981',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Contratos vigentes'
    },
    {
      status: 'Por vencer',
      count: data.expiringContracts || 0,
      color: '#f59e0b',
      icon: <Clock className="h-4 w-4" />,
      description: 'Próximos a vencer'
    },
    {
      status: 'Cancelados',
      count: data.cancelledContracts || 0,
      color: '#6b7280',
      icon: <XCircle className="h-4 w-4" />,
      description: 'Contratos cancelados'
    }
  ];

  const totalContracts = chartData.reduce((sum, item) => sum + item.count, 0);

  if (totalContracts === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay datos de contratos disponibles</p>
          <p className="text-xs text-gray-400 mt-1">Verifica la conexión con la base de datos</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalContracts > 0 ? ((data.count / totalContracts) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div style={{ color: data.color }}>
              {data.icon}
            </div>
            <p className="font-semibold text-gray-900">{label}</p>
          </div>
          <p className="text-sm text-gray-600">Cantidad: {data.count}</p>
          <p className="text-sm text-gray-600">Porcentaje: {percentage}%</p>
          <p className="text-xs text-gray-500 mt-1">{data.description}</p>
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
            <FileText className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{totalContracts} contratos totales</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-xs font-medium text-green-700">
            {data.activeContracts} activos
          </span>
        </div>
      </div>

      {/* Estadísticas en cards */}
      <div className="grid grid-cols-3 gap-3">
        {chartData.map((item, index) => {
          const percentage = totalContracts > 0 ? ((item.count / totalContracts) * 100).toFixed(1) : '0.0';
          const bgColor = item.status === 'Activos' ? 'from-green-50 to-green-100 border-green-200' :
                          item.status === 'Por vencer' ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
                          'from-gray-50 to-gray-100 border-gray-200';
          
          return (
            <div key={index} className={`p-3 bg-gradient-to-br ${bgColor} rounded-lg border`}>
              <div className="flex items-center gap-2 mb-2">
                <div style={{ color: item.color }}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-gray-700">{item.status}</span>
              </div>
              <div className="text-xl font-bold text-gray-900">{item.count}</div>
              <div className="text-xs text-gray-500">{percentage}% del total</div>
            </div>
          );
        })}
      </div>

      {/* Gráfico de barras horizontales */}
      <div className="h-[200px] bg-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="horizontal"
            margin={{
              top: 20,
              right: 30,
              left: 60,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category"
              dataKey="status"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              fill="#10b981"
              radius={[0, 4, 4, 0]}
              stroke="#fff"
              strokeWidth={1}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total de contratos:</span>
          <span className="font-semibold text-gray-900">{totalContracts}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Contratos saludables:</span>
          <span className="font-semibold text-green-600">
            {((data.activeContracts / totalContracts) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
} 