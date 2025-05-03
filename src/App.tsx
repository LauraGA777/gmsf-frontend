import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import { GlobalClientsProvider } from "@/context/ClientsContext"
import AppRoutes from "@/routes/AppRoutes"

/**
 * Componente principal de la aplicación
 * Configura los proveedores de contexto y el enrutador
 */
export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <GlobalClientsProvider>
          <AppRoutes />
        </GlobalClientsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
