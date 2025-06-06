import { useState, useEffect, useMemo } from "react"
import { ProtectedRoute } from "../../auth/components/protectedRoute"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import { TrainingForm } from "@/features/schedule/components/TrainingForm"
import { TrainingDetailsForm } from "@/features/schedule/components/TrainingDetailsForm"
import { useAuth } from "@/shared/contexts/authContext"
import { Button } from "@/shared/components/ui/button"
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
import { type User as UserType } from "@/shared/types"
import { format, isSameDay, addDays, subDays, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { ScheduleComponent } from "@/features/schedule/components/ScheduleComponent"
import { contractService } from "@/features/contracts/services/contract.service"
import { clientService } from "@/features/clients/services/client.service"
import type { Contract, Client } from "@/shared/types"
import { scheduleService } from "@/features/schedule/services/schedule.service"
import { Training, TrainingsResponse, AvailabilityResponse } from "@/shared/types/training"

export function SchedulePage() {
    const { user } = useAuth()
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
    const [viewMode, setViewMode] = useState<"calendar" | "daily">("daily")
    const [searchTerm, setSearchTerm] = useState("")
    const [fetchedTrainings, setFetchedTrainings] = useState<Training[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeClientsCount, setActiveClientsCount] = useState(0)
    const [clients, setClients] = useState<Client[]>([])
    const [trainers, setTrainers] = useState<Array<{ id: string; name: string }>>([])

    // Obtener clientes con contratos activos
    const [clientsWithActiveContracts, setClientsWithActiveContracts] = useState<{ id: string; name: string }[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                
                // Intentar cargar contratos y clientes en paralelo
                const [contractsResponse, clientsResponse] = await Promise.all([
                    contractService.getContracts().catch(err => {
                        console.error("Error loading contracts:", err);
                        return { data: { data: [] } }; // Estructura de respuesta por defecto
                    }),
                    clientService.getClients({}).catch(err => {
                        console.error("Error loading clients:", err);
                        return { data: [] }; // Estructura de respuesta por defecto
                    })
                ])

                // Manejar contratos de forma segura
                const contractsData = contractsResponse?.data?.data || contractsResponse?.data || [];
                let activeContracts = [];
                if (Array.isArray(contractsData)) {
                    activeContracts = contractsData.filter(
                        contract => contract && contract.estado === "Activo"
                    );
                }
                setActiveClientsCount(activeContracts.length)

                // Manejar clientes de forma segura
                const clientsData = clientsResponse?.data || [];
                if (Array.isArray(clientsData)) {
                    try {
                        // Mapear clientes filtrando los que tienen datos válidos
                        const validClients = clientsData.filter(client => client && (client.id_persona || client.id));
                        const mappedClients = validClients.map(client => {
                            try {
                                return {
                                    id: (client.id_persona || client.id).toString(),
                                    name: client.usuario?.nombre || client.nombre || client.codigo || 'Cliente desconocido'
                                };
                            } catch (err) {
                                console.warn('Error mapping client:', client, err);
                                return null;
                            }
                        }).filter(Boolean); // Remover nulls

                        setClients(clientsData);
                        setClientsWithActiveContracts(mappedClients);
                    } catch (err) {
                        console.error("Error mapping clients:", err);
                        setClients([]);
                        setClientsWithActiveContracts([]);
                    }
                } else {
                    console.warn('Clients response is not an array:', clientsResponse);
                    setClients([]);
                    setClientsWithActiveContracts([]);
                }

                // Datos mock para entrenadores
                setTrainers([
                    { id: '1', name: 'Juan Perez' },
                    { id: '2', name: 'Maria Garcia' },
                ])

                // Fetch trainings from the API de forma segura
                try {
                    const trainingsResponse = await scheduleService.getTrainings({
                        fecha_inicio: format(selectedDate, "yyyy-MM-dd"),
                        fecha_fin: format(selectedDate, "yyyy-MM-dd"),
                    });
                    
                    const trainingsData = trainingsResponse?.data || [];
                    if (Array.isArray(trainingsData)) {
                        setFetchedTrainings(trainingsData);
                    } else {
                        console.warn('Trainings response is not an array:', trainingsResponse);
                        setFetchedTrainings([]);
                    }
                } catch (err) {
                    console.error("Error fetching trainings:", err);
                    setFetchedTrainings([]);
                }

                setError(null)
            } catch (err) {
                setError("Error al cargar los datos")
                console.error("Error fetching data:", err)
                setFetchedTrainings([])
                setClients([])
                setClientsWithActiveContracts([])
                setTrainers([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [selectedDate])

    // Filter and sort trainings based on fetchedTrainings and other dependencies
    const displayedTrainings = useMemo(() => {
        if (!user) {
            return []
        }

        let filtered = [...fetchedTrainings]

        // Si es cliente, solo mostrar sus entrenamientos
        if (user.role === "CLIENTE" && user.clientId) {
            filtered = filtered.filter((training) => training.id_cliente?.toString() === user.clientId)
        }

        // Si es entrenador, mostrar solo los entrenamientos que imparte
        else if (user.role === "ENTRENADOR" && user.trainerId) {
            filtered = filtered.filter((training) => training.id_entrenador?.toString() === user.trainerId)
        }

        // Filtrar por fecha seleccionada en modo diario
        if (viewMode === "daily") {
            filtered = filtered.filter((training) => {
                const isSameClient = user?.role === 'CLIENTE' ? training.id_cliente?.toString() === user.clientId : true
                // Check if the training's start date is the same as the selected date
                return isSameDay(new Date(training.fecha_inicio), selectedDate) && isSameClient
            })
        }

        // Aplicar búsqueda mejorada en todos los campos posibles
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (training) =>
                    // Buscar en todos los campos de texto posibles
                    training.cliente?.usuario?.nombre?.toLowerCase().includes(term) || // Access nested client name
                    training.cliente?.codigo?.toLowerCase().includes(term) || // Search by client code if available
                    training.id_cliente?.toString().includes(term) || // Search by client ID (as string)
                    training.entrenador?.nombre?.toLowerCase().includes(term) || // Access nested trainer name
                    training.entrenador?.apellido?.toLowerCase().includes(term) || // Search by trainer last name
                    training.id_entrenador?.toString().includes(term) || // Search by trainer ID (as string)
                    training.titulo?.toLowerCase().includes(term) || // Search by training title (was service)
                    training.estado?.toLowerCase().includes(term) || // Search by training status (was status)
                    format(new Date(training.fecha_inicio), "dd/MM/yyyy").includes(term) || // Search by start date (was date)
                    format(new Date(training.fecha_fin), "dd/MM/yyyy").includes(term) || // Search by end date
                    (training.fecha_inicio && format(new Date(training.fecha_inicio), "HH:mm").includes(term)) || // Search by start time (was startTime)
                    (training.fecha_fin && format(new Date(training.fecha_fin), "HH:mm").includes(term)) // Search by end time (was endTime)
            )
        }

        // Ordenar por hora de inicio
        filtered.sort((a, b) => {
            if (a.fecha_inicio && b.fecha_inicio) {
                return new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime()
            }
            return 0
        })

        return filtered
    }, [fetchedTrainings, user, selectedDate, viewMode, searchTerm])

    // Agrupar entrenamientos por hora para la vista diaria
    const groupedTrainings = useMemo(() => {
        const hours: { [key: string]: Training[] } = {}

        displayedTrainings.forEach((training) => {
            if (training.fecha_inicio) {
                const hour = format(new Date(training.fecha_inicio), "HH:mm")
                if (!hours[hour]) {
                    hours[hour] = []
                }
                hours[hour].push(training)
            }
        })

        return hours
    }, [displayedTrainings])

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date)
    }

    const handleSubmitTraining = async (data: Partial<Training>) => {
        try {
            setIsLoading(true); // Start loading indicator for submission
            if (selectedTraining) {
                // Actualizar entrenamiento existente
                await scheduleService.updateTraining(selectedTraining.id, data);
            } else {
                // Crear nuevo entrenamiento
                await scheduleService.createTraining(data);
            }
            setIsFormOpen(false);
            setIsEditFormOpen(false); // Close edit form as well
            // Recargar entrenamientos after adding/editing
            // Fetch trainings for the currently selected date to update the view
            const trainingsResponse = await scheduleService.getTrainings({
                 fecha_inicio: format(selectedDate, "yyyy-MM-dd"),
                 fecha_fin: format(selectedDate, "yyyy-MM-dd"),
            });
            setFetchedTrainings(trainingsResponse.data);

            Swal.fire({
                title: selectedTraining ? "¡Actualizado!" : "¡Creado!",
                text: `El entrenamiento ha sido ${selectedTraining ? "actualizado" : "agendado"} correctamente.`,
                icon: "success",
                confirmButtonColor: "#000",
                timer: 5000,
                timerProgressBar: true,
            });

        } catch (err) {
            console.error("Error saving training:", err);
            Swal.fire({
                title: "Error",
                text: "Hubo un problema al guardar el entrenamiento.",
                icon: "error",
                confirmButtonColor: "#000",
            });
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    }

    const handleTrainingClick = (training: Training) => {
        setSelectedTraining(training);
        setIsEditFormOpen(true);
    }

    const handleDeleteTraining = async (id: number) => {
        // Cerrar el modal antes de mostrar el SweetAlert
        setIsEditFormOpen(false);

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
            }).then(async (result) => { // Added async here
                if (result.isConfirmed) {
                    try {
                        await scheduleService.deleteTraining(id); // Call delete API
                        // Refetch trainings for the currently selected date to update the view
                        const trainingsResponse = await scheduleService.getTrainings({
                             fecha_inicio: format(selectedDate, "yyyy-MM-dd"),
                             fecha_fin: format(selectedDate, "yyyy-MM-dd"),
                        });
                        setFetchedTrainings(trainingsResponse.data);

                        Swal.fire({
                            title: "Eliminado",
                            text: "El servicio ha sido eliminado.",
                            icon: "success",
                            confirmButtonColor: "#000",
                            timer: 5000,
                            timerProgressBar: true,
                        });
                    } catch (error) {
                        console.error("Error deleting training:", error);
                         Swal.fire({
                            title: "Error",
                            text: "Hubo un problema al eliminar el entrenamiento.",
                            icon: "error",
                            confirmButtonColor: "#000",
                        });
                    }
                }
            });
        }, 300);
    }

    const handleAddTraining = () => {
        // Verificar si el usuario tiene un contrato activo antes de abrir el formulario
        if (user?.role === "CLIENTE" && !clientsWithActiveContracts.length) {
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

        setSelectedTraining(null); // Ensure no training is selected for a new training
        setIsFormOpen(true); // Open the new training form modal
    }

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setIsEditFormOpen(false)
        setSelectedTraining(null)
    }

    const handleChangeStatus = async (id: number, newStatus: Training["estado"]) => { // Added async here
         try {
            // Call API to update status
            await scheduleService.updateTraining(id, { estado: newStatus });
            // Update fetchedTrainings after successful status change
             const trainingsResponse = await scheduleService.getTrainings({
                 fecha_inicio: format(selectedDate, "yyyy-MM-dd"),
                 fecha_fin: format(selectedDate, "yyyy-MM-dd"),
            });
            setFetchedTrainings(trainingsResponse.data);

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
            });
         } catch (error) {
            console.error("Error changing training status:", error);
             Swal.fire({
                title: "Error",
                text: "Hubo un problema al cambiar el estado del entrenamiento.",
                icon: "error",
                confirmButtonColor: "#000",
            });
         }
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

    const getStatusIcon = (estado: string) => {
        switch (estado) {
            case "Programado":
                return <Clock3 className="h-4 w-4 text-blue-500" />
            case "En proceso":
                return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case "Completado":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "Cancelado":
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />
        }
    }

    const getStatusBadge = (estado: "Programado" | "Completado" | "Cancelado" | "En proceso") => {
        switch (estado) {
            case "Programado":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{estado}</Badge>
            case "Completado":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{estado}</Badge>
            case "Cancelado":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{estado}</Badge>
             case "En proceso":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{estado}</Badge>
            default:
                return <Badge variant="outline">{estado}</Badge>
        }
    }
    
    // Componente de búsqueda simplificado
    const SearchAndViewSelector = () => (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar entrenamientos, clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Tabs
                        value={viewMode}
                        onValueChange={(value) => setViewMode(value as "calendar" | "daily")}
                        className="w-full sm:w-auto"
                    >
                        <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                            <TabsTrigger value="daily" className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Vista Diaria
                            </TabsTrigger>
                            <TabsTrigger value="calendar" className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                Calendario
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {activeClientsCount} Clientes activos
                        </Badge>
                        {viewMode === "daily" && (
                            <Badge variant="outline" className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                {displayedTrainings.length} Entrenamientos hoy
                            </Badge>
                        )}
                    </div>
                    <Button
                        onClick={handleAddTraining}
                        className="bg-black hover:bg-gray-800 text-white"
                        disabled={user?.role === "CLIENTE" && !clientsWithActiveContracts.length}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Agendar entrenamiento
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    // Vista diaria mejorada
    const DailyView = () => (
        <div className="space-y-6">
            {/* Header de navegación diaria */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
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
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">
                                {format(selectedDate, "d 'de' MMMM", { locale: es })}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {format(selectedDate, "EEEE, yyyy", { locale: es })}
                                {isToday(selectedDate) && (
                                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                        Hoy
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {displayedTrainings.length} entrenamientos
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de entrenamientos */}
            {displayedTrainings.length > 0 ? (
                <div className="space-y-4">
                    {Object.entries(groupedTrainings).map(([hour, hourTrainings]) => (
                        <Card key={hour} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex">
                                    {/* Columna de tiempo */}
                                    <div className="w-20 bg-gray-50 p-4 flex flex-col items-center justify-center border-r">
                                        <div className="text-lg font-semibold text-gray-800">
                                            {hour.split(':')[0]}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            :{hour.split(':')[1]}
                                        </div>
                                    </div>
                                    
                                    {/* Columna de entrenamientos */}
                                    <div className="flex-1 p-4">
                                        <div className="space-y-3">
                                            {hourTrainings.map((training) => (
                                                <div
                                                    key={training.id}
                                                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md border ${
                                                        training.estado === "Programado"
                                                            ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                                                            : training.estado === "En proceso"
                                                            ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                                                            : training.estado === "Completado"
                                                            ? "bg-green-50 border-green-200 hover:bg-green-100"
                                                            : "bg-red-50 border-red-200 hover:bg-red-100"
                                                    }`}
                                                    onClick={() => handleTrainingClick(training)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {getStatusIcon(training.estado)}
                                                                <h3 className="font-semibold text-gray-900">
                                                                    {training.titulo}
                                                                </h3>
                                                                {getStatusBadge(training.estado as "Programado" | "Completado" | "Cancelado" | "En proceso")}
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    <span>
                                                                        {training.cliente?.usuario?.nombre || training.cliente?.codigo || 'Cliente desconocido'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Dumbbell className="h-4 w-4 text-gray-400" />
                                                                    <span>
                                                                        {training.entrenador?.nombre || 'Entrenador asignado'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            {training.descripcion && (
                                                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                                    {training.descripcion}
                                                                </p>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="text-right ml-4">
                                                            <div className="text-sm font-medium text-gray-800">
                                                                {training.fecha_inicio && training.fecha_fin
                                                                    ? `${format(new Date(training.fecha_inicio), "HH:mm")} - ${
                                                                          format(new Date(training.fecha_fin), "HH:mm")
                                                                      }`
                                                                    : "Horario no especificado"}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Duración: {training.fecha_inicio && training.fecha_fin
                                                                    ? `${Math.round((new Date(training.fecha_fin).getTime() - new Date(training.fecha_inicio).getTime()) / (1000 * 60))} min`
                                                                    : "No especificado"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <CalendarDays className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No hay entrenamientos para este día
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md">
                                No se encontraron entrenamientos programados para {format(selectedDate, "d 'de' MMMM", { locale: es })}.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )

    if (isLoading) {
        return <div>Cargando...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Mi Calendario de Entrenamiento</h1>
                    <p className="text-gray-600">Visualiza y gestiona tus entrenamientos y revisa los detalles de tu membresía actual.</p>
                </div>

                <SearchAndViewSelector />

                {/* Contenido principal */}
                {viewMode === "calendar" ? (
                    <ScheduleComponent
                        trainings={displayedTrainings}
                        onSelectDate={handleSelectDate}
                        onTrainingClick={handleTrainingClick}
                        selectedDate={selectedDate}
                    />
                ) : (
                    <DailyView />
                )}

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
                            onSubmit={handleSubmitTraining}
                            onCancel={handleCloseForm}
                            initialDate={selectedDate}
                            clients={clients}
                            trainers={trainers}
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
                                    Detalles del Entrenamiento
                                </DialogTitle>
                                <DialogDescription id="edit-training-description">
                                    Visualice o modifique los detalles del entrenamiento agendado.
                                </DialogDescription>
                            </DialogHeader>
                            <TrainingDetailsForm
                                training={selectedTraining}
                                onUpdate={handleSubmitTraining}
                                onDelete={() => handleDeleteTraining(selectedTraining.id)}
                                onClose={() => setIsEditFormOpen(false)}
                                onChangeStatus={handleChangeStatus}
                                trainers={trainers}
                                clients={clientsWithActiveContracts}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </ProtectedRoute>
    )
}

export default SchedulePage