import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, User, ChevronRight, Settings, Bell, HelpCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/utils"

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

  // Genera iniciales a partir del nombre
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Obtiene un color de fondo basado en el rol
  const getAvatarColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-600 text-white"; // Púrpura para admin
      case "trainer": return "bg-blue-500 text-white"; // Azul para entrenadores
      case "client": return "bg-green-500 text-white"; // Verde para clientes
      default: return "bg-gray-500 text-white"; // Gris por defecto
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Icono de notificaciones */}
      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800 relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
      </Button>
      
      {/* Icono de ayuda */}
      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800">
        <HelpCircle className="h-5 w-5" />
      </Button>
      
      {/* Menú de usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 px-3 flex items-center gap-2 rounded-full hover:bg-gray-100">
            <Avatar className={cn("h-8 w-8", getAvatarColor(user.role))}>
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-sm font-medium truncate max-w-[120px]">{user.name}</span>
              <span className="text-xs text-gray-500">{getRoleName(user.role)}</span>
            </div>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center p-2">
            <Avatar className={cn("h-10 w-10 mr-2", getAvatarColor(user.role))}>
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-gray-500 mt-1">{getRoleName(user.role)}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferencias</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

