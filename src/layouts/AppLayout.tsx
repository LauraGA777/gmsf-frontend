"use client"

import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
          {/* Overlay para dispositivos móviles cuando el sidebar está abierto */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar - visible en desktop, controlado por estado en móvil */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Contenido principal */}
          <div className="flex-1 flex flex-col min-h-screen">
            <Header toggleSidebar={toggleSidebar} />
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

