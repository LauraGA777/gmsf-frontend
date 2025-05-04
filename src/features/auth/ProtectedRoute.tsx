import type React from "react"
import { useAuth } from "@/shared/contexts/AuthContext"
import { LoginForm } from "@/features/auth/LoginForm"
import { Navigate, useLocation } from "react-router-dom"
import type { UserRole } from "@/shared/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (!hasPermission(allowedRoles)) {
    // Redirigir a los usuarios según su rol cuando intentan acceder a una página no permitida
    if (user.role === "client") {
      return <Navigate to="/calendar/client" replace />
    } else if (user.role === "admin" || user.role === "trainer") {
      return <Navigate to="/dashboard" replace />
    }
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-center mb-6">No tienes los permisos necesarios para acceder a esta página.</p>
      </div>
    )
  }

  return <>{children}</>
}

