"use client"

import { useState, useEffect } from "react"
import { Outlet, useLocation, Navigate } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { useAuth } from "@/context/AuthContext"
import { useMobile } from "@/hooks/useMediaQuery"

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isMobile = useMobile()
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()
  const [currentSection, setCurrentSection] = useState("")

  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false)
    }
    
    const path = location.pathname
    if (path.includes("/dashboard")) setCurrentSection("Dashboard")
    else if (path.includes("/services")) setCurrentSection("Servicios & Entrenadores")
    else if (path.includes("/clients")) setCurrentSection("Clientes & Membresías")
    else if (path.includes("/contracts")) setCurrentSection("Contratos")
  }, [location.pathname, isMobile, isSidebarOpen])

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isSidebarOpen])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
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

      {!isMobile && <Sidebar isOpen={true} onClose={() => {}} />}

      <div className="flex-1 min-h-screen flex flex-col">
        <Header toggleSidebar={toggleSidebar} currentSection={currentSection} />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

