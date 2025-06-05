import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./shared/contexts/themeContext";
import AppRoutes from "./shared/routes/appRoutes";
import { GlobalClientsProvider } from "@/shared/contexts/clientsContext"
import { AuthProvider } from "./shared/contexts/authContext";

function App() {

  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <AuthProvider>
          <GlobalClientsProvider>
            <AppRoutes />
          </GlobalClientsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App