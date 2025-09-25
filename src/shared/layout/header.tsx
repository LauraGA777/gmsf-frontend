import { useLocation } from "react-router-dom"
import { UserMenu } from "./userMenu"
import { Menu, Home, Users, UserCog, FileSignature, User, ClipboardCheck, Calendar, UserCheck } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useEffect, useState } from "react"

interface HeaderProps {
  toggleSidebar: () => void
  currentSection: string
}

export function Header({ toggleSidebar, currentSection }: HeaderProps) {
  const location = useLocation()
  const [pathIcon, setPathIcon] = useState<React.ReactNode>(<Home />)

  // Actualiza el icono basado en la ruta actual
  useEffect(() => {
    const path = location.pathname
    let icon = <Home />

    if (path.includes("/dashboard")) {
      icon = <Home />
    } else if (path.includes("/users")) {
      icon = <Users />
    } else if (path.includes("/trainers")) {
      icon = <UserCog />
    } else if (path.includes("/calendar")) {
      icon = <Calendar />
    } else if (path.includes("/contracts")) {
      icon = <FileSignature />
    } else if (path.includes("/clients")) {
      icon = <User />
    } else if (path.includes("/memberships")) {
      icon = <ClipboardCheck />
    } else if (path.includes("/attendance")) {
      icon = <UserCheck />
    }

    setPathIcon(icon)
  }, [location.pathname])

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
              <li className="flex items-center">
                <span className="text-sm md:text-base font-semibold text-gray-800">
                  {currentSection}
                </span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex-1" />
        <UserMenu />
      </div>
    </header>
  )
}

