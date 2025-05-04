import React from "react";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { AttendanceChart } from "../components/AttendanceChart";
import { PopularMembershipsChart } from "../components/PopularMembershipsChart";
import { SatisfactionChart } from "../components/SatisfactionChart";
import { ServiceSatisfactionChart } from "../components/ServicesSatisfactionChart";
import { mockTrainings, mockClients } from "@/features/data/mockData";

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

];