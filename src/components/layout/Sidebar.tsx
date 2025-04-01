"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  ClipboardList,
  MessageSquare,
  LogOut,
  ChevronDown,
  ChevronUp,
  UserCog,
  CalendarClock,
  Dumbbell,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

// Componente NavItem simplificado que no usa li anidados
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
    // En dispositivos móviles, cerrar el sidebar al hacer clic en un elemento
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

  // Determinar la ruta activa basada en la ubicación actual
  useEffect(() => {
    const path = location.pathname

    if (path.includes("/services/trainers-schedule")) {
      setActiveItem("trainers.schedule")
      setActiveGroup("services")
    } else if (path.includes("/services/trainers")) {
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

  const handleItemClick = (item: string, group: string) => {
    setActiveItem(item)
    setActiveGroup(group)
  }

  const toggleGroup = (group: string) => {
    setActiveGroup(activeGroup === group ? null : group)
  }

  // Clases para el sidebar basadas en el estado isOpen
  const sidebarClasses = cn(
    "fixed md:sticky top-0 left-0 z-30",
    "h-screen md:h-auto",
    "w-[280px] md:w-64",
    "transform transition-transform duration-300 ease-in-out",
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
  )

  return (
    <aside className={sidebarClasses} aria-label="Sidebar">
      <div className="overflow-y-auto h-full py-4 px-3 bg-gray-50 dark:bg-gray-800 flex flex-col">
        {/* Botón de cierre para móviles */}
        <div className="flex justify-between items-center mb-5 md:hidden">
          <h2 className="text-lg font-semibold">Gym Management</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ul className="space-y-2 flex-1">
          <NavItem
            icon={<LayoutDashboard className="h-5 w-5" aria-hidden="true" />}
            label="Dashboard"
            active={activeItem === "dashboard"}
            onClick={() => handleItemClick("dashboard", "main")}
            to="/dashboard"
            onClose={onClose}
          />

          {/* Servicios & Entrenadores - Grupo desplegable */}
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
              <NavItem
                icon={<Dumbbell className="h-5 w-5" aria-hidden="true" />}
                label="Servicios"
                active={activeItem === "services.list"}
                onClick={() => handleItemClick("services.list", "services")}
                indent
                to="/services/list"
                onClose={onClose}
              />
              <NavItem
                icon={<UserCog className="h-5 w-5" aria-hidden="true" />}
                label="Entrenadores"
                active={activeItem === "trainers.list"}
                onClick={() => handleItemClick("trainers.list", "services")}
                indent
                to="/services/trainers"
                onClose={onClose}
              />
              <NavItem
                id="trainers.schedule"
                icon={<CalendarClock className="h-5 w-5" aria-hidden="true" />}
                label="Prog. Entrenadores"
                active={activeItem === "trainers.schedule"}
                onClick={() => handleItemClick("trainers.schedule", "services")}
                indent
                to="/services/trainers-schedule"
                onClose={onClose}
              />
              <NavItem
                icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
                label="Servicios Personalizados"
                active={activeItem === "custom.services"}
                onClick={() => {
                  handleItemClick("custom.services", "services")
                  // Disparar un evento personalizado para cambiar la vista
                  const event = new CustomEvent("viewChange", { detail: "services" })
                  window.dispatchEvent(event)
                }}
                indent
                to="/services/custom"
                onClose={onClose}
              />
            </ul>
          </li>

          {/* Clientes & Membresías - Grupo desplegable */}
          <li>
            <button
              type="button"
              onClick={() => toggleGroup("clients")}
              className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              aria-controls="dropdown-clients"
              aria-expanded={activeGroup === "clients"}
            >
              <Users className="h-5 w-5" aria-hidden="true" />
              <span className="ml-3 flex-1 whitespace-nowrap">Clientes & Membresías</span>
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
                label="Clientes"
                active={activeItem === "clients.list"}
                onClick={() => handleItemClick("clients.list", "clients")}
                indent
                to="/clients"
                onClose={onClose}
              />
              <NavItem
                icon={<FileText className="h-5 w-5" aria-hidden="true" />}
                label="Contratos"
                active={activeItem === "contracts.list"}
                onClick={() => handleItemClick("contracts.list", "clients")}
                indent
                to="/contracts"
                onClose={onClose}
              />
            </ul>
          </li>

          <NavItem
            icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
            label="Asistencias"
            active={activeItem === "attendance.list"}
            onClick={() => handleItemClick("attendance.list", "attendance")}
            onClose={onClose}
          />

          <li>
            <button
              type="button"
              onClick={() => toggleGroup("feedback")}
              className="flex items-center p-2 w-full text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              aria-controls="dropdown-feedback"
              aria-expanded={activeGroup === "feedback"}
            >
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
              <span className="ml-3 flex-1 whitespace-nowrap">Retroalimentación</span>
              {activeGroup === "feedback" ? (
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
            <ul
              id="dropdown-feedback"
              className={cn("py-2 space-y-2", activeGroup !== "feedback" && "hidden")}
              aria-hidden={activeGroup !== "feedback"}
            >
              <NavItem
                icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
                label="Encuestas"
                active={activeItem === "surveys.list"}
                onClick={() => handleItemClick("surveys.list", "feedback")}
                indent
                onClose={onClose}
              />
            </ul>
          </li>

          <NavItem
            icon={<Settings className="h-5 w-5" aria-hidden="true" />}
            label="Configuración"
            active={activeItem === "settings"}
            onClick={() => handleItemClick("settings", "settings")}
            onClose={onClose}
          />
        </ul>

        {/* Botón de cerrar sesión al final */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <NavItem
            icon={<LogOut className="h-5 w-5" aria-hidden="true" />}
            label="Cerrar Sesión"
            active={activeItem === "logout"}
            onClick={() => handleItemClick("logout", "logout")}
            onClose={onClose}
          />
        </div>
      </div>
    </aside>
  )
}

