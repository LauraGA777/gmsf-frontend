"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/utils"
import { CalendarIcon, Clock, Dumbbell } from "lucide-react"
import type { Training } from "@/types"
import Swal from "sweetalert2"

interface TrainingFormProps {
    onSubmit?: (training: Omit<Training, "id">) => void
    onAddTraining?: (training: Omit<Training, "id">) => void
    onCancel: () => void
    selectedDate?: Date
    trainers: string[]
    services: string[]
    clientsWithActiveContracts: { id: string; name: string }[]
    initialValues?: Partial<Training>
    isCustomService?: boolean
    user?: any
}

export function TrainingForm({
    onAddTraining,
    onSubmit,
    onCancel,
    selectedDate = new Date(),
    trainers,
    services,
    clientsWithActiveContracts = [],
    initialValues,
    isCustomService,
    user,
}: TrainingFormProps) {
    const [clientId, setClientId] = useState(initialValues?.clientId || "")
    const [trainer, setTrainer] = useState(initialValues?.trainer || "")
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredClients, setFilteredClients] = useState(clientsWithActiveContracts)
    // Permitir seleccionar cualquier servicio
    const [service, setService] = useState(initialValues?.service || "")
    const [date, setDate] = useState<Date>(initialValues?.date || selectedDate)
    const [startTime, setStartTime] = useState<string>(
        initialValues?.startTime ? format(new Date(initialValues.startTime), "HH:mm") : "09:00",
    )
    const [endTime, setEndTime] = useState<string>(
        initialValues?.endTime ? format(new Date(initialValues.endTime), "HH:mm") : "10:00",
    )
    // Capacidad máxima (1 para servicios personalizados, configurable para otros)
    const [maxCapacity, setMaxCapacity] = useState<number>(initialValues?.maxCapacity || (isCustomService ? 1 : 10))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validación de campos requeridos
        if (!clientId || !trainer || !service || !date || !startTime || !endTime) {
            Swal.fire({
                icon: "error",
                title: "Campos incompletos",
                text: "Por favor, complete todos los campos requeridos",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                didOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer)
                    toast.addEventListener("mouseleave", Swal.resumeTimer)
                },
            })
            return
        }

        // Usar solo clientes con contratos activos
        const selectedClient = clientsWithActiveContracts.find((c) => c.id === clientId)
        const clientName = selectedClient ? selectedClient.name : ""

        // Crear objetos Date para startTime y endTime
        const [startHour, startMinute] = startTime.split(":").map(Number)
        const [endHour, endMinute] = endTime.split(":").map(Number)

        const startDateTime = new Date(date)
        startDateTime.setHours(startHour, startMinute, 0)

        const endDateTime = new Date(date)
        endDateTime.setHours(endHour, endMinute, 0)

        const trainingData = {
            client: clientName,
            clientId: clientId,
            trainer,
            service,
            date,
            startTime: startDateTime,
            endTime: endDateTime,
            maxCapacity: isCustomService ? 1 : maxCapacity,
            occupiedSpots: initialValues?.occupiedSpots || 0,
            status: initialValues?.status || "Activo",
            trainerId: initialValues?.trainerId,
        }

        // Usar la función de callback apropiada
        if (onSubmit) {
            onSubmit(trainingData)
        } else if (onAddTraining) {
            onAddTraining(trainingData)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div>
                    {/* Información del Entrenamiento */}
                    <div className="rounded-lg bg-gray-50 p-6 mb-6 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <Dumbbell className="h-5 w-5 text-gray-700" />
                            <h3 className="text-md font-medium">Información del Entrenamiento</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="client" className="block text-sm font-medium">
                                    Cliente <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                    <Input
                                        type="text"
                                        placeholder="Buscar cliente por nombre o documento..."
                                        className="w-full transition-all hover:border-black focus:border-black"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            const term = e.target.value
                                            setSearchTerm(term)
                                            // Filtrar clientes en tiempo real
                                            const filtered = clientsWithActiveContracts.filter(
                                                (client) =>
                                                    client.name.toLowerCase().includes(term.toLowerCase()) ||
                                                    client.id.toLowerCase().includes(term.toLowerCase()),
                                            )
                                            setFilteredClients(filtered)
                                            // Si solo hay un cliente que coincide, seleccionarlo automáticamente
                                            if (filtered.length === 1) {
                                                setClientId(filtered[0].id)
                                                setSearchTerm(filtered[0].name) // Mostrar el nombre completo cuando se encuentra una coincidencia
                                            }
                                        }}
                                    />
                                    {clientId ? (
                                        <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                            <p className="text-sm text-gray-700">
                                                Cliente seleccionado: <span className="font-medium">{searchTerm}</span>
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="mt-2 text-sm w-full"
                                                onClick={() => {
                                                    setClientId("")
                                                    setSearchTerm("")
                                                }}
                                            >
                                                Cambiar cliente
                                            </Button>
                                        </div>
                                    ) : (
                                        <Select
                                            value={clientId}
                                            onValueChange={(value) => {
                                                setClientId(value)
                                                const selectedClient = clientsWithActiveContracts.find((c) => c.id === value)
                                                if (selectedClient) {
                                                    setSearchTerm(selectedClient.name)
                                                }
                                            }}
                                            required
                                        >
                                            <SelectTrigger className="w-full transition-all hover:border-black focus:border-black">
                                                <SelectValue placeholder="Seleccionar cliente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredClients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                    {clientsWithActiveContracts.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">No hay clientes con contratos activos disponibles</p>
                                    )}
                                    {clientsWithActiveContracts.length > 0 && filteredClients.length === 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            No se encontraron clientes con ese criterio de búsqueda
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="service" className="block text-sm font-medium">
                                    Servicio <span className="text-red-500">*</span>
                                </label>
                                <Select value={service} onValueChange={setService} required>
                                    <SelectTrigger className="w-full transition-all hover:border-black focus:border-black">
                                        <SelectValue placeholder="Seleccionar servicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {!isCustomService && (
                                <div>
                                    <label htmlFor="maxCapacity" className="block text-sm font-medium">
                                        Capacidad máxima <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="maxCapacity"
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={maxCapacity}
                                        onChange={(e) => setMaxCapacity(Number(e.target.value))}
                                        className="w-full transition-all hover:border-black focus:border-black"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha */}
                <div>
                    {/* Entrenador y Horario */}
                    <div className="rounded-lg bg-gray-50 p-6 mb-6 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-700" />
                            <h3 className="text-md font-medium">Entrenador y Horario</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="trainer" className="block text-sm font-medium">
                                    Entrenador <span className="text-red-500">*</span>
                                </label>
                                <Select value={trainer} onValueChange={setTrainer} required>
                                    <SelectTrigger className="w-full transition-all hover:border-black focus:border-black">
                                        <SelectValue placeholder="Seleccionar entrenador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {trainers.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
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
                                            className={cn(
                                                "w-full justify-start text-left font-normal transition-all hover:border-black focus:border-black",
                                                !date && "text-muted-foreground",
                                            )}
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
                                        className="transition-all hover:border-black focus:border-black"
                                        required
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
                                        className="transition-all hover:border-black focus:border-black"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8 border-t pt-6 px-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="transition-all hover:bg-gray-100 px-6 py-2.5 w-[115%]"
                >
                    Cancelar
                </Button>
                <Button type="submit" className="bg-black text-white transition-all hover:bg-gray-800 px-6 py-2.5 w-[115%]">
                    {initialValues ? "Actualizar Entrenamiento" : "Agendar Entrenamiento"}
                </Button>
            </div>
        </form>
    )
}
