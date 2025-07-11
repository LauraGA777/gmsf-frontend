import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { Users, AlertCircle, Crown, Star, CreditCard } from 'lucide-react';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Badge } from '@/shared/components/ui/badge';

interface MembershipData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface MembershipDistributionChartProps {
  data: MembershipData[];
  title?: string;
  loading?: boolean;
  total?: number;
}

export function MembershipDistributionChart({ 
  data, 
  title = "Distribución de Membresías", 
  loading,
  total
}: MembershipDistributionChartProps) {
  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-200 rounded-full mb-4"></div>
          <div className="h-4 bg-purple-200 rounded w-32 mb-2"></div>
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

  // Filtrar y validar datos
  const validData = data.filter(item => 
    item && 
    typeof item.name === 'string' && 
    typeof item.value === 'number' && 
    item.value > 0 &&
    typeof item.percentage === 'number' &&
    item.percentage >= 0 &&
    typeof item.color === 'string'
  );

  if (validData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay membresías con datos válidos</p>
          <p className="text-xs text-gray-400 mt-1">Los datos pueden estar siendo procesados</p>
        </div>
      </div>
    );
  }

  const totalMemberships = total || validData.reduce((sum, item) => sum + (item.value || 0), 0);
  const mostPopular = validData.reduce((prev, current) => 
    (current.value || 0) > (prev.value || 0) ? current : prev, validData[0]);
  
  const getIcon = (membershipName: string) => {
    const name = membershipName.toLowerCase();
    if (name.includes('premium') || name.includes('oro') || name.includes('vip')) {
      return <Crown className="h-3 w-3 text-yellow-500" />;
    }
    if (name.includes('plus') || name.includes('pro')) {
      return <Star className="h-3 w-3 text-blue-500" />;
    }
    return <Users className="h-3 w-3 text-gray-500" />;
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const safePercentage = (data.percentage || 0).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-blue-600 text-sm">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: data.color }}></span>
            {data.value || 0} miembros ({safePercentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">Total: {totalMemberships}</p>
          </div>
        </div>
        {mostPopular && (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 text-xs">
            <Crown className="h-3 w-3 mr-1" />
            {mostPopular.name}
          </Badge>
        )}
      </div>

      {/* Mini estadísticas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <div className="text-lg font-bold text-purple-600">{totalMemberships}</div>
          <div className="text-xs text-purple-600 font-medium">Total</div>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-lg font-bold text-blue-600">{validData.length}</div>
          <div className="text-xs text-blue-600 font-medium">Tipos</div>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
          <div className="text-lg font-bold text-emerald-600">
            {mostPopular ? (mostPopular.percentage || 0).toFixed(1) : '0.0'}%
          </div>
          <div className="text-xs text-emerald-600 font-medium">Popular</div>
        </div>
      </div>
      
      {/* Gráfico Donut */}
      <div className="h-[280px] bg-gray-50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              innerRadius={45}
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
              <tspan x="50%" dy="1.2em" className="text-sm fill-gray-600">Total</tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda personalizada */}
      <div className="mt-4 space-y-2">
        {validData.map((entry, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              {getIcon(entry.name)}
              <span className="font-medium text-gray-900 text-sm truncate max-w-[120px]" title={entry.name}>
                {entry.name}
              </span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-900 text-sm">{entry.value}</div>
              <div className="text-xs text-gray-500">{entry.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="text-center p-2 bg-gray-50 rounded-lg mt-4">
        <div className="text-xs text-gray-600">
          Mostrando {validData.length} de {data.length} tipos de membresías
        </div>
      </div>
    </div>
  );
} 