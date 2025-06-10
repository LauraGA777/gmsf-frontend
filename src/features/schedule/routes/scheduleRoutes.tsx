import { SchedulePage } from "@/features/schedule/pages/SchedulePage";
import { ClientSchedulePage } from "@/features/schedule/pages/ClientSchedulePage";

export const scheduleRoutes = [
  {
    path: "/schedule",
    element: <SchedulePage />,
  },
  {
    path: "/calendar",
    element: <SchedulePage />,
  },
  {
    path: "/client-schedule",
    element: <ClientSchedulePage />,
  },
];