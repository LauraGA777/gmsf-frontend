import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { Users, AlertCircle, Crown, Star, CreditCard } from 'lucide-react';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Badge } from '@/shared/components/ui/badge';

// ✅ Interface para datos que llegan del backend
interface RawMembershipData {
  id: number;
  nombre: string;
  precio: number;
  activeContracts: number;
}

// ✅ Interface para datos procesados del gráfico
interface PopularMembershipData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PopularMembershipsChartProps {
  data: RawMembershipData[] | PopularMembershipData[]; // ✅ Acepta ambos formatos
  title?: string;
  loading?: boolean;
  total?: number;
}

export function PopularMembershipsChart({ 
  data, 
  title = "Membresías Populares", 
  loading = false,
  total
}: PopularMembershipsChartProps) {
  console.log('PopularMembershipsChart - Raw data received:', data);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="h-[350px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-200 rounded-full mb-4"></div>
            <div className="h-4 bg-purple-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Función para transformar datos del backend
  const transformBackendData = (rawData: RawMembershipData[]): PopularMembershipData[] => {
    if (!Array.isArray(rawData) || rawData.length === 0) return [];

    // Filtrar datos válidos
    const validRawData = rawData.filter(item => 
      item && 
      typeof item.nombre === 'string' && 
      typeof item.activeContracts === 'number' && 
      item.activeContracts > 0
    );

    if (validRawData.length === 0) return [];

    // Calcular total para porcentajes
    const totalContracts = validRawData.reduce((sum, item) => sum + item.activeContracts, 0);

    // Colores para las membresías
    const colors = [
      '#3b82f6', // azul
      '#10b981', // verde
      '#f59e0b', // amarillo
      '#ef4444', // rojo
      '#8b5cf6', // violeta
      '#f97316', // naranja
      '#06b6d4', // cyan
      '#84cc16'  // lima
    ];

    // Transformar datos
    return validRawData.map((item, index) => ({
      name: item.nombre,
      value: item.activeContracts,
      percentage: totalContracts > 0 ? (item.activeContracts / totalContracts) * 100 : 0,
      color: colors[index % colors.length]
    }));
  };

  // ✅ Función para verificar si los datos ya están procesados
  const isProcessedData = (data: any[]): data is PopularMembershipData[] => {
    return data.length > 0 && 
           'name' in data[0] && 
           'value' in data[0] && 
           'percentage' in data[0] && 
           'color' in data[0];
  };

  // ✅ Transformar datos según el formato recibido
  let chartData: PopularMembershipData[] = [];

  if (!data || !Array.isArray(data) || data.length === 0) {
    // Datos de fallback
    chartData = [
      { name: 'Membresía Básica', value: 45, percentage: 45, color: '#3b82f6' },
      { name: 'Membresía Premium', value: 30, percentage: 30, color: '#10b981' },
      { name: 'Membresía VIP', value: 25, percentage: 25, color: '#f59e0b' }
    ];
  } else if (isProcessedData(data)) {
    // Los datos ya están procesados
    chartData = data;
  } else {
    // Los datos vienen del backend y necesitan transformación
    chartData = transformBackendData(data as RawMembershipData[]);
  }

  console.log('PopularMembershipsChart - Processed data:', chartData);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay membresías populares disponibles</p>
            <p className="text-xs text-gray-400 mt-1">Los datos se cargarán cuando haya contratos activos</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Validar datos finales
  const validData = chartData.filter(item => {
    const isValid = item && 
      typeof item.name === 'string' && 
      typeof item.value === 'number' && 
      item.value > 0 &&
      typeof item.percentage === 'number' &&
      item.percentage >= 0 &&
      typeof item.color === 'string';
    
    return isValid;
  });

  if (validData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay datos válidos para mostrar</p>
            <p className="text-xs text-gray-400 mt-1">Verificando contratos activos...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalMemberships = total || validData.reduce((sum, item) => sum + (item.value || 0), 0);
  const mostPopular = validData.reduce((prev, current) => 
    (current.value || 0) > (prev.value || 0) ? current : prev, validData[0]);

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const safePercentage = (data.percentage || 0).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-blue-600 text-sm">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: data.color }}></span>
            {data.value || 0} contratos activos ({safePercentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* ✅ Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Crown className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">Total: {totalMemberships} contratos activos</p>
          </div>
        </div>
        {mostPopular && (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">
            <Star className="h-3 w-3 mr-1" />
            {mostPopular.name}
          </Badge>
        )}
      </div>

      {/* ✅ Layout vertical: Estadísticas arriba + Gráfico en el medio + Desglose abajo */}
      <div className="space-y-4">
        {/* Panel superior - Estadísticas en fila horizontal */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-lg font-bold text-purple-600">{totalMemberships}</div>
            <div className="text-xs text-purple-600 font-medium">Total Contratos</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{validData.length}</div>
            <div className="text-xs text-blue-600 font-medium">Tipos Populares</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
            <div className="text-lg font-bold text-emerald-600">
              {mostPopular ? (mostPopular.percentage || 0).toFixed(0) : '0'}%
            </div>
            <div className="text-xs text-emerald-600 font-medium">Más Popular</div>
          </div>
        </div>

        {/* Panel medio - Solo el gráfico centrado */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="h-[320px] bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={validData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={3}
                  >
                    {validData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Texto central del donut */}
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900">
                    <tspan x="50%" dy="-0.5em" className="text-2xl font-bold">{totalMemberships}</tspan>
                    <tspan x="50%" dy="1.5em" className="text-sm fill-gray-600">Contratos</tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Panel inferior - Desglose en grid horizontal */}
        <div className="space-y-3">
          <h4 className="text-center text-sm font-semibold text-gray-700">Desglose por Tipo de Membresía</h4>
          
          {/* ✅ Layout vertical - cada tarjeta una debajo de otra */}
          <div className="space-y-2">
            {validData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div 
                    className="w-5 h-5 rounded-full flex-shrink-0 border-2 border-white shadow-md" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-900 truncate text-sm" title={entry.name}>
                      {entry.name}
                    </div>
                    <div className="text-xs text-gray-600">{entry.percentage.toFixed(1)}% del total</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="font-bold text-gray-900 text-lg">{entry.value}</div>
                  <div className="text-xs text-gray-500">contratos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Footer info */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-500">
          Mostrando {validData.length} tipos de membresías más populares
        </div>
      </div>
    </>
  );
}