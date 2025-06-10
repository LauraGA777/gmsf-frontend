import { useAuth } from "../contexts/authContext"
import { Button } from "@/shared/components/ui/button"
import { LogOut, User, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/shared/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { cn } from "@/shared/lib/formatCop"
import { Link } from 'react-router-dom';

export function UserMenu() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getRoleName = (id_rol: number) => {
    switch (id_rol) {
      case 1:
        return "Administrador"
      case 2:
        return "Entrenador"
      case 3:
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
            <Avatar className={cn("h-8 w-8 border-2 border-black text-black")}>
              <AvatarFallback>{getInitials(user.nombre)}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-sm font-medium truncate max-w-[120px]">{user.nombre}</span>
              <p className="text-xs text-gray-400">{getRoleName(user.id_rol)}</p>
            </div>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center p-2">
            <Avatar className={cn("h-8 w-8 mr-2 border-2 border-black text-black")}>
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
                <Link to="/profile" className="flex items-center">
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

