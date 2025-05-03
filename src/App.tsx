import { AuthProvider } from "@/shared/contexts/AuthContext"
import { ThemeProvider } from "@/shared/contexts/ThemeContext"
import { GlobalClientsProvider } from "@/shared/contexts/ClientsContext"
import AppRoutes from "@/shared/routes/AppRoutes"

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
