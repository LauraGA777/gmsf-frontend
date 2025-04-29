"use client"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { SatisfactionChart } from "@/components/dashboard/SatisfactionChart"
import { AttendanceChart } from "@/components/dashboard/AttendanceChart"
import { PopularMembershipsChart } from "@/components/dashboard/ClassesCompletedChart"
import { ServiceSatisfactionChart } from "@/components/dashboard/ServicesSatisfactionChart"
import { UpcomingTrainings } from "@/components/dashboard/UpcomingTrainings"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { mockTrainings, mockClients } from "@/data/mockData"
import type { Training } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Datos de satisfacción del servicio por categoría
const satisfactionData = [
  { categoria: "Clases Grupales", calificacion: 4.5, color: "#8884d8" },
  { categoria: "Equipamientos", calificacion: 4.7, color: "#82ca9d" },
  { categoria: "Atención al Cliente", calificacion: 4.8, color: "#ff8042" },
]

// Datos simulados para ServiceSatisfactionChart
const serviceSatisfactionData = [
  { categoria: "Musculación", calificacion: 4.5, color: "#4f46e5" },
  { categoria: "Cardio", calificacion: 4.2, color: "#059669" },
  { categoria: "Yoga", calificacion: 4.8, color: "#0ea5e9" },
  { categoria: "Spinning", calificacion: 3.9, color: "#f97316" },
  { categoria: "Pilates", calificacion: 4.6, color: "#8b5cf6" }
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

export function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "trainer"]}>
      <div className="space-y-8 container mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-gray-600 border border-gray-200">
            Última actualización: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <section className="mb-8">
          <DashboardStats />
        </section>

        {/* Gráficos principales */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Análisis de asistencia y membresías</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Asistencia Diaria */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800">Asistencia diaria</CardTitle>
                <p className="text-gray-500 text-sm">Registro de ingresos de clientes al gimnasio</p>
              </CardHeader>
              <CardContent className="pt-4">
                <AttendanceChart />
              </CardContent>
            </Card>

            {/* Gráfico de Membresías Populares */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800">Membresías populares</CardTitle>
                <p className="text-gray-500 text-sm">Distribución de membresías activas por tipo</p>
              </CardHeader>
              <CardContent className="h-auto pt-4">
                <PopularMembershipsChart />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gráficos de satisfacción */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Nivel de satisfacción</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Satisfacción General */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800">Satisfacción general</CardTitle>
                <p className="text-gray-500 text-sm">Calificación promedio mensual por categoría</p>
              </CardHeader>
              <CardContent className="pt-4">
                <SatisfactionChart data={satisfactionData} />
              </CardContent>
            </Card>
            
            {/* Gráfico de Satisfacción por Servicio */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
              <CardHeader className="pb-2 border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800">Satisfacción por servicio</CardTitle>
                <p className="text-gray-500 text-sm">Calificación de los usuarios por tipo de servicio</p>
              </CardHeader>
              <CardContent className="pt-4">
                <ServiceSatisfactionChart data={serviceSatisfactionData} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Próximos entrenamientos */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Agenda</h2>
          <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200">
            <CardHeader className="pb-2 border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-800">Próximos entrenamientos</CardTitle>
              <p className="text-gray-500 text-sm">Programación de los próximos 5 días</p>
            </CardHeader>
            <CardContent className="pt-4">
              <UpcomingTrainings trainings={upcomingTrainings} />
            </CardContent>
          </Card>
        </section>
      </div>
    </ProtectedRoute>
  )
}
