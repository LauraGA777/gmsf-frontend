"use client"

import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { useMobile } from "@/hooks/useMediaQuery"

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = useMobile()
  const location = useLocation()
  const [currentSection, setCurrentSection] = useState("")

  // Cerrar sidebar automáticamente en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
    // Actualizar la sección actual basada en la ruta
    const path = location.pathname
    if (path.includes("/dashboard")) setCurrentSection("Dashboard")
    else if (path.includes("/services")) setCurrentSection("Servicios & Entrenadores")
    else if (path.includes("/clients")) setCurrentSection("Clientes & Membresías")
    else if (path.includes("/contracts")) setCurrentSection("Contratos")
  }, [location.pathname, isMobile, isSidebarOpen])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:block">
          <Sidebar isOpen={true} onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Sidebar móvil */}
        {isMobile && (
          <>
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
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
        <div className="flex-1 min-h-screen flex flex-col">
          <Header toggleSidebar={toggleSidebar} currentSection={currentSection} />
          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout

