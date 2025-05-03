import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/shared/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/popover"
import { cn } from "@/shared/utils/utils"
import { AlertCircle, CalendarIcon, Clock, Dumbbell, Clock3, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"
import type { Training } from "@/shared/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { MOCK_CLIENTS } from "@/features/data/mockData"

interface TrainingDetailsFormProps {
    training: Training
    onSave: (id: number, updatedTraining: Partial<Training>) => void
    onDelete: () => void
    onCancel: () => void
    onChangeStatus?: (id: number, status: string) => void
    trainers?: string[]
    clients?: { id: string; name: string }[]
    isCustomService?: boolean
}

export function TrainingDetailsForm({
    training,
    onSave,
    onDelete,
    onCancel,
    onChangeStatus,
    trainers = [],
    clients = [],
    isCustomService = false,
}: TrainingDetailsFormProps) {
    const [clientId, setClientId] = useState(training.clientId || "")
    const [clientSearch, setClientSearch] = useState<string>(training.client || "")
    const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false)
    const [trainer, setTrainer] = useState(training.trainer || "")
    const [service, setService] = useState(training.service || "")
    const [date, setDate] = useState<Date>(training.date ? new Date(training.date) : new Date())
    const [startTime, setStartTime] = useState<string>(
        training.startTime ? format(new Date(training.startTime), "HH:mm") : "09:00",
    )
    const [endTime, setEndTime] = useState<string>(
        training.endTime ? format(new Date(training.endTime), "HH:mm") : "10:00",
    )
    const [status, setStatus] = useState(training.status || "Activo")

    // Usar los clientes pasados como prop en lugar de filtrar MOCK_CLIENTS directamente
    const activeClients = useMemo(() => {
        // Si se proporcionan clientes como prop, usarlos
        if (clients && clients.length > 0) {
            return MOCK_CLIENTS.filter(
                (client) => clients.some(c => c.id === client.id)
            )
        }
        // Si no hay clientes proporcionados, filtrar los activos de MOCK_CLIENTS
        return MOCK_CLIENTS.filter(
            (client) => 
                client.estado === "Activo" && 
                client.membershipEndDate && 
                client.membershipEndDate > new Date()
        )
    }, [clients, MOCK_CLIENTS]) // Añadir MOCK_CLIENTS como dependencia para actualizar cuando cambian los datos

    // Variable para controlar si el usuario está editando manualmente
    const [isUserEditing, setIsUserEditing] = useState(false)

    // Mantener sincronizado el clientSearch cuando cambia el training
    // Este efecto solo debe ejecutarse una vez al montar el componente o cuando cambia el training.client
    useEffect(() => {
        // Solo sincronizar cuando el componente se monta inicialmente o cuando cambia el cliente del training
        // Y solo si el usuario no ha interactuado manualmente con el campo
        if (training.client && !isUserEditing) {
            setClientSearch(training.client)
            // Primero intentar encontrar el cliente en los clientes pasados como prop
            const matchingClientFromProps = clients.find((c) => c.name === training.client)
            if (matchingClientFromProps) {
                setClientId(matchingClientFromProps.id)
            } else {
                // Si no se encuentra en los props, buscar en activeClients
                const matchingClient = activeClients.find((c) => `${c.nombre} ${c.apellido}` === training.client)
                if (matchingClient) {
                    setClientId(matchingClient.id)
                }
            }
        }
        // Eliminamos isUserEditing de las dependencias para evitar que el efecto se ejecute cuando el usuario está escribiendo
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [training.client, activeClients, clients])

    // Clientes filtrados por búsqueda
    const filteredClients = useMemo(() => {
        if (!clientSearch) return activeClients
        return activeClients.filter(
            (c) =>
                `${c.nombre} ${c.apellido}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
                (c.numero_documento && c.numero_documento.includes(clientSearch)),
        )
    }, [activeClients, clientSearch])

    // Cerrar el dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            setShowClientDropdown(false)
        }

        document.addEventListener("click", handleClickOutside)
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [])

    const statusOptions = ["Activo", "Pendiente", "Completado", "Cancelado"]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Encontrar el nombre del cliente seleccionado
        const selectedClient = activeClients.find((c) => c.id === clientId)
        const clientName = selectedClient ? `${selectedClient.nombre} ${selectedClient.apellido}` : ""

        // Crear objetos Date para startTime y endTime
        const [startHour, startMinute] = startTime.split(":").map(Number)
        const [endHour, endMinute] = endTime.split(":").map(Number)

        const startDateTime = new Date(date)
        startDateTime.setHours(startHour, startMinute, 0)

        const endDateTime = new Date(date)
        endDateTime.setHours(endHour, endMinute, 0)

        onSave(training.id, {
            client: clientName,
            clientId: clientId,
            trainer,
            service: service,
            date,
            startTime: startDateTime,
            endTime: endDateTime,
            maxCapacity: 1,
            occupiedSpots: 1,
            status,
        })
    }

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus)
        if (onChangeStatus) {
            onChangeStatus(training.id, newStatus)
        }
    }

    return (
        <div className="p-4">
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 p-1 mb-6 bg-gray-100/80 rounded-lg">
                    <TabsTrigger
                        value="details"
                        className="py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                    >
                        <Dumbbell className="w-3.5 h-3.5 mr-1.5" />
                        Detalles
                    </TabsTrigger>
                    <TabsTrigger
                        value="status"
                        className="py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                    >
                        <Clock3 className="w-3.5 h-3.5 mr-1.5" />
                        Estado
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Columna izquierda */}
                            <div>
                                {/* Información del Entrenamiento */}
                                <div className="rounded-lg bg-gray-50 p-5 shadow-sm border border-gray-100">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Dumbbell className="h-4 w-4 text-gray-600" />
                                        <h3 className="text-md font-medium">Información del Entrenamiento</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="clientSearch" className="block text-sm font-medium">
                                                Cliente <span className="text-red-500">*</span>
                                            </label>
                                            <div
                                                className="relative"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setShowClientDropdown(true)
                                                }}
                                            >
                                                <User className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
                                                <Input
                                                    id="clientSearch"
                                                    placeholder="Buscar cliente con contrato activo"
                                                    value={clientSearch}
                                                    onChange={(e) => {
                                                        // Marcar que el usuario está editando manualmente
                                                        setIsUserEditing(true)
                                                        // Actualizar el valor del campo de búsqueda con lo que el usuario está escribiendo
                                                        setClientSearch(e.target.value)
                                                        // Mostrar el dropdown de clientes
                                                        setShowClientDropdown(true)

                                                        // Si el usuario borra completamente el campo, limpiar también el ID
                                                        if (e.target.value === "") {
                                                            setClientId("")
                                                        }
                                                    }}
                                                    // Cuando el campo pierde el foco, NO reseteamos isUserEditing
                                                    // para mantener el estado de edición manual y evitar que el efecto
                                                    // sobrescriba lo que el usuario escribió
                                                    className="pl-9 h-9 text-sm border-gray-200"
                                                />
                                                {clientId && (
                                                    <div className="mt-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                                        Cliente seleccionado:{" "}
                                                        <span className="font-medium">
                                                            {(() => {
                                                                const selectedClient = activeClients.find((c) => c.id === clientId)
                                                                return selectedClient ? `${selectedClient.nombre} ${selectedClient.apellido}` : "Cliente no encontrado"
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}
                                                {showClientDropdown && filteredClients.length > 0 && (
                                                    <div className="absolute z-10 mt-1 w-full max-h-28 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                                                        <ul className="py-1">
                                                            {filteredClients.map((c) => (
                                                                <li
                                                                    key={c.id}
                                                                    className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                                                                    onClick={() => {
                                                                        setClientId(c.id)
                                                                        setClientSearch(`${c.nombre} ${c.apellido}`)
                                                                        setShowClientDropdown(false)
                                                                        // Mantenemos isUserEditing en true para evitar que el efecto sobrescriba lo que el usuario seleccionó
                                                                        // No reseteamos isUserEditing aquí
                                                                    }}
                                                                >
                                                                    {`${c.nombre} ${c.apellido}`}
                                                                    <span className="text-xs text-gray-500 ml-1">
                                                                        {c.tipo_documento} {c.numero_documento}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="service" className="block text-sm font-medium">
                                                Servicio <span className="text-red-500">*</span>
                                            </label>
                                            <Select 
                                                value={service} 
                                                onValueChange={setService}
                                                required
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Seleccionar servicio" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Entrenamiento personalizado">Entrenamiento personalizado</SelectItem>
                                                    <SelectItem value="GAP">GAP</SelectItem>
                                                    <SelectItem value="Yoga">Yoga</SelectItem>
                                                    <SelectItem value="Pilates">Pilates</SelectItem>
                                                    <SelectItem value="Crossfit">Crossfit</SelectItem>
                                                    <SelectItem value="Funcional">Funcional</SelectItem>
                                                    <SelectItem value="Zumba">Zumba</SelectItem>
                                                    <SelectItem value="Spinning">Spinning</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna derecha */}
                            <div>
                                {/* Entrenador y Horario */}
                                <div className="rounded-lg bg-gray-50 p-5 shadow-sm border border-gray-100">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-600" />
                                        <h3 className="text-md font-medium">Entrenador y Horario</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="trainer" className="block text-sm font-medium">
                                                Entrenador <span className="text-red-500">*</span>
                                            </label>
                                            <Select value={trainer} onValueChange={setTrainer} required>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Seleccionar entrenador" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {trainers && trainers.length > 0 ? (
                                                        trainers.map((t) => (
                                                            <SelectItem key={t} value={t}>
                                                                {t}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="no_trainers">No hay entrenadores disponibles</SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label htmlFor="date" className="block text-sm font-medium">
                                                Fecha <span className="text-red-500">*</span>
                                            </label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        onSelect={(date) => date && setDate(date)}
                                                        initialFocus
                                                        locale={es}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label htmlFor="startTime" className="block text-sm font-medium">
                                                    Hora inicio <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    id="startTime"
                                                    type="time"
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    required
                                                    className="transition-all hover:border-black focus:border-black"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="endTime" className="block text-sm font-medium">
                                                    Hora fin <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    id="endTime"
                                                    type="time"
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    required
                                                    className="transition-all hover:border-black focus:border-black"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between gap-4 mt-6">
                            <Button type="button" variant="destructive" onClick={onDelete} className="px-6 py-2 text-sm transition-all">
                                Eliminar
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    className="px-6 py-2 text-sm transition-all hover:bg-gray-100"
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-black text-white hover:bg-gray-800 px-6 py-2 text-sm transition-all">
                                    Guardar Cambios
                                </Button>
                            </div>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="status" className="mt-2">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Estado del entrenamiento */}
                            <div className="rounded-lg bg-gray-50 p-4 shadow-sm border border-gray-100">
                                <div className="mb-2 flex items-center gap-2">
                                    <Clock3 className="h-4 w-4 text-gray-600" />
                                    <h3 className="text-sm font-medium">Estado del Entrenamiento</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="pt-1">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            <span>El cambio de estado se aplicará inmediatamente</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                        {statusOptions.map((option) => (
                            <div
                                key={option}
                                className={cn(
                                    "p-2.5 rounded-md border cursor-pointer transition-all text-sm flex items-center justify-center",
                                    status === option
                                        ? option === "Activo"
                                            ? "border-green-500 bg-green-50 text-green-700"
                                            : option === "Pendiente"
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : option === "Completado"
                                                    ? "border-purple-500 bg-purple-50 text-purple-700"
                                                    : "border-red-500 bg-red-50 text-red-700"
                                        : "border-gray-200 hover:border-gray-300 text-gray-700",
                                )}
                                onClick={() => handleStatusChange(option)}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
