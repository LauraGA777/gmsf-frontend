"use client"

import { useState } from "react"
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Training } from "@/types"
import { useAuth } from "@/context/AuthContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CustomCalendarViewProps {
    trainings: Training[]
    onSelectDate: (date: Date) => void
    onAddTraining?: () => void
    onDeleteTraining?: (id: number) => void
    onEditTraining?: (id: number, updatedTraining: Partial<Training>) => void
    selectedDate: Date
    onTrainingClick?: (training: Training) => void
}

export function CustomCalendarView({
    trainings,
    onSelectDate,
    onAddTraining,
    onDeleteTraining,
    onEditTraining,
    selectedDate,
    onTrainingClick,
}: CustomCalendarViewProps) {
    const { user } = useAuth()
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()))
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTrainer, setSelectedTrainer] = useState<string>("all")
    const [selectedService, setSelectedService] = useState<string>("all")

    // Determinar si el usuario puede agregar entrenamientos
    const canAddTrainings = user?.role === "admin" || user?.role === "trainer"

    // Obtener días del mes actual
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    })

    // Nombres de los días de la semana
    const weekDays = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]

    // Navegar al mes anterior
    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    // Navegar al mes siguiente
    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    // Navegar al día actual
    const goToToday = () => {
        const today = new Date()
        setCurrentMonth(startOfMonth(today))
        onSelectDate(today)
    }

    // Verificar si un día tiene entrenamientos
    const hasTrainings = (day: Date) => {
        return trainings.some((training) => isSameDay(new Date(training.date), day))
    }

    // Filtrar entrenamientos por búsqueda y filtros
    const filteredTrainings = trainings.filter((training) => {
        // Filtrar por búsqueda
        const matchesSearch =
            !searchQuery ||
            training.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            training.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            training.service.toLowerCase().includes(searchQuery.toLowerCase())

        // Filtrar por entrenador
        const matchesTrainer = selectedTrainer === "all" || training.trainer === selectedTrainer

        // Filtrar por servicio
        const matchesService = selectedService === "all" || training.service === selectedService

        return matchesSearch && matchesTrainer && matchesService
    })

    // Obtener entrenamientos para el día seleccionado
    const selectedDateTrainings = filteredTrainings.filter((training) => isSameDay(new Date(training.date), selectedDate))

    // Obtener lista única de entrenadores y servicios para los filtros
    const uniqueTrainers = Array.from(new Set(trainings.map((t) => t.trainer)))
    const uniqueServices = Array.from(new Set(trainings.map((t) => t.service)))

    // Manejar clic en entrenamiento para editar
    const handleTrainingClick = (training: Training) => {
        if (onTrainingClick) {
            onTrainingClick(training)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-3/4">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl">Calendario de Entrenamientos</CardTitle>
                                <p className="text-muted-foreground">Visualiza los entrenamientos programados</p>
                            </div>

                            <div className="flex items-center gap-2">
                                {canAddTrainings && onAddTraining && (
                                    <Button onClick={onAddTraining} className="bg-black hover:bg-gray-800 text-white">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Agendar entrenamiento
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Select
                                    value={format(currentMonth, "MMMM", { locale: es })}
                                    onValueChange={(value) => {
                                        const months = Array.from({ length: 12 }, (_, i) => i)
                                        const selectedMonth = months.find(
                                            (month) => format(new Date(2023, month, 1), "MMMM", { locale: es }) === value,
                                        )
                                        if (selectedMonth !== undefined) {
                                            const newDate = new Date(currentMonth)
                                            newDate.setMonth(selectedMonth)
                                            setCurrentMonth(startOfMonth(newDate))
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <SelectItem key={i} value={format(new Date(2023, i, 1), "MMMM", { locale: es })}>
                                                {format(new Date(2023, i, 1), "MMMM", { locale: es })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={format(currentMonth, "yyyy")}
                                    onValueChange={(value) => {
                                        const newDate = new Date(currentMonth)
                                        newDate.setFullYear(Number.parseInt(value))
                                        setCurrentMonth(startOfMonth(newDate))
                                    }}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 10 }, (_, i) => (
                                            <SelectItem key={i} value={(new Date().getFullYear() - 5 + i).toString()}>
                                                {new Date().getFullYear() - 5 + i}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={prevMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={nextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={goToToday}>
                                    Hoy
                                </Button>
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <div className="grid grid-cols-7 bg-gray-100">
                                {weekDays.map((day, index) => (
                                    <div key={index} className="p-3 text-center font-medium text-sm border-b">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7">
                                {daysInMonth.map((day, index) => {
                                    const isCurrentDay = isToday(day)
                                    const isSelected = isSameDay(day, selectedDate)
                                    const hasEvents = hasTrainings(day)
                                    const dayTrainings = trainings.filter((training) => isSameDay(new Date(training.date), day))

                                    return (
                                        <div
                                            key={index}
                                            className={`
                        min-h-[80px] p-2 border relative
                        ${!isSameMonth(day, currentMonth) ? "text-gray-300 bg-gray-50" : ""}
                        ${isCurrentDay ? "bg-blue-50" : ""}
                        ${isSelected ? "bg-blue-100" : ""}
                        hover:bg-gray-50 cursor-pointer transition-colors
                      `}
                                            onClick={() => onSelectDate(day)}
                                        >
                                            <div
                                                className={`
                        flex items-center justify-center h-8 w-8 rounded-full
                        ${isSelected ? "bg-blue-500 text-white" : ""}
                        ${isCurrentDay && !isSelected ? "border border-blue-500" : ""}
                      `}
                                            >
                                                {format(day, "d")}
                                            </div>

                                            {dayTrainings.length > 0 && (
                                                <div className="mt-1 space-y-1">
                                                    {dayTrainings.slice(0, 2).map((training, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`
                                text-xs px-1 py-0.5 rounded truncate
                                ${training.status === "Activo"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : training.status === "Cancelado"
                                                                        ? "bg-red-100 text-red-800"
                                                                        : "bg-blue-100 text-blue-800"
                                                                }
                              `}
                                                            title={`${training.service} - ${training.trainer}`}
                                                        >
                                                            {training.startTime && format(new Date(training.startTime), "HH:mm")}{" "}
                                                            {training.service.substring(0, 10)}
                                                            {training.service.length > 10 ? "..." : ""}
                                                        </div>
                                                    ))}
                                                    {dayTrainings.length > 2 && (
                                                        <div className="text-xs text-center text-gray-500">+{dayTrainings.length - 2} más</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Entrenamientos del día seleccionado */}
                <Card className="mt-6">
                    <CardHeader className="pb-3">
                        <CardTitle>Entrenamientos para {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {selectedDateTrainings.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateTrainings.map((training) => (
                                    <div
                                        key={training.id}
                                        className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => handleTrainingClick(training)}
                                    >
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-semibold">{training.service}</h3>
                                                <p className="text-sm text-gray-600">Entrenador: {training.trainer}</p>
                                                <p className="text-sm text-gray-600">Cliente: {training.client}</p>
                                                <p className="text-sm text-gray-600">
                                                    Horario:{" "}
                                                    {training.startTime ? format(new Date(training.startTime), "HH:mm") : "No especificado"} -
                                                    {training.endTime ? format(new Date(training.endTime), "HH:mm") : "No especificado"}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <Badge
                                                    className={`
                            ${training.status === "Activo"
                                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                            : training.status === "Cancelado"
                                                                ? "bg-red-100 text-red-800 hover:bg-red-200"
                                                                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                        }
                          `}
                                                >
                                                    {training.status}
                                                </Badge>

                                                {training.maxCapacity && (
                                                    <span className="text-xs text-gray-500 mt-2">
                                                        {training.occupiedSpots || 0}/{training.maxCapacity} ocupados
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No hay entrenamientos programados para este día.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="lg:w-1/4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por cliente o entrenador"
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Entrenador</label>
                            <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los entrenadores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los entrenadores</SelectItem>
                                    {uniqueTrainers.map((trainer) => (
                                        <SelectItem key={trainer} value={trainer}>
                                            {trainer}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Servicio</label>
                            <Select value={selectedService} onValueChange={setSelectedService}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los servicios" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los servicios</SelectItem>
                                    {uniqueServices.map((service) => (
                                        <SelectItem key={service} value={service}>
                                            {service}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="font-medium mb-2">Resumen</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total entrenamientos:</span>
                                    <span className="font-medium">{filteredTrainings.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Activos:</span>
                                    <span className="font-medium">{filteredTrainings.filter((t) => t.status === "Activo").length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Cancelados:</span>
                                    <span className="font-medium">
                                        {filteredTrainings.filter((t) => t.status === "Cancelado").length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

