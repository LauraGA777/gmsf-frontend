"use client"

import { useState, useEffect } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "@/routes/router"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import Swal from "sweetalert2"
import { ClientsTable } from "./components/clients/ClientsTable"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { UserMenu } from "./components/layout/UserMenu"
import { ContractsPage } from "./pages/contracts/ContractsPage"
import { Sidebar } from "./components/layout/Sidebar"
import type { Client, Training, SearchFilters } from "./types"
import { format, differenceInDays } from "date-fns"
import { EnhancedCalendarView } from "./components/calendar/EnhancedCalendarView"
import { CompactSearchBar } from "./components/search/CompactSearchBar"

function AppContent() {
  // Estado para controlar la vista actual
  const [currentView, setCurrentView] = useState<string>("dashboard")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([])
  const { user } = useAuth()

  // Datos de ejemplo
  const [clients, setClients] = useState<Client[]>([
    {
      id: "0001",
      name: "Juan Pérez",
      email: "juan@example.com",
      membershipType: "Premium",
      status: "Activo",
      membershipEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días desde hoy
    },
    {
      id: "0002",
      name: "María González",
      email: "maria@example.com",
      membershipType: "Estándar",
      status: "Activo",
      membershipEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días desde hoy
    },
    {
      id: "0003",
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      membershipType: "Básico",
      status: "Inactivo",
      membershipEndDate: null,
    },
    {
      id: "0004",
      name: "Ana Martínez",
      email: "ana@example.com",
      membershipType: "Premium",
      status: "Activo",
      membershipEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 días desde hoy
    },
    {
      id: "0005",
      name: "Luis Sánchez",
      email: "luis@example.com",
      membershipType: "Estándar",
      status: "Inactivo",
      membershipEndDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expirada hace 10 días
    },
  ])

  // Datos de ejemplo para entrenamientos
  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: 1,
      client: "Juan Pérez",
      clientId: "0001",
      trainer: "Carlos Ruiz",
      trainerId: "t1",
      service: "Entrenamiento personal",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días desde hoy
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 10:00 AM
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // 11:00 AM
      maxCapacity: 5,
      occupiedSpots: 3,
      status: "Activo",
    },
    {
      id: 2,
      client: "María González",
      clientId: "0002",
      trainer: "Ana Gómez",
      trainerId: "t2",
      service: "Yoga",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días desde hoy
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4:00 PM
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000), // 5:00 PM
      maxCapacity: 10,
      occupiedSpots: 7,
      status: "Activo",
    },
    {
      id: 3,
      client: "Carlos Rodríguez",
      clientId: "0003",
      trainer: "Miguel Sánchez",
      trainerId: "t3",
      service: "Crossfit",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día desde hoy
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 6:00 PM
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // 7:00 PM
      maxCapacity: 8,
      occupiedSpots: 8,
      status: "Activo",
    },
    {
      id: 4,
      client: "Ana Martínez",
      clientId: "0004",
      trainer: "Laura Martínez",
      trainerId: "t4",
      service: "Pilates",
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 días desde hoy
      startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), // 9:00 AM
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 10:00 AM
      maxCapacity: 6,
      occupiedSpots: 2,
      status: "Activo",
    },
    {
      id: 5,
      client: "Luis Sánchez",
      clientId: "0005",
      trainer: "Carlos Ruiz",
      trainerId: "t1",
      service: "Entrenamiento personal",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días desde hoy
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // 3:00 PM
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 4:00 PM
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Activo",
    },
  ])

  // Filtrar entrenamientos según el rol del usuario
  useEffect(() => {
    if (!user) {
      setFilteredTrainings([])
      return
    }

    let filtered = [...trainings]

    // Si es cliente, solo mostrar sus entrenamientos
    if (user.role === "client" && user.clientId) {
      filtered = filtered.filter((training) => training.clientId === user.clientId)
    }

    // Si es entrenador, mostrar solo los entrenamientos que imparte
    else if (user.role === "trainer" && user.trainerId) {
      filtered = filtered.filter((training) => training.trainerId === user.trainerId)
    }

    // Si es admin, mostrar todos los entrenamientos (no filtrar)

    setFilteredTrainings(filtered)
  }, [user, trainings])

  // Trainers y servicios para el buscador
  const trainers: string[] = ["Carlos Ruiz", "Ana Gómez", "Miguel Sánchez", "Laura Martínez"]
  const services: string[] = ["Entrenamiento personal", "Yoga", "Pilates", "Crossfit", "Funcional"]

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
  }

  const handleAddClient = (newClient: Omit<Client, "id">) => {
    // Generar un nuevo ID (en producción, esto vendría del backend)
    const newId = (Number(clients[clients.length - 1]?.id || "0") + 1).toString().padStart(4, "0")

    const clientToAdd = {
      ...newClient,
      id: newId,
    }

    setClients([...clients, clientToAdd])
  }

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
  }

  const handleDeleteTraining = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas eliminar este entrenamiento?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setTrainings(trainings.filter((training) => training.id !== id))
        setFilteredTrainings(filteredTrainings.filter((training) => training.id !== id))

        Swal.fire({
          title: "Eliminado",
          text: "El entrenamiento ha sido eliminado.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  const handleEditTraining = (id: number, updatedTraining: Partial<Training>) => {
    const updatedTrainings = trainings.map((training) =>
      training.id === id ? { ...training, ...updatedTraining } : training,
    )

    setTrainings(updatedTrainings)

    // Actualizar también los entrenamientos filtrados
    setFilteredTrainings(
      filteredTrainings.map((training) => (training.id === id ? { ...training, ...updatedTraining } : training)),
    )

    Swal.fire({
      title: "¡Actualizado!",
      text: "El entrenamiento ha sido actualizado correctamente.",
      icon: "success",
      confirmButtonColor: "#000",
      timer: 5000,
      timerProgressBar: true,
    })
  }

  const handleAddTraining = (newTraining: Omit<Training, "id">) => {
    const id = Math.max(0, ...trainings.map((t) => t.id)) + 1

    // Añadir clientId y trainerId según corresponda
    const trainingToAdd: Training = {
      ...newTraining,
      id,
      clientId: user?.role === "client" ? user.clientId : undefined,
      trainerId: user?.role === "trainer" ? user.trainerId : undefined,
    }

    setTrainings([...trainings, trainingToAdd])

    // Añadir a los entrenamientos filtrados si cumple con los filtros actuales
    if (
      user?.role === "admin" ||
      (user?.role === "trainer" && trainingToAdd.trainerId === user.trainerId) ||
      (user?.role === "client" && trainingToAdd.clientId === user.clientId)
    ) {
      setFilteredTrainings([...filteredTrainings, trainingToAdd])
    }

    Swal.fire({
      title: "¡Entrenamiento agendado!",
      text: `Se ha programado un entrenamiento de ${newTraining.service} con ${newTraining.trainer} para ${newTraining.client} de ${format(new Date(newTraining.startTime || newTraining.date), "HH:mm")} a ${format(new Date(newTraining.endTime || new Date(newTraining.date.getTime() + 60 * 60 * 1000)), "HH:mm")}.`,
      icon: "success",
      confirmButtonColor: "#000",
      timer: 5000,
      timerProgressBar: true,
    })
  }

  const handleSearch = (filters: SearchFilters) => {
    // Implementar la lógica de búsqueda real
    let filtered = [...trainings]

    // Aplicar filtros según el rol del usuario
    if (user?.role === "client" && user.clientId) {
      filtered = filtered.filter((training) => training.clientId === user.clientId)
    } else if (user?.role === "trainer" && user.trainerId) {
      filtered = filtered.filter((training) => training.trainerId === user.trainerId)
    }

    // Filtrar por cliente
    if (filters.client) {
      filtered = filtered.filter((training) => training.client.toLowerCase().includes(filters.client.toLowerCase()))
    }

    // Filtrar por entrenador
    if (filters.trainer && filters.trainer !== "all") {
      filtered = filtered.filter((training) => training.trainer === filters.trainer)
    }

    // Filtrar por servicio
    if (filters.service && filters.service !== "all") {
      filtered = filtered.filter((training) => training.service === filters.service)
    }

    // Filtrar por rango de fechas
    if (filters.dateRange.from && filters.dateRange.to) {
      const fromDate = new Date(filters.dateRange.from)
      const toDate = new Date(filters.dateRange.to)

      // Establecer las horas a 0 para comparar solo fechas
      fromDate.setHours(0, 0, 0, 0)
      toDate.setHours(23, 59, 59, 999)

      filtered = filtered.filter((training) => {
        const trainingDate = new Date(training.date)
        return trainingDate >= fromDate && trainingDate <= toDate
      })
    }

    setFilteredTrainings(filtered)

    // Mostrar mensaje de resultados
    Swal.fire({
      title: "Búsqueda realizada",
      text: `Se encontraron ${filtered.length} entrenamientos que coinciden con los criterios.`,
      icon: "info",
      confirmButtonColor: "#000",
      timer: 5000,
      timerProgressBar: true,
    })
  }

  // Determinar si el usuario puede ver el buscador
  const canViewSearchBar = user?.role === "admin" || user?.role === "trainer"

  // Determinar si el usuario puede agregar entrenamientos
  const canAddTrainings = user?.role === "admin" || user?.role === "trainer"

  // Manejar la navegación desde el sidebar
  useEffect(() => {
    const handleViewChange = (e: CustomEvent) => {
      const view = e.detail
      setCurrentView(view)

      // Si estamos usando react-router, podemos navegar programáticamente
      if (view === "custom.services") {
        window.location.href = "/services"
      }
    }

    window.addEventListener("viewChange" as any, handleViewChange as any)

    return () => {
      window.removeEventListener("viewChange" as any, handleViewChange as any)
    }
  }, [])

  // Renderizar el contenido según la vista actual
  const [selectedDateTrainings, setSelectedDateTrainings] = useState<Training[]>([])
  const [selectedViewDate, setSelectedViewDate] = useState<Date>(new Date())
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const renderContent = () => {
    switch (currentView) {
      case "clients":
        return (
          <ProtectedRoute allowedRoles={["admin"]}>
            <ClientsTable clients={clients} onUpdateClient={handleUpdateClient} onAddClient={handleAddClient} />
          </ProtectedRoute>
        )
      case "contracts":
        return (
          <ProtectedRoute allowedRoles={["admin", "client"]}>
            <ContractsPage />
          </ProtectedRoute>
        )
      case "dashboard":
        return (
          <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Resumen</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Clientes activos:</span>
                    <span className="font-medium">{clients.filter((c) => c.status === "Activo").length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Entrenamientos programados:</span>
                    <span className="font-medium">{trainings.filter((t) => t.status === "Activo").length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Próximos vencimientos:</span>
                    <span className="font-medium">
                      {
                        clients.filter(
                          (c) =>
                            c.status === "Activo" &&
                            c.membershipEndDate &&
                            differenceInDays(c.membershipEndDate, new Date()) <= 7,
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Próximos entrenamientos</h2>
                {filteredTrainings.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTrainings.slice(0, 3).map((training) => (
                      <div key={training.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{training.service}</p>
                            <p className="text-sm text-gray-600">Cliente: {training.client}</p>
                            <p className="text-sm text-gray-600">Entrenador: {training.trainer}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{format(new Date(training.date), "dd/MM/yyyy")}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(training.startTime || training.date), "HH:mm")} -
                              {training.endTime ? format(new Date(training.endTime), "HH:mm") : "No especificado"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay entrenamientos programados.</p>
                )}
              </div>
            </div>
          </ProtectedRoute>
        )
      case "services":
        return (
          <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendario mejorado con más espacio */}
              <div className="lg:col-span-3">
                <EnhancedCalendarView
                  trainings={filteredTrainings}
                  onSelectDate={handleSelectDate}
                  onDeleteTraining={handleDeleteTraining}
                  onEditTraining={handleEditTraining}
                  onAddTraining={handleAddTraining}
                />
              </div>

              <div className="space-y-6">
                {/* Solo mostrar buscador a admin y entrenadores */}
                {canViewSearchBar && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <CompactSearchBar
                      onSearch={handleSearch}
                      trainers={trainers}
                      services={services}
                      trainings={trainings}
                    />
                  </div>
                )}

                {/* Para clientes, mostrar información de sus próximos entrenamientos */}
                {user?.role === "client" && (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Mis Próximos Entrenamientos</h2>
                    {filteredTrainings.length > 0 ? (
                      <div className="space-y-4">
                        {filteredTrainings.map((training) => (
                          <div
                            key={training.id}
                            className="p-4 border rounded-lg hover:border-gray-300 transition-colors"
                          >
                            <h3 className="font-semibold">{training.service}</h3>
                            <p className="text-sm text-gray-600">Entrenador: {training.trainer}</p>
                            <p className="text-sm text-gray-600">
                              Fecha: {format(new Date(training.date), "dd/MM/yyyy")}
                            </p>
                            <p className="text-sm text-gray-600">
                              Horario: {format(new Date(training.startTime || training.date), "HH:mm")} -
                              {training.endTime ? format(new Date(training.endTime), "HH:mm") : "No especificado"}
                            </p>
                            <div className="mt-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${training.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                              >
                                {training.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No tienes entrenamientos programados.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ProtectedRoute>
        )
      // Añadir más casos según sea necesario para otras vistas
      default:
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
            <p>La vista solicitada no existe o no tienes permisos para acceder a ella.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 ml-0 flex flex-col">
        <header className="bg-white shadow-sm p-4 border-b sticky top-0 z-20">
          <div className="px-4 flex justify-end items-center">
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

