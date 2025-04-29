import { calendarRoutes } from "@/components/calendar/routes";
import { clientsRoutes } from "@/components/clients/routes";
import { contractsRoutes } from "@/components/contracts/routes";
import { dashboardRoutes } from "@/components/dashboard/routes/index";
import { servicesRoutes } from "@/components/services/routes";
import { usersRoutes } from "@/components/users/routes";
import { membershipRoutes } from "@/components/membership/routes";

export const privateRoutes = [
  ...calendarRoutes,
  ...clientsRoutes,
  ...contractsRoutes,
  ...dashboardRoutes,
  ...servicesRoutes,
  ...usersRoutes,
  ...membershipRoutes,
];