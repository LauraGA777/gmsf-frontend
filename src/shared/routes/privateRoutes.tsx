import { calendarRoutes } from "@/features/schedule/routes/RoutesSchedule";
import { clientsRoutes } from "@/features/clients/routes/ClientsRoutes";
import { contractsRoutes } from "@/features/contracts/routes/ContractsRoutes";
import { dashboardRoutes } from "@/features/dashboard/routes/DashboardRoutes";

export const privateRoutes = [
  ...calendarRoutes,
  ...clientsRoutes,
  ...contractsRoutes,
  ...dashboardRoutes
];