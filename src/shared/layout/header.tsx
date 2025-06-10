import { useLocation } from "react-router-dom"
import { UserMenu } from "./userMenu"
import { Menu, Home, Users, UserCog, Dumbbell, FileSignature, User, ClipboardCheck, MessageSquare } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/formatCop"
import { useEffect, useState } from "react"
import { useAuth, ROLES } from "@/shared/contexts/authContext"

interface HeaderProps {
  toggleSidebar: () => void
  currentSection?: string
}

export function Header({ toggleSidebar, currentSection }: HeaderProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [pathIcon, setPathIcon] = useState<React.ReactNode>(<Home />)
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>([])

  // Actualiza el icono y las migas de pan basado en la ruta actual
  useEffect(() => {
    const path = location.pathname
    let icon = <Home />
    let items: string[] = []

    if (path.includes("/dashboard")) {
      icon = <Home />
      items = ["Panel de Control"]
    }
    else if (path.includes("/roles")) {
      icon = <Users />
      items = ["Roles"]
    } else if (path.includes("/users")) {
      icon = <Users />
      items = ["Usuarios"]
    } else if (path.includes("/trainers")) {
      icon = <UserCog />
      items = ["Entrenadores"]
    } else if (path.includes("/services")) {
      icon = <Dumbbell />
      items = ["Servicios"]
    } else if (path.includes("/calendar")) {
      icon = <Dumbbell />
      items = user?.id_rol === ROLES.CLIENTE ? ["Agenda"] : ["Servicios", "Agenda"]
    } else if (path.includes("/contracts")) {
      icon = <FileSignature />
      items = ["Ventas", "Contratos"]
    } else if (path.includes("/clients")) {
      icon = <User />
      items = ["Ventas", "Personas"]
    } else if (path.includes("/memberships")) {
      icon = <ClipboardCheck />
      items = ["Membresías"]
    } else if (path.includes("/attendance")) {
      icon = <ClipboardCheck />
      items = ["Membresías", "Asistencia"]
    } else if (path.includes("/surveys")) {
      icon = <MessageSquare />
      items = ["Encuestas"]
    }

    setPathIcon(icon)
    setBreadcrumbItems(items)
  }, [location.pathname, user])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Breadcrumb navigation*/} 
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleSidebar}
          aria-label="Mostrar menú"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb navigation */}
        <div className="flex items-center">
          <div className="flex items-center text-gray-500 mr-2">
            {pathIcon}
          </div>
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2">
              {breadcrumbItems.map((item, index) => (
                <li key={item} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  <span className={cn(
                    "text-sm md:text-base font-medium",
                    index === breadcrumbItems.length - 1 
                      ? "text-gray-800 font-semibold" 
                      : "text-gray-500"
                  )}>
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="flex-1" />
        
        {/* Status indicator - green dot when user is active 
        <div className="hidden md:flex items-center mr-4">
          <div className="flex items-center mr-2">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-sm text-gray-600">Activo</span>
          </div>
        </div>*/}
        
        <UserMenu />
      </div>
    </header>
  )
}

