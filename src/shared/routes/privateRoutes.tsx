import { attendanceRoutes } from "@/features/attendance/routes/attendanceRoutes";
import { scheduleRoutes } from "@/features/schedule/routes/scheduleRoutes";
import { clientsRoutes } from "@/features/clients/routes/clientsRoutes";
import { contractsRoutes } from "@/features/contracts/routes/contractsRoutes";
import { dashboardRoutes } from "@/features/dashboard/routes/dashboardRoutes";
import { membershipsRoutes } from "@/features/memberships/routes/membershipsRoutes";
import { rolesRoutes } from "@/features/roles/routes/rolesRoutes";
import { trainersRoutes } from "@/features/trainers/routes/trainerRoutes";
import { userRoutes } from "@/features/users/routes/userRoutes";

export const privateRoutes = [
    ...attendanceRoutes,
    ...scheduleRoutes,
    ...clientsRoutes,
    ...contractsRoutes,
    ...dashboardRoutes,
    ...membershipsRoutes,
    ...rolesRoutes,
    ...trainersRoutes,
    ...userRoutes,
];