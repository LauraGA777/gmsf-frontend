import { useAuth, ROLES } from "../contexts/authContext"
import { Button } from "../components/ui/button"
import { LogOut, User, ChevronRight, Settings, Bell, HelpCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { cn } from "../lib/formatCop"
import { Link } from 'react-router-dom';

export function UserMenu() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case ROLES.ADMIN:
        return "Administrador"
      case ROLES.ENTRENADOR:
        return "Entrenador"
      case ROLES.CLIENTE:
        return "Cliente"
      default:
        return "Usuario"
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
  const getAvatarColor = (roleId: number) => {
    switch (roleId) {
      case ROLES.ADMIN: return "bg-purple-600 text-white"
      case ROLES.ENTRENADOR: return "bg-blue-500 text-white"
      case ROLES.CLIENTE: return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Icono de notificaciones 
      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800 relative">
        <Bell className="h-5 w-5" />
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
      </Button>*/}
      
      {/* Icono de ayuda 
      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800">
        <HelpCircle className="h-5 w-5" />
      </Button>*/}
      
      {/* Menú de usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 px-3 flex items-center gap-2 rounded-full hover:bg-gray-100">
            <Avatar className={cn("h-8 w-8", getAvatarColor(user.id_rol))}>
              <AvatarFallback>{getInitials(user.nombre)}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-sm font-medium truncate max-w-[120px]">{user.nombre}</span>
              <span className="text-xs text-gray-500">{getRoleName(user.id_rol)}</span>
            </div>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center p-2">
            <Avatar className={cn("h-10 w-10 mr-2", getAvatarColor(user.id_rol))}>
              <AvatarFallback>{getInitials(user.nombre)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{user.nombre}</p>
              <p className="text-xs text-gray-500 mt-1">{getRoleName(user.id_rol)}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/edit-profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                </Link>
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

