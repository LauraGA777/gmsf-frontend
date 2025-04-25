"use client"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { SatisfactionChart } from "@/components/dashboard/SatisfactionChart"
import { AttendanceChart } from "@/components/dashboard/AttendanceChart"
import { PopularMembershipsChart } from "@/components/dashboard/ClassesCompletedChart"
import { DashboardStats } from "@/components/dashboard/DashboardStats"

// Datos de satisfacción del servicio por categoría
const satisfactionData = [
  { categoria: "Clases Grupales", calificacion: 4.5, color: "#8884d8" },
  { categoria: "Equipamientos", calificacion: 4.7, color: "#82ca9d" },
  { categoria: "Atención al Cliente", calificacion: 4.8, color: "#ff8042" },
]

export function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "trainer"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Tarjetas de estadísticas */}
        <DashboardStats />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de Asistencia Diaria */}
          <AttendanceChart />

          {/* Gráfico de Membresías Populares */}
          <PopularMembershipsChart />
        </div>

        {/* Gráfico de Satisfacción del Servicio */}
        <SatisfactionChart data={satisfactionData} />
      </div>
    </ProtectedRoute>
  )
}
