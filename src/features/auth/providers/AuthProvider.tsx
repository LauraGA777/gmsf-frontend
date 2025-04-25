"use client"

import type React from "react"
import { createContext, useState, useEffect } from "react"
import type { User, UserRole } from "@/types"

// Define the context interface
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (requiredRoles: UserRole[]) => boolean
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users data for development
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

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Authentication provider component
 * Manages authentication state and provides auth methods
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would verify the token with the backend
        const storedUser = localStorage.getItem("user")
        
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        // Clear potentially corrupted data
        localStorage.removeItem("user")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find user with matching credentials
      const foundUser = MOCK_USERS.find(u => u.email === email)
      
      if (foundUser && password === "password") { // In a real app, use proper password verification
        setUser(foundUser)
        localStorage.setItem("user", JSON.stringify(foundUser))
        return true
      }
      
      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // Check if user has required role
  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false
    return requiredRoles.includes(user.role)
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}