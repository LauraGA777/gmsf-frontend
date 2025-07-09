import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { 
  CreditCard, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatCurrency } from '@/shared/lib/formatCop';

interface MembershipStatsProps {
  membershipStats: any;
}

export function MembershipStats({ membershipStats }: MembershipStatsProps) {
  if (!membershipStats) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const {
    totalMemberships,
    activeMemberships,
    inactiveMemberships,
    popularMemberships,
    membershipRevenue,
    newMemberships,
    membershipDetails
  } = membershipStats;

  // Calcular métricas
  const activePercentage = totalMemberships > 0 ? (activeMemberships / totalMemberships) * 100 : 0;
  const newMembershipsPercentage = totalMemberships > 0 ? (newMemberships / totalMemberships) * 100 : 0;
  const averageRevenue = activeMemberships > 0 ? membershipRevenue / activeMemberships : 0;

  // Obtener la membresía más popular
  const mostPopular = popularMemberships && popularMemberships.length > 0 ? popularMemberships[0] : null;

  // Obtener la membresía más cara
  const mostExpensive = membershipDetails && membershipDetails.length > 0 
    ? membershipDetails.reduce((max, membership) => 
        membership.precio > max.precio ? membership : max
      )
    : null;

  const stats = [
    {
      title: 'Total Membresías',
      value: totalMemberships || 0,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: 'Membresías en el sistema'
    },
    {
      title: 'Membresías Activas',
      value: activeMemberships || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: `${activePercentage.toFixed(1)}% del total`,
      progress: activePercentage
    },
    {
      title: 'Membresías Inactivas',
      value: inactiveMemberships || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      description: `${(100 - activePercentage).toFixed(1)}% del total`,
      progress: 100 - activePercentage
    },
    {
      title: 'Nuevas Membresías',
      value: newMemberships || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      description: `${newMembershipsPercentage.toFixed(1)}% del total`,
      progress: newMembershipsPercentage
    },
    {
      title: 'Ingresos por Membresías',
      value: formatCurrency(membershipRevenue || 0),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      description: 'Ingresos totales'
    },
    {
      title: 'Ingreso Promedio',
      value: formatCurrency(averageRevenue),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      description: 'Por membresía activa'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`p-4 rounded-lg border ${stat.bgColor} border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.title}
                  </h4>
                </div>
                <span className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
              
              {stat.progress !== undefined && (
                <Progress value={stat.progress} className="h-2 mb-2" />
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Información destacada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Membresía más popular */}
        {mostPopular && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Membresía Más Popular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-800 dark:text-green-200">
                    {mostPopular.nombre}
                  </span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {mostPopular.activeContracts} contratos
                  </Badge>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Precio: {formatCurrency(mostPopular.precio)}
                </div>
                <Progress 
                  value={mostPopular.activeContracts > 0 ? Math.min((mostPopular.activeContracts / 50) * 100, 100) : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Membresía más cara */}
        {mostExpensive && (
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Membresía Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-purple-800 dark:text-purple-200">
                    {mostExpensive.nombre}
                  </span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    {mostExpensive.totalContracts} contratos
                  </Badge>
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Precio: {formatCurrency(mostExpensive.precio)}
                </div>
                <div className="text-xs text-purple-500 dark:text-purple-400">
                  Acceso: {mostExpensive.dias_acceso}/{mostExpensive.vigencia_dias} días
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de membresías */}
      {membershipDetails && membershipDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Todas las Membresías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {membershipDetails.map((membership, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${membership.estado ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {membership.nombre}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {membership.codigo} • {membership.dias_acceso}/{membership.vigencia_dias} días
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(membership.precio)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {membership.totalContracts} contratos
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
