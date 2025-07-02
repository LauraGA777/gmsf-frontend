"use client"

import type React from "react"

// src/features/auth/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { User } from "../types/index" // Asegúrate de importar el tipo User correct
import type { Role } from "../types/role" // Importar el tipo Role
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
  loadRoles: () => Promise<Role[]>
  refreshUserPermissions: () => Promise<void>
  isInitialized: boolean
  error: string | null
}

interface NormalizedUser {
  id: number
  nombre: string
  correo: string
  id_rol: number | null
  [key: string]: any // Permite indexación dinámica
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Cargar roles desde la API con mejor manejo de errores
  const loadRoles = async (): Promise<Role[]> => {
    try {
      setError(null)
      console.log("🔄 Cargando roles desde la base de datos...")
      
      const rolesData = await roleService.getRoles()
      
      if (!rolesData || !Array.isArray(rolesData)) {
        throw new Error("Formato de datos de roles inválido")
      }
      
      setRoles(rolesData)
      console.log("✅ Roles cargados desde BD:", rolesData.length, "roles")
      return rolesData
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("❌ Error cargando roles desde BD:", errorMessage)
      setError(`Error cargando roles: ${errorMessage}`)
      
      // Solo usar fallback si es crítico
      console.warn("⚠️ Usando roles fallback temporalmente")
      const fallbackRoles = Object.values(DEFAULT_ROLES) as any[]
      setRoles(fallbackRoles)
      return fallbackRoles as Role[]
    }
  }

  // Refrescar permisos del usuario actual
  const refreshUserPermissions = async () => {
    if (!user?.id_rol) {
      console.warn("⚠️ No hay usuario para refrescar permisos")
      return
    }

    try {
      setError(null)
      console.log("🔄 Refrescando permisos para usuario:", user.id_rol)
      
      await permissionService.initializeWithUserId(user.id_rol)
      console.log("✅ Permisos refrescados exitosamente")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("❌ Error refrescando permisos:", errorMessage)
      setError(`Error actualizando permisos: ${errorMessage}`)
      throw error
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 1. Cargar roles desde la base de datos primero
        console.log("🚀 Iniciando carga de roles...")
        await loadRoles()

        // 2. Verificar sesión guardada
        const storedUser = localStorage.getItem("user")
        const storedAccessToken = localStorage.getItem("accessToken")
        const storedRefreshToken = localStorage.getItem("refreshToken")

        if (storedUser && storedAccessToken && storedRefreshToken) {
          try {
            const parsedUser = JSON.parse(storedUser) as User
            
            // Validar integridad de datos del usuario
            if (!parsedUser.id || !parsedUser.id_rol) {
              throw new Error("Datos de usuario incompletos en sesión guardada")
            }

            // Enriquecer datos del usuario con información fresca del rol
            const userRole = roles.find((r) => r.id === parsedUser.id_rol)
            
            const enrichedUser: User = {
              ...parsedUser,
              role: userRole, // Objeto completo del rol actualizado
              roleName: userRole ? userRole.nombre : parsedUser.roleName || "Usuario", // Nombre del rol actualizado
              roleCode: userRole ? userRole.nombre?.toLowerCase() : parsedUser.roleCode || "usuario"
            }

            console.log("🔄 Usuario enriquecido con rol actualizado:", enrichedUser)

            setUser(enrichedUser)
            setAccessToken(storedAccessToken)
            setRefreshToken(storedRefreshToken)

            // 3. Inicializar permisos desde la base de datos
            console.log("🔄 Inicializando permisos desde BD para usuario:", parsedUser.nombre)
            await permissionService.initializeWithUserId(parsedUser.id_rol)
            console.log("✅ Permisos inicializados desde BD exitosamente")
            
            setIsInitialized(true)
          } catch (sessionError) {
            console.error("❌ Error en sesión guardada:", sessionError)
            // Limpiar sesión corrupta
            localStorage.removeItem("user")
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setError("Sesión corrupta. Por favor, inicie sesión nuevamente.")
          }
        } else {
          console.log("📝 No hay sesión guardada")
          setIsInitialized(true)
        }
      } catch (initError) {
        const errorMessage = initError instanceof Error ? initError.message : "Error de inicialización"
        console.error("❌ Error durante inicialización:", errorMessage)
        setError(`Error de inicialización: ${errorMessage}`)
        setIsInitialized(true) // Marcar como inicializado incluso con errores
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (!isLoading && user && location.pathname === "/") {
      redirectBasedOnRole(user.id_rol)
    }
  }, [isLoading, user, location, navigate])

  const redirectBasedOnRole = (roleId: number) => {
    try {
      // Buscar el rol en los roles cargados dinámicamente desde la BD
      const role = roles.find((r) => r.id === roleId)

      if (role) {
        // Mapeo dinámico de rutas basado en datos de la BD
        const routeMap: { [key: string]: string } = {
          admin: "/dashboard",
          administrador: "/dashboard",
          entrenador: "/dashboard",
          trainer: "/dashboard",
          cliente: "/client",
          beneficiario: "/client",
          user: "/client",
        }

        // Usar ruta específica del rol de la BD o mapeo por nombre
        const targetRoute = role.ruta || routeMap[role.nombre?.toLowerCase() || ""] || "/dashboard"
        
        console.log(`🚀 Redirigiendo a ${targetRoute} para rol ${role.nombre} (ID: ${roleId})`)
        navigate(targetRoute)
        return
      }

      // Fallback solo si no se encuentra en roles dinámicos
      console.warn("⚠️ Rol no encontrado en BD, usando fallback:", roleId)
      const defaultRole = Object.values(DEFAULT_ROLES).find((r) => r.id === roleId)
      
      if (defaultRole) {
        console.log(`🔄 Usando ruta fallback: ${defaultRole.ruta}`)
        navigate(defaultRole.ruta)
      } else {
        console.error("❌ Rol no reconocido, redirigiendo a dashboard:", roleId)
        setError(`Rol no reconocido: ${roleId}`)
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("❌ Error en redirección:", error)
      setError("Error en redirección de usuario")
      navigate("/dashboard")
    }
  }

  const login = async (correo: string, contrasena: string) => {
    try {
      setError(null)
      setIsLoading(true)
      
      // Validaciones básicas
      if (!correo || !contrasena) {
        throw new Error("Email y contraseña son requeridos")
      }

      if (!import.meta.env.VITE_API_URL) {
        throw new Error("URL de API no configurada")
      }

      console.log("🔐 Intentando login para:", correo)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
      })

      const data = await response.json()
      console.log("🔍 Respuesta del servidor:", { status: response.status, ok: response.ok })

      if (!response.ok) {
        const errorMessage = data.message || data.error || "Credenciales incorrectas"
        throw new Error(errorMessage)
      }

      // Validar estructura de respuesta
      if (!data || typeof data !== 'object') {
        throw new Error("Respuesta del servidor inválida")
      }

      const authData = data

      // Extraer datos del usuario con múltiples formatos posibles
      const userData = authData.data?.user || authData.user || authData.data || {}
      console.log("👤 Datos del usuario extraídos:", userData)

      // Extraer tokens con múltiples formatos posibles
      const tokens = {
        accessToken: authData.data?.accessToken || authData.accessToken || authData.token,
        refreshToken: authData.data?.refreshToken || authData.refreshToken,
      }

      // Validar tokens requeridos
      if (!tokens.accessToken) {
        console.error("❌ Token de acceso no encontrado:", authData)
        throw new Error("Token de acceso no recibido del servidor")
      }

      // Validar datos mínimos del usuario
      if (!userData || typeof userData !== "object" || !userData.id) {
        console.error("❌ Datos de usuario inválidos:", userData)
        throw new Error("Datos de usuario inválidos recibidos del servidor")
      }

      // Normalizar datos del usuario
      const normalizedUser: NormalizedUser = {
        id: userData.id,
        nombre: userData.nombre || userData.nombre_usuario || userData.name || "",
        correo: userData.correo || userData.email || correo,
        id_rol: userData.id_rol || userData.rol_id || userData.roleId || null,
      }

      console.log("🎭 Usuario normalizado:", normalizedUser)

      // Validar campos críticos
      const requiredFields = ["id", "id_rol"] as const
      const missingFields = requiredFields.filter(
        (field) => normalizedUser[field] === undefined || normalizedUser[field] === null,
      )

      if (missingFields.length > 0) {
        console.error("❌ Campos requeridos faltantes:", {
          missingFields,
          userData: normalizedUser,
          originalData: authData,
        })
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(", ")}`)
      }

      // Crear estructura normalizada
      const normalizedData = {
        ...authData,
        ...tokens,
        user: normalizedUser,
      }

      await handleSuccessfulLogin(normalizedData as AuthResponse, normalizedUser.correo)
      return { success: true }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido en el login"
      console.error("❌ Error durante login:", {
        mensaje: errorMessage,
        tipo: error instanceof Error ? error.name : typeof error,
        error: error,
      })
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessfulLogin = async (authData: AuthResponse, correo: string) => {
    try {
      console.log("🎯 Procesando login exitoso para rol:", authData.user.id_rol)
      setError(null)

      // Guardar el token ANTES de hacer cualquier petición a la API
      setAccessToken(authData.accessToken)
      setRefreshToken(authData.refreshToken)
      localStorage.setItem("accessToken", authData.accessToken)
      if (authData.refreshToken) {
        localStorage.setItem("refreshToken", authData.refreshToken)
      }

      // Buscar el rol en los datos dinámicos de la BD
      let userRole = roles.find((r) => r.id === authData.user.id_rol)

      if (!userRole) {
        console.warn("⚠️ Rol no encontrado en roles de BD, recargando roles...")
        
        // Intentar recargar roles si no se encuentra (ahora con token disponible)
        const freshRoles = await loadRoles()
        userRole = freshRoles.find((r) => r.id === authData.user.id_rol)
        
        if (!userRole) {
          console.warn("⚠️ Rol aún no encontrado, usando fallback")
          userRole = Object.values(DEFAULT_ROLES).find((r) => r.id === authData.user.id_rol)
        }
      }

      const roleKey = userRole ? userRole.nombre?.toLowerCase() || "usuario" : "usuario"
      console.log("🔍 Rol identificado:", roleKey, "para ID:", authData.user.id_rol)

      // Crear usuario con información completa
      const userWithRole: User = {
        id: authData.user.id.toString(),
        nombre: authData.user.nombre,
        correo: correo,
        id_rol: authData.user.id_rol,
        role: userRole, // Objeto completo del rol
        roleCode: roleKey, // Código del rol para compatibilidad
        roleName: userRole ? userRole.nombre : "Usuario", // Nombre del rol para UI
        clientId: [3, 4].includes(authData.user.id_rol) ? authData.user.id.toString() : undefined,
      }

      console.log("✅ Usuario final creado:", userWithRole)

      // Guardar estado del usuario
      setUser(userWithRole)

      // Persistir en localStorage (tokens ya guardados anteriormente)
      localStorage.setItem("user", JSON.stringify(userWithRole))

      // Inicializar permisos desde la BD
      console.log("🔄 Inicializando permisos desde BD para rol:", authData.user.id_rol)
      try {
        await permissionService.initializeWithUserId(authData.user.id_rol)
        console.log("✅ Permisos inicializados desde BD exitosamente")
      } catch (permError) {
        console.error("❌ Error inicializando permisos desde BD:", permError)
        setError("Error cargando permisos. Algunas funciones pueden estar limitadas.")
        // No lanzar error aquí para no interrumpir el login
      }

      setIsInitialized(true)
      redirectBasedOnRole(authData.user.id_rol)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error procesando login exitoso"
      console.error("❌ Error en handleSuccessfulLogin:", errorMessage)
      setError(errorMessage)
      throw error
    }
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
    try {
      if (!user || !user.id_rol) {
        console.log("🔒 Sin usuario o rol para verificar permisos")
        return false
      }

      // Buscar primero en roles dinámicos de la BD
      const userRole = roles.find((r) => r.id === user.id_rol)

      if (userRole) {
        const hasAccess = requiredRoles.includes(userRole.id)
        console.log(`🔍 Verificación BD - Usuario rol ${userRole.nombre} (${userRole.id}), requiere: [${requiredRoles.join(", ")}], acceso: ${hasAccess}`)
        return hasAccess
      }

      // Fallback a roles por defecto solo si es necesario
      console.warn("⚠️ Usando verificación de permisos fallback para rol:", user.id_rol)
      const defaultRole = Object.values(DEFAULT_ROLES).find((r) => r.id === user.id_rol)
      
      if (!defaultRole) {
        console.error("❌ Rol no encontrado en BD ni en fallback:", user.id_rol)
        return false
      }

      const hasDefaultAccess = requiredRoles.includes(defaultRole.id)
      console.log(`🔄 Verificación fallback - Rol ${defaultRole.nombre} (${defaultRole.id}), acceso: ${hasDefaultAccess}`)
      return hasDefaultAccess
      
    } catch (error) {
      console.error("❌ Error verificando permisos:", error)
      return false
    }
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
        refreshUserPermissions,
        isInitialized,
        error,
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
