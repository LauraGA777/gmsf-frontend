import { useState, useEffect } from "react"
import { Outlet, useLocation, Navigate } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useMobile } from "../hooks/useMediaQuery"
import { useAuth } from "../contexts/authContext"

export function AppLayout() {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isMobile = useMobile()
  const location = useLocation()
  const [currentSection, setCurrentSection] = useState("")
  const [isPageLoading, setIsPageLoading] = useState(false)

  // ✅ VERIFICACIÓN ADICIONAL DE SEGURIDAD: Redirigir si no está autenticado
  if (!isLoading && isInitialized && !isAuthenticated) {
    console.warn("⚠️ AppLayout: Usuario no autenticado, redirigiendo a login")
    return <Navigate to="/login" replace />
  }

  // ✅ VERIFICACIÓN ADICIONAL DE SEGURIDAD: Verificar datos del usuario
  if (!isLoading && isInitialized && isAuthenticated && !user) {
    console.error("❌ AppLayout: Usuario autenticado pero sin datos, redirigiendo a login")
    return <Navigate to="/login" replace />
  }

  // Loading state mientras se inicializa la autenticación
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Cargando aplicación...</p>
          <p className="text-sm text-gray-500">Por favor, espere un momento.</p>
        </div>
      </div>
    )
  }

  // Simulación de carga al cambiar de ruta
  useEffect(() => {
    if (location.pathname) {
      setIsPageLoading(true)
      // Simular carga por 300ms para una mejor experiencia
      const timer = setTimeout(() => {
        setIsPageLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  // Cerrar sidebar automáticamente en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
    
    // Actualizar la sección actual basada en la ruta
    const path = location.pathname
    if (path.includes("/dashboard")) setCurrentSection("Panel de Control")
    else if (path.includes("/roles")) setCurrentSection("Roles")
    else if (path.includes("/users")) setCurrentSection("Usuarios")
    else if (path.includes("/trainers")) setCurrentSection("Entrenadores")
    else if (path.includes("/services")) setCurrentSection("Servicios")
    else if (path.includes("/calendar")) setCurrentSection(user?.id_rol === 3 ? "Mi Agenda" : "Agenda")
    else if (path.includes("/clients")) setCurrentSection("Clientes")
    else if (path.includes("/contracts")) setCurrentSection("Contratos")
    else if (path.includes("/memberships")) setCurrentSection("Membresías")
    else if (path.includes("/attendance")) setCurrentSection("Control de Asistencia")
    else if (path.includes("/surveys")) setCurrentSection("Encuestas de Satisfacción")
  }, [location.pathname, isMobile, isSidebarOpen, user])

  // Manejar escape key para cerrar sidebar
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => {
      window.removeEventListener("keydown", handleEscKey)
    }
  }, [isSidebarOpen])

  // Prevenir scroll cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = isSidebarOpen ? "hidden" : "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isSidebarOpen, isMobile])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Obtener año actual para el footer
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar para escritorio con animación suave */}
        <div className="hidden md:block transition-all duration-300 ease-in-out">
          <Sidebar isOpen={true} onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Overlay y Sidebar para móvil */}
        {isMobile && (
          <>
            <div
              className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
            <div
              className={`fixed top-0 left-0 z-50 h-full transition-transform duration-300 ease-in-out transform ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col">
          <Header toggleSidebar={toggleSidebar} currentSection={currentSection} />
          
          {/* Indicador de carga */}
          {isPageLoading && (
            <div className="h-0.5 bg-indigo-100 w-full relative overflow-hidden">
              <div className="absolute h-0.5 bg-indigo-600 animate-loading-bar"></div>
            </div>
          )}
          
          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto w-full transition-all duration-300 ease-in-out">
              <Outlet />
            </div>
          </main>
          
          {/* Footer */}
          <footer className="py-4 px-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <div className="max-w-7xl mx-auto">
              <p>© {currentYear} Gym Management System. Todos los derechos reservados.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
