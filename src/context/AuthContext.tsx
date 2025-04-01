"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { User, UserRole, AuthState } from "../types"

// Definir la interfaz del contexto
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (requiredRoles: UserRole[]) => boolean
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Datos de ejemplo para usuarios
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin Usuario",
    email: "admin@example.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    email: "carlos@example.com",
    role: "trainer",
    trainerId: "t1",
  },
  {
    id: "3",
    name: "Ana Gómez",
    email: "ana@example.com",
    role: "trainer",
    trainerId: "t2",
  },
  {
    id: "4",
    name: "Juan Pérez",
    email: "juan@example.com",
    role: "client",
    clientId: "0001",
  },
  {
    id: "5",
    name: "María González",
    email: "maria@example.com",
    role: "client",
    clientId: "0002",
  },
]

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Comprobar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Función de login
  const login = async (email: string, password: string): Promise<boolean> => {
    // En un entorno real, aquí harías una llamada a la API
    // Para este ejemplo, simulamos la autenticación con datos de ejemplo

    // Simular un retraso de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (user) {
      // En un entorno real, verificarías la contraseña aquí
      // Para este ejemplo, cualquier contraseña es válida

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })

      // Guardar en localStorage para persistencia
      localStorage.setItem("user", JSON.stringify(user))

      return true
    }

    return false
  }

  // Función de logout
  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    localStorage.removeItem("user")
  }

  // Función para verificar permisos
  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!authState.isAuthenticated || !authState.user) return false
    return requiredRoles.includes(authState.user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

