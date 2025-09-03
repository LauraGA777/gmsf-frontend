import { useState, useEffect, useMemo } from "react"
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
  Globe,
  CreditCard,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/formatCop"
import { useAuth } from "@/shared/contexts/authContext"
import { usePermissionsContext } from '@/shared/contexts/permissionsContext'
import { PERMISSIONS } from "@/shared/services/permissionService"

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
    "flex items-center w-full py-2.5 px-3 mx-1 text-sm font-medium transition-all duration-200 cursor-pointer rounded-lg",
    active
      ? "text-gray-900 bg-gray-100"
      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-white dark:hover:bg-gray-700",
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
      <span className="flex-shrink-0 text-gray-500 dark:text-gray-400 mr-3">{icon}</span>
      <span className="flex-1 whitespace-nowrap">{label}</span>
      {hasSubmenu && (
        <span className="flex-shrink-0 text-gray-400 ml-auto">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <li id={id}>
        <Link to={to} className={baseClassName} onClick={handleClick}>
          {content}
        </Link>
      </li>
    )
  }

  return (
    <li id={id}>
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
  const { logout, user, client } = useAuth()
  
  // ✅ Usar el nuevo contexto de permisos
  const {
    hasModuleAccess,
    isLoading,
    isReady,
    lastError,
    accessibleModules,
    permissionsVersion, // Para forzar re-renders
    refreshPermissions
  } = usePermissionsContext()

  // ✅ Determinar si debe renderizar el sidebar
  const shouldRender = useMemo(() => {
    return !!user && Number(user.id) > 0
  }, [user])

  // ✅ Determinar tipo de usuario
  const isClientOrBeneficiary = useMemo(() => {
    return user?.id_rol === 3 || user?.id_rol === 4
  }, [user?.id_rol])

  // ✅ Verificar acceso a grupos específicos (reactivo)
  const hasVentasAccess = useMemo(() => {
    return hasModuleAccess(PERMISSIONS.CONTRATOS) || hasModuleAccess(PERMISSIONS.CLIENTES)
  }, [hasModuleAccess, permissionsVersion])

  const hasMembresíasAccess = useMemo(() => {
    return hasModuleAccess(PERMISSIONS.MEMBRESIAS) || hasModuleAccess(PERMISSIONS.ASISTENCIAS)
  }, [hasModuleAccess, permissionsVersion])

  // ✅ Efectos para manejar rutas activas
  useEffect(() => {
    const path = location.pathname

    // Determinar el ítem activo basado en la ruta actual
    if (path.includes("/dashboard")) {
      setActiveItem("dashboard")
      setActiveGroup(null)
    } /* else if (path.includes("/roles")) {
      setActiveItem("roles")
      setActiveGroup(null) 
    }*/ else if (path.includes("/landing-settings")) {
      setActiveItem("landing-settings")
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
    } else if (path.includes("/my-contract")) {
      setActiveItem("my-contract")
      setActiveGroup(null)
    } else if (path.includes("/my-attendance")) {
      setActiveItem("my-attendance")
      setActiveGroup(null)
    } else if (path.includes("/my-membership")) {
      setActiveItem("my-membership")
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

  // ✅ Clases para el sidebar basadas en el estado isOpen
  const sidebarClasses = cn(
    "fixed md:sticky top-0 left-0 z-30",
    "h-screen",
    "w-[280px] md:w-64",
    "transform transition-transform duration-300 ease-in-out",
    "flex flex-col shadow-md",
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
  )

  // ✅ Componente de loading para permisos
  const LoadingPermissions = () => (
    <div className="text-center text-gray-500 py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-sm">Cargando permisos...</p>
      {lastError && (
        <div className="mt-2">
          <p className="text-xs text-red-600">{lastError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshPermissions}
            className="mt-1 text-xs"
          >
            Reintentar
          </Button>
        </div>
      )}
    </div>
  )

  // ✅ No renderizar si no hay usuario
  if (!shouldRender) {
    return null
  }

  // ✅ Mostrar loading mientras se cargan permisos (solo para no-administradores)
  if (isLoading && user?.id_rol !== 1) {
    return (
      <aside className={sidebarClasses} aria-label="Sidebar">
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
          <div className="h-16 px-4 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex items-center">
            <div className="flex gap-3 items-center w-full">
              <img src="/favicon.ico" alt="Logo GMSF" className="h-10 w-10" />
              <Link to="/dashboard" className="text-2xl font-bold text-black-800 font-gmsf">
                GMSF
              </Link>
              <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <LoadingPermissions />
          </nav>
        </div>
      </aside>
    )
  }

  // ✅ Para administradores, mostrar sidebar incluso durante la carga
  if (isLoading && user?.id_rol === 1) {
  }

  // ✅ Si no está listo y no es admin, no mostrar
  if (!isReady && user?.id_rol !== 1) {
    return null
  }

  return (
    <aside className={sidebarClasses} aria-label="Sidebar">
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
        {/* ✅ Encabezado del Sidebar */}
        <div className="h-16 px-4 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 flex items-center">
          <div className="flex gap-3 items-center w-full">
            <Link
              to="/dashboard" 
              className="flex items-center gap-3 text-2xl font-bold text-black-800 font-gmsf font-normal not-italic hover:text-black-800 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                handleItemClick("dashboard")
                if (window.innerWidth < 768) onClose()
              }}
              aria-label="Ir al Dashboard"
            >
              <img src="/favicon.ico" alt="Logo GMSF" className="h-10 w-10" />
              <span>GMSF</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="md:hidden h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 ml-auto" 
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ✅ Área de navegación con scroll */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {/* ✅ VISTA SIMPLIFICADA PARA CLIENTES Y BENEFICIARIOS */}
            {isClientOrBeneficiary ? (
              <>
                {/* Mi Agenda */}
                {hasModuleAccess(PERMISSIONS.HORARIOS) && (
                  <NavItem
                    icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
                    label="Mi Agenda"
                    active={activeItem === "calendar"}
                    onClick={() => {
                      handleItemClick("calendar")
                      if (window.innerWidth < 768) onClose()
                    }}
                    to="/calendar"
                    onClose={onClose}
                    id="nav-calendar"
                  />
                )}

                {/* Mi Contrato */}
                {hasModuleAccess(PERMISSIONS.CONTRATOS) && (
                  <NavItem
                    icon={<FileSignature className="h-5 w-5" aria-hidden="true" />}
                    label="Mi Contrato"
                    active={activeItem === "my-contract"}
                    onClick={() => handleItemClick("my-contract")}
                    to="/my-contract"
                    onClose={onClose}
                    id="nav-my-contract"
                  />
                )}

                {/* Mi Membresía */}
                {hasModuleAccess(PERMISSIONS.MEMBRESIAS) && (
                  <NavItem
                    icon={<CreditCard className="h-5 w-5" aria-hidden="true" />}
                    label="Mi Membresía"
                    active={activeItem === "my-membership"}
                    onClick={() => handleItemClick("my-membership")}
                    to="/my-membership"
                    onClose={onClose}
                    id="nav-my-membership"
                  />
                )}

                {/* Mis Asistencias */}
                {hasModuleAccess(PERMISSIONS.ASISTENCIAS) && user?.id && (
                  <NavItem
                    icon={<BarChart4 className="h-5 w-5" aria-hidden="true" />}
                    label="Mis Asistencias"
                    active={activeItem === "my-attendance"}
                    onClick={() => {
                      handleItemClick("my-attendances");
                    }}
                    to={`/my-attendances/${user.id}`}
                    onClose={onClose}
                    id="nav-my-attendances"
                  />
                )}
              </>
            ) : (
              <>
                {/* ✅ VISTA COMPLETA PARA ADMINISTRADORES Y ENTRENADORES */}
                
                {/* Panel de control - Solo si tiene acceso al sistema */}
                {(hasModuleAccess(PERMISSIONS.SISTEMA) || user?.id_rol === 1) && (
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

                {/* Gestión de roles - Solo si tiene acceso al sistema 
                {(hasModuleAccess(PERMISSIONS.SISTEMA) || user?.id_rol === 1) && (
                  <NavItem
                    icon={<BadgeCheck className="h-5 w-5" aria-hidden="true" />}
                    label="Roles"
                    active={activeItem === "roles"}
                    onClick={() => handleItemClick("roles")}
                    to="/roles"
                    onClose={onClose}
                    id="nav-roles"
                  />
                )}*/}

                {/* Configuración de Landing Page - Solo para administradores */}
                {user?.id_rol === 1 && (
                  <NavItem
                    icon={<Globe className="h-5 w-5" aria-hidden="true" />}
                    label="Página de Inicio"
                    active={activeItem === "landing-settings"}
                    onClick={() => handleItemClick("landing-settings")}
                    to="/landing-settings"
                    onClose={onClose}
                    id="nav-landing-settings"
                  />
                )}

                {/* Gestión de usuarios - Solo si tiene acceso */}
                {hasModuleAccess(PERMISSIONS.USUARIOS) && (
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

                {/* Gestión de entrenadores - Solo si tiene acceso */}
                {hasModuleAccess(PERMISSIONS.ENTRENADORES) && (
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

                {/* Agenda - Solo si tiene acceso a horarios */}
                {hasModuleAccess(PERMISSIONS.HORARIOS) && (
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
                )}

                {/* ✅ GRUPO VENTAS - Solo mostrar si tiene acceso a al menos un submódulo */}
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
                      <ul className="py-2 mx-3 space-y-1">
                        {/* Contratos - Solo si tiene acceso */}
                        {hasModuleAccess(PERMISSIONS.CONTRATOS) && (
                          <li>
                            <Link
                              to="/contracts"
                              className={cn(
                                "flex items-center w-full py-2 px-3 ml-3 text-sm font-medium transition-all duration-200 cursor-pointer rounded-lg border-l-2",
                                activeItem === "contracts.list"
                                  ? "text-gray-900 bg-gray-50 border-gray-300"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent dark:text-gray-300 dark:hover:bg-gray-700",
                              )}
                              onClick={() => {
                                handleItemClick("contracts.list", "clients")
                                if (window.innerWidth < 768) onClose()
                              }}
                            >
                              <span className="flex-shrink-0 text-gray-500 mr-3">
                                <FileSignature className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <span className="flex-1 whitespace-nowrap">Contratos</span>
                            </Link>
                          </li>
                        )}

                        {/* Clientes - Solo si tiene acceso */}
                        {hasModuleAccess(PERMISSIONS.CLIENTES) && (
                          <li>
                            <Link
                              to="/clients"
                              className={cn(
                                "flex items-center w-full py-2 px-3 ml-3 text-sm font-medium transition-all duration-200 cursor-pointer rounded-lg border-l-2",
                                activeItem === "clients.list"
                                  ? "text-gray-900 bg-gray-50 border-gray-300"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent dark:text-gray-300 dark:hover:bg-gray-700",
                              )}
                              onClick={() => {
                                handleItemClick("clients.list", "clients")
                                if (window.innerWidth < 768) onClose()
                              }}
                            >
                              <span className="flex-shrink-0 text-gray-500 mr-3">
                                <User className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <span className="flex-1 whitespace-nowrap">Clientes</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </>
                )}

                {/* ✅ GRUPO MEMBRESÍAS - Solo mostrar si tiene acceso a al menos un submódulo */}
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
                      <ul className="py-2 mx-3 space-y-1">
                        {/* Membresías - Solo mostrar si tiene acceso */}
                        {hasModuleAccess(PERMISSIONS.MEMBRESIAS) && (
                          <li>
                            <Link
                              to="/memberships"
                              className={cn(
                                "flex items-center w-full py-2 px-3 ml-3 text-sm font-medium transition-all duration-200 cursor-pointer rounded-lg border-l-2",
                                activeItem === "memberships.list"
                                  ? "text-gray-900 bg-gray-50 border-gray-300"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent dark:text-gray-300 dark:hover:bg-gray-700",
                              )}
                              onClick={() => {
                                handleItemClick("memberships.list", "memberships")
                                if (window.innerWidth < 768) onClose()
                              }}
                            >
                              <span className="flex-shrink-0 text-gray-500 mr-3">
                                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <span className="flex-1 whitespace-nowrap">Membresías</span>
                            </Link>
                          </li>
                        )}

                        {/* Asistencia - Solo mostrar si tiene acceso */}
                        {hasModuleAccess(PERMISSIONS.ASISTENCIAS) && (
                          <li>
                            <Link
                              to="/attendance"
                              className={cn(
                                "flex items-center w-full py-2 px-3 ml-3 text-sm font-medium transition-all duration-200 cursor-pointer rounded-lg border-l-2",
                                activeItem === "attendance.list"
                                  ? "text-gray-900 bg-gray-50 border-gray-300"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent dark:text-gray-300 dark:hover:bg-gray-700",
                              )}
                              onClick={() => {
                                handleItemClick("attendance.list", "memberships")
                                if (window.innerWidth < 768) onClose()
                              }}
                            >
                              <span className="flex-shrink-0 text-gray-500 mr-3">
                                <BarChart4 className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <span className="flex-1 whitespace-nowrap">Asistencia</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    )}
                  </>
                )}
              </>
            )}

            {/* ✅ Separador visual */}
            <li className="mx-3 my-3">
              <hr className="border-gray-200 dark:border-gray-600" />
            </li>

            {/* ✅ Cerrar Sesión - Siempre visible */}
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
