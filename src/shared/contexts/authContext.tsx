"use client"

import type React from "react"

// src/features/auth/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { User } from "../types/index" // Asegúrate de importar el tipo User correct
import { authService } from "@/features/auth/services/authService"
import { roleService } from "@/features/roles/services/roleService"
import { permissionService } from "@/shared/services/permissionService"

// Tipos
interface AuthResponse {
  status: string
  menssage: string
  accessToken: string
  refreshToken: string
  user: {
    id: number
    nombre: string
    correo: string
    id_rol: number
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  refreshToken: string | null
  login: (correo: string, contrasena: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasPermission: (requiredRoles: number[]) => boolean
  roles: any[]
  loadRoles: () => Promise<void>
}

interface NormalizedUser {
  id: number
  nombre: string
  correo: string
  id_rol: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<any[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  // Cargar roles desde la API
  const loadRoles = async () => {
    try {
      const rolesData = await roleService.getRoles()
      setRoles(rolesData || [])
      console.log("🎭 Roles cargados:", rolesData)
    } catch (error) {
      console.error("❌ Error cargando roles:", error)
      // Usar roles por defecto si falla la carga
      setRoles(Object.values(DEFAULT_ROLES))
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      // Cargar roles primero
      await loadRoles()

      const storedUser = localStorage.getItem("user")
      const storedAccessToken = localStorage.getItem("accessToken")
      const storedRefreshToken = localStorage.getItem("refreshToken")

      if (storedUser && storedAccessToken && storedRefreshToken) {
        try {
          const parsedUser = JSON.parse(storedUser) as User
          setUser(parsedUser)
          setAccessToken(storedAccessToken)
          setRefreshToken(storedRefreshToken)

          // 🔥 CRÍTICO: Inicializar permisos cuando se restaura la sesión
          try {
            console.log("🔄 Inicializando permisos para usuario restaurado:", parsedUser)
            await permissionService.initializeWithUserId(parsedUser.id_rol)
            console.log("✅ Permisos inicializados desde sesión guardada")
          } catch (error) {
            console.warn("⚠️ Error inicializando permisos desde sesión:", error)
            // Aplicar fallback directo
            await permissionService.initializeWithUserId(parsedUser.id_rol)
          }
        } catch (error) {
          localStorage.removeItem("user")
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && user && location.pathname === "/") {
      redirectBasedOnRole(user.id_rol)
    }
  }, [isLoading, user, location, navigate])

  const redirectBasedOnRole = (roleId: number) => {
    // Buscar el rol en los roles cargados dinámicamente
    const role = roles.find((r) => r.id === roleId)

    if (role) {
      // Si el rol tiene una ruta específica, usarla
      const routeMap: { [key: string]: string } = {
        admin: "/dashboard",
        administrador: "/dashboard",
        entrenador: "/dashboard", // Cambiar a dashboard para entrenadores también
        cliente: "/client",
        beneficiario: "/client",
      }

      const targetRoute = routeMap[role.nombre.toLowerCase()] || "/dashboard"
      navigate(targetRoute)
      console.log(`🚀 Redirigiendo a ${targetRoute} para rol ${role.nombre}`)
    } else {
      // Fallback a los roles por defecto
      const defaultRole = Object.values(DEFAULT_ROLES).find((r) => r.id === roleId)
      if (defaultRole) {
        navigate(defaultRole.ruta)
      } else {
        navigate("/dashboard")
        console.warn("⚠️ Rol no reconocido:", roleId)
      }
    }
  }

  const login = async (correo: string, contrasena: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
      })

      const data = await response.json()
      console.log("🔍 Respuesta completa del login:", data)

      if (!response.ok) {
        throw new Error(data.message || "Credenciales incorrectas")
      }

      const authData = data

      // Extraer datos del usuario de la respuesta
      const userData = authData.data?.user || authData.user || {}
      console.log("👤 Datos del usuario extraídos:", userData)

      const tokens = {
        accessToken: authData.data?.accessToken || authData.accessToken,
        refreshToken: authData.data?.refreshToken || authData.refreshToken,
      }

      // Validar que tengamos los tokens necesarios
      if (!tokens.accessToken || !tokens.refreshToken) {
        console.error("❌ Tokens no encontrados en la respuesta:", authData)
        throw new Error("Error en la autenticación: tokens no recibidos")
      }

      // Validar que tengamos los datos básicos del usuario
      if (!userData || typeof userData !== "object") {
        console.error("❌ Datos de usuario no encontrados en la respuesta:", authData)
        throw new Error("Datos de usuario no encontrados en la respuesta")
      }

      // Normalizar la estructura de datos del usuario
      const normalizedUser: NormalizedUser = {
        id: userData.id,
        nombre: userData.nombre || userData.nombre_usuario || "",
        correo: userData.correo || correo,
        id_rol: userData.id_rol || userData.rol_id || null,
      }

      console.log("🎭 Usuario normalizado:", normalizedUser)
      console.log("🔑 ID del rol:", normalizedUser.id_rol)

      // Validar que tengamos los campos requeridos
      const requiredFields = ["id", "id_rol"]
      const missingFields = requiredFields.filter(
        (field) => normalizedUser[field] === undefined || normalizedUser[field] === null,
      )

      if (missingFields.length > 0) {
        console.error("❌ Faltan campos requeridos en los datos del usuario:", {
          missingFields,
          userData: normalizedUser,
          originalData: authData,
        })
        throw new Error(`Faltan campos requeridos: ${missingFields.join(", ")}`)
      }

      // Crear la estructura normalizada para handleSuccessfulLogin
      const normalizedData = {
        ...authData,
        ...tokens,
        user: normalizedUser,
      }

      await handleSuccessfulLogin(normalizedData as AuthResponse, normalizedUser.correo)
      return { success: true }
    } catch (error) {
      console.error("❌ Error detallado durante el inicio de sesión:", {
        mensaje: error instanceof Error ? error.message : "Error desconocido",
        tipo: error instanceof Error ? error.name : typeof error,
        error: error,
      })
      throw error
    }
  }

  const handleSuccessfulLogin = async (authData: AuthResponse, correo: string) => {
    console.log("🎯 Procesando login exitoso para rol:", authData.user.id_rol)

    // Buscar el rol en los roles cargados dinámicamente
    let userRole = roles.find((r) => r.id === authData.user.id_rol)

    if (!userRole) {
      console.warn("⚠️ Rol no encontrado en roles dinámicos, usando fallback")
      // Usar rol por defecto si no se encuentra
      userRole = Object.values(DEFAULT_ROLES).find((r) => r.id === authData.user.id_rol)
    }

    const roleKey = userRole ? userRole.nombre.toLowerCase() : "cliente"
    console.log("🔍 Clave de rol encontrada:", roleKey)

    const userWithRole: User = {
      id: authData.user.id.toString(),
      nombre: authData.user.nombre,
      correo: correo,
      id_rol: authData.user.id_rol,
      role: roleKey,
      clientId: authData.user.id_rol === 3 || authData.user.id_rol === 4 ? authData.user.id.toString() : undefined,
    }

    console.log("✅ Usuario final creado:", userWithRole)

    setUser(userWithRole)
    setAccessToken(authData.accessToken)
    setRefreshToken(authData.refreshToken)

    localStorage.setItem("user", JSON.stringify(userWithRole))
    localStorage.setItem("accessToken", authData.accessToken)
    localStorage.setItem("refreshToken", authData.refreshToken)

    // 🔥 CRÍTICO: Inicializar permisos después del login exitoso
    try {
      console.log("🔄 Inicializando permisos después del login para rol:", authData.user.id_rol)
      await permissionService.initializeWithUserId(authData.user.id_rol)
      console.log("✅ Permisos inicializados después del login")
    } catch (error) {
      console.warn("⚠️ Error inicializando permisos después del login:", error)
      // Forzar fallback
      await permissionService.initializeWithUserId(authData.user.id_rol)
    }

    redirectBasedOnRole(authData.user.id_rol)
  }

  const logout = async () => {
    try {
      // 1. Llamar al endpoint de logout en la API
      await authService.logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      // 2. Limpiar permisos
      permissionService.clearPermissions()

      // 3. Limpiar el estado local independientemente de la respuesta del servidor
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      setAccessToken(null)
      setRefreshToken(null)
      // 4. Redirigir al login
      navigate("/login")
    }
  }

  const hasPermission = (requiredRoles: number[]): boolean => {
    if (!user) return false

    // Buscar el rol en los roles dinámicos primero
    const userRole = roles.find((r) => r.id === user.id_rol)

    if (userRole) {
      return requiredRoles.includes(userRole.id)
    }

    // Fallback a roles por defecto
    const defaultRole = Object.values(DEFAULT_ROLES).find((r) => r.id === user.id_rol)
    if (!defaultRole) return false

    return requiredRoles.includes(defaultRole.id)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        accessToken,
        refreshToken,
        login,
        logout,
        hasPermission,
        roles,
        loadRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Roles por defecto como fallback
export const DEFAULT_ROLES = {
  ADMIN: {
    id: 1,
    nombre: "admin",
    ruta: "/dashboard",
    permisos: ["ver_usuarios", "editar_usuarios", "ver_estadisticas"],
  },
  ENTRENADOR: {
    id: 2,
    nombre: "entrenador",
    ruta: "/dashboard", // Cambiar a dashboard
    permisos: ["ver_clientes", "editar_rutinas", "ver_horarios"],
  },
  CLIENTE: {
    id: 3,
    nombre: "cliente",
    ruta: "/client",
    permisos: ["ver_perfil", "ver_rutinas", "ver_membresia"],
  },
  BENEFICIARIO: {
    id: 4,
    nombre: "beneficiario",
    ruta: "/client",
    permisos: ["ver_perfil", "ver_rutinas", "ver_membresia"],
  },
} as const

// Mantener compatibilidad con código existente
export const ROLES = DEFAULT_ROLES
