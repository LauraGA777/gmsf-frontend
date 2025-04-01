"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Clock, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Schedule, Trainer } from "@/types"
import { useAuth } from "@/context/AuthContext"

// Servicios disponibles
const SERVICES = [
  { id: 1, name: "Entrenamiento personal" },
  { id: 2, name: "Yoga" },
  { id: 3, name: "Pilates" },
  { id: 4, name: "Crossfit" },
  { id: 5, name: "Funcional" },
]

interface TrainerScheduleFormProps {
  onAddSchedule: (schedule: Omit<Schedule, "id" | "fecha_registro">) => void
  selectedDate: Date
  onCancel?: () => void
  initialData?: Schedule
  isEditing?: boolean
  trainers: Trainer[]
  selectedTrainer: string | null
}

export function TrainerScheduleForm({
  onAddSchedule,
  selectedDate,
  onCancel,
  initialData,
  isEditing = false,
  trainers,
  selectedTrainer,
}: TrainerScheduleFormProps) {
  const { user } = useAuth()
  const [trainerId, setTrainerId] = useState<string>(
    initialData ? initialData.id_entrenador.toString() : selectedTrainer || "",
  )
  const [serviceId, setServiceId] = useState<string>(initialData ? initialData.id_servicio.toString() : "1")
  const [date, setDate] = useState<Date>(initialData ? new Date(initialData.fecha) : selectedDate)
  const [startTime, setStartTime] = useState<string>(
    initialData ? format(new Date(initialData.hora_inicio), "HH:mm") : "10:00",
  )
  const [endTime, setEndTime] = useState<string>(
    initialData ? format(new Date(initialData.hora_fin), "HH:mm") : "11:00",
  )
  const [maxCapacity, setMaxCapacity] = useState<number>(initialData?.cupo_maximo || 10)
  const [occupiedSpots, setOccupiedSpots] = useState<number>(initialData?.cupos_ocupados || 0)
  const [status, setStatus] = useState<string>(initialData?.estado || "Activo")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [clientName, setClientName] = useState<string>("")

  // Si el usuario es entrenador, establecer automáticamente su ID
  useEffect(() => {
    if (user?.role === "trainer" && user.trainerId) {
      setTrainerId(user.trainerId)
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    const newErrors: Record<string, string> = {}

    if (!trainerId) newErrors.trainerId = "Seleccione un entrenador"
    if (!serviceId) newErrors.serviceId = "Seleccione un servicio"
    if (!startTime) newErrors.startTime = "Seleccione hora de inicio"
    if (!endTime) newErrors.endTime = "Seleccione hora de fin"
    if (maxCapacity <= 0) newErrors.maxCapacity = "El cupo máximo debe ser mayor a 0"
    if (occupiedSpots > maxCapacity) newErrors.occupiedSpots = "Los cupos ocupados no pueden exceder el máximo"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Create datetime from date and time
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    const startDateTime = new Date(date)
    startDateTime.setHours(startHours, startMinutes)

    const endDateTime = new Date(date)
    endDateTime.setHours(endHours, endMinutes)

    // Obtener nombres para mostrar en la UI
    const selectedTrainerObj = trainers.find((t) => t.id === trainerId)
    const selectedService = SERVICES.find((s) => s.id.toString() === serviceId)

    const newSchedule: Omit<Schedule, "id" | "fecha_registro"> = {
      id_entrenador: Number(trainerId),
      id_servicio: Number(serviceId),
      fecha: date,
      hora_inicio: startDateTime,
      hora_fin: endDateTime,
      cupo_maximo: maxCapacity,
      cupos_ocupados: occupiedSpots,
      estado: status as "Activo" | "Cancelado",
      entrenador_nombre: selectedTrainerObj?.name || `Entrenador ${trainerId}`,
      servicio_nombre: selectedService?.name || `Servicio ${serviceId}`,
      codigo: initialData?.codigo || "",
      fecha_actualizacion: new Date(),
    }

    onAddSchedule(newSchedule)
    setErrors({})
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

  // Opciones de cupo máximo predefinidas
  const capacityOptions = [
    { label: "1", value: 1 },
    { label: "5", value: 5 },
    { label: "10", value: 10 },
    { label: "15", value: 15 },
  ]

  // Obtener el nombre del entrenador seleccionado
  const selectedTrainerName = trainers.find((t) => t.id === trainerId)?.name || "No seleccionado"

  // Obtener el nombre del servicio seleccionado
  const selectedServiceName = SERVICES.find((s) => s.id.toString() === serviceId)?.name || "No seleccionado"

  return (
    <div className="grid grid-cols-2 gap-0">
      {/* Columna izquierda: Información del Entrenamiento */}
      <div className="p-4 border-r">
        <h3 className="font-medium text-gray-700 mb-4">Información del Entrenamiento</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="client">
              <User className="h-4 w-4 text-gray-500" />
              Cliente
            </Label>
            <Input
              id="client"
              placeholder="Buscar cliente con contrato activo"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="trainer">
              <User className="h-4 w-4 text-gray-500" />
              Entrenador
            </Label>
            <Select value={trainerId} onValueChange={setTrainerId} disabled={user?.role === "trainer"}>
              <SelectTrigger id="trainer" className={cn(errors.trainerId ? "border-red-300" : "")}>
                <SelectValue placeholder="Seleccionar entrenador" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.trainerId && <p className="text-red-500 text-xs">{errors.trainerId}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="service">
              <Clock className="h-4 w-4 text-gray-500" />
              Tipo de Servicio
            </Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger id="service" className={cn(errors.serviceId ? "border-red-300" : "")}>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && <p className="text-red-500 text-xs">{errors.serviceId}</p>}
          </div>
        </div>

        {/* Resumen del entrenamiento */}
        <Card className="mt-4 bg-blue-50 border-blue-100">
          <CardContent className="p-4 text-sm text-blue-800">
            <h4 className="font-medium mb-2">Resumen del entrenamiento</h4>
            <div className="space-y-1">
              <p>
                <span className="font-medium">Cliente:</span> {clientName || "No seleccionado"}
              </p>
              <p>
                <span className="font-medium">Entrenador:</span> {selectedTrainerName}
              </p>
              <p>
                <span className="font-medium">Servicio:</span> {selectedServiceName}
              </p>
              <p>
                <span className="font-medium">Fecha:</span> {format(date, "dd/MM/yyyy")}
              </p>
              <p>
                <span className="font-medium">Horario:</span> {startTime} - {endTime}
              </p>
              <p>
                <span className="font-medium">Cupo máximo:</span> {maxCapacity} personas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna derecha: Horario y Capacidad */}
      <div className="p-4">
        <h3 className="font-medium text-gray-700 mb-4">Horario y Capacidad</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="date">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", errors.date ? "border-red-300" : "")}
                  id="date"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "dd/MM/yyyy", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => setDate(newDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="start-time">
              <Clock className="h-4 w-4 text-gray-500" />
              Hora de inicio
            </Label>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {timeOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={startTime === option.value ? "default" : "outline"}
                    className={startTime === option.value ? "bg-black text-white" : ""}
                    onClick={() => setStartTime(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={cn(errors.startTime ? "border-red-300" : "")}
              />
            </div>
            {errors.startTime && <p className="text-red-500 text-xs">{errors.startTime}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="end-time">
              <Clock className="h-4 w-4 text-gray-500" />
              Hora de finalización
            </Label>
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
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={cn(errors.endTime ? "border-red-300" : "")}
              />
            </div>
            {errors.endTime && <p className="text-red-500 text-xs">{errors.endTime}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="max-capacity">
              <Users className="h-4 w-4 text-gray-500" />
              Cupo máximo
            </Label>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {capacityOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={maxCapacity === option.value ? "default" : "outline"}
                    className={maxCapacity === option.value ? "bg-black text-white" : ""}
                    onClick={() => setMaxCapacity(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <Input
                id="max-capacity"
                type="number"
                min="1"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number.parseInt(e.target.value))}
                className={cn(errors.maxCapacity ? "border-red-300" : "")}
              />
            </div>
            {errors.maxCapacity && <p className="text-red-500 text-xs">{errors.maxCapacity}</p>}
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="col-span-2 flex justify-end gap-2 p-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} className="bg-black hover:bg-gray-800 text-white">
          {isEditing ? "Guardar cambios" : "Agendar Entrenamiento"}
        </Button>
      </div>
    </div>
  )
}

