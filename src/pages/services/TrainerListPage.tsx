"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export function TrainerListPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Listado de Entrenadores</h1>
        <p className="text-gray-500">
          Esta es la página de listado de entrenadores. Aquí se mostrarán todos los entrenadores disponibles en el
          gimnasio.
        </p>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Esta sección está en desarrollo. Pronto podrás ver y gestionar todos los entrenadores del gimnasio.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  )
}

