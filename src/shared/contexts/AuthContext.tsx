import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import type { User, UserRole } from "../types"

// Definir la interfaz del contexto
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
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
    clientId: "1", // ID que coincide con un cliente en mockData
    contract: {
      id: 1,
      codigo: "CT0001",
      id_cliente: 1,
      id_membresia: 2,
      fecha_inicio: new Date("2023-05-15"),
      fecha_fin: new Date(new Date().setDate(new Date().getDate() + 30)),
      precio_total: 150000,
      estado: "Activo",
      fecha_registro: "2023-05-15",
      cliente_nombre: "Juan Carlos Pérez Rodríguez",
      membresia_nombre: "Mensualidad",
      membresia_precio: 150000,
      cliente_documento: "1098765432",
      cliente_documento_tipo: "CC"
    }
  },
  {
    id: "5",
    name: "María González",
    email: "maria@example.com",
    role: "client",
    clientId: "0002",
    // Agregar contrato activo por defecto
    activeContract: {
      id: "C0002",
      status: "Activo",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      membershipType: "Standard"
    }
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.role === "client") {
          parsedUser.contract = {
            id: "default",
            estado: "Activo",
            fecha_inicio: new Date().toISOString(),
            fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            membresia_nombre: "Mensual",
          }
        }
        setUser(parsedUser)
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  // Efecto separado para manejar redirecciones
  useEffect(() => {
    if (!loading && user && location.pathname === "/") {
      if (user.role === "client") {
        navigate("/calendar")
      } else {
        navigate("/dashboard")
      }
    }
  }, [loading, user, navigate, location])

  const login = async (email: string, password: string) => {
    try {
      const foundUser = MOCK_USERS.find(u => u.email === email)
      
      if (!foundUser || password !== "password") {
        return { success: false, error: "Credenciales inválidas" }
      }

      const userToSave = { ...foundUser }
      
      // No sobrescribir el contrato si ya existe en el usuario
      if (userToSave.role === "client" && !userToSave.contract) {
        userToSave.contract = {
          id: 1,
          codigo: "CT0001",
          id_cliente: 1,
          id_membresia: 2,
          fecha_inicio: new Date("2023-05-15"),
          fecha_fin: new Date(new Date().setDate(new Date().getDate() + 30)),
          precio_total: 150000,
          estado: "Activo",
          fecha_registro: "2023-05-15",
          cliente_nombre: "Juan Carlos Pérez Rodríguez",
          membresia_nombre: "Mensualidad",
          membresia_precio: 150000,
          cliente_documento: "1098765432",
          cliente_documento_tipo: "CC"
        }
      }

      setUser(userToSave)
      localStorage.setItem("user", JSON.stringify(userToSave))

      if (userToSave.role === "client") {
        navigate("/calendar")
      } else {
        navigate("/dashboard")
      }

      return { success: true }
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error)
      return { 
        success: false, 
        error: "Ha ocurrido un error durante el inicio de sesión. Por favor, intente nuevamente." 
      }
    }
  }

  // Función de logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    navigate("/")
  }

  // Función para verificar permisos
  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false
    return requiredRoles.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: loading,
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

