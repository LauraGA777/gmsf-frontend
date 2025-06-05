import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronUp,
  UserCog,
  Dumbbell,
  X,
  FileSignature,
  UserCheck,
  ClipboardCheck,
  BarChart4,
  FileQuestion,
  User,
  TagIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { cn } from "../lib/formatCop"
import { useAuth } from "../contexts/authContext"

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
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, hasSubmenu, expanded, to, onClose, id }) => {
  const className = cn(
    "flex items-center w-full py-3 px-4 text-base font-normal transition duration-75 cursor-pointer",
    active
      ? "text-gray-700 bg-gray-100 hover:bg-gray-200"
      : "text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700",
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
        <Link to={to} className={className} onClick={handleClick}>
          {content}
        </Link>
      </li>
    )
  }

  return (
    <li id={id} className="my-1">
      <div className={className} onClick={handleClick}>
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
    }
    else if (path.includes("/users")) {
      setActiveItem("users")
      setActiveGroup(null)
    } else if (path.includes("/trainers")) {
      setActiveItem("trainers")
      setActiveGroup(null)
    } else if (path.includes("/services/custom")) {
      setActiveItem("services.custom")
      setActiveGroup("services")
    } else if (path.includes("/services")) {
      setActiveItem("services.list")
      setActiveGroup("services")
    } else if (path.includes("/calendar")) {
      setActiveItem("calendar")
      setActiveGroup("services")
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
    } else if (path.includes("/surveys")) {
      setActiveItem("surveys.list")
      setActiveGroup("feedback")
    }
  }, [location.pathname])

  // Función para determinar si se debe mostrar un elemento basado en el rol de usuario
  const shouldShowItem = (allowedRoles: number[]) => {
    if (!user || !user.id_rol) return false
    return allowedRoles.includes(user.id_rol)
  }

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

  if (!shouldRender) return null

  return (
    <aside className={sidebarClasses} aria-label="Sidebar">
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
        {/* Encabezado del Sidebar */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2 items-center">
            <img
              src="../../public/favicon.ico" // o la ruta correcta a tu imagen
              alt="Logo GMSF"
              className="h-8 w-8" // Ajusta el tamaño según necesites
            /> 
            <h2 className="text-2xl font-bold text-black-800">GMSF</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden p-1" aria-label="Cerrar menú">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Área de navegación con scroll */}
        <nav className="flex-1 overflow-y-auto py-4 text-base">
          <ul className="space-y-0">
            {/* 1. Panel de control - Solo para admin y trainer */}
            {shouldShowItem([1, 2]) && (
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

            {/* 2. Usuarios - Solo para admin */}
            {shouldShowItem([1]) && (
              <NavItem
                icon={<Users className="h-5 w-5" aria-hidden="true" />}
                label="Roles"
                active={activeItem === "roles"}
                onClick={() => handleItemClick("roles")}
                to="/roles"
                onClose={onClose}
                id="nav-users"
              />
            )}

            {/* 2. Usuarios - Solo para admin */}
            {shouldShowItem([1]) && (
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

            {/* 3. Entrenadores - Solo para admin */}
            {shouldShowItem([1]) && (
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

            {/* 4. Servicios */}
            <NavItem
              icon={<Dumbbell className="h-5 w-5" aria-hidden="true" />}
              label="Servicios"
              active={activeGroup === "services"}
              onClick={() => toggleGroup("services")}
              hasSubmenu={true}
              expanded={activeGroup === "services"}
              id="nav-services"
            />
            {activeGroup === "services" && (
              <ul className="py-1 mx-4 border-l border-gray-100">
                {/* Listado de servicios */}
                <li className="my-1">
                  <Link
                    to="/services"
                    className={cn(
                      "flex items-center w-full py-2 px-4 text-base font-normal transition duration-75 cursor-pointer ml-2",
                      activeItem === "services.list"
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                    )}
                    onClick={() => {
                      handleItemClick("services.list", "services")
                      if (window.innerWidth < 768) onClose()
                    }}
                  >
                    <span className="flex-shrink-0 text-gray-500 mr-3">
                      <ClipboardList className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex-1 whitespace-nowrap">Servicios</span>
                  </Link>
                </li>
                {/* Agenda */}
                <li className="my-1">
                  <Link
                    to="/calendar"
                    className={cn(
                      "flex items-center w-full py-2 px-4 text-base font-normal transition duration-75 cursor-pointer ml-2",
                      activeItem === "calendar"
                        ? "text-gray-700 hover:bg-gray-100"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700",
                    )}
                    onClick={() => {
                      handleItemClick("calendar", "services")
                      if (window.innerWidth < 768) onClose()
                    }}
                  >
                    <span className="flex-shrink-0 text-gray-500 mr-3">
                      <Calendar className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex-1 whitespace-nowrap">Agenda</span>
                  </Link>
                </li>
              </ul>
            )}

            {/* 5. Clientes y contratos */}
            {shouldShowItem([1, 2]) && (
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
                    {/* Contratos */}
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
                    {/* Personas */}
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
                  </ul>
                )}
              </>
            )}

            {/* 6. Membresías y asistencia */}
            {shouldShowItem([1, 2]) && (
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
                    {/* Membresías */}
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
                    {/* Asistencia */}
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
                  </ul>
                )}
              </>
            )}

            {/* 7. Retroalimentación - Encuestas
            {shouldShowItem([1, 2]) && (
              <NavItem
                icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
                label="Encuestas"
                active={activeItem === "surveys.list"}
                onClick={() => handleItemClick("surveys.list", "feedback")}
                to="/surveys"
                onClose={onClose}
                id="nav-surveys"
              />
            )}  */}

            {/* Cerrar Sesión */}
            <NavItem
              icon={<LogOut className="h-5 w-5" aria-hidden="true" />}
              label="Cerrar Sesión"
              active={false}
              onClick={() => handleItemClick("logout")}
              onClose={onClose}
              id="nav-logout"
            />
          </ul>
        </nav>
      </div>
    </aside>
  )
}
