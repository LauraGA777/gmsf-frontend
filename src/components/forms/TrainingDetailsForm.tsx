"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, Dumbbell, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Training } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TrainingDetailsFormProps {
    training: Training
    onSave: (id: number, updatedTraining: Partial<Training>) => void
    onDelete: () => void
    onCancel: () => void
    onChangeStatus?: (id: number, status: string) => void
    trainers: string[]
    services: string[]
    clients: { id: string; name: string }[]
}

export function TrainingDetailsForm({
    training,
    onSave,
    onDelete,
    onCancel,
    onChangeStatus,
    trainers,
    services,
    clients,
}: TrainingDetailsFormProps) {
    const [clientId, setClientId] = useState(training.clientId || "")
    const [trainer, setTrainer] = useState(training.trainer || "")
    const [service, setService] = useState(training.service || "")
    const [date, setDate] = useState<Date>(training.date ? new Date(training.date) : new Date())
    const [startTime, setStartTime] = useState<string>(
        training.startTime ? format(new Date(training.startTime), "HH:mm") : "09:00",
    )
    const [endTime, setEndTime] = useState<string>(
        training.endTime ? format(new Date(training.endTime), "HH:mm") : "10:00",
    )
    const [maxCapacity, setMaxCapacity] = useState<number>(training.maxCapacity || 1)
    const [isGroupClass, setIsGroupClass] = useState(training.maxCapacity ? training.maxCapacity > 1 : false)
    const [status, setStatus] = useState(training.status || "Activo")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Encontrar el nombre del cliente seleccionado
        const selectedClient = clients.find((c) => c.id === clientId)
        const clientName = selectedClient ? selectedClient.name : ""

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
            service,
            date,
            startTime: startDateTime,
            endTime: endDateTime,
            maxCapacity: isGroupClass ? maxCapacity : 1,
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
        <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="status">Estado</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Información del Entrenamiento */}
                        <div className="rounded-lg bg-gray-50 p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Dumbbell className="h-5 w-5" />
                                <h3 className="text-lg font-medium">Información del Entrenamiento</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="client" className="block text-sm font-medium">
                                        Cliente <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={clientId} onValueChange={setClientId} required>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="trainer" className="block text-sm font-medium">
                                        Entrenador <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={trainer} onValueChange={setTrainer} required>
                                        <SelectTrigger className="w-full">
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

                                <div className="space-y-2">
                                    <label htmlFor="service" className="block text-sm font-medium">
                                        Servicio <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={service} onValueChange={setService} required>
                                        <SelectTrigger className="w-full">
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

                                <div className="space-y-2">
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
                            </div>
                        </div>

                        {/* Horario */}
                        <div className="rounded-lg bg-gray-50 p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                <h3 className="text-lg font-medium">Horario</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="startTime" className="block text-sm font-medium">
                                        Hora de inicio <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="endTime" className="block text-sm font-medium">
                                        Hora de fin <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tipo de clase */}
                        <div className="rounded-lg bg-gray-50 p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <h3 className="text-lg font-medium">Tipo de clase</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isGroupClass"
                                        checked={isGroupClass}
                                        onCheckedChange={(checked) => setIsGroupClass(checked === true)}
                                    />
                                    <label
                                        htmlFor="isGroupClass"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        ¿Es una clase grupal?
                                    </label>
                                </div>

                                {isGroupClass && (
                                    <div className="space-y-2">
                                        <label htmlFor="maxCapacity" className="block text-sm font-medium">
                                            Capacidad máxima <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="maxCapacity"
                                            type="number"
                                            min="2"
                                            value={maxCapacity}
                                            onChange={(e) => setMaxCapacity(Number.parseInt(e.target.value))}
                                            required={isGroupClass}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button type="button" variant="destructive" onClick={onDelete}>
                            Eliminar
                        </Button>
                        <div className="space-x-2">
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </form>
            </TabsContent>

            <TabsContent value="status">
                <Card>
                    <CardHeader>
                        <CardTitle>Estado del Entrenamiento</CardTitle>
                        <CardDescription>Cambia el estado del entrenamiento según su situación actual</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${status === "Activo" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                                }`}
                            onClick={() => handleStatusChange("Activo")}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center ${status === "Activo" ? "bg-green-500" : "border-2 border-gray-300"
                                        }`}
                                >
                                    {status === "Activo" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                                    <span className="text-sm font-medium">- Entrenamiento programado y confirmado</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${status === "Pendiente" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                                }`}
                            onClick={() => handleStatusChange("Pendiente")}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center ${status === "Pendiente" ? "bg-blue-500" : "border-2 border-gray-300"
                                        }`}
                                >
                                    {status === "Pendiente" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pendiente</Badge>
                                    <span className="text-sm font-medium">- Esperando confirmación</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${status === "Completado" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"
                                }`}
                            onClick={() => handleStatusChange("Completado")}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center ${status === "Completado" ? "bg-purple-500" : "border-2 border-gray-300"
                                        }`}
                                >
                                    {status === "Completado" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completado</Badge>
                                    <span className="text-sm font-medium">- Entrenamiento realizado</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${status === "Cancelado" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300"
                                }`}
                            onClick={() => handleStatusChange("Cancelado")}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-4 h-4 rounded-full flex items-center justify-center ${status === "Cancelado" ? "bg-red-500" : "border-2 border-gray-300"
                                        }`}
                                >
                                    {status === "Cancelado" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>
                                    <span className="text-sm font-medium">- Entrenamiento cancelado</span>
                                </div>
                            </div>
                        </div>

                        {status === "Cancelado" && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-red-800">Atención</h4>
                                        <p className="text-sm text-red-600">
                                            Al cancelar un entrenamiento, se notificará automáticamente al cliente y al entrenador. Esta
                                            acción no puede deshacerse.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button className="bg-black text-white hover:bg-gray-800" onClick={() => onSave(training.id, { status })}>
                            Guardar Cambios
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

