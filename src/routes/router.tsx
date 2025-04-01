import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/AppLayout"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { ClientsPage } from "@/pages/clients/ClientsPage"
import { ContractsPage } from "@/pages/contracts/ContractsPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ServiceListPage } from "@/pages/services/ServiceListPage"
import { TrainerListPage } from "@/pages/services/TrainerListPage"
import { TrainerSchedulePage } from "@/pages/services/TrainerSchedulePage"
import { CustomServicesPage } from "@/pages/services/CustomServicesPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "clients",
        element: <ClientsPage />,
      },
      {
        path: "services",
        children: [
          {
            index: true,
            element: <ServiceListPage />,
          },
          {
            path: "list",
            element: <ServiceListPage />,
          },
          {
            path: "trainers",
            element: <TrainerListPage />,
          },
          {
            path: "trainers-schedule",
            element: <TrainerSchedulePage />,
          },
          {
            path: "custom",
            element: <CustomServicesPage />,
          },
        ],
      },
      // Asegurarnos de que la ruta para servicios personalizados apunte al componente correcto
      {
        path: "services/custom",
        element: <CustomServicesPage />,
      },
      {
        path: "contracts",
        element: <ContractsPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
])

