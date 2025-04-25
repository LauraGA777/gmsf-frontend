"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  ClipboardList,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronUp,
  UserCog,
  Dumbbell,
  X,
  Clock, // Add Clock icon for Continue section
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  indent?: boolean
  to?: string
  onClose?: () => void
  id?: string
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick, indent, to, onClose, id }) => {
  const className = cn(
    "flex items-center w-full p-2 text-base font-normal rounded-lg transition duration-75 cursor-pointer",
    active
      ? "text-blue-600 bg-blue-100 hover:bg-blue-200"
      : "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
  )

  const content = (
    <>
      {icon}
      <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
    </>
  )

  const handleClick = () => {
    onClick()
    if (onClose && window.innerWidth < 768) {
      onClose()
    }
  }

  if (to) {
    return (
      <li className={indent ? "ml-4" : ""} id={id}>
        <Link to={to} className={className} onClick={handleClick}>
          {content}
        </Link>
      </li>
    )
  }

  return (
    <li className={indent ? "ml-4" : ""} id={id}>
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
    if (path.includes("/services/trainers")) {
      setActiveItem("trainers.list")
      setActiveGroup("services")
    } else if (path.includes("/services/custom")) {
      setActiveItem("services.custom")
      setActiveGroup("services")
    } else if (path.includes("/services")) {
      setActiveItem("services.list")
      setActiveGroup("services")
    } else if (path.includes("/clients")) {
      setActiveItem("clients.list")
      setActiveGroup("clients")
    } else if (path.includes("/contracts")) {
      setActiveItem("contracts.list")
      setActiveGroup("clients")
    } else if (path.includes("/dashboard")) {
      setActiveItem("dashboard")
      setActiveGroup(null)
    }
  }, [location.pathname])

  // Función mejorada para determinar si se debe mostrar un elemento
  const shouldShowItem = (allowedRoles: string[]) => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  }

  const handleItemClick = (item: string, group: string) => {
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
    "flex flex-col",
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
  )

  if (!shouldRender) return null

  return (
    <aside className={sidebarClasses} aria-label="Sidebar">
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
        {/* Encabezado del Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">GMSF</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden p-1"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Área de navegación con scroll */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            {/* Dashboard - Solo para admin y trainer */}
            {shouldShowItem(["admin", "trainer"]) && (
              <NavItem
                icon={<LayoutDashboard className="h-5 w-5" aria-hidden="true" />}
                label="Dashboard"
                active={activeItem === "dashboard"}
                onClick={() => handleItemClick("dashboard", "main")}
                to="/dashboard"
                onClose={onClose}
              />
            )}

            {/* Servicios & Entrenadores */}
            <li>
              <button
                type="button"
                onClick={() => toggleGroup("services")}
                className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                aria-controls="dropdown-services"
                aria-expanded={activeGroup === "services"}
              >
                <Dumbbell className="h-5 w-5" aria-hidden="true" />
                <span className="ml-3 flex-1 whitespace-nowrap">Servicios & Entrenadores</span>
                {activeGroup === "services" ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <ul
                id="dropdown-services"
                className={cn("py-2 space-y-2", activeGroup !== "services" && "hidden")}
                aria-hidden={activeGroup !== "services"}
              >
                {/* Lista de servicios visible para todos */}
                <NavItem
                  icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
                  label="Lista de Servicios"
                  active={activeItem === "services.list"}
                  onClick={() => handleItemClick("services.list", "services")}
                  to="/services"
                  onClose={onClose}
                  indent
                />

                {/* Agenda - Visible para todos */}
                <NavItem
                  icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
                  label="Agenda"
                  active={activeItem === "calendar"}
                  onClick={() => handleItemClick("calendar", "services")}
                  to="/calendar"
                  onClose={onClose}
                  indent
                />

                {/* Entrenadores - Solo visible para admin */}
                {shouldShowItem(["admin"]) && (
                  <NavItem
                    icon={<UserCog className="h-5 w-5" aria-hidden="true" />}
                    label="Entrenadores"
                    active={activeItem === "trainers.list"}
                    onClick={() => handleItemClick("trainers.list", "services")}
                    to="/services/trainers"
                    onClose={onClose}
                    indent
                  />
                )}
              </ul>
            </li>

            {/* Clientes y Contratos - Solo para admin y trainer */}
            {shouldShowItem(["admin", "trainer"]) && (
              <li>
                <button
                  type="button"
                  onClick={() => toggleGroup("clients")}
                  className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  aria-controls="dropdown-clients"
                  aria-expanded={activeGroup === "clients"}
                >
                  <Users className="h-5 w-5" aria-hidden="true" />
                  <span className="ml-3 flex-1 whitespace-nowrap">Clientes & Contratos</span>
                  {activeGroup === "clients" ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <ul
                  id="dropdown-clients"
                  className={cn("py-2 space-y-2", activeGroup !== "clients" && "hidden")}
                  aria-hidden={activeGroup !== "clients"}
                >
                  <NavItem
                    icon={<Users className="h-5 w-5" aria-hidden="true" />}
                    label="Lista de Clientes"
                    active={activeItem === "clients.list"}
                    onClick={() => handleItemClick("clients.list", "clients")}
                    to="/clients"
                    onClose={onClose}
                    indent
                  />
                  <NavItem
                    icon={<FileText className="h-5 w-5" aria-hidden="true" />}
                    label="Contratos"
                    active={activeItem === "contracts.list"}
                    onClick={() => handleItemClick("contracts.list", "clients")}
                    to="/contracts"
                    onClose={onClose}
                    indent
                  />
                </ul>
              </li>
            )}

            {/* Continue section - Visible for trainers and clients */}
            {shouldShowItem(["trainer", "client"]) && (
              <NavItem
                icon={<Clock className="h-5 w-5" aria-hidden="true" />}
                label="Continue"
                active={activeItem === "continue"}
                onClick={() => handleItemClick("continue", "main")}
                to="/continue"
                onClose={onClose}
              />
            )}

            {/* Mensajes - Visible para todos */}
            <NavItem
              icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
              label="Mensajes"
              active={activeItem === "messages"}
              onClick={() => handleItemClick("messages", "main")}
              to="/messages"
              onClose={onClose}
            />

            {/* Cerrar Sesión */}
            <NavItem
              icon={<LogOut className="h-5 w-5" aria-hidden="true" />}
              label="Cerrar Sesión"
              active={false}
              onClick={() => handleItemClick("logout", "main")}
              onClose={onClose}
            />
          </ul>
        </nav>
      </div>
    </aside>
  )
}

