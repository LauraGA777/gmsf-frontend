"use client"

import { useState, useEffect, useMemo } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { CustomCalendarView } from "@/components/calendar/CustomCalendarView"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
import { CompactTrainingForm } from "@/components/forms/CompactTrainingForm"

export function TrainingSchedulePage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "daily">("daily")
  const [searchTerm, setSearchTerm] = useState("")

  // Datos de ejemplo para servicios agendados (convertidos al formato Training)
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
  const services: string[] = ["Entrenamiento personalizado", "GAP", "Yoga", "Pilates", "Crossfit", "Funcional", "Zumba", "Spinning"]
  const statusOptions: string[] = ["Activo", "Pendiente", "Completado", "Cancelado"]

  // Obtener clientes con contratos activos desde mockData
  const [clientsWithActiveContracts, setClientsWithActiveContracts] = useState<{ id: string; name: string }[]>([])
  
  // Cargar clientes con contratos activos
  useEffect(() => {
    // Importar los datos de contratos y clientes
    import("@/data/mockData").then((data) => {
      const { MOCK_CONTRACTS } = data;
      
      if (!MOCK_CONTRACTS) {
        console.error("No se pudieron cargar los datos de contratos");
        return;
      }
      
      try {
        // Filtrar contratos activos y mapear a formato requerido
        const activeClients = MOCK_CONTRACTS
          .filter(contract => contract.estado === "Activo")
          .map(contract => ({
            id: contract.cliente_documento,
            name: contract.cliente_nombre
          }))
          // Eliminar duplicados basados en el ID del cliente
          .filter((client, index, self) =>
            index === self.findIndex((c) => c.id === client.id)
          );
        
        console.log('Clientes con contratos activos:', activeClients);
        setClientsWithActiveContracts(activeClients);
      } catch (error) {
        console.error("Error al procesar los datos de clientes:", error);
        setClientsWithActiveContracts([]);
      }
    }).catch(error => {
      console.error("Error al importar los datos:", error);
      setClientsWithActiveContracts([]);
    });
  }, [])

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

  // Función para verificar si el usuario tiene un contrato activo
  const checkMembership = (user: UserType) => {
    if (!user.clientId) {
      setHasActiveMembership(false)
      return
    }
    
    // Verificar si los datos de contratos ya están cargados
    if (!clientsWithActiveContracts || clientsWithActiveContracts.length === 0) {
      // Si los datos aún no están disponibles, no mostramos mensaje de error
      // ya que podría ser que los datos aún se están cargando
      return
    }
    
    // Verificar si el usuario está en la lista de clientes con contratos activos
    const hasActive = clientsWithActiveContracts.some(client => client.id === user.clientId)
    setHasActiveMembership(hasActive)

    // Si no tiene contrato activo y es un cliente, mostrar mensaje
    if (!hasActive && user.role === "client") {
      Swal.fire({
        title: "Contrato inactivo",
        text: "No tienes un contrato activo. Por favor, adquiere o renueva tu membresía para poder agendar servicios.",
        icon: "warning",
        confirmButtonColor: "#000",
        timer: 8000,
        timerProgressBar: true,
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

    // Aplicar búsqueda mejorada en todos los campos posibles
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (training) =>
          // Buscar en todos los campos de texto posibles
          training.client?.toLowerCase().includes(term) ||
          training.clientId?.toLowerCase().includes(term) ||
          training.trainer?.toLowerCase().includes(term) ||
          training.trainerId?.toLowerCase().includes(term) ||
          training.service?.toLowerCase().includes(term) ||
          training.status?.toLowerCase().includes(term) ||
          format(new Date(training.date), "dd/MM/yyyy").includes(term) ||
          (training.startTime && format(new Date(training.startTime), "HH:mm").includes(term)) ||
          (training.endTime && format(new Date(training.endTime), "HH:mm").includes(term))
      )
    }

    // Ordenar por hora de inicio
    filtered.sort((a, b) => {
      if (a.startTime && b.startTime) {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }
      return 0
    })

    setFilteredTrainings(filtered)
  }, [user, trainings, selectedDate, viewMode, searchTerm])

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
        text: "¿Deseas eliminar este servicio agendado?",
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
            text: "El servicio ha sido eliminado.",
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
        text: "El servicio ha sido actualizado correctamente.",
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      })
    }, 300)
  }

  const handleAddTraining = () => {
    // Verificar si el usuario tiene un contrato activo antes de abrir el formulario
    if (user?.role === "client" && !hasActiveMembership) {
      Swal.fire({
        title: "Contrato inactivo",
        text: "No tienes un contrato activo. Para agendar servicios, necesitas tener una membresía vigente.",
        icon: "warning",
        confirmButtonColor: "#000",
        footer: '<a href="/contracts" class="text-blue-600 hover:underline">Ver mis contratos</a>',
        timer: 10000,
        timerProgressBar: true,
      })
      return
    }
    
    // Verificar si hay clientes con contratos activos disponibles
    if ((user?.role === "admin" || user?.role === "trainer")) {
      // Verificar si los datos de contratos ya están cargados
      if (clientsWithActiveContracts === undefined) {
        // Si los datos aún no están disponibles, mostrar un mensaje de carga
        Swal.fire({
          title: "Cargando datos",
          text: "Estamos cargando la información de clientes, por favor espera un momento.",
          icon: "info",
          confirmButtonColor: "#000",
          timer: 3000,
          timerProgressBar: true,
        })
        return
      }
      
      // Si no hay clientes con contratos activos
      if (clientsWithActiveContracts.length === 0) {
        Swal.fire({
          title: "Sin clientes disponibles",
          text: "No hay clientes con contratos activos disponibles para agendar servicios.",
          icon: "info",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
        return
      }
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
        title: "¡Servicio agendado!",
        text: `Se ha programado ${newTraining.service} con ${newTraining.trainer} para ${newTraining.client} de ${format(new Date(newTraining.startTime || newTraining.date), "HH:mm")} a ${format(new Date(newTraining.endTime || new Date(newTraining.date.getTime() + 60 * 60 * 1000)), "HH:mm")}.`,
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      })
    }, 300)
  }

  const handleTrainingClick = (training: Training) => {
    setSelectedTraining(training)
    setTimeout(() => {
      setIsEditFormOpen(true)
    }, 100) // Asegurar que el estado se actualice antes de abrir el modal
  }

  const handleChangeStatus = (id: number, newStatus: Training["status"]) => {
      const updatedTrainings = trainings.map((training) =>
        training.id === id ? { ...training, status: newStatus } : training,
      )
  
      setTrainings(updatedTrainings)

    // No cerramos el modal aquí para permitir cambios adicionales
    Swal.fire({
      title: "Estado actualizado",
      text: `El servicio ahora está ${newStatus.toLowerCase()}.`,
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

  const getStatusBadge = (status: "Activo" | "Pendiente" | "Completado" | "Cancelado") => {
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

  return (
    <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mi Calendario de Entrenamiento</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-gray-500">
              Visualiza y gestiona tus sesiones de entrenamiento y revisa los detalles de tu membresía actual.
            </p>
            {user?.role === "client" && (
              <Badge 
                className={`${hasActiveMembership ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"} px-3 py-1 text-sm flex items-center gap-2`}
              >
                {hasActiveMembership ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Contrato activo
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    Contrato inactivo
                  </>
                )}
              </Badge>
            )}
          </div>
          {user?.role === "client" && !hasActiveMembership && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <p className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>Para agendar servicios, necesitas tener un contrato activo. Por favor, contacta a recepción para adquirir o renovar tu membresía.</span>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel lateral con filtros y búsqueda */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Búsqueda global
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      id="search"
                      type="search"
                      placeholder="Cliente, entrenador, servicio, fecha, hora..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7 text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchTerm("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-xs text-gray-500 mt-1">
                      Buscando "{searchTerm}" en todos los campos
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Vista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="daily" onValueChange={(value) => setViewMode(value as "calendar" | "daily")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="daily" className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
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
            
            {(user?.role === "admin" || user?.role === "trainer") && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Clientes disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900 flex items-center justify-center gap-2">
                      <User className="h-5 w-5 text-gray-500" />
                      {clientsWithActiveContracts.length}
                    </p>
                    <p className="text-sm text-gray-500 text-center">
                      {clientsWithActiveContracts.length === 1 ? 'Cliente con contrato activo' : 'Clientes con contratos activos'}
                    </p>
                    {clientsWithActiveContracts.length === 0 && (
                      <div className="p-3 bg-amber-50 rounded-md text-amber-800 text-sm">
                        <p className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          No hay clientes con contratos activos disponibles
                        </p>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={handleAddTraining}
                      disabled={clientsWithActiveContracts.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar entrenamiento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                      <Button variant="outline" size="icon" onClick={handlePreviousDay} aria-label="Día anterior">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleToday}
                        className={isToday(selectedDate) ? "border-black" : ""}
                        aria-label="Ir a hoy"
                      >
                        Hoy
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleNextDay} aria-label="Día siguiente">
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
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <h3 className="text-sm font-medium">{hour}</h3>
                          </div>
                          <div className="space-y-3">
                            {trainings.map((training) => (
                              <Card
                                key={training.id}
                                className={`border-l-4 ${training.status === "Activo" ? "border-l-green-500" : training.status === "Pendiente" ? "border-l-blue-500" : training.status === "Completado" ? "border-l-purple-500" : "border-l-red-500"} hover:shadow-md transition-shadow cursor-pointer`}
                                onClick={() => handleTrainingClick(training)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <p className="font-medium">{training.client}</p>
                                        {getStatusBadge(training.status)}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                        <User className="h-4 w-4" />
                                        <p>{training.trainer}</p>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Dumbbell className="h-4 w-4" />
                                        <p>{training.service}</p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <p>
                                          {format(new Date(training.startTime), "HH:mm")} -{" "}
                                          {format(new Date(training.endTime ?? training.date), "HH:mm")}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500 mb-4">No hay entrenamientos programados para este día</p>
                      {user && (user.role === "admin" || user.role === "trainer") && (
                        <Button onClick={handleAddTraining} className="bg-black hover:bg-gray-800 text-white">
                          <Plus className="mr-2 h-4 w-4" />
                          Agendar entrenamiento
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Botón flotante para agregar entrenamiento (visible solo en vista diaria) */}
        {viewMode === "daily" && Object.keys(groupedTrainings).length > 0 && user && (user.role === "admin" || user.role === "trainer") && (
          <Button
            onClick={handleAddTraining}
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-black hover:bg-gray-800 text-white shadow-lg"
            aria-label="Agendar entrenamiento"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {/* Modal para agregar entrenamiento */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[715px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agendar Servicio
              </DialogTitle>
              <DialogDescription>
                Complete el formulario para agendar un nuevo servicio o clase.
              </DialogDescription>
              {clientsWithActiveContracts.length === 0 ? (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Importante:</strong> No hay clientes con contratos activos disponibles. 
                      Solo se pueden agendar servicios para clientes con contratos vigentes.
                    </span>
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Clientes disponibles:</strong> {clientsWithActiveContracts.length} {clientsWithActiveContracts.length === 1 ? 'cliente tiene' : 'clientes tienen'} contratos activos y {clientsWithActiveContracts.length === 1 ? 'puede' : 'pueden'} agendar entrenamientos personalizados.
                    </span>
                  </p>
                </div>
              )}
            </DialogHeader>
            <TrainingForm
              onAddTraining={handleAddTrainingSubmit}
              onCancel={() => setIsFormOpen(false)}
              trainers={trainers}
              services={services}
              clientsWithActiveContracts={clientsWithActiveContracts}
              selectedDate={selectedDate}
              isCustomService={false}
              user={user}
            />
          </DialogContent>
        </Dialog>

        {/* Diálogo para editar entrenamiento */}
        {selectedTraining && (
          <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  Detalles del Servicio Agendado
                </DialogTitle>
                <DialogDescription>
                  Visualice o modifique los detalles del servicio o clase agendada.
                </DialogDescription>
              </DialogHeader>
              <TrainingDetailsForm
                training={selectedTraining}
                onSave={handleEditTraining}
                onDelete={() => handleDeleteTraining(selectedTraining.id)}
                onCancel={() => setIsEditFormOpen(false)}
                onChangeStatus={handleChangeStatus}
                trainers={trainers}
                clients={clientsWithActiveContracts}
                isCustomService={false}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  )
}

export default TrainingSchedulePage

