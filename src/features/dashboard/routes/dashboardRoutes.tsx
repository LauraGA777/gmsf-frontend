import React from "react";
import { PermissionProtectedRoute } from "@/shared/components/PermissionProtectedRoute";
import { GymDashboard } from "@/features/dashboard/pages/gymDashboard";
import { DashboardPage } from "@/features/dashboard/pages/dashboardPage";
import { AttendanceChart } from "../components/attendanceChart";
import { PopularMembershipsChart } from "../components/popularMembershipsChart";
import { SatisfactionChart } from "../components/satisfactionChart";
import { ServiceSatisfactionChart } from "../components/servicesSatisfactionChart";

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
        element: (
            <PermissionProtectedRoute 
                requiredModule="Panel de control" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <DashboardPage />
            </PermissionProtectedRoute>
        )
    },
    {
        path: "dashboard/gym",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Panel de control" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <GymDashboard />
            </PermissionProtectedRoute>
        )
    },
    // Mantenemos rutas individuales para acceso directo a componentes específicos
    {
        path: "dashboard/attendance",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Panel de control" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <AttendanceChart />
            </PermissionProtectedRoute>
        ),
    },
    {
        path: "dashboard/classes",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Panel de control" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <PopularMembershipsChart />
            </PermissionProtectedRoute>
        ),
    },
    {
        path: "dashboard/satisfaction",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Panel de control" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <SatisfactionChart data={satisfactionData} />
            </PermissionProtectedRoute>
        ),
    },
    {
        path: "dashboard/services-satisfaction",
        element: (
            <PermissionProtectedRoute 
                requiredModule="Panel de control" 
                requiredPrivilege="Leer"
                fallbackRoles={[1, 2]} // Admin y entrenadores
            >
                <ServiceSatisfactionChart
                    data={serviceSatisfactionData}
                    title="Satisfacción por Servicio"
                />
            </PermissionProtectedRoute>
        ),
    },
];