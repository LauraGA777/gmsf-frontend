import { useState, useEffect } from "react"
import { Calendar } from "@/shared/components/calendar"
import { es } from "date-fns/locale"
import { format, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, parseISO, isValid } from "date-fns"
import { Card, CardContent } from "@/shared/components/card"
import { Button } from "@/shared/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { TrainingDetailsForm } from "@/features/schedule/components/TrainingDetailsForm"
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import type { Training } from "@/shared/types"
import { useAuth } from "@/shared/contexts/AuthContext"
import { MOCK_CLIENTS, mockTrainers } from "@/features/data/mockData"

interface ScheduleComponentProps {
  trainings: Training[]
  onSelectDate: (date: Date) => void
  onDeleteTraining?: (id: number) => void
  onEditTraining?: (id: number, updatedTraining: Partial<Training>) => void
  onAddTraining?: () => void
  selectedDate?: Date
}

export function ScheduleComponent({
  trainings,
  onSelectDate,
  onDeleteTraining,
  onEditTraining,
  onAddTraining,
  selectedDate: propSelectedDate,
}: ScheduleComponentProps) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(propSelectedDate || new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(propSelectedDate || new Date())
  const [selectedTrainings, setSelectedTrainings] = useState<Training[]>([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)

  // Actualizar entrenamientos seleccionados cuando cambia la fecha o los entrenamientos
  useEffect(() => {
    if (selectedDate) {
      const filtered = trainings.filter((training) => {
        const trainingDate = new Date(training.date);
        return isValid(trainingDate) && isSameDay(trainingDate, selectedDate);
      })
      setSelectedTrainings(filtered)
    }
  }, [selectedDate, trainings])
  
  // Actualizar la fecha seleccionada cuando cambia desde las props
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate)
      setCurrentMonth(propSelectedDate)
    }
  }, [propSelectedDate])

  // Manejar cambio de fecha
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      onSelectDate(date)
    }
  }

  // Navegación del calendario
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
    onSelectDate(today)
  }

  // Manejar clic en entrenamiento
  const handleTrainingClick = (training: Training) => {
    setSelectedTraining(training)
    setIsDetailsOpen(true)
  }

  // Manejar eliminación de entrenamiento
  const handleDeleteTraining = () => {
    if (selectedTraining && onDeleteTraining) {
      onDeleteTraining(selectedTraining.id)
      setIsDetailsOpen(false)
    }
  }

  // Determinar si el usuario puede editar/eliminar entrenamientos
  const canModifyTrainings = user?.role === "admin" || user?.role === "trainer"

  // Función para renderizar los días con entrenamientos
  const renderDay = (day: Date | undefined) => {
    if (!day) return null

    const dayTrainings = trainings.filter((training) => {
      const trainingDate = new Date(training.date);
      return isValid(trainingDate) && isSameDay(trainingDate, day);
    }).sort((a, b) => {
      if (a.startTime && b.startTime) {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      }
      return 0;
    });

    const isSelected = selectedDate && isSameDay(day, selectedDate);

    return (
      <div className={`relative w-full h-full min-h-[80px] p-1 ${isSelected ? 'bg-gray-100 rounded' : ''}`}>
        <div className="text-xs font-medium p-1">{day.getDate()}</div>
        <div className="mt-1 space-y-1 overflow-hidden max-h-[60px]">
          {dayTrainings.slice(0, 3).map((training, index) => {
            const startTimeStr = training.startTime ? format(new Date(training.startTime), "HH:mm") : "";
            const statusColor = training.status === "Activo" ? "bg-green-100 text-green-800 border-green-200" : 
                               training.status === "Cancelado" ? "bg-red-100 text-red-800 border-red-200" : 
                               "bg-blue-100 text-blue-800 border-blue-200";
            
            return (
              <div 
                key={training.id} 
                className={`text-xs truncate px-1 py-0.5 rounded border ${statusColor} cursor-pointer`}
                onClick={() => handleTrainingClick(training)}
              >
                {startTimeStr} {training.service.substring(0, 10)}{training.service.length > 10 ? '...' : ''}
              </div>
            );
          })}
          {dayTrainings.length > 3 && (
            <div className="text-xs text-gray-500 pl-1">+{dayTrainings.length - 3} más</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Calendario de Entrenamientos</h2>
            <p className="text-sm text-gray-500">Visualiza y agenda tus entrenamientos programados</p>
          </div>
          
          {onAddTraining && (
            <Button onClick={onAddTraining} className="bg-black hover:bg-gray-800 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Agendar entrenamiento
            </Button>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Select 
              value={format(currentMonth, "MMMM", { locale: es })}
              onValueChange={(value) => {
                const monthIndex = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"].indexOf(value);
                if (monthIndex !== -1) {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(monthIndex);
                  setCurrentMonth(newDate);
                }
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"].map((month) => (
                  <SelectItem key={month} value={month}>
                    {month.charAt(0).toUpperCase() + month.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={format(currentMonth, "yyyy")}
              onValueChange={(value) => {
                const year = parseInt(value);
                if (!isNaN(year)) {
                  const newDate = new Date(currentMonth);
                  newDate.setFullYear(year);
                  setCurrentMonth(newDate);
                }
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          {/* Cabecera de días de la semana */}
          <div className="grid grid-cols-7 gap-px bg-gray-100 border-b">
            {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((day) => (
              <div key={day} className="text-center py-2 text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-px bg-white">
            {(() => {
              const monthStart = startOfMonth(currentMonth);
              const monthEnd = endOfMonth(currentMonth);
              const startDate = monthStart;
              const endDate = monthEnd;
              
              // Ajustar para que comience en domingo
              const daysToAdd = getDay(startDate) === 0 ? 0 : 7 - getDay(startDate);
              const daysToSubtract = getDay(startDate);
              
              const startDateAdjusted = addDays(startDate, -daysToSubtract);
              const endDateAdjusted = addDays(endDate, daysToAdd);
              
              const days = eachDayOfInterval({
                start: startDateAdjusted,
                end: endDateAdjusted,
              });
              
              // Asegurarse de que tenemos exactamente 42 días (6 semanas)
              const totalDays = Math.ceil(days.length / 7) * 7;
              while (days.length < totalDays) {
                days.push(addDays(days[days.length - 1], 1));
              }
              
              return days.map((day) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`border-t border-r min-h-[80px] ${isCurrentMonth ? '' : 'bg-gray-50 text-gray-400'}`}
                    onClick={() => handleDateChange(day)}
                  >
                    {renderDay(day)}
                  </div>
                );
              });
            })()} 
          </div>
        </div>
      </div>

      {/* Entrenamientos del día seleccionado */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Entrenamientos para {selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es }) : ""}
          </h2>
        </div>

        {selectedTrainings.length > 0 ? (
          <div className="space-y-4">
            {selectedTrainings.map((training) => (
              <Card key={training.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{training.service}</h3>
                      <p className="text-sm text-gray-600">Entrenador: {training.trainer}</p>
                      <p className="text-sm text-gray-600">Cliente: {training.client}</p>
                      <p className="text-sm text-gray-600">
                        Horario:{" "}
                        {training.startTime ? format(new Date(training.startTime), "HH:mm") : "No especificado"} -
                        {training.endTime ? format(new Date(training.endTime), "HH:mm") : "No especificado"}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${training.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {training.status}
                        </span>
                      </div>
                    </div>

                    {canModifyTrainings && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTrainingClick(training)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedTraining(training)
                            handleDeleteTraining()
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay entrenamientos programados para este día.</p>
        )}
      </div>

      {/* Diálogo de detalles del entrenamiento */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden" aria-describedby="training-details-description">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Detalles del Entrenamiento</DialogTitle>
            <DialogDescription id="training-details-description">
              Modifique la información del entrenamiento según sea necesario.
            </DialogDescription>
          </DialogHeader>
          {selectedTraining && (
            <TrainingDetailsForm
              training={selectedTraining}
              onSave={(id, training) => {
                if (onEditTraining) {
                  onEditTraining(id, training)
                  setIsDetailsOpen(false)
                }
              }}
              onDelete={handleDeleteTraining}
              onCancel={() => setIsDetailsOpen(false)}
              trainers={mockTrainers.map(trainer => `${trainer.nombre} ${trainer.apellido}`)}
              // Pasar los clientes con contratos activos desde MOCK_CLIENTS
              clients={MOCK_CLIENTS.filter(
                (client) => 
                  client.estado === "Activo" && 
                  client.membershipEndDate && 
                  client.membershipEndDate > new Date()
              ).map(client => ({ id: client.id, name: `${client.nombre} ${client.apellido}` }))}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

