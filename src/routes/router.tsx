import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { AppLayout } from "@/layouts/AppLayout"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { ClientsPage } from "@/pages/clients/ClientsPage"
import { ContractsPage } from "@/pages/contracts/ContractsPage"
import { ServiceListPage } from "@/pages/services/ServiceListPage"
import { TrainerListPage } from "@/pages/services/TrainerListPage"
import { TrainingSchedulePage } from "@/pages/services/TrainingSchedulePage"
import { CalendarPage } from "@/pages/calendar/CalendarPage"
import { LoginForm } from "@/components/auth/LoginForm"
import { useAuth } from "@/context/AuthContext"

// Componente para la página de inicio que maneja la redirección basada en la autenticación
const IndexPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <LoginForm />
  }

  return <Navigate to={user.role === "client" ? "/clients" : "/dashboard"} replace />
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={
        <AuthProvider>
          <IndexPage />
        </AuthProvider>
      } />
      <Route element={
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/services">
          <Route index element={<ServiceListPage />} />
          <Route path="training-schedule" element={<TrainingSchedulePage />} />
          <Route path="trainers" element={<TrainerListPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Route>
  )
)

