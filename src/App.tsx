"use client"

import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { router } from "@/routes/router"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"

/**
 * Componente principal de la aplicación
 * Configura los proveedores de contexto y el enrutador
 */
export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
