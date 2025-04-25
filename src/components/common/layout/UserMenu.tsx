"use client"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { LogOut, User, ChevronRight, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * User menu component that displays user information and logout button
 * Used in the application header
 */
export function UserMenu() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "trainer":
        return "Entrenador"
      case "client":
        return "Cliente"
      default:
        return role
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 px-3 flex items-center gap-2 rounded-full hover:bg-gray-100">
          <div className="bg-gray-200 rounded-full p-1.5">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-gray-700" />
            )}
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-gray-500">{getRoleName(user.role)}</span>
          </div>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}