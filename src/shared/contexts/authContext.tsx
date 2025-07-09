import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { User } from "../types/index" // Asegúrate de importar el tipo User correct
import type { Role } from "../types/role" // Importar el tipo Role
import { authService } from "@/features/auth/services/authService"
import { permissionService } from "@/shared/services/permissionService"
import { installRoleDebugger } from "@/shared/utils/roleDebugger"

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
  diagnoseRoleStatus: () => void // Agregar función de diagnóstico
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

  // Cargar roles desde la API con mejor manejo de errores y cache
  const loadRoles = async (): Promise<Role[]> => {
    try {
      setError(null)

      // Verificar si ya tenemos roles cargados en memoria
      if (roles.length > 0) {
        console.log("� Usando roles desde caché:", roles.length, "roles")
        return roles
      }

      console.log("�🔄 Cargando roles desde la base de datos...")

      const rolesData = await authService.getRoles() // Usar authService que es más rápido

      if (!rolesData || !Array.isArray(rolesData)) {
        throw new Error("Formato de datos de roles inválido")
      }

      // Transformar roles con menos procesamiento
      const processedRoles = rolesData.map(role => ({
        id: role.id,
        codigo: role.codigo || "",
        nombre: role.nombre,
        name: role.nombre, // Alias para frontend
        descripcion: role.descripcion || "",
        description: role.descripcion || "", // Alias para frontend
        estado: role.estado,
        isActive: role.estado,
        status: role.estado ? "Activo" : "Inactivo", // Para UI
        source: 'database'
      })) as Role[]

      setRoles(processedRoles)
      console.log("✅ Roles cargados desde BD:", processedRoles.length, "roles")
      return processedRoles
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      console.error("❌ Error cargando roles:", errorMessage)
      setError(`Error cargando roles: ${errorMessage}`)

      // Fallback más simple
      const fallbackRoles = Object.values(DEFAULT_ROLES).map(role => ({
        ...role,
        source: 'fallback'
      })) as any[]
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

        // Verificar sesión guardada primero (más rápido)
        const storedUser = localStorage.getItem("user")
        const storedAccessToken = localStorage.getItem("accessToken")
        const storedRefreshToken = localStorage.getItem("refreshToken")

        // Si hay sesión guardada, procesarla inmediatamente
        if (storedUser && storedAccessToken && storedRefreshToken) {
          try {
            const parsedUser = JSON.parse(storedUser) as User

            if (parsedUser.id && parsedUser.id_rol) {
              console.log("🔐 Restaurando sesión de usuario:", parsedUser.nombre, "con rol:", parsedUser.id_rol)

              // Configurar usuario inmediatamente para UI rápida
              setUser(parsedUser)
              setAccessToken(storedAccessToken)
              setRefreshToken(storedRefreshToken)

              // ✅ IMPORTANTE: Solo cargar permisos para usuarios AUTENTICADOS
              console.log("📋 Cargando permisos para usuario autenticado...")

              // Cargar roles y permisos en paralelo (en background)
              Promise.all([
                loadRoles(),
                permissionService.initializeWithUserId(parsedUser.id_rol)
              ]).then(() => {
                console.log("✅ Inicialización completa para usuario autenticado")
                setIsInitialized(true)
              }).catch(error => {
                console.error("❌ Error en inicialización background:", error)
                setError("Error cargando configuración")
                setIsInitialized(true)
              })

              // Instalar debugger solo en desarrollo
              if (process.env.NODE_ENV === 'development') {
                const debugContext = { roles, user: parsedUser, loadRoles, diagnoseRoleStatus }
                installRoleDebugger(debugContext)
              }

              // Finalizar carga inicial rápidamente
              setIsLoading(false)
              return
            }
          } catch (sessionError) {
            console.error("❌ Error en sesión guardada:", sessionError)
            // Limpiar sesión corrupta
            localStorage.removeItem("user")
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
          }
        }

        // Si no hay sesión, solo cargar roles básicos (NO permisos)
        console.log("🌍 No hay sesión guardada, iniciando modo público...")
        console.log("❌ NO se cargarán permisos hasta que el usuario se autentique")

        // Solo cargar roles para el sistema (no permisos de usuario)
        await loadRoles()

        // Limpiar cualquier permiso residual en el servicio
        permissionService.clearPermissions()

        setIsInitialized(true)

      } catch (initError) {
        const errorMessage = initError instanceof Error ? initError.message : "Error de inicialización"
        console.error("❌ Error durante inicialización:", errorMessage)
        setError(`Error de inicialización: ${errorMessage}`)
        setIsInitialized(true)
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
      // Mapeo rápido basado en IDs conocidos
      const quickRouteMap: { [key: number]: string } = {
        1: "/dashboard", // Administrador
        2: "/dashboard", // Entrenador
        3: "/client",    // Cliente
        4: "/client",    // Beneficiario
      }

      // Redirección rápida si el ID es conocido
      if (quickRouteMap[roleId]) {
        console.log(`🚀 Redirección rápida a ${quickRouteMap[roleId]} para rol ID ${roleId}`)
        navigate(quickRouteMap[roleId])
        return
      }

      // Buscar en roles cargados como fallback
      const role = roles.find((r) => r.id === roleId)
      if (role) {
        const targetRoute = (role as any).ruta || "/dashboard"
        console.log(`🚀 Redirección desde BD a ${targetRoute} para rol ${role.nombre}`)
        navigate(targetRoute)
        return
      }

      // Fallback final
      console.warn(`⚠️ Rol ${roleId} no encontrado, usando dashboard por defecto`)
      navigate("/dashboard")

    } catch (error) {
      console.error("❌ Error en redirección:", error)
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

      // Extraer datos del usuario with multiple possible formats
      const userData = authData.data?.user || authData.user || authData.data || {}
      console.log("👤 Datos del usuario extraídos:", userData)

      // Extraer tokens with multiple possible formats
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

      // ✅ CONFIGURAR USUARIO INMEDIATAMENTE PARA UI REACTIVA
      const basicUser: User = {
        id: normalizedUser.id.toString(),
        nombre: normalizedUser.nombre,
        correo: normalizedUser.correo,
        id_rol: normalizedUser.id_rol!,
        roleCode: "usuario",
        roleName: "Usuario",
        clientId: [3, 4].includes(normalizedUser.id_rol!) ? normalizedUser.id.toString() : undefined,
      }

      // ✅ ACTUALIZAR ESTADO INMEDIATAMENTE
      setUser(basicUser)
      setAccessToken(tokens.accessToken)
      setRefreshToken(tokens.refreshToken)

      // ✅ GUARDAR EN LOCALSTORAGE INMEDIATAMENTE
      localStorage.setItem("user", JSON.stringify(basicUser))
      localStorage.setItem("accessToken", tokens.accessToken)
      if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken)
      }

      // ✅ CARGAR PERMISOS ANTES DE REDIRIGIR (CON AWAIT)
      console.log("🔄 Inicializando permisos para usuario ANTES de redirigir:", normalizedUser.id_rol)

      try {
        await permissionService.initializeWithUserId(normalizedUser.id_rol!)
        console.log("✅ Permisos inicializados correctamente ANTES de redirección")
        setIsInitialized(true)
      } catch (permissionError) {
        console.error("❌ Error inicializando permisos:", permissionError)
        // Continuar con el login aunque fallen los permisos
        setIsInitialized(true)
      }

      // ✅ REDIRIGIR SOLO DESPUÉS DE CARGAR PERMISOS
      console.log("🚀 Redirigiendo con permisos ya cargados...")
      redirectBasedOnRole(normalizedUser.id_rol!)

      return { success: true }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido en el login"
      console.error("❌ Error durante login:", {
        mensaje: errorMessage,
        tipo: error instanceof Error ? error.name : typeof error,
        error: error,
      })

      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false) // ✅ SIEMPRE TERMINAR LOADING
    }
  }

  const handleSuccessfulLogin = async (authData: AuthResponse, correo: string) => {
    try {
      console.log("🎯 Procesando login exitoso para rol:", authData.user.id_rol)
      setError(null)

      // Guardar tokens inmediatamente
      setAccessToken(authData.accessToken)
      setRefreshToken(authData.refreshToken)
      localStorage.setItem("accessToken", authData.accessToken)
      if (authData.refreshToken) {
        localStorage.setItem("refreshToken", authData.refreshToken)
      }

      // Crear usuario básico primero para UI rápida
      const basicUser: User = {
        id: authData.user.id.toString(),
        nombre: authData.user.nombre,
        correo: correo,
        id_rol: authData.user.id_rol,
        roleCode: "usuario", // Temporal
        roleName: "Usuario", // Temporal
        clientId: [3, 4].includes(authData.user.id_rol) ? authData.user.id.toString() : undefined,
      }

      // Configurar usuario inmediatamente
      setUser(basicUser)
      localStorage.setItem("user", JSON.stringify(basicUser))
      setIsInitialized(true)

      // Redirigir inmediatamente con rol básico
      redirectBasedOnRole(authData.user.id_rol)

      // Cargar roles y permisos en background
      loadRoles().then(async () => {
        const userRole = roles.find((r) => r.id === authData.user.id_rol)

        if (userRole) {
          // Actualizar usuario con información completa
          const enrichedUser: User = {
            ...basicUser,
            role: userRole,
            roleCode: userRole.nombre?.toLowerCase() || "usuario",
            roleName: userRole.nombre || "Usuario",
          }

          setUser(enrichedUser)
          localStorage.setItem("user", JSON.stringify(enrichedUser))

          // Inicializar permisos
          try {
            await permissionService.initializeWithUserId(authData.user.id_rol)
            console.log("✅ Usuario y permisos actualizados en background")
          } catch (permError) {
            console.error("❌ Error cargando permisos:", permError)
          }
        }
      }).catch(error => {
        console.error("❌ Error cargando roles en background:", error)
      })

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
    if (!user || !user.id_rol) return false

    // Verificación rápida con mapeo directo
    if (requiredRoles.includes(user.id_rol)) return true

    // Buscar en roles cargados como fallback
    const userRole = roles.find((r) => r.id === user.id_rol)
    return userRole ? requiredRoles.includes(userRole.id) : false
  }

  // Función para diagnosticar el estado de los roles (útil para debugging)
  const diagnoseRoleStatus = () => {
    console.log("🔍 DIAGNÓSTICO DE ROLES:")
    console.log("========================")
    console.log(`📊 Total de roles cargados: ${roles.length}`)

    const rolesBySource = roles.reduce((acc, role) => {
      const source = (role as any).source || 'unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log("📋 Roles por origen:")
    Object.entries(rolesBySource).forEach(([source, count]) => {
      console.log(`   - ${source}: ${count} roles`)
    })

    console.log("📝 Detalle de roles:")
    roles.forEach(role => {
      const source = (role as any).source || 'unknown'
      console.log(`   - ${role.nombre} (ID: ${role.id}) - Origen: ${source}`)
    })

    if (user) {
      const userRole = roles.find(r => r.id === user.id_rol)
      const userRoleSource = userRole ? ((userRole as any).source || 'unknown') : 'not-found'
      console.log(`👤 Usuario actual: ${user.nombre}`)
      console.log(`🎭 Rol del usuario: ${userRole ? userRole.nombre : 'NO ENCONTRADO'} (ID: ${user.id_rol})`)
      console.log(`🔍 Origen del rol del usuario: ${userRoleSource}`)

      if (userRoleSource === 'fallback') {
        console.warn("⚠️ PROBLEMA: El usuario actual tiene un rol fallback")
      }
    }

    console.log("========================")
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
        diagnoseRoleStatus,
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
    nombre: "Administrador",
    ruta: "/dashboard",
    permisos: ["ver_usuarios", "editar_usuarios", "ver_estadisticas"],
  },
  ENTRENADOR: {
    id: 2,
    nombre: "Entrenador",
    ruta: "/dashboard", // Cambiar a dashboard
    permisos: ["ver_clientes", "editar_rutinas", "ver_horarios"],
  },
  CLIENTE: {
    id: 3,
    nombre: "Cliente",
    ruta: "/client",
    permisos: ["ver_perfil", "ver_rutinas", "ver_membresia"],
  },
  BENEFICIARIO: {
    id: 4,
    nombre: "Benenficiario",
    ruta: "/client",
    permisos: ["ver_perfil", "ver_rutinas", "ver_membresia"],
  },
} as const

// Mantener compatibilidad con código existente
export const ROLES = DEFAULT_ROLES
