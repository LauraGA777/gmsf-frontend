import React from "react";
import { Navigate } from "react-router-dom";
import { ScheduleComponent } from "../components/ScheduleComponent";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { SchedulePage } from "@/features/schedule/pages/SchedulePage";
import { ClientSchedulePage } from "@/features/schedule/pages/ClientSchedulePage";
import { mockTrainings } from "@/features/data/mockData";
import type { Training } from "@/shared/types";

// Convertir los datos de mockTrainings al formato que esperan los componentes
const calendarTrainings: Training[] = mockTrainings.slice(0, 10).map(t => ({
  id: t.id,
  client: `${t.service?.nombre || ''} - Cliente`,
  clientId: "1",
  trainer: `${t.trainer?.nombre || ''} ${t.trainer?.apellido || ''}`,
  trainerId: String(t.id_entrenador),
  service: t.service?.nombre || '',
  date: new Date(t.fecha),
  startTime: new Date(`${t.fecha}T${t.hora_inicio}`),
  endTime: new Date(`${t.fecha}T${t.hora_fin}`),
  maxCapacity: t.cupo_maximo,
  occupiedSpots: t.cupos_ocupados,
  status: t.estado === "Activo" ? "Activo" : "Cancelado"
}));

export const calendarRoutes = [
    {
        path: "calendar/custom",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <ScheduleComponent 
                    trainings={calendarTrainings}
                    onSelectDate={(date) => console.log("Fecha seleccionada:", date)}
                    selectedDate={new Date()}
                />
            </ProtectedRoute>
        ),
    },
    {
        path: "calendar/enhanced",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <ScheduleComponent 
                    trainings={calendarTrainings}
                    onSelectDate={(date) => console.log("Fecha seleccionada:", date)}
                />
            </ProtectedRoute>
        ),
    },
    {
        path: "calendar",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <SchedulePage />
            </ProtectedRoute>
        ),
    },
    {
        path: "calendar/client",
        element: (
            <ProtectedRoute allowedRoles={["client"]}>
                <ClientSchedulePage />
            </ProtectedRoute>
        ),
    },
    // Ruta principal que redirige según el rol del usuario
    {
        path: "",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
                {/* El componente ProtectedRoute ya maneja la redirección según el rol */}
                <div>Redirigiendo...</div>
            </ProtectedRoute>
        ),
    }
];