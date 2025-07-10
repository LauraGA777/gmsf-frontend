import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/shared/contexts/authContext";
import { GymProvider } from "@/shared/contexts/gymContext";
import { GymSettingsProvider } from "@/shared/contexts/gymSettingsContext";
import AppRoutes from "./shared/routes/appRoutes";
import { Toaster } from "@/shared/components/ui/toaster";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GymSettingsProvider>
          <GymProvider>
            <div className="min-h-screen bg-gray-50">
              <AppRoutes />
              <Toaster />
            </div>
          </GymProvider>
        </GymSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;