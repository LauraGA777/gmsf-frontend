"use client"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { useMobile } from "@/hooks/useMediaQuery"

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = useMobile()

  // Cerrar sidebar automáticamente en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }, [window.location.pathname, isMobile])

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Overlay para cerrar sidebar en móvil */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout

