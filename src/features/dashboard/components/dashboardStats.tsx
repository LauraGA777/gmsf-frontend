"use client"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  CalendarDays,
  Activity,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/formatCop";

interface DashboardStatsProps {
  stats: {
    attendance: {
      total: number;
      activos: number;
    };
    contracts: {
      activeContracts: number;
      newContracts: number;
      totalRevenue: number;
      periodRevenue: number;
      expiredContracts: number;
    };
    memberships: {
      activeMemberships: number;
      newMemberships: number;
    };
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statsCards = [
    {
      title: "Asistencias del Mes",
      value: stats.attendance.activos,
      subtitle: `Total: ${stats.attendance.total}`,
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Contratos Activos",
      value: stats.contracts.activeContracts,
      subtitle: `Nuevos: ${stats.contracts.newContracts}`,
      icon: CreditCard,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Ingresos del Mes",
      value: formatCurrency(stats.contracts.periodRevenue),
      subtitle: `Total: ${formatCurrency(stats.contracts.totalRevenue)}`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Membresías Activas",
      value: stats.memberships.activeMemberships,
      subtitle: `Nuevas: ${stats.memberships.newMemberships}`,
      icon: CalendarDays,
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((card, index) => (
        <Card key={index} className={`bg-gradient-to-r ${card.color} text-white border-0`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {card.value}
                </div>
                <p className="text-sm opacity-80">
                  {card.subtitle}
                </p>
              </div>
              <card.icon className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Alerta de contratos expirados */}
      {stats.contracts.expiredContracts > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">
                {stats.contracts.expiredContracts} contratos vencidos requieren atención
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
