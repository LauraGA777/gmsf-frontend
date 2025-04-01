"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PersonalizedService } from "@/types"
import { useAuth } from "@/context/AuthContext"
import { ClientSearch } from "@/components/search/ClientSearch"

interface PersonalizedServiceFormProps {
    onAddService: (service: Omit<PersonalizedService, "id">) => void
    selectedDate: Date
    onCancel?: () => void
    initialData?: PersonalizedService
    isEditing?: boolean
    trainers: string[]
}

export function PersonalizedServiceForm({
    onAddService,
    selectedDate,
    onCancel,
    initialData,
    isEditing = false,
    trainers,
}: PersonalizedServiceFormProps) {
    const { user } = useAuth()

    // Estado para el formulario
    const [clientId, setClientId] = useState<number>(initialData?.id_cliente || 0)
    const [clientName, setClientName] = useState<string>(initialData?.cliente_nombre || "")

    const [trainerId, setTrainerId] = useState<number>(
        initialData?.id_entrenador || (user?.role === "trainer" && user.trainerId ? Number.parseInt(user.trainerId) : 0),
    )
    const [trainerName, setTrainerName] = useState<string>(initialData?.entrenador_nombre || "")

    const [date, setDate] = useState<Date>(initialData?.fecha || selectedDate)
    const [startTime, setStartTime] = useState<string>(
        initialData?.hora_inicio ? format(new Date(initialData.hora_inicio), "HH:mm") : "10:00",
    )
    const [endTime, setEndTime] = useState<string>(
        initialData?.hora_fin ? format(new Date(initialData.hora_fin), "HH:mm") : "11:00",
    )

    const [status, setStatus] = useState<"Completo" | "Disponible" | "Cancelado">(initialData?.estado || "Disponible")

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Mapear trainers a objetos con id y nombre
    const trainerOptions = trainers.map((name, index) => ({
        id: index + 1,
        name,
    }))

    // Actualizar el nombre del entrenador cuando cambia el id
    useEffect(() => {
        if (trainerId) {
            const trainer = trainerOptions.find((t) => t.id === trainerId)
            if (trainer) {
                setTrainerName(trainer.name)
            }
        }
    }, [trainerId, trainerOptions])

    // Si el usuario es cliente, establecer automáticamente su ID
    useEffect(() => {
        if (user?.role === "client" && user.clientId) {
            // Buscar el cliente en los datos mock (en una aplicación real, esto sería una llamada a la API)
            // y establecer su ID y nombre
            setClientId(Number.parseInt(user.clientId))
            // El nombre del cliente se establecería aquí
        }
    }, [user])

    const handleClientSelect = (name: string, id: number) => {
        setClientId(id)
        setClientName(name)
        setErrors({ ...errors, clientId: "" })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validación básica
        const newErrors: Record<string, string> = {}

        if (!clientId) newErrors.clientId = "Seleccione un cliente"
        if (!trainerId) newErrors.trainerId = "Seleccione un entrenador"
        if (!date) newErrors.date = "Seleccione una fecha"
        if (!startTime) newErrors.startTime = "Seleccione hora de inicio"
        if (!endTime) newErrors.endTime = "Seleccione hora de fin"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Crear fechas completas con hora
        const [startHours, startMinutes] = startTime.split(":").map(Number)
        const [endHours, endMinutes] = endTime.split(":").map(Number)

        const startDateTime = new Date(date)
        startDateTime.setHours(startHours, startMinutes)

        const endDateTime = new Date(date)
        endDateTime.setHours(endHours, endMinutes)

        // Crear el nuevo servicio personalizado
        const newService: Omit<PersonalizedService, "id"> = {
            id_servicio: 1, // ID fijo para "Entrenamiento personalizado"
            id_entrenador: trainerId,
            id_cliente: clientId,
            fecha: date,
            hora_inicio: startDateTime,
            hora_fin: endDateTime,
            estado: status,
            servicio_nombre: "Entrenamiento personalizado", // Siempre "Entrenamiento personalizado"
            entrenador_nombre: trainerName,
            cliente_nombre: clientName,
            fecha_registro: new Date(),
            fecha_actualizacion: new Date(),
        }

        onAddService(newService)
    }

    // Opciones de hora predefinidas
    const timeOptions = [
        { label: "08:00", value: "08:00" },
        { label: "10:00", value: "10:00" },
        { label: "14:00", value: "14:00" },
    ]

    // Opciones de hora fin predefinidas
    const endTimeOptions = [
        { label: "09:00", value: "09:00" },
        { label: "11:00", value: "11:00" },
        { label: "15:00", value: "15:00" },
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="client">Cliente</Label>
                        <ClientSearch
                            onSelectClient={handleClientSelect}
                            selectedClient={clientName}
                            error={!!errors.clientId}
                            disabled={user?.role === "client"}
                        />
                        {errors.clientId && <p className="text-red-500 text-xs">{errors.clientId}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="trainer">Entrenador</Label>
                        <Select
                            value={trainerId.toString()}
                            onValueChange={(value) => setTrainerId(Number.parseInt(value))}
                            disabled={user?.role === "trainer"}
                        >
                            <SelectTrigger id="trainer" className={cn(errors.trainerId ? "border-red-300" : "")}>
                                <SelectValue placeholder="Seleccionar entrenador" />
                            </SelectTrigger>
                            <SelectContent>
                                {trainerOptions.map((trainer) => (
                                    <SelectItem key={trainer.id} value={trainer.id.toString()}>
                                        {trainer.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.trainerId && <p className="text-red-500 text-xs">{errors.trainerId}</p>}
                    </div>

                    {/* Campo de servicio - Siempre "Entrenamiento personalizado" */}
                    <div className="space-y-2">
                        <Label htmlFor="service">Tipo de Servicio</Label>
                        <Input id="service" value="Entrenamiento personalizado" disabled className="bg-gray-100" />
                        <p className="text-xs text-gray-500">Los servicios personalizados son entrenamientos uno a uno</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value as "Completo" | "Disponible" | "Cancelado")}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Disponible">Disponible</SelectItem>
                                <SelectItem value="Completo">Completo</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn("w-full justify-start text-left font-normal", errors.date ? "border-red-300" : "")}
                                    id="date"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "dd/MM/yyyy", { locale: es }) : <span>Seleccionar fecha</span>}
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
                        {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startTime">Hora de inicio</Label>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                                {timeOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={startTime === option.value ? "default" : "outline"}
                                        className={startTime === option.value ? "bg-black text-white" : ""}
                                        onClick={() => {
                                            setStartTime(option.value)
                                            // Establecer hora de fin una hora después
                                            const [hours, minutes] = option.value.split(":").map(Number)
                                            const startDate = new Date()
                                            startDate.setHours(hours, minutes)
                                            const endDate = new Date(startDate)
                                            endDate.setHours(endDate.getHours() + 1)
                                            setEndTime(format(endDate, "HH:mm"))
                                        }}
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </div>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className={cn(errors.startTime ? "border-red-300" : "")}
                            />
                        </div>
                        {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endTime">Hora de finalización</Label>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                                {endTimeOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={endTime === option.value ? "default" : "outline"}
                                        className={endTime === option.value ? "bg-black text-white" : ""}
                                        onClick={() => setEndTime(option.value)}
                                    >
                                        {option.label}
                                    </Button>
                                ))}
                            </div>
                            <Input
                                id="endTime"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className={cn(errors.endTime ? "border-red-300" : "")}
                            />
                        </div>
                        {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime}</p>}
                    </div>

                    {/* Capacidad máxima - Siempre 1 para servicios personalizados */}
                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacidad máxima</Label>
                        <Input id="capacity" type="number" value="1" disabled className="bg-gray-100" />
                        <p className="text-xs text-gray-500">Los servicios personalizados tienen capacidad para 1 cliente</p>
                    </div>
                </div>
            </div>

            {/* Resumen del servicio */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 text-sm text-blue-700">
                <h4 className="font-medium mb-2">Resumen del servicio personalizado</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <p>
                            <strong>Cliente:</strong> {clientName || "No seleccionado"}
                        </p>
                        <p>
                            <strong>Entrenador:</strong> {trainerName || "No seleccionado"}
                        </p>
                        <p>
                            <strong>Servicio:</strong> Entrenamiento personalizado
                        </p>
                    </div>
                    <div>
                        <p>
                            <strong>Fecha:</strong> {date ? format(date, "dd/MM/yyyy") : "No seleccionada"}
                        </p>
                        <p>
                            <strong>Horario:</strong> {startTime} - {endTime}
                        </p>
                        <p>
                            <strong>Estado:</strong> {status}
                        </p>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white">
                    {isEditing ? "Guardar cambios" : "Agendar Servicio Personalizado"}
                </Button>
            </div>
        </form>
    )
}

