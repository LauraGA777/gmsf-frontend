"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CalendarIcon, Clock, Users, Dumbbell, User, UserCheck } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/utils"
import { es } from "date-fns/locale"
import type { Training } from "@/types"
import { MOCK_CLIENTS } from "@/data/mockData"

interface CompactTrainingFormProps {
    onAddTraining: (training: Omit<Training, "id">) => void
    selectedDate: Date | null
    onCancel?: () => void
    initialData?: Training
    isEditing?: boolean
}

export function CompactTrainingForm({
    onAddTraining,
    selectedDate,
    onCancel,
    initialData,
    isEditing = false,
}: CompactTrainingFormProps) {
    const [client, setClient] = useState<string>(initialData?.client || "")
    const [clientSearch, setClientSearch] = useState<string>("")
    const [showClientDropdown, setShowClientDropdown] = useState<boolean>(false)
    const [trainer, setTrainer] = useState<string>(initialData?.trainer || "")
    const [service, setService] = useState<string>(initialData?.service || "")
    const [date, setDate] = useState<Date | undefined>(initialData?.date ? new Date(initialData.date) : undefined)
    const [startTime, setStartTime] = useState<string>(
        initialData?.startTime ? format(new Date(initialData.startTime), "HH:mm") : "10:00",
    )
    const [endTime, setEndTime] = useState<string>(
        initialData?.endTime ? format(new Date(initialData.endTime), "HH:mm") : "11:00",
    )
    const [maxCapacity, setMaxCapacity] = useState<number>(initialData?.maxCapacity || 10)
    const [status, setStatus] = useState<string>(initialData?.status || "Activo")
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Trainers and services data
    const trainers: string[] = ["Carlos Ruiz", "Ana Gómez", "Miguel Sánchez", "Laura Martínez"]
    const services: string[] = ["Entrenamiento personal", "Yoga", "Pilates", "Crossfit", "Funcional"]

    // Filtrar clientes con contratos activos
    const activeClients = useMemo(() => {
        return MOCK_CLIENTS.filter(
            (client) => client.status === "Activo" && client.membershipEndDate && client.membershipEndDate > new Date(),
        )
    }, [])

    // Clientes filtrados por búsqueda
    const filteredClients = useMemo(() => {
        if (!clientSearch) return activeClients
        return activeClients.filter(
            (c) =>
                c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                (c.documentNumber && c.documentNumber.includes(clientSearch)),
        )
    }, [activeClients, clientSearch])

    useEffect(() => {
        if (selectedDate && !initialData) {
            setDate(selectedDate)
        }
    }, [selectedDate, initialData])

    // Cerrar el dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = () => {
            setShowClientDropdown(false)
        }

        document.addEventListener("click", handleClickOutside)
        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validación básica
        const newErrors: Record<string, string> = {}

        if (!client) newErrors.client = "Seleccione un cliente"
        if (!trainer) newErrors.trainer = "Seleccione un entrenador"
        if (!service) newErrors.service = "Seleccione un servicio"
        if (!date) newErrors.date = "Seleccione una fecha"
        if (!startTime) newErrors.startTime = "Seleccione hora de inicio"
        if (!endTime) newErrors.endTime = "Seleccione hora de fin"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Create datetime from date and time
        const [startHours, startMinutes] = startTime.split(":").map(Number)
        const [endHours, endMinutes] = endTime.split(":").map(Number)

        const trainingDate = new Date(date!)
        const startDateTime = new Date(trainingDate)
        startDateTime.setHours(startHours, startMinutes)

        const endDateTime = new Date(trainingDate)
        endDateTime.setHours(endHours, endMinutes)

        const newTraining: Omit<Training, "id"> = {
            client,
            trainer,
            service,
            date: trainingDate,
            startTime: startDateTime,
            endTime: endDateTime,
            maxCapacity,
            occupiedSpots: initialData?.occupiedSpots || 0,
            status,
            clientId: initialData?.clientId,
            trainerId: initialData?.trainerId,
        }

        onAddTraining(newTraining)
        setErrors({})
    }

    const handleClientSearchClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowClientDropdown(true)
    }

    const handleClientSelect = (clientName: string) => {
        setClient(clientName)
        setClientSearch("")
        setShowClientDropdown(false)
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Columna izquierda */}
            <div className="space-y-3">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-semibold border-b pb-1 mb-2">Información del Entrenamiento</h3>

                    {/* Cliente con búsqueda */}
                    <div className="space-y-1 mb-3">
                        <Label htmlFor="clientSearch" className="flex items-center gap-1.5 text-gray-700 text-xs">
                            <User className="h-3.5 w-3.5 text-gray-500" />
                            Cliente
                        </Label>
                        <div className="relative" onClick={handleClientSearchClick}>
                            <User className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
                            <Input
                                id="clientSearch"
                                placeholder="Buscar cliente con contrato activo"
                                value={clientSearch}
                                onChange={(e) => {
                                    setClientSearch(e.target.value)
                                    setShowClientDropdown(true)
                                }}
                                className={cn("pl-9 h-9 text-sm border-gray-200", errors.client ? "border-red-300" : "")}
                            />
                            {client && (
                                <div className="mt-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                    Cliente seleccionado: <span className="font-medium">{client}</span>
                                </div>
                            )}
                            {showClientDropdown && filteredClients.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full max-h-28 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg">
                                    <ul className="py-1">
                                        {filteredClients.map((c) => (
                                            <li
                                                key={c.id}
                                                className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                                                onClick={() => handleClientSelect(c.name)}
                                            >
                                                {c.name}
                                                <span className="text-xs text-gray-500 ml-1">
                                                    {c.documentType} {c.documentNumber}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {errors.client && <p className="text-red-500 text-xs">{errors.client}</p>}
                    </div>

                    {/* Entrenador */}
                    <div className="space-y-1 mb-3">
                        <Label htmlFor="trainer" className="flex items-center gap-1.5 text-gray-700 text-xs">
                            <UserCheck className="h-3.5 w-3.5 text-gray-500" />
                            Entrenador
                        </Label>
                        <Select value={trainer} onValueChange={setTrainer}>
                            <SelectTrigger
                                id="trainer"
                                className={cn("h-9 text-sm border-gray-200", errors.trainer ? "border-red-300" : "")}
                            >
                                <SelectValue placeholder="Seleccionar entrenador" />
                            </SelectTrigger>
                            <SelectContent>
                                {trainers.map((trainer) => (
                                    <SelectItem key={trainer} value={trainer}>
                                        {trainer}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.trainer && <p className="text-red-500 text-xs">{errors.trainer}</p>}
                    </div>

                    {/* Servicio */}
                    <div className="space-y-1">
                        <Label htmlFor="service" className="flex items-center gap-1.5 text-gray-700 text-xs">
                            <Dumbbell className="h-3.5 w-3.5 text-gray-500" />
                            Tipo de Servicio
                        </Label>
                        <Select value={service} onValueChange={setService}>
                            <SelectTrigger
                                id="service"
                                className={cn("h-9 text-sm border-gray-200", errors.service ? "border-red-300" : "")}
                            >
                                <SelectValue placeholder="Seleccionar servicio" />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((service) => (
                                    <SelectItem key={service} value={service}>
                                        {service}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.service && <p className="text-red-500 text-xs">{errors.service}</p>}
                    </div>
                </div>

                {/* Resumen */}
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-xs text-blue-700">
                    <h4 className="font-medium mb-1">Resumen del entrenamiento</h4>
                    <ul className="space-y-0.5">
                        <li>
                            <strong>Cliente:</strong> {client || "No seleccionado"}
                        </li>
                        <li>
                            <strong>Entrenador:</strong> {trainer || "No seleccionado"}
                        </li>
                        <li>
                            <strong>Servicio:</strong> {service || "No seleccionado"}
                        </li>
                        <li>
                            <strong>Fecha:</strong> {date ? format(date, "dd/MM/yyyy") : "No seleccionada"}
                        </li>
                        <li>
                            <strong>Horario:</strong> {startTime} - {endTime}
                        </li>
                        <li>
                            <strong>Cupo máximo:</strong> {maxCapacity} personas
                        </li>
                    </ul>
                </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <h3 className="text-sm font-semibold border-b pb-1 mb-2">Horario y Capacidad</h3>

                    {/* Fecha */}
                    <div className="space-y-1 mb-3">
                        <Label htmlFor="date" className="flex items-center gap-1.5 text-gray-700 text-xs">
                            <CalendarIcon className="h-3.5 w-3.5 text-gray-500" />
                            Fecha
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-9 text-sm border-gray-200",
                                        !date && "text-muted-foreground",
                                        errors.date ? "border-red-300" : "",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                    {date ? format(date, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(date) => date && setDate(date)}
                                    initialFocus
                                    locale={es}
                                    className="rounded-md border"
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                    </div>

                    {/* Hora inicio */}
                    <div className="space-y-1 mb-3">
                        <Label htmlFor="startTime" className="flex items-center gap-1.5 text-gray-700 text-xs">
                            <Clock className="h-3.5 w-3.5 text-gray-500" />
                            Hora de inicio
                        </Label>
                        <div className="grid grid-cols-3 gap-1 mb-1">
                            {["08:00", "10:00", "14:00"].map((time) => (
                                <Button
                                    key={time}
                                    type="button"
                                    variant={startTime === time ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        setStartTime(time)
                                        // Establecer hora de fin una hora después
                                        const [hours, minutes] = time.split(":").map(Number)
                                        const startDate = new Date()
                                        startDate.setHours(hours, minutes)
                                        const endDate = new Date(startDate)
                                        endDate.setHours(endDate.getHours() + 1)
                                        setEndTime(format(endDate, "HH:mm"))
                                    }}
                                    className={cn("h-7 text-xs", startTime === time ? "bg-black hover:bg-gray-800" : "border-gray-200")}
                                >
                                    {time}
                                </Button>
                            ))}
                        </div>
                        <div className="relative">
                            <Clock className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className={cn("pl-9 h-9 text-sm border-gray-200", errors.startTime ? "border-red-300" : "")}
                            />
                        </div>
                        {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime}</p>}
                    </div>

                    {/* Hora fin */}
                    <div className="space-y-1 mb-3">
                        <Label htmlFor="endTime" className="flex items-center gap-1.5 text-gray-700 text-xs">
                            <Clock className="h-3.5 w-3.5 text-gray-500" />
                            Hora de finalización
                        </Label>
                        <div className="grid grid-cols-3 gap-1 mb-1">
                            {["09:00", "11:00", "15:00"].map((time) => (
                                <Button
                                    key={time}
                                    type="button"
                                    variant={endTime === time ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setEndTime(time)}
                                    className={cn("h-7 text-xs", endTime === time ? "bg-black hover:bg-gray-800" : "border-gray-200")}
                                >
                                    {time}
                                </Button>
                            ))}
                        </div>
                        <div className="relative">
                            <Clock className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
                            <Input
                                id="endTime"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className={cn("pl-9 h-9 text-sm border-gray-200", errors.endTime ? "border-red-300" : "")}
                            />
                        </div>
                        {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime}</p>}
                    </div>

                    {/* Cupo máximo */}
                    <div className="space-y-1">
                        <Label htmlFor="maxCapacity" className="flex items-center gap-1.5 text-gray-700 text-xs">
                            <Users className="h-3.5 w-3.5 text-gray-500" />
                            Cupo máximo
                        </Label>
                        <div className="grid grid-cols-4 gap-1 mb-1">
                            {[1, 5, 10, 15].map((num) => (
                                <Button
                                    key={num}
                                    type="button"
                                    variant={maxCapacity === num ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setMaxCapacity(num)}
                                    className={cn("h-7 text-xs", maxCapacity === num ? "bg-black hover:bg-gray-800" : "border-gray-200")}
                                >
                                    {num}
                                </Button>
                            ))}
                        </div>
                        <div className="relative">
                            <Users className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
                            <Input
                                id="maxCapacity"
                                type="number"
                                min="1"
                                max={50}
                                value={maxCapacity}
                                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                                className="pl-9 h-9 text-sm border-gray-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="col-span-2 flex justify-end gap-4 mt-6">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="text-sm h-10 px-5 transition-all hover:bg-gray-100"
                        >
                            Cancelar
                        </Button>
                    )}

                    <Button type="submit" className="bg-black text-white hover:bg-gray-800 text-sm h-10 px-5 transition-all">
                        {isEditing ? "Actualizar" : "Agendar"}
                    </Button>
                </div>
            </div>
        </form>
    )
}
