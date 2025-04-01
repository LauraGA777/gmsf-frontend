"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, Dumbbell } from "lucide-react"
import type { Training } from "@/types"

interface TrainingFormProps {
  onAddTraining: (training: Omit<Training, "id">) => void
  onCancel: () => void
  selectedDate?: Date
  trainers: string[]
  services: string[]
  clients: { id: string; name: string }[]
  initialValues?: Partial<Training>
}

export function TrainingForm({
  onAddTraining,
  onCancel,
  selectedDate = new Date(),
  trainers,
  services,
  clients,
  initialValues,
}: TrainingFormProps) {
  const [clientId, setClientId] = useState(initialValues?.clientId || "")
  const [trainer, setTrainer] = useState(initialValues?.trainer || "")
  const [service, setService] = useState(initialValues?.service || "")
  const [date, setDate] = useState<Date>(initialValues?.date || selectedDate)
  const [startTime, setStartTime] = useState<string>(
    initialValues?.startTime ? format(new Date(initialValues.startTime), "HH:mm") : "09:00",
  )
  const [endTime, setEndTime] = useState<string>(
    initialValues?.endTime ? format(new Date(initialValues.endTime), "HH:mm") : "10:00",
  )
  const [maxCapacity, setMaxCapacity] = useState<number>(initialValues?.maxCapacity || 1)
  const [isGroupClass, setIsGroupClass] = useState(initialValues?.maxCapacity ? initialValues.maxCapacity > 1 : false)

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

    onAddTraining({
      client: clientName,
      clientId: clientId,
      trainer,
      service,
      date,
      startTime: startDateTime,
      endTime: endDateTime,
      maxCapacity: isGroupClass ? maxCapacity : 1,
      occupiedSpots: initialValues?.occupiedSpots || 0,
      status: initialValues?.status || "Activo",
      trainerId: initialValues?.trainerId,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Información del Entrenamiento */}
        <div className="rounded-lg bg-gray-50 p-6 transition-all hover:shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-medium">Información del Entrenamiento</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="client" className="block text-sm font-medium">
                Cliente <span className="text-red-500">*</span>
              </label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger className="w-full transition-all hover:border-black focus:border-black">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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
          </div>
        </div>

        {/* Horario */}
        <div className="rounded-lg bg-gray-50 p-6 transition-all hover:shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-700" />
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
                className="transition-all hover:border-black focus:border-black"
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
                className="transition-all hover:border-black focus:border-black"
                required
              />
            </div>
          </div>
        </div>

        {/* Tipo de clase */}
        <div className="rounded-lg bg-gray-50 p-6 transition-all hover:shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <h3 className="text-lg font-medium">Tipo de clase</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isGroupClass"
                checked={isGroupClass}
                onCheckedChange={(checked) => setIsGroupClass(checked === true)}
                className="transition-all data-[state=checked]:bg-black data-[state=checked]:text-white"
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
                  className="transition-all hover:border-black focus:border-black"
                  required={isGroupClass}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} className="transition-all hover:bg-gray-100">
          Cancelar
        </Button>
        <Button type="submit" className="bg-black text-white transition-all hover:bg-gray-800">
          {initialValues ? "Actualizar Entrenamiento" : "Agendar Entrenamiento"}
        </Button>
      </div>
    </form>
  )
}

