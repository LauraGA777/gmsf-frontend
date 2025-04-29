import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { privateRoutes } from "./privateRoutes";
import { useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Ruta de redirección según el rol del usuario
  const getRedirectPath = () => {
    if (!user) return "/login";
    return user.role === "client" ? "/clients" : "/dashboard";
  };

  // Configura la ruta principal con redirección
  const indexRoute = {
    path: "/",
    element: isLoading ? (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    ) : (
      <Navigate to={getRedirectPath()} replace />
    )
  };

  // Configura la wrapper para rutas privadas
  const privateRoutesWrapper = {
    path: "/",
    element: isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />,
    children: [
      ...privateRoutes,
      // Ruta comodín para cualquier otra ruta no encontrada dentro del layout
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  };

  // Combina todas las rutas
  const routes = [
    indexRoute,
    privateRoutesWrapper,
    ...publicRoutes,
    // Ruta comodín global para cualquier otra ruta no encontrada (fuera del layout privado)
    {
      path: "*",
      element: <NotFoundPage />
    }
  ];

  return useRoutes(routes);
}