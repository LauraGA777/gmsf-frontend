import React, { useState } from "react"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { SatisfactionChart } from "@/features/dashboard/components/satisfactionChart"
import { AttendanceChart } from "@/features/dashboard/components/attendanceChart"
import { PopularMembershipsChart } from "@/features/dashboard/components/popularMembershipsChart"
import { ServiceSatisfactionChart } from "@/features/dashboard/components/servicesSatisfactionChart"
import { MembershipRenewalChart } from "@/features/dashboard/components/membershipRenewalChart"
import { NewMembershipsChart } from "@/features/dashboard/components/newMembershipsChart"
import { RenewalVsExpiredChart } from "@/features/dashboard/components/renewalVsExpiredChart"
import { MembershipStats } from "@/features/dashboard/components/membershipStats"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { AlertTriangle, ArrowUp, PieChart, Users } from "lucide-react"

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
  { categoria: "Pilates", calificacion: 4.6, color: "#8b5cf6" },
]

export function DashboardPage() {
  const [period, setPeriod] = useState("monthly")
  const data = [
    { name: "Premium", value: 45, color: '#0088FE' },
    { name: "Estándar", value: 30, color: '#00C49F' },
    { name: "Básica", value: 25, color: '#FFBB28' },
    ]
  return (
    <ProtectedRoute allowedRoles={[1, 2]}>

      <div className="space-y-6 sm:space-y-8 container mx-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Panel de Control</h1>
          <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm text-xs sm:text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 whitespace-nowrap">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
        {/* Gráficos de Membresías canceladas, ingreso x ventas, Membresías activas */}
        <div >
          <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
            Análisis de asistencia y membresías
          </h2>
            <Tabs defaultValue="monthly" onValueChange={setPeriod}>
              <TabsList className="h-9">
                <TabsTrigger value="weekly" className="px-3 text-xs">Semanal</TabsTrigger>
                <TabsTrigger value="monthly" className="px-3 text-xs">Mensual</TabsTrigger>
                <TabsTrigger value="yearly" className="px-3 text-xs">Anual</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Sección superior - Estadísticas rápidas */}
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            <Card className="border-red-500 border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Membresías Canceladas</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="text-xl py-1.5 px-3">
                    24
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    <span className="flex items-center text-red-500">
                      <ArrowUp className="mr-1 h-4 w-4" />
                      12%
                    </span>
                    <span>desde el mes pasado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos por Ventas de Membresías(Mensuales)</CardTitle>
                <ArrowUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3'000.000</div>
                <p className="text-xs text-muted-foreground">+8% desde el periodo anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Membresías Activas</CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,345</div>
                <p className="text-xs text-muted-foreground">+5.2% desde el periodo anterior</p>
              </CardContent>
            </Card>
          </div>

        </div>
        {/* Gráficos principales */}
        <section className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Gráfico de Asistencia Diaria */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Asistencia diaria
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Registro de ingresos de clientes al gimnasio
                </p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <AttendanceChart />
              </CardContent>
            </Card>

            {/* Gráfico de Membresías Populares */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Membresías populares
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Distribución de membresías activas por tipo
                </p>
              </CardHeader>
              <CardContent className="h-auto pt-3 sm:pt-4">
                <PopularMembershipsChart />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Gráficos de satisfacción */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
            Nivel de satisfacción
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Gráfico de Satisfacción General */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Satisfacción general
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Calificación promedio mensual por categoría
                </p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <SatisfactionChart data={satisfactionData} />
              </CardContent>
            </Card>

            {/* Gráfico de Satisfacción por Servicio */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Satisfacción por servicio
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Calificación de los usuarios por tipo de servicio
                </p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <ServiceSatisfactionChart data={serviceSatisfactionData} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Estadísticas de Membresías */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
            Estadísticas de Membresías
          </h2>

          {/* Tarjetas de estadísticas de membresías */}
          <div className="mb-4 sm:mb-6">
            <MembershipStats className={undefined} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Gráfico de Renovaciones de Membresías */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Renovaciones
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Tendencia de renovaciones mensuales
                </p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <MembershipRenewalChart />
              </CardContent>
            </Card>

            {/* Gráfico de Nuevas Membresías */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Nuevas Membresías
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Adquisición de nuevos miembros por mes
                </p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <NewMembershipsChart />
              </CardContent>
            </Card>

            
          </div>
          
        </section>
        <section>
          <div>
            {/* Gráfico de Renovaciones vs Expiradas */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50">
              <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                  Renovaciones vs Expiradas
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  Comparativa de membresías renovadas y expiradas
                </p>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4">
                <RenewalVsExpiredChart />
              </CardContent>
            </Card>
          </div>
          </section>
      </div>
    </ProtectedRoute>
  )
}
