import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/shared/contexts/authContext";
import { GymProvider } from "@/shared/contexts/gymContext";
import { GymSettingsProvider } from "@/shared/contexts/gymSettingsContext";
import AppRoutes from "./shared/routes/appRoutes";
import { Toaster } from "@/shared/components/ui/toaster";
import { PermissionsProvider } from "./shared/contexts/permissionsContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GymSettingsProvider>
          <GymProvider>
            <PermissionsProvider 
            enablePolling={true}
            pollingInterval={60000} // 1 minuto
            enableDebugLogs={process.env.NODE_ENV === 'development'}
          >
            <div className="min-h-screen bg-gray-50">
              <AppRoutes />
              <Toaster />
            </div>
            </PermissionsProvider>
          </GymProvider>
        </GymSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;