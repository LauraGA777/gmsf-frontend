import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  ChevronDown,
  ChevronUp,
  UserCog,
  X,
  FileSignature,
  UserCheck,
  ClipboardCheck,
  BarChart4,
  User,
  ShoppingCartIcon,
  BadgeCheck,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/formatCop"
import { useAuth } from "@/shared/contexts/authContext"
import { usePermissions } from "@/shared/hooks/usePermissions"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  hasSubmenu?: boolean
  expanded?: boolean
  to?: string
  onClose?: () => void
  id?: string
  className?: string
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active,
  onClick,
  hasSubmenu,
  expanded,
  to,
  onClose,
  id,
  className,
}) => {
  const baseClassName = cn(
    "flex items-center w-full py-3 px-4 text-base font-normal transition duration-75 cursor-pointer",
    active
      ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
      : "text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700",
    className,
  )

  const handleClick = () => {
    onClick()
    if (onClose && window.innerWidth < 768 && !hasSubmenu) {
      onClose()
    }
  }

  const content = (
    <>
      <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">{icon}</span>
      <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
      {hasSubmenu && (
        <span className="flex-shrink-0 text-gray-400">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <li id={id} className="my-1">
        <Link to={to} className={baseClassName} onClick={handleClick}>
          {content}
        </Link>
      </li>
    )
  }

  return (
    <li id={id} className="my-1">
      <div className={baseClassName} onClick={handleClick}>
        {content}
      </div>
    </li>
  )
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const { logout, user } = useAuth()
  const [shouldRender, setShouldRender] = useState(false)
  const { hasModuleAccess, isLoading } = usePermissions()

  useEffect(() => {
    setShouldRender(!!user)
  }, [user])

  useEffect(() => {
    const path = location.pathname

    // Determinar el ítem activo basado en la ruta actual
    if (path.includes("/dashboard")) {
      setActiveItem("dashboard")
      setActiveGroup(null)
    } else if (path.includes("/roles")) {
      setActiveItem("roles")
      setActiveGroup(null)
    } else if (path.includes("/users")) {
      setActiveItem("users")
      setActiveGroup(null)
    } else if (path.includes("/trainers")) {
      setActiveItem("trainers")
      setActiveGroup(null)
    } else if (path.includes("/calendar")) {
      setActiveItem("calendar")
      setActiveGroup(null)
    } else if (path.includes("/clients")) {
      setActiveItem("clients.list")
      setActiveGroup("clients")
    } else if (path.includes("/contracts")) {
      setActiveItem("contracts.list")
      setActiveGroup("clients")
    } else if (path.includes("/memberships")) {
      setActiveItem("memberships.list")
      setActiveGroup("memberships")
    } else if (path.includes("/attendance")) {
      setActiveItem("attendance.list")
      setActiveGroup("memberships")
    }
  }, [location.pathname])

  const handleItemClick = (item: string, group: string | null = null) => {
    if (item === "logout") {
      logout()
      return
    }
    setActiveItem(item)
    setActiveGroup(group)
  }

  const toggleGroup = (group: string) => {
    setActiveGroup(activeGroup === group ? null : group)
  }

  // Clases para el sidebar basadas en el estado isOpen
  const sidebarClasses = cn(
    "fixed md:sticky top-0 left-0 z-30",
    "h-screen",
    "w-[280px] md:w-64",
    "transform transition-transform duration-300 ease-in-out",
    "flex flex-col shadow-md",
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
  )

  // Verificar acceso a diferentes grupos de módulos
  const hasVentasAccess = hasModuleAccess("Gestión de contratos") || hasModuleAccess("Gestión de clientes")
  
  const hasMembresíasAccess = hasModuleAccess("Gestión de membresías") || hasModuleAccess("Control de asistencia")

  if (!shouldRender || isLoading) return null

  return (
    <aside className={sidebarClasses} aria-label="Sidebar">
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
        {/* Encabezado del Sidebar */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2 items-center">
            {/* Logo GMSF */}
            <Link
            to="/dashboard" 
              className="text-2xl font-bold text-black-800 font-gmsf font-normal not-italic hover:text-black-800 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                handleItemClick("dashboard")
                if (window.innerWidth < 768) onClose()
              }}
              aria-label="Ir al Dashboard">
            <img src="/favicon.ico" alt="Logo GMSF" className="h-10 w-10" />
            </Link>
            {/* Título GMSF clickeable que redirecciona al dashboard */}
            <Link 
              to="/dashboard" 
              className="text-2xl font-bold text-black-800 font-gmsf font-normal not-italic hover:text-black-800 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                handleItemClick("dashboard")
                if (window.innerWidth < 768) onClose()
              }}
              aria-label="Ir al Dashboard"
            >
              GMSF
            </Link>
            {/* 
            Opciones alternativas de fuentes:
            - font-title: Fuente Inter moderna y limpia
            - font-brand: Fuente Roboto corporativa  
            - font-modern: Fuente Poppins moderna (actual)
            - font-tech: Fuente Fira Code estilo tecnológico
            - font-elegant: Fuente Playfair Display elegante
            - font-mono: Fuente monospace del sistema
            - font-sans: Fuente sans-serif por defecto
            - font-serif: Fuente serif tradicional
            - font-gmsf: Fuente Fugaz One personalizada para GMSF
            */}
            <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden p-1" aria-label="Cerrar menú">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Área de navegación con scroll */}
        <nav className="flex-1 overflow-y-auto py-4 text-base">
          <ul className="space-y-0">
            {/* 1. Panel de control */}
            {hasModuleAccess("Panel de control") && (
              <NavItem
                icon={<LayoutDashboard className="h-5 w-5" aria-hidden="true" />}
                label="Panel de control"
                active={activeItem === "dashboard"}
                onClick={() => handleItemClick("dashboard")}
                to="/dashboard"
                onClose={onClose}
                id="nav-dashboard"
              />
            )}

            {/* 2. Gestión de roles */}
            {hasModuleAccess("Gestión de roles") && (
              <NavItem
                icon={<BadgeCheck className="h-5 w-5" aria-hidden="true" />}
                label="Roles"
                active={activeItem === "roles"}
                onClick={() => handleItemClick("roles")}
                to="/roles"
                onClose={onClose}
                id="nav-roles"
              />
            )}

            {/* 3. Gestión de usuarios */}
            {hasModuleAccess("Gestión de usuarios") && (
              <NavItem
                icon={<Users className="h-5 w-5" aria-hidden="true" />}
                label="Usuarios"
                active={activeItem === "users"}
                onClick={() => handleItemClick("users")}
                to="/users"
                onClose={onClose}
                id="nav-users"
              />
            )}

            {/* 4. Gestión de entrenadores */}
            {hasModuleAccess("Gestión de entrenadores") && (
              <NavItem
                icon={<UserCog className="h-5 w-5" aria-hidden="true" />}
                label="Entrenadores"
                active={activeItem === "trainers"}
                onClick={() => handleItemClick("trainers")}
                to="/trainers"
                onClose={onClose}
                id="nav-trainers"
              />
            )}

            {/* 5. Agenda - Siempre visible para usuarios autenticados */}
            <NavItem
              icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
              label="Agenda"
              active={activeItem === "calendar"}
              onClick={() => {
                handleItemClick("calendar")
                if (window.innerWidth < 768) onClose()
              }}
              to="/calendar"
              onClose={onClose}
              id="nav-calendar"
            />

            {/* 6. Ventas - Solo mostrar si tiene acceso a al menos un submódulo */}
            {hasVentasAccess && (
              <>
                <NavItem
                  icon={<ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />}
                  label="Ventas"
                  active={activeGroup === "clients"}
                  onClick={() => toggleGroup("clients")}
                  hasSubmenu={true}
                  expanded={activeGroup === "clients"}
                  id="nav-clients"
                />
                {activeGroup === "clients" && (
                  <ul className="py-1 mx-4 border-l border-gray-100">
                    {/* Contratos - Solo mostrar si tiene acceso */}
                    {hasModuleAccess("Gestión de contratos") && (
                      <li className="my-1">
                        <Link
                          to="/contracts"
                          className={cn(
                            "flex items-center w-full py-2 px-4 text-base font-normal transition duration-75 cursor-pointer ml-2",
                            activeItem === "contracts.list"
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                          )}
                          onClick={() => {
                            handleItemClick("contracts.list", "clients")
                            if (window.innerWidth < 768) onClose()
                          }}
                        >
                          <span className="flex-shrink-0 text-gray-500 mr-3">
                            <FileSignature className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="flex-1 whitespace-nowrap">Contratos</span>
                        </Link>
                      </li>
                    )}

                    {/* Personas - Solo mostrar si tiene acceso */}
                    {hasModuleAccess("Gestión de clientes") && (
                      <li className="my-1">
                        <Link
                          to="/clients"
                          className={cn(
                            "flex items-center w-full py-2 px-4 text-base font-normal transition duration-75 cursor-pointer ml-2",
                            activeItem === "clients.list"
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                          )}
                          onClick={() => {
                            handleItemClick("clients.list", "clients")
                            if (window.innerWidth < 768) onClose()
                          }}
                        >
                          <span className="flex-shrink-0 text-gray-500 mr-3">
                            <User className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="flex-1 whitespace-nowrap">Personas</span>
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </>
            )}

            {/* 7. Membresías - Solo mostrar si tiene acceso a al menos un submódulo */}
            {hasMembresíasAccess && (
              <>
                <NavItem
                  icon={<UserCheck className="h-5 w-5" aria-hidden="true" />}
                  label="Membresías"
                  active={activeGroup === "memberships"}
                  onClick={() => toggleGroup("memberships")}
                  hasSubmenu={true}
                  expanded={activeGroup === "memberships"}
                  id="nav-memberships"
                />
                {activeGroup === "memberships" && (
                  <ul className="py-1 mx-4 border-l border-gray-100">
                    {/* Membresías - Solo mostrar si tiene acceso */}
                    {hasModuleAccess("Gestión de membresías") && (
                      <li className="my-1">
                        <Link
                          to="/memberships"
                          className={cn(
                            "flex items-center w-full py-2 px-4 text-base font-normal transition duration-75 cursor-pointer ml-2",
                            activeItem === "memberships.list"
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                          )}
                          onClick={() => {
                            handleItemClick("memberships.list", "memberships")
                            if (window.innerWidth < 768) onClose()
                          }}
                        >
                          <span className="flex-shrink-0 text-gray-500 mr-3">
                            <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="flex-1 whitespace-nowrap">Membresías</span>
                        </Link>
                      </li>
                    )}

                    {/* Asistencia - Solo mostrar si tiene acceso */}
                    {hasModuleAccess("Control de asistencia") && (
                      <li className="my-1">
                        <Link
                          to="/attendance"
                          className={cn(
                            "flex items-center w-full py-2 px-4 text-base font-normal transition duration-75 cursor-pointer ml-2",
                            activeItem === "attendance.list"
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                          )}
                          onClick={() => {
                            handleItemClick("attendance.list", "memberships")
                            if (window.innerWidth < 768) onClose()
                          }}
                        >
                          <span className="flex-shrink-0 text-gray-500 mr-3">
                            <BarChart4 className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="flex-1 whitespace-nowrap">Asistencia</span>
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </>
            )}

            {/* Separador visual */}
            <li className="my-2">
              <hr className="border-gray-200 dark:border-gray-700" />
            </li>

            {/* Cerrar Sesión - Siempre visible */}
            <NavItem
              icon={<LogOut className="h-5 w-5 text-red-600" aria-hidden="true" />}
              label="Cerrar Sesión"
              active={false}
              onClick={logout}
              onClose={onClose}
              id="nav-logout"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            />
          </ul>
        </nav>
      </div>
    </aside>
  )
}
