import { useAuth } from "../contexts/authContext"
import { Button } from "@/shared/components/ui/button"
import { LogOut, User, ChevronRight, HelpCircle } from "lucide-react"
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
  const { user, logout, roles } = useAuth()

  if (!user) return null

  // Genera iniciales a partir del nombre
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Función para obtener el rol de manera robusta
  const getRoleName = (): string => {
    // 1. Intentar usar roleName directamente del usuario
    if (user.roleName && user.roleName !== "Usuario") {
      return user.roleName;
    }

    // 2. Intentar usar role.nombre del objeto rol
    if (user.role && typeof user.role === 'object' && user.role.nombre) {
      return user.role.nombre;
    }

    // 3. Buscar en la lista de roles dinámicos usando id_rol
    if (user.id_rol && roles && roles.length > 0) {
      const foundRole = roles.find(role => role.id === user.id_rol);
      if (foundRole && foundRole.nombre) {
        return foundRole.nombre;
      }
    }

    // 4. Fallback final
    return "Usuario";
  };

  const roleName = getRoleName();

  return (
    <div className="flex items-center space-x-4">
      {/* Botón de ayuda */}
      <Button 
        variant="ghost" 
        size="sm"
        className="h-10 w-10 rounded-full hover:bg-gray-100"
        title="Ayuda"
        onClick={() => window.open('https://drive.google.com/file/d/1pW-8XZzDNx7bKEwlWp2UlfefoZ4kscjr/view?usp=sharing', '_blank')}
      >
        <HelpCircle className="h-5 w-5 text-gray-600" />
      </Button>
      
      {/* Menú de usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 px-3 flex items-center gap-2 rounded-full hover:bg-gray-100">
            <Avatar className={cn("h-8 w-8 border-2 border-black text-black")}>
              <AvatarFallback>{getInitials(user.nombre)}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-sm font-medium truncate max-w-[120px]">{user.nombre}</span>
              <p className="text-xs text-gray-400">{roleName}</p>
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
              <p className="text-xs text-gray-500 mt-1">{roleName}</p>
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

