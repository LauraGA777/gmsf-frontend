"use client"

import { useState, useEffect, useMemo } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { CustomCalendarView } from "@/components/calendar/CustomCalendarView"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TrainingForm } from "@/components/forms/TrainingForm"
import { TrainingDetailsForm } from "@/components/forms/TrainingDetailsForm"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  X,
  CalendarIcon,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  User,
  Dumbbell,
  CalendarDays,
  Plus,
} from "lucide-react"
import Swal from "sweetalert2"
import type { Training, User as UserType } from "@/types"
import { format, isSameDay, addDays, subDays, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CustomServicesPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "daily">("daily")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTrainer, setFilterTrainer] = useState("all")
  const [filterService, setFilterService] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Datos de ejemplo para servicios personalizados (convertidos al formato Training)
  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: 1,
      client: "Juan Pérez",
      clientId: "0001",
      trainer: "Carlos Ruiz",
      trainerId: "t1",
      service: "Entrenamiento personalizado",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Activo",
    },
    {
      id: 2,
      client: "María González",
      clientId: "0002",
      trainer: "Ana Gómez",
      trainerId: "t2",
      service: "Entrenamiento personalizado",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Activo",
    },
    {
      id: 3,
      client: "Carlos Rodríguez",
      clientId: "0003",
      trainer: "Miguel Sánchez",
      trainerId: "t3",
      service: "Entrenamiento personalizado",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000),
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Activo",
    },
    {
      id: 4,
      client: "Laura Martínez",
      clientId: "0004",
      trainer: "Carlos Ruiz",
      trainerId: "t1",
      service: "Entrenamiento personalizado",
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Cancelado",
    },
    {
      id: 5,
      client: "Roberto Sánchez",
      clientId: "0008",
      trainer: "Ana Gómez",
      trainerId: "t2",
      service: "Entrenamiento personalizado",
      date: new Date(),
      startTime: new Date(new Date().setHours(10, 0, 0, 0)),
      endTime: new Date(new Date().setHours(11, 0, 0, 0)),
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Activo",
    },
    {
      id: 6,
      client: "Ana Martínez",
      clientId: "0005",
      trainer: "Carlos Ruiz",
      trainerId: "t1",
      service: "Entrenamiento personalizado",
      date: new Date(),
      startTime: new Date(new Date().setHours(15, 0, 0, 0)),
      endTime: new Date(new Date().setHours(16, 0, 0, 0)),
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Pendiente",
    },
  ])

  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([])
  const [hasActiveMembership, setHasActiveMembership] = useState<boolean>(false)

  // Trainers y servicios para el buscador
  const trainers: string[] = ["Carlos Ruiz", "Ana Gómez", "Miguel Sánchez", "Laura Martínez"]
  const services: string[] = ["Entrenamiento personalizado"]
  const statusOptions: string[] = ["Activo", "Pendiente", "Completado", "Cancelado"]

  const [clientsWithActiveContracts, setClientsWithActiveContracts] = useState<{ id: string; name: string }[]>([
    { id: "0001", name: "Juan Pérez" },
    { id: "0002", name: "María González" },
    { id: "0003", name: "Carlos Rodríguez" },
    { id: "0005", name: "Ana Martínez" },
    { id: "0008", name: "Roberto Sánchez" },
  ])

  // Verificar si el usuario tiene una membresía activa
  useEffect(() => {
    if (user?.role === "client") {
      // Simulación de verificación de membresía activa
      checkMembership(user)
    } else if (user?.role === "admin" || user?.role === "trainer") {
      // Administradores y entrenadores siempre pueden agendar
      setHasActiveMembership(true)
    }
  }, [user])

  // Función para verificar membresía (simulada)
  const checkMembership = (user: UserType) => {
    // Simulación: verificar si el usuario tiene una membresía activa
    // En un caso real, esto sería una llamada a la API

    // Para propósitos de demostración, asumimos que el usuario con clientId "0001" tiene membresía activa
    const hasActive = user.clientId === "0001"
    setHasActiveMembership(hasActive)

    // Si no tiene membresía activa y es un cliente, mostrar mensaje
    if (!hasActive && user.role === "client") {
      Swal.fire({
        title: "Membresía inactiva",
        text: "No tienes una membresía activa. Por favor, adquiere una membresía para poder agendar entrenamientos personalizados.",
        icon: "warning",
        confirmButtonColor: "#000",
      })
    }
  }

  // Filtrar entrenamientos según el rol del usuario, fecha seleccionada y filtros
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

    // Filtrar por fecha seleccionada en modo diario
    if (viewMode === "daily") {
      filtered = filtered.filter((training) => isSameDay(new Date(training.date), selectedDate))
    }

    // Aplicar filtros de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (training) =>
          training.client.toLowerCase().includes(term) ||
          training.trainer.toLowerCase().includes(term) ||
          training.service.toLowerCase().includes(term),
      )
    }

    // Aplicar filtro de entrenador
    if (filterTrainer && filterTrainer !== "all") {
      filtered = filtered.filter((training) => training.trainer === filterTrainer)
    }

    // Aplicar filtro de servicio
    if (filterService) {
      filtered = filtered.filter((training) => training.service === filterService)
    }

    // Aplicar filtro de estado
    if (filterStatus && filterStatus !== "all") {
      filtered = filtered.filter((training) => training.status === filterStatus)
    }

    // Ordenar por hora de inicio
    filtered.sort((a, b) => {
      if (a.startTime && b.startTime) {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }
      return 0
    })

    setFilteredTrainings(filtered)
  }, [user, trainings, selectedDate, viewMode, searchTerm, filterTrainer, filterService, filterStatus])

  // Agrupar entrenamientos por hora para la vista diaria
  const groupedTrainings = useMemo(() => {
    const hours: { [key: string]: Training[] } = {}

    filteredTrainings.forEach((training) => {
      if (training.startTime) {
        const hour = format(new Date(training.startTime), "HH:mm")
        if (!hours[hour]) {
          hours[hour] = []
        }
        hours[hour].push(training)
      }
    })

    return hours
  }, [filteredTrainings])

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
  }

  const handleDeleteTraining = (id: number) => {
    // Cerrar el modal antes de mostrar el SweetAlert
    setIsEditFormOpen(false)

    // Pequeño retraso para asegurar que el modal se cierre primero
    setTimeout(() => {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas eliminar este entrenamiento personalizado?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#000",
        cancelButtonColor: "#d1d5db",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          setTrainings(trainings.filter((training) => training.id !== id))

          Swal.fire({
            title: "Eliminado",
            text: "El entrenamiento personalizado ha sido eliminado.",
            icon: "success",
            confirmButtonColor: "#000",
            timer: 5000,
            timerProgressBar: true,
          })
        }
      })
    }, 300)
  }

  const handleEditTraining = (id: number, updatedTraining: Partial<Training>) => {
    const updatedTrainings = trainings.map((training) =>
      training.id === id ? { ...training, ...updatedTraining } : training,
    )

    setTrainings(updatedTrainings)
    setIsEditFormOpen(false)

    // Pequeño retraso para asegurar que el modal se cierre primero
    setTimeout(() => {
      Swal.fire({
        title: "¡Actualizado!",
        text: "El entrenamiento personalizado ha sido actualizado correctamente.",
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      })
    }, 300)
  }

  const handleAddTraining = () => {
    // Verificar si el usuario tiene una membresía activa antes de abrir el formulario
    if (user?.role === "client" && !hasActiveMembership) {
      Swal.fire({
        title: "Membresía inactiva",
        text: "No tienes una membresía activa. Por favor, adquiere una membresía para poder agendar entrenamientos personalizados.",
        icon: "warning",
        confirmButtonColor: "#000",
      })
      return
    }

    setIsFormOpen(true)
  }

  const handleAddTrainingSubmit = (newTraining: Omit<Training, "id">) => {
    // Validar que todos los campos requeridos estén completos
    if (
      !newTraining.client ||
      !newTraining.trainer ||
      !newTraining.service ||
      !newTraining.date ||
      !newTraining.startTime ||
      !newTraining.endTime
    ) {
      Swal.fire({
        title: "Datos incompletos",
        text: "Por favor, completa todos los campos requeridos para agendar un entrenamiento personalizado.",
        icon: "error",
        confirmButtonColor: "#000",
      })
      return
    }

    const id = Math.max(0, ...trainings.map((t) => t.id)) + 1

    // Añadir clientId y trainerId según corresponda
    const trainingToAdd: Training = {
      ...newTraining,
      id,
      clientId: user?.role === "client" ? user.clientId : newTraining.clientId,
      trainerId: user?.role === "trainer" ? user.trainerId : newTraining.trainerId,
      // Para servicios personalizados, siempre es capacidad 1
      maxCapacity: 1,
      occupiedSpots: 1,
    }

    setTrainings([...trainings, trainingToAdd])
    setIsFormOpen(false)

    // Pequeño retraso para asegurar que el modal se cierre primero
    setTimeout(() => {
      Swal.fire({
        title: "¡Entrenamiento personalizado agendado!",
        text: `Se ha programado un entrenamiento personalizado con ${newTraining.trainer} para ${newTraining.client} de ${format(new Date(newTraining.startTime || newTraining.date), "HH:mm")} a ${format(new Date(newTraining.endTime || new Date(newTraining.date.getTime() + 60 * 60 * 1000)), "HH:mm")}.`,
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      })
    }, 300)
  }

  const handleTrainingClick = (training: Training) => {
    setSelectedTraining(training)
    setIsEditFormOpen(true)
  }

  const handleChangeStatus = (id: number, newStatus: string) => {
    const updatedTrainings = trainings.map((training) =>
      training.id === id ? { ...training, status: newStatus } : training,
    )

    setTrainings(updatedTrainings)

    // No cerramos el modal aquí para permitir cambios adicionales
    Swal.fire({
      title: "Estado actualizado",
      text: `El entrenamiento personalizado ahora está ${newStatus.toLowerCase()}.`,
      icon: "success",
      confirmButtonColor: "#000",
      timer: 5000,
      timerProgressBar: true,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
    })
  }

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1))
  }

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1))
  }

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Activo":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "Pendiente":
        return <Clock3 className="h-4 w-4 text-blue-500" />
      case "Completado":
        return <CheckCircle2 className="h-4 w-4 text-purple-500" />
      case "Cancelado":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Activo":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>
      case "Pendiente":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>
      case "Completado":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{status}</Badge>
      case "Cancelado":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterTrainer("all")
    setFilterService("all")
    setFilterStatus("all")
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Servicios Personalizados</h1>
          <p className="text-gray-500">
            Gestiona los entrenamientos personalizados y visualiza la disponibilidad de los entrenadores.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel lateral con filtros y búsqueda */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="search" className="text-sm font-medium">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Cliente, entrenador..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="trainer" className="text-sm font-medium">
                    Entrenador
                  </label>
                  <Select value={filterTrainer} onValueChange={setFilterTrainer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los entrenadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los entrenadores</SelectItem>
                      {trainers.map((trainer) => (
                        <SelectItem key={trainer} value={trainer}>
                          {trainer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Estado
                  </label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span>{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full mt-2" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Vista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="daily" onValueChange={(value) => setViewMode(value as "calendar" | "daily")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="daily" className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      Diaria
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Calendario
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {viewMode === "calendar" ? (
              <Card>
                <CardContent className="p-0">
                  <CustomCalendarView
                    trainings={filteredTrainings}
                    onSelectDate={handleSelectDate}
                    onAddTraining={handleAddTraining}
                    onDeleteTraining={handleDeleteTraining}
                    onEditTraining={handleEditTraining}
                    selectedDate={selectedDate}
                    onTrainingClick={handleTrainingClick}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleToday}
                        className={isToday(selectedDate) ? "border-black" : ""}
                      >
                        Hoy
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleNextDay}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <h2 className="text-xl font-semibold">
                      {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </h2>
                  </div>
                </CardHeader>
                <CardContent>
                  {Object.keys(groupedTrainings).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(groupedTrainings).map(([hour, trainings]) => (
                        <div key={hour} className="relative">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mr-4">
                              <Clock className="h-5 w-5 text-gray-700" />
                            </div>
                            <h3 className="text-lg font-medium">{hour}</h3>
                          </div>
                          <div className="ml-16 space-y-3">
                            {trainings.map((training) => (
                              <div
                                key={training.id}
                                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleTrainingClick(training)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <Dumbbell className="h-5 w-5 text-gray-700" />
                                    <h4 className="font-medium">{training.service}</h4>
                                  </div>
                                  {getStatusBadge(training.status)}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{training.client}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{training.trainer}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">
                                      {format(new Date(training.startTime || training.date), "HH:mm")} -
                                      {format(
                                        new Date(
                                          training.endTime || new Date(training.date.getTime() + 60 * 60 * 1000),
                                        ),
                                        "HH:mm",
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="bg-gray-100 rounded-full p-4 mb-4">
                        <CalendarIcon className="h-8 w-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium mb-1">No hay servicios personalizados programados</h3>
                      <p className="text-gray-500 text-center mb-4">
                        No se encontraron entrenamientos personalizados para esta fecha con los filtros seleccionados.
                      </p>
                      <Button onClick={handleAddTraining} className="bg-black hover:bg-gray-800 transition-colors">
                        <Plus className="mr-2 h-4 w-4" /> Agendar servicio personalizado
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Diálogo para agregar nuevo entrenamiento personalizado */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[600px] p-0">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Agendar Servicio Personalizado</h2>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={() => setIsFormOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <TrainingForm
                onAddTraining={handleAddTrainingSubmit}
                onCancel={() => setIsFormOpen(false)}
                selectedDate={selectedDate}
                trainers={trainers}
                services={services}
                clients={clientsWithActiveContracts}
                isPersonalized={true}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo para editar entrenamiento personalizado */}
        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <DialogContent className="sm:max-w-[600px] p-0">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Editar Servicio Personalizado</h2>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={() => setIsEditFormOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              {selectedTraining && (
                <TrainingDetailsForm
                  training={selectedTraining}
                  onSave={handleEditTraining}
                  onDelete={() => handleDeleteTraining(selectedTraining.id)}
                  onCancel={() => setIsEditFormOpen(false)}
                  onChangeStatus={handleChangeStatus}
                  trainers={trainers}
                  services={services}
                  clients={clientsWithActiveContracts}
                  isPersonalized={true}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}

export default CustomServicesPage

