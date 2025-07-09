import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, TrendingUp, Calendar } from 'lucide-react';

interface AttendanceData {
  date: string;
  asistencias: number;
  label: string;
}

interface AttendanceBarChartProps {
  data: AttendanceData[];
  loading?: boolean;
  title?: string;
}

export function AttendanceBarChart({ 
  data, 
  loading = false, 
  title = "Asistencias por Día" 
}: AttendanceBarChartProps) {
  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
          <div className="h-4 bg-blue-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay datos de asistencias disponibles</p>
          <p className="text-xs text-gray-400 mt-1">Verifica la conexión con la base de datos</p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalAttendance = data.reduce((sum, item) => sum + (item.asistencias || 0), 0);
  const averageAttendance = totalAttendance / data.length;
  const maxAttendance = Math.max(...data.map(item => item.asistencias || 0));
  const minAttendance = Math.min(...data.map(item => item.asistencias || 0));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>{data.asistencias} asistencias</span>
          </p>
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
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{data.length} días analizados</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
          <TrendingUp className="h-3 w-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">
            {averageAttendance.toFixed(1)} promedio
          </span>
        </div>
      </div>

      {/* Estadísticas mini */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">{totalAttendance}</div>
          <div className="text-xs text-blue-600 font-medium">Total</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="text-lg font-bold text-green-600">{maxAttendance}</div>
          <div className="text-xs text-green-600 font-medium">Máximo</div>
        </div>
        <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <div className="text-lg font-bold text-orange-600">{averageAttendance.toFixed(1)}</div>
          <div className="text-xs text-orange-600 font-medium">Promedio</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[300px] bg-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
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
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="asistencias" 
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
              stroke="#3b82f6"
              strokeWidth={1}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Información adicional */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="h-3 w-3" />
          <span>Período: {data[0]?.label} - {data[data.length - 1]?.label}</span>
        </div>
        <div className="text-xs text-gray-500">
          Rango: {minAttendance} - {maxAttendance} asistencias
        </div>
      </div>
    </div>
  );
} 