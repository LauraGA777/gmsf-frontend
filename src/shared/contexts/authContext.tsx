import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { Client, User } from "../types/index"
import type { Role } from "../types/role"
import { authService } from "@/features/auth/services/authService"
import { permissionService } from "@/shared/services/permissionService"

// Tipos
interface AuthContextType {
  user: User | null
  client: Client | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  refreshToken: string | null
  login: (correo: string, contrasena: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasPermission: (requiredRoles: number[]) => boolean
  roles: Role[]
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
  id_persona?: number
  [key: string]: any
}

// ✅ Solo exportar constantes para referencia rápida
export const ROLES = {
  ADMIN: 1,
  TRAINER: 2,
  CLIENT: 3,
  BENEFICIARY: 4
} as const

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [roles, setRoles] = useState<Role[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ Solo cargar roles desde la base de datos
  const loadRoles = async (): Promise<Role[]> => {
    try {
      setError(null)

      // Si ya tenemos roles cargados, retornar directamente
      if (roles.length > 0) {
        return roles
      }

      // Cargar roles desde la API
      const rolesData = await authService.getRoles()

      if (!rolesData || !Array.isArray(rolesData)) {
        throw new Error("No se pudieron cargar los roles desde la base de datos")
      }

      // Procesar roles de la base de datos
      const processedRoles = rolesData.map(role => ({
        id: role.id,
        codigo: role.codigo || "",
        nombre: role.nombre,
        name: role.nombre,
        descripcion: role.descripcion || "",
        description: role.descripcion || "",
        estado: role.estado,
        isActive: role.estado,
        status: role.estado ? "Activo" : "Inactivo"
      })) as Role[]

      setRoles(processedRoles)
      return processedRoles

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al cargar roles"
      setError(`Error cargando roles: ${errorMessage}`)
      
      // ❌ NO usar roles por defecto - fallar si no hay conexión a BD
      throw new Error("No se pueden cargar los roles. Verifique la conexión a la base de datos.")
    }
  }

  // Refrescar permisos del usuario actual
  const refreshUserPermissions = async () => {
    if (!user?.id_rol) {
      return
    }

    try {
      setError(null)
      await permissionService.initializeWithUserId(user.id_rol)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(`Error actualizando permisos: ${errorMessage}`)
      throw error
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const storedUser = localStorage.getItem("user")
        const storedAccessToken = localStorage.getItem("accessToken")
        const storedRefreshToken = localStorage.getItem("refreshToken")

        if (storedUser && storedAccessToken && storedRefreshToken) {
          try {
            const parsedUser = JSON.parse(storedUser) as User

            if (parsedUser.id && parsedUser.id_rol) {
              setUser(parsedUser)
              setAccessToken(storedAccessToken)
              setRefreshToken(storedRefreshToken)
              
              // ✅ Cargar roles desde BD y permisos en paralelo
              try {
                await Promise.all([
                  loadRoles(),
                  permissionService.initializeWithUserId(parsedUser.id_rol)
                ])
                setIsInitialized(true)
              } catch (error) {
                // Si fallan los roles o permisos, limpiar sesión
                localStorage.removeItem("user")
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                setUser(null)
                setAccessToken(null)
                setRefreshToken(null)
                throw error
              }

              setIsLoading(false)
              return
            }
          } catch (sessionError) {
            localStorage.removeItem("user")
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
          }
        }

        // ✅ Solo cargar roles desde BD al inicializar sin sesión
        await loadRoles()
        permissionService.clearPermissions()
        setIsInitialized(true)

      } catch (initError) {
        const errorMessage = initError instanceof Error ? initError.message : "Error de inicialización"
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
      let path = "/dashboard"
      
      // ✅ Usar constantes ROLES para legibilidad
      if (roleId === ROLES.CLIENT || roleId === ROLES.BENEFICIARY) {
        path = "/my-contract"
      } else if (roleId === ROLES.TRAINER) {
        path = "/calendar"
      }
      
      navigate(path)
    } catch (error) {
      navigate("/dashboard")
    }
  }

  const login = async (correo: string, contrasena: string) => {
    try {
      setError(null)
      setIsLoading(true)

      if (!correo || !contrasena) {
        throw new Error("Email y contraseña son requeridos")
      }

      if (!import.meta.env.VITE_API_URL) {
        throw new Error("URL de API no configurada")
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
      })

      const data = await response.json()
      if (!response.ok) {
        const errorMessage = data.message || data.error || "Credenciales incorrectas"
        throw new Error(errorMessage)
      }

      if (!data || typeof data !== 'object') {
        throw new Error("Respuesta del servidor inválida")
      }

      const authData = data
      const userData = authData.data?.user || authData.user || authData.data || {}

      const tokens = {
        accessToken: authData.data?.accessToken || authData.accessToken || authData.token,
        refreshToken: authData.data?.refreshToken || authData.refreshToken,
      }

      if (!tokens.accessToken) {
        throw new Error("Token de acceso no recibido del servidor")
      }

      if (!userData || typeof userData !== "object" || !userData.id) {
        throw new Error("Datos de usuario inválidos recibidos del servidor")
      }

      const normalizedUser: NormalizedUser = {
        id: userData.id,
        nombre: userData.nombre || userData.nombre_usuario || userData.name || "",
        correo: userData.correo || userData.email || correo,
        id_rol: userData.id_rol || userData.rol_id || userData.roleId || null,
        id_persona: userData.id_persona || null,
      }

      const requiredFields = ["id", "id_rol"] as const
      const missingFields = requiredFields.filter(
        (field) => normalizedUser[field] === undefined || normalizedUser[field] === null,
      )

      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(", ")}`)
      }

      // ✅ Verificar que el rol existe en la base de datos
      if (roles.length > 0) {
        const userRole = roles.find(role => role.id === normalizedUser.id_rol)
        if (!userRole) {
          throw new Error(`El rol ${normalizedUser.id_rol} no existe en el sistema`)
        }
      }

      const basicUser: User = {
        id: normalizedUser.id.toString(),
        nombre: normalizedUser.nombre,
        correo: normalizedUser.correo,
        id_rol: normalizedUser.id_rol!,
        roleCode: "usuario",
        roleName: "Usuario",
  personId: normalizedUser.id_persona ? normalizedUser.id_persona.toString() : undefined,
        clientId: (normalizedUser.id_rol === ROLES.CLIENT || normalizedUser.id_rol === ROLES.BENEFICIARY) && normalizedUser.id_persona
          ? normalizedUser.id_persona.toString()
          : (normalizedUser.id_rol === ROLES.CLIENT || normalizedUser.id_rol === ROLES.BENEFICIARY)
            ? normalizedUser.id.toString()
            : undefined,
      }

      setUser(basicUser)
      setAccessToken(tokens.accessToken)
      setRefreshToken(tokens.refreshToken)

      localStorage.setItem("user", JSON.stringify(basicUser))
      localStorage.setItem("accessToken", tokens.accessToken)
      if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken)
      }

      try {
        await permissionService.initializeWithUserId(normalizedUser.id_rol!)
        setIsInitialized(true)
      } catch (permissionError) {
        setIsInitialized(true)
      }

      redirectBasedOnRole(normalizedUser.id_rol!)

      return { success: true }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido en el login"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Continuar con logout local aunque falle el servidor
    } finally {
      permissionService.clearPermissions()

      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      setClient(null)
      setAccessToken(null)
      setRefreshToken(null)
      
      navigate("/login")
    }
  }

  const hasPermission = (requiredRoles: number[]): boolean => {
    if (!user || !user.id_rol) return false

    // ✅ Verificación directa con el ID del rol
    if (requiredRoles.includes(user.id_rol)) return true

    // ✅ Verificación adicional con roles de BD
    const userRole = roles.find((r) => r.id === user.id_rol)
    return userRole ? requiredRoles.includes(userRole.id) : false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        client,
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