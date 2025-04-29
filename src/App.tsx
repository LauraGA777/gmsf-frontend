"use client"

import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import AppRoutes from "@/routes/AppRoutes"

/**
 * Componente principal de la aplicación
 * Configura los proveedores de contexto y el enrutador
 */
export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}
