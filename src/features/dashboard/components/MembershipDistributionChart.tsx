import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Badge } from '@/shared/components/ui/badge';
import { CreditCard, Users, Crown, Star } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
      <div className="p-6 h-[500px]">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">Cargando datos...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[360px] bg-gray-50 rounded-xl">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-20 h-20 bg-purple-200 rounded-full mb-4"></div>
            <div className="h-4 bg-purple-200 rounded w-40 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalMemberships = total || data.reduce((sum, item) => sum + item.value, 0);
  const mostPopular = data.reduce((prev, current) => (prev.value > current.value) ? prev : current);
  
  const getIcon = (membershipName: string) => {
    const name = membershipName.toLowerCase();
    if (name.includes('premium') || name.includes('oro') || name.includes('vip')) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    if (name.includes('plus') || name.includes('pro')) {
      return <Star className="h-4 w-4 text-blue-500" />;
    }
    return <Users className="h-4 w-4 text-gray-500" />;
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-blue-600">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: data.color }}></span>
            Miembros: {data.value} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="mt-6 space-y-2">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            {getIcon(entry.value)}
            <span className="font-medium text-gray-900">{entry.value}</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">{entry.payload.value}</div>
            <div className="text-xs text-gray-500">{entry.payload.percentage.toFixed(1)}%</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header del gráfico */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">Análisis de tipos de membresía</p>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">
            <Crown className="h-3 w-3 mr-1" />
            Más popular: {mostPopular.name}
          </Badge>
        </div>
        
        {/* Mini estadísticas */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{totalMemberships}</div>
            <div className="text-xs text-purple-600 font-medium">Total Miembros</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{data.length}</div>
            <div className="text-xs text-blue-600 font-medium">Tipos Diferentes</div>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-xl font-bold text-emerald-600">{mostPopular.percentage.toFixed(1)}%</div>
            <div className="text-xs text-emerald-600 font-medium">Más Popular</div>
          </div>
        </div>
      </div>
      
      {/* Gráfico */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Total de miembros activos: {totalMemberships}</span>
          </div>
          <div>
            Actualizado: {format(new Date(), 'HH:mm', { locale: es })}
          </div>
        </div>
      </div>
    </div>
  );
} 