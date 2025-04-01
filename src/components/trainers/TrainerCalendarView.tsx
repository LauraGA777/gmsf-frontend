"use client"

import { useState, useEffect, useMemo } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
} from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Clock,
  User,
  UserCheck,
  MapPin,
  Plus,
  Edit,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Training } from "@/types"
import { useAuth } from "@/context/AuthContext"
import { CompactTrainingForm } from "@/components/forms/CompactTrainingForm"

interface EnhancedCalendarViewProps {
  trainings: Training[]
  onSelectDate: (date: Date) => void
  onDeleteTraining: (id: number) => void
  onEditTraining: (id: number, updatedTraining: Partial<Training>) => void
  onAddTraining: (training: Omit<Training, "id">) => void
}

export function EnhancedCalendarView({
  trainings,
  onSelectDate,
  onDeleteTraining,
  onEditTraining,
  onAddTraining,
}: EnhancedCalendarViewProps) {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDateTrainings, setSelectedDateTrainings] = useState<Training[]>([])
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  // Generar los meses para el selector
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1)
      return {
        value: i.toString(),
        label: format(date, "MMMM", { locale: es }),
      }
    })
  }, [])

  // Generar los años para el selector (10 años antes y después del actual)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 21 }, (_, i) => {
      const year = currentYear - 10 + i
      return {
        value: year.toString(),
        label: year.toString(),
      }
    })
  }, [])

  // Actualizar los entrenamientos del día seleccionado cuando cambia la fecha o los entrenamientos
  useEffect(() => {
    const filteredTrainings = trainings.filter((training) => isSameDay(new Date(training.date), selectedDate))
    setSelectedDateTrainings(filteredTrainings)
  }, [selectedDate, trainings])

  // Función para navegar al mes anterior
  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1))
  }

  // Función para navegar al mes siguiente
  const handleNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1))
  }

  // Función para ir al día actual
  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    onSelectDate(today)
  }

  // Función para cambiar el mes
  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(Number.parseInt(month))
    setCurrentDate(newDate)
  }

  // Función para cambiar el año
  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(Number.parseInt(year))
    setCurrentDate(newDate)
  }

  // Función para seleccionar una fecha
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onSelectDate(date)

    // Filtrar entrenamientos para la fecha seleccionada
    const dateTrainings = trainings.filter((training) => isSameDay(new Date(training.date), date))
    setSelectedDateTrainings(dateTrainings)

    // Abrir el diálogo de detalles si hay entrenamientos, o el de agregar si no hay
    if (dateTrainings.length > 0) {
      setIsDetailsDialogOpen(true)
    } else if (user?.role === "admin" || user?.role === "trainer") {
      setIsAddDialogOpen(true)
    }
  }

  // Función para editar un entrenamiento
  const handleEditClick = (training: Training) => {
    setSelectedTraining(training)
    setIsDetailsDialogOpen(false)
    setIsEditDialogOpen(true)
  }

  // Función para guardar cambios de edición
  const handleSaveEdit = (updatedTraining: Omit<Training, "id">) => {
    if (selectedTraining) {
      onEditTraining(selectedTraining.id, updatedTraining)
      setIsEditDialogOpen(false)
      setSelectedTraining(null)
    }
  }

  // Obtener los días del mes actual
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Obtener el primer día de la semana del mes
  const firstDayOfMonth = startOfMonth(currentDate).getDay()

  // Determinar si el usuario puede agregar entrenamientos
  const canAddTrainings = user?.role === "admin" || user?.role === "trainer"

  // Función para obtener el color de fondo del día según su estado
  const getDayBackgroundColor = (day: Date) => {
    const isSelected = isSameDay(day, selectedDate)
    const isCurrentDay = isToday(day)
    const isHovered = hoveredDate && isSameDay(day, hoveredDate)
    const isCurrentMonth = isSameMonth(day, currentDate)

    if (!isCurrentMonth) return "bg-gray-50/50"
    if (isSelected) return "bg-blue-50 border-blue-300"
    if (isCurrentDay) return "bg-emerald-50 border-emerald-200"
    if (isHovered) return "bg-gray-50"
    return ""
  }

  // Altura optimizada para las celdas del calendario
  const calendarCellHeight = "h-16" // Altura ideal para mostrar el calendario sin scroll

  // Renderizar el calendario
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold">Calendario de Entrenamientos</h2>
          <p className="text-gray-500 mt-1">Visualiza los entrenamientos programados</p>
        </div>

        {canAddTrainings && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agendar entrenamiento
          </Button>
        )}
      </div>

      {/* Controles del calendario */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[140px] border-gray-200 h-9 text-sm">
              <SelectValue placeholder={format(currentDate, "MMMM", { locale: es })} />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[100px] border-gray-200 h-9 text-sm">
              <SelectValue placeholder={currentDate.getFullYear().toString()} />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
            className="border-gray-200 hover:bg-gray-50 hover:text-gray-900 h-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            className="border-gray-200 hover:bg-gray-50 hover:text-gray-900 h-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="flex items-center gap-2 border-gray-200 hover:bg-gray-50 hover:text-gray-900 h-9 text-sm"
          >
            <CalendarIcon className="h-4 w-4" />
            Hoy
          </Button>
        </div>
      </div>

      {/* Título del mes y año */}
      <h3 className="text-xl font-medium text-center mb-4 capitalize text-gray-800">
        {format(currentDate, "MMMM yyyy", { locale: es })}
      </h3>

      {/* Calendario */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((day) => (
            <div key={day} className="text-center font-medium text-gray-500 py-2 text-sm">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {/* Espacios vacíos para el primer día del mes */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className={`${calendarCellHeight} p-1 border-b border-r border-gray-200 bg-gray-50/50`}
            ></div>
          ))}

          {/* Días del mes */}
          {daysInMonth.map((day) => {
            // Filtrar entrenamientos para este día
            const dayTrainings = trainings.filter((training) => isSameDay(new Date(training.date), day))

            // Determinar si es el día seleccionado, hoy, o un día normal
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentDay = isToday(day)
            const isCurrentMonth = isSameMonth(day, currentDate)
            const dayOfWeek = getDay(day)
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

            return (
              <div
                key={day.toString()}
                className={cn(
                  `${calendarCellHeight} relative border-b border-r border-gray-200 transition-all`,
                  !isCurrentMonth && "text-gray-400 bg-gray-50/50",
                  isWeekend && isCurrentMonth && "bg-gray-50/30",
                  getDayBackgroundColor(day),
                  "hover:bg-gray-50 cursor-pointer",
                )}
                onClick={() => handleDateSelect(day)}
                onMouseEnter={() => setHoveredDate(day)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div className="p-1.5">
                  <div
                    className={cn(
                      "flex justify-center items-center h-6 w-6 text-sm mx-auto",
                      isSelected ? "font-semibold text-blue-600" : "",
                      isCurrentDay && !isSelected ? "font-semibold text-emerald-600" : "",
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  {/* Listado de entrenamientos (máximo 2) */}
                  <div className="mt-1 space-y-1 max-h-[calc(100%-24px)] overflow-hidden">
                    {dayTrainings.slice(0, 2).map((training, idx) => (
                      <div
                        key={`${training.id}-${idx}`}
                        className="text-xs px-1.5 py-0.5 rounded truncate bg-blue-50 text-blue-700 border border-blue-100"
                        title={`${training.service} - ${training.client}`}
                      >
                        {format(new Date(training.startTime || training.date), "HH:mm")}{" "}
                        {training.service.split(" ")[0]}
                      </div>
                    ))}

                    {/* Indicador de más entrenamientos */}
                    {dayTrainings.length > 2 && (
                      <div className="text-xs text-center text-gray-500">+{dayTrainings.length - 2} más</div>
                    )}
                  </div>
                </div>

                {/* Indicador de día actual */}
                {isCurrentDay && <div className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-emerald-500"></div>}

                {/* Indicador de día seleccionado */}
                {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Leyenda del calendario */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 bg-blue-500"></div>
            <span>Seleccionado</span>
          </div>
        </div>

        <div>
          {selectedDateTrainings.length > 0
            ? `${selectedDateTrainings.length} entrenamientos para ${format(selectedDate, "dd/MM/yyyy")}`
            : `No hay entrenamientos para ${format(selectedDate, "dd/MM/yyyy")}`}
        </div>
      </div>

      {/* Diálogo de detalles de entrenamientos */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5" />
              Entrenamientos para {format(selectedDate, "dd MMMM, yyyy", { locale: es })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-2">
            {selectedDateTrainings.length > 0 ? (
              selectedDateTrainings.map((training) => (
                <div key={training.id} className="p-4 border rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{training.service}</h3>
                      <div className="space-y-1 mt-2">
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          Cliente: {training.client}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5" />
                          Entrenador: {training.trainer}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Horario: {format(new Date(training.startTime || training.date), "HH:mm")} -
                          {training.endTime ? format(new Date(training.endTime), "HH:mm") : ""}
                        </p>
                        {training.maxCapacity && (
                          <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Cupos: {training.occupiedSpots}/{training.maxCapacity}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={`${training.status === "Activo" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}
                    >
                      {training.status}
                    </Badge>
                  </div>

                  {canAddTrainings && (
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(training)}
                        className="border-gray-200 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 border-gray-200"
                        onClick={() => {
                          onDeleteTraining(training.id)
                          setIsDetailsDialogOpen(false)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No hay entrenamientos programados para este día.</p>
            )}
          </div>

          <DialogFooter>
            {canAddTrainings && (
              <Button
                onClick={() => {
                  setIsDetailsDialogOpen(false)
                  setIsAddDialogOpen(true)
                }}
                className="mr-auto bg-black hover:bg-gray-800 text-white"
              >
                Agendar nuevo
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="border-gray-200">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para agregar entrenamiento */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-visible">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5" />
              Agendar entrenamiento para {format(selectedDate, "dd MMMM, yyyy", { locale: es })}
            </DialogTitle>
          </DialogHeader>

          <CompactTrainingForm
            onAddTraining={(training) => {
              onAddTraining(training)
              setIsAddDialogOpen(false)
            }}
            selectedDate={selectedDate}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar entrenamiento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-visible">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="h-5 w-5" />
              Editar entrenamiento
            </DialogTitle>
          </DialogHeader>

          {selectedTraining && (
            <CompactTrainingForm
              onAddTraining={handleSaveEdit}
              selectedDate={new Date(selectedTraining.date)}
              onCancel={() => setIsEditDialogOpen(false)}
              initialData={selectedTraining}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

