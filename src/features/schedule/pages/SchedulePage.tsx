import { useState, useEffect, useMemo } from "react"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/dialog"
import { TrainingForm } from "@/features/schedule/components/TrainingForm"
import { TrainingDetailsForm } from "@/features/schedule/components/TrainingDetailsForm"
import { useAuth } from "@/shared/contexts/AuthContext"
import { Button } from "@/shared/components/button"
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
import type { Training, User as UserType } from "@/shared/types"
import { format, isSameDay, addDays, subDays, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card"
import { Badge } from "@/shared/components/badge"
import { Input } from "@/shared/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/tabs"
import { ScheduleComponent } from "@/features/schedule/components/ScheduleComponent"

export function SchedulePage() {
    const { user } = useAuth()
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
    const [viewMode, setViewMode] = useState<"calendar" | "daily">("daily")
    const [searchTerm, setSearchTerm] = useState("")
    const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), "MMMM yyyy", { locale: es }))

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
    const [activeClientsCount, setActiveClientsCount] = useState<number>(0)

    // Cargar clientes con contratos activos
    useEffect(() => {
        // Importar los datos de contratos y clientes
        import("@/features/data/mockData").then((data) => {
            const { MOCK_CONTRACTS, MOCK_CLIENTS } = data;

            if (!MOCK_CONTRACTS || !MOCK_CLIENTS) {
                console.error("No se pudieron cargar los datos de contratos o clientes");
                return;
            }

            try {
                // Filtrar contratos activos
                const activeContractIds = MOCK_CONTRACTS
                    .filter(contract => contract.estado === "Activo")
                    .map(contract => contract.id_cliente.toString());
                
                // Obtener clientes con contratos activos
                const activeClients = MOCK_CLIENTS
                    .filter(client => 
                        activeContractIds.includes(client.id) && 
                        client.estado === "Activo" && 
                        client.membershipEndDate && 
                        new Date(client.membershipEndDate) > new Date()
                    )
                    .map(client => ({
                        id: client.id,
                        name: `${client.nombre} ${client.apellido}`
                    }))
                    // Eliminar duplicados basados en el ID del cliente
                    .filter((client, index, self) =>
                        index === self.findIndex((c) => c.id === client.id)
                    );

                console.log('Clientes con contratos activos:', activeClients);
                setClientsWithActiveContracts(activeClients);
                setActiveClientsCount(activeClients.length);
                
                // Si el usuario actual es un cliente, verificar si tiene membresía activa
                if (user?.role === "client" && user.clientId) {
                    const hasActive = activeClients.some(client => client.id === user.clientId);
                    setHasActiveMembership(hasActive);
                }
            } catch (error) {
                console.error("Error al procesar los datos de clientes:", error);
                setClientsWithActiveContracts([]);
                setActiveClientsCount(0);
            }
        }).catch(error => {
            console.error("Error al importar los datos:", error);
            setClientsWithActiveContracts([]);
            setActiveClientsCount(0);
        });
    }, [user, trainings]) // Añadir trainings como dependencia para actualizar cuando cambian los entrenamientos

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
            filtered = filtered.filter((training) => {
            const isSameClient = user?.role === 'client' ? training.clientId === user.clientId : true;
            return isSameDay(new Date(training.date), selectedDate) && isSameClient;
          })
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

        // Additional client filter for search results
        if (user?.role === 'client') {
            filtered = filtered.filter(training => training.clientId === user.clientId)
        }

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
    
    // Componentes UI extraídos fuera del método de renderizado
    const SearchComponent = () => (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Búsqueda
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar entrenamiento, cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 text-sm"
                    />
                </div>
            </CardContent>
        </Card>
    )

    // Componente de selector de vista reutilizable
    const ViewSelector = () => (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Vista
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as "calendar" | "daily")}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="daily" className="text-xs">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            Diaria
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="text-xs">
                            <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                            Calendario
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardContent>
        </Card>
    )

    // Componente de clientes disponibles reutilizable
    const AvailableClients = () => (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Clientes disponibles
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-2 py-1">
                            <span className="font-medium">{activeClientsCount}</span>
                        </Badge>
                        <span className="text-sm text-gray-500">Clientes con contratos activos</span>
                    </div>
                </div>
                <Button
                    onClick={handleAddTraining}
                    className="w-full bg-black hover:bg-gray-800 text-white text-xs py-2 mt-2"
                    disabled={!hasActiveMembership}
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Agendar entrenamiento
                </Button>
            </CardContent>
        </Card>
    )
    
    // Componente de vista diaria reutilizable
    const DailyView = () => (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle>Calendario de Entrenamientos</CardTitle>
                    <Button
                        onClick={handleAddTraining}
                        className="bg-black hover:bg-gray-800 text-white text-xs py-2"
                        disabled={!hasActiveMembership}
                    >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Agendar entrenamiento
                    </Button>
                </div>
                <p className="text-sm text-gray-500">Visualiza los entrenamientos programados</p>
            </CardHeader>

            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousDay}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToday}>
                        Hoy
                    </Button>
                </div>
                <div className="text-lg font-medium">
                    {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                    {isToday(selectedDate) && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Hoy
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-7 text-center py-2 border-b bg-gray-50">
                {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((day, index) => (
                    <div key={index} className="text-xs font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            <CardContent className="p-4">
                {Object.entries(groupedTrainings).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedTrainings).map(([hour, hourTrainings]) => (
                            <div key={hour} className="border-l-2 border-gray-200 pl-4 py-2">
                                <div className="flex items-center mb-2">
                                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="font-medium">{hour}</span>
                                </div>
                                <div className="space-y-2">
                                    {hourTrainings.map((training) => (
                                        <div
                                            key={training.id}
                                            className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                                training.status === "Activo"
                                                    ? "bg-green-50 border-l-4 border-green-500"
                                                    : training.status === "Pendiente"
                                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                                    : training.status === "Completado"
                                                    ? "bg-purple-50 border-l-4 border-purple-500"
                                                    : "bg-red-50 border-l-4 border-red-500"
                                            }`}
                                            onClick={() => handleTrainingClick(training)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium">{training.service}</h4>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        <div className="flex items-center">
                                                            <User className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                                            {training.client}
                                                        </div>
                                                        <div className="flex items-center mt-1">
                                                            <Dumbbell className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                                            {training.trainer}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    {getStatusBadge(training.status as "Activo" | "Pendiente" | "Completado" | "Cancelado")}
                                                    <span className="text-xs text-gray-500 mt-1">
                                                        {training.startTime && training.endTime
                                                            ? `${format(new Date(training.startTime), "HH:mm")} - ${
                                                                  format(new Date(training.endTime), "HH:mm")
                                                              }`
                                                            : "Horario no especificado"}
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
                    <div className="text-center py-10">
                        <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">No hay entrenamientos para este día</h3>
                        <p className="text-gray-400 mb-6">No se encontraron entrenamientos programados para la fecha seleccionada.</p>
                        <Button onClick={handleAddTraining} className="bg-black hover:bg-gray-800 text-white" disabled={!hasActiveMembership}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agendar entrenamiento
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <ProtectedRoute allowedRoles={["admin", "trainer", "client"]}>
            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">Mi Calendario de Entrenamiento</h1>
                    <p className="text-gray-500 text-sm">Visualiza y gestiona tus entrenamientos y revisa los detalles de tu membresía actual.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Panel lateral izquierdo */}
                    <div className="w-full lg:w-1/4 space-y-4">
                        <SearchComponent />
                        <ViewSelector />
                        <AvailableClients />
                    </div>

                    {/* Contenido principal */}
                    <div className="w-full lg:w-3/4">
                        {viewMode === "calendar" ? (
                            <ScheduleComponent
                                trainings={trainings}
                                onSelectDate={handleSelectDate}
                                onDeleteTraining={handleDeleteTraining}
                                onEditTraining={handleEditTraining}
                                onAddTraining={handleAddTraining}
                                selectedDate={selectedDate}
                            />
                        ) : (
                            <DailyView />
                        )}
                    </div>
                </div>

                {/* Diálogo para agregar entrenamiento */}
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="sm:max-w-[800px]" aria-describedby="training-form-description">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                <Dumbbell className="h-5 w-5" />
                                Agendar Entrenamiento Personalizado
                            </DialogTitle>
                            <DialogDescription id="training-form-description">
                                Complete los datos para agendar un entrenamiento personalizado con uno de nuestros entrenadores.
                            </DialogDescription>
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
                        <DialogContent className="sm:max-w-[800px]" aria-describedby="edit-training-description">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Dumbbell className="h-5 w-5" />
                                    Detalles del Servicio Agendado
                                </DialogTitle>
                                <DialogDescription id="edit-training-description">
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

export default SchedulePage