"use client"

import type React from "react"
import { useAuth } from "@/context/AuthContext"
import { LoginForm } from "@/components/auth/LoginForm"
import { Button } from "@/components/ui/button"
import type { UserRole } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth()

  // Si está cargando, mostrar un indicador de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  // Si no está autenticado, mostrar el formulario de inicio de sesión
  if (!isAuthenticated || !user) {
    return <LoginForm />
  }

  // Si está autenticado pero no tiene los permisos necesarios
  if (!hasPermission(allowedRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-gray-600 mb-6 text-center">No tienes permisos para acceder a esta sección.</p>
        <Button onClick={() => window.history.back()}>Volver</Button>
      </div>
    )
  }

  // Si está autenticado y tiene los permisos necesarios, mostrar el contenido
  return <>{children}</>
}

