import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { SatisfactionChart } from "@/features/dashboard/components/SatisfactionChart"
import { AttendanceChart } from "@/features/dashboard/components/AttendanceChart"
import { PopularMembershipsChart } from "@/features/dashboard/components/PopularMembershipsChart"
import { ServiceSatisfactionChart } from "@/features/dashboard/components/ServicesSatisfactionChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card"

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



export function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "trainer"]}>
      <div className="space-y-6 sm:space-y-8 container mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Panel de Control</h1>
          <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm text-xs sm:text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 whitespace-nowrap">
            Última actualización: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Gráficos principales */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Análisis de asistencia y membresías</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Gráfico de Asistencia Diaria */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Asistencia diaria</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Registro de ingresos de clientes al gimnasio</p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <AttendanceChart />
              </CardContent>
            </Card>

            {/* Gráfico de Membresías Populares */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Membresías populares</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Distribución de membresías activas por tipo</p>
              </CardHeader>
              <CardContent className="h-auto pt-3 sm:pt-4">
                <PopularMembershipsChart />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gráficos de satisfacción */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">Nivel de satisfacción</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Gráfico de Satisfacción General */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Satisfacción general</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Calificación promedio mensual por categoría</p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <SatisfactionChart data={satisfactionData} />
              </CardContent>
            </Card>
            
            {/* Gráfico de Satisfacción por Servicio */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">Satisfacción por servicio</CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Calificación de los usuarios por tipo de servicio</p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <ServiceSatisfactionChart data={serviceSatisfactionData} />
              </CardContent>
            </Card>
          </div>
        </section>


      </div>
    </ProtectedRoute>
  )
}
