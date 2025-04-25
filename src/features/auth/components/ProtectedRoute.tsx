"use client"

import type React from "react"
import { useAuth } from "../hooks/useAuth"
import type { UserRole } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

/**
 * Component that protects routes based on user roles
 * Redirects to login if user is not authenticated or doesn't have the required role
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
        <p className="text-center mb-6">Debes iniciar sesión para acceder a esta página.</p>
        <button
          onClick={() => window.location.href = "/login"}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        >
          Iniciar Sesión
        </button>
      </div>
    )
  }

  // Check if user has the required role
  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-center mb-6">No tienes permisos para acceder a esta página.</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
        >
          Volver
        </button>
      </div>
    )
  }

  // If authenticated and has the required role, render the children
  return <>{children}</>
}