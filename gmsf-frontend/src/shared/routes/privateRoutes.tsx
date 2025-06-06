import { attendanceRoutes } from "@/features/attendance/routes/attendanceRoutes";
import { scheduleRoutes } from "@/features/schedule/routes/scheduleRoutes";
import { clientRoutes } from "@/features/clients/routes/clientRoutes";
import { clientsRoutes } from "@/features/clients/routes/clientsRoutes";
import { contractsRoutes } from "@/features/contracts/routes/contractsRoutes";
import { dashboardRoutes } from "@/features/dashboard/routes/dashboardRoutes";
import { membershipsRoutes } from "@/features/memberships/routes/membershipsRoutes";
import { rolesRoutes } from "@/features/roles/routes/rolesRoutes";
import { servicesRoutes } from "@/features/services/routes/servicesRoutes";
import { trainersRoutes } from "@/features/trainers/routes/trainersRoutes";
import { userRoutes } from "@/features/users/routes/userRoutes";

export const privateRoutes = [
    ...attendanceRoutes,
    ...scheduleRoutes,
    ...clientRoutes,
    ...clientsRoutes,
    ...contractsRoutes,
    ...dashboardRoutes,
    ...membershipsRoutes,
    ...rolesRoutes,
    ...trainersRoutes,
    ...servicesRoutes,
    ...userRoutes,
];