import React from "react";
import { CustomCalendarView } from "../CustomCalendarView";
import { EnhancedCalendarView } from "../EnhancedCalendarView";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CalendarPage } from "@/pages/calendar/CalendarPage";
import { mockTrainings } from "@/data/mockData";
import type { Training } from "@/types";

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
                <CustomCalendarView 
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
                <EnhancedCalendarView 
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
                <CalendarPage />
            </ProtectedRoute>
        ),
    }
];