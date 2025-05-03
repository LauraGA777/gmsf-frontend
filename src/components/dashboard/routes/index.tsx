import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { AttendanceChart } from "../AttendanceChart";
import { PopularMembershipsChart } from "../PopularMembershipsChart";
import { SatisfactionChart } from "../SatisfactionChart";
import { ServiceSatisfactionChart } from "../ServicesSatisfactionChart";
import { UpcomingTrainings } from "../UpcomingTrainings";
import { mockTrainings, mockClients } from "@/data/mockData";
import type { Training } from "@/types";

// Datos simulados para ServiceSatisfactionChart
const serviceSatisfactionData = [
    { categoria: "Musculación", calificacion: 4.5, color: "#4f46e5" },
    { categoria: "Cardio", calificacion: 4.2, color: "#059669" },
    { categoria: "Yoga", calificacion: 4.8, color: "#0ea5e9" },
    { categoria: "Spinning", calificacion: 3.9, color: "#f97316" },
    { categoria: "Pilates", calificacion: 4.6, color: "#8b5cf6" }
];

// Datos de satisfacción del servicio por categoría
const satisfactionData = [
    { categoria: "Clases Grupales", calificacion: 4.5, color: "#8884d8" },
    { categoria: "Equipamientos", calificacion: 4.7, color: "#82ca9d" },
    { categoria: "Atención al Cliente", calificacion: 4.8, color: "#ff8042" },
];

// Crear datos simulados con la estructura que espera el componente UpcomingTrainings
const upcomingTrainings: Training[] = mockTrainings.slice(0, 5).map(t => ({
    id: t.id,
    client: `${mockClients.find(c => c.id_persona === 1)?.nombre || ''} ${mockClients.find(c => c.id_persona === 1)?.apellido || ''}`,
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

export const dashboardRoutes = [
    {
        path: "dashboard",
        element: <DashboardPage />
    },
    // Mantenemos rutas individuales para acceso directo a componentes específicos
    {
        path: "dashboard/attendance",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <AttendanceChart />
            </ProtectedRoute>
        ),
    },
    {
        path: "dashboard/classes",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <PopularMembershipsChart />
            </ProtectedRoute>
        ),
    },
    {
        path: "dashboard/satisfaction",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <SatisfactionChart data={satisfactionData} />
            </ProtectedRoute>
        ),
    },
    {
        path: "dashboard/services-satisfaction",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <ServiceSatisfactionChart
                    data={serviceSatisfactionData}
                    title="Satisfacción por Servicio"
                />
            </ProtectedRoute>
        ),
    },
    {
        path: "dashboard/upcoming-trainings",
        element: (
            <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <UpcomingTrainings
                    trainings={upcomingTrainings}
                />
            </ProtectedRoute>
        ),
    },
];