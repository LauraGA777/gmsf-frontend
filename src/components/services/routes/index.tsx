import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ServiceListPage } from "@/pages/services/ServiceListPage";
import { TrainerListPage } from "@/pages/services/TrainerListPage";
import { TrainingSchedulePage } from "@/pages/services/TrainingSchedulePage";

export const servicesRoutes = [
  {
    path: "services",
    element: (
      <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
        <ServiceListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "services/trainers",
    element: (
      <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
        <TrainerListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "services/training-schedule",
    element: (
      <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
        <TrainingSchedulePage />
      </ProtectedRoute>
    ),
  },
]; 