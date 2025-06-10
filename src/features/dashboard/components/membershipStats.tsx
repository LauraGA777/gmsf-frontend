import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { contractService } from "@/features/contracts/services/contract.service";
import { membershipService } from "@/features/memberships/services/membership.service";
import type { Contract, Membership } from "@/shared/types";

interface MembershipStats {
  totalMemberships: number;
  activeMemberships: number;
  revenue: number;
  averageDuration: number;
}

export function MembershipStats() {
  const [stats, setStats] = useState<MembershipStats>({
    totalMemberships: 0,
    activeMemberships: 0,
    revenue: 0,
    averageDuration: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [contractsResponse, membershipsResponse] = await Promise.all([
          contractService.getContracts(),
          membershipService.getMemberships()
        ]);

        // Verificar que las respuestas tienen la estructura esperada
        const contractsData = contractsResponse?.data?.data || contractsResponse?.data || [];
        const membershipsData = membershipsResponse?.data || [];

        // Asegurar que son arrays antes de procesarlos
        const contracts = Array.isArray(contractsData) ? contractsData : [];
        const memberships = Array.isArray(membershipsData) ? membershipsData : [];

        if (contracts.length === 0 && memberships.length === 0) {
          console.warn('No contracts or memberships data received');
          return;
        }

        // Calculate stats de forma segura
        const now = new Date();
        const activeContracts = contracts.filter(contract => 
          contract && contract.estado === "Activo" && new Date(contract.fecha_fin) >= now
        );

        const totalRevenue = contracts.reduce((sum, contract) => {
          return sum + (contract?.membresia_precio || contract?.precio_total || 0);
        }, 0);

        const totalDuration = contracts.reduce((sum, contract) => {
          if (!contract || !contract.fecha_inicio || !contract.fecha_fin) return sum;
          
          const start = new Date(contract.fecha_inicio);
          const end = new Date(contract.fecha_fin);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) return sum;
          
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // Duration in days
        }, 0);

        setStats({
          totalMemberships: memberships.length,
          activeMemberships: activeContracts.length,
          revenue: totalRevenue,
          averageDuration: contracts.length > 0 ? totalDuration / contracts.length : 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Set default stats in case of error
        setStats({
          totalMemberships: 0,
          activeMemberships: 0,
          revenue: 0,
          averageDuration: 0,
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Membresías</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Número total de tipos de membresías disponibles</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMemberships}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Membresías Activas</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Número de contratos de membresía actualmente activos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeMemberships}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Ingresos totales generados por todas las membresías</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Duración promedio de las membresías en días</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(stats.averageDuration)} días</div>
        </CardContent>
      </Card>
    </div>
  );
}
