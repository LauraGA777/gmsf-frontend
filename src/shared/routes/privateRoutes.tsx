import { calendarRoutes } from "@/features/schedule/routes/RoutesSchedule";
import { clientsRoutes } from "@/features/clients/routes/ClientsRoutes";
import { contractsRoutes } from "@/features/contracts/routes/ContractsRoutes";
import { dashboardRoutes } from "@/features/dashboard/routes/DashboardRoutes";
import { clientRoutes } from "@/features/clients/routes/ClientRoutes";

export const privateRoutes = [
  ...calendarRoutes,
  ...clientsRoutes,
  ...contractsRoutes,
  ...dashboardRoutes,
  ...clientRoutes
];