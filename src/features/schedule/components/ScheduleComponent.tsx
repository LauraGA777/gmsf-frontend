import { useState, useEffect } from "react"
import { Calendar } from "@/shared/components/ui/calendar"
import { es } from "date-fns/locale"
import { format, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, parseISO, isValid } from "date-fns"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { TrainingDetailsForm } from "@/features/schedule/components/TrainingDetailsForm"
import { TrainingForm } from "@/features/schedule/components/TrainingForm"
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import type { Training } from "@/shared/types/training"
import { useAuth } from "@/shared/contexts/authContext"
import { scheduleService } from "../services/schedule.service"
import { Badge } from "@/shared/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock3, XCircle } from "lucide-react"
import { clientService } from "@/features/clients/services/client.service"
import type { Client, Trainer } from "@/shared/types/index"
import { mapDbClientToUiClient } from "@/shared/types/index"

interface ScheduleComponentProps {
  trainings: Training[]
  onSelectDate: (date: Date) => void
  onTrainingClick: (training: Training) => void
  selectedDate: Date
}

export function ScheduleComponent({
  trainings,
  onSelectDate,
  onTrainingClick,
  selectedDate,
}: ScheduleComponentProps) {
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), "MMMM yyyy", { locale: es }))
  const [isDailyView, setIsDailyView] = useState(false)
  const [clients, setClients] = useState<Client[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsResponse = await clientService.getClients({});
        const mappedClients = clientsResponse.data.map(mapDbClientToUiClient);
        setClients(mappedClients);

        setTrainers([
          { id: '1', name: 'Juan Perez', email: '', specialties: [], status: 'Activo' },
          { id: '2', name: 'Maria Garcia', email: '', specialties: [], status: 'Activo' },
        ]);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleTrainingClick = (training: Training) => {
    setSelectedTraining(training)
    onTrainingClick(training)
  }

  const handleAddTraining = () => {
    setSelectedTraining(null)
    setIsFormOpen(true)
  }

  const handleEditTraining = (training: Training) => {
    setSelectedTraining(training)
    setIsEditFormOpen(true)
  }

  const handleDeleteTraining = async (id: number) => {
    try {
      await scheduleService.deleteTraining(id);
    } catch (error) {
      console.error("Error deleting training:", error)
    }
  }

  const handleSubmitTraining = async (data: Partial<Training>) => {
    try {
      const trainingData = {
        ...data,
        fecha_inicio: format(new Date(data.fecha_inicio as string), "yyyy-MM-dd'T'HH:mm"),
        fecha_fin: format(new Date(data.fecha_fin as string), "yyyy-MM-dd'T'HH:mm"),
        id_cliente: data.id_cliente ? Number(data.id_cliente) : undefined,
        id_entrenador: data.id_entrenador ? Number(data.id_entrenador) : undefined,
      };

      if (selectedTraining) {
        await scheduleService.updateTraining(selectedTraining.id, trainingData);
      } else {
        await scheduleService.createTraining(trainingData);
      }
      setIsFormOpen(false);
      setIsEditFormOpen(false);
    } catch (error) {
      console.error("Error submitting training:", error)
    }
  }

  const getTrainingStatus = (training: Training) => {
    switch (training.estado) {
      case "Programado":
        return {
          label: "Programado",
          color: "bg-blue-100 text-blue-800",
          icon: <Clock3 className="h-3.5 w-3.5 mr-1" />,
        }
      case "En proceso":
        return {
          label: "En proceso",
          color: "bg-yellow-100 text-yellow-800",
          icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
        }
      case "Completado":
        return {
          label: "Completado",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />,
        }
      case "Cancelado":
        return {
          label: "Cancelado",
          color: "bg-red-100 text-red-800",
          icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
        }
      default:
        return {
          label: "Programado",
          color: "bg-blue-100 text-blue-800",
          icon: <Clock3 className="h-3.5 w-3.5 mr-1" />,
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Calendario de Entrenamientos</h2>
            <p className="text-sm text-gray-500">Visualiza y agenda tus entrenamientos programados</p>
          </div>
        </div>

        {!isDailyView && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Select
                value={format(new Date(currentMonth), "MMMM", { locale: es })}
                onValueChange={(value) => {
                  const monthIndex = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"].indexOf(value)
                  if (monthIndex !== -1) {
                    const newDate = new Date(currentMonth)
                    newDate.setMonth(monthIndex)
                    setCurrentMonth(newDate.toISOString().split('T')[0])
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
                value={format(new Date(currentMonth), "yyyy")}
                onValueChange={(value) => {
                  const year = parseInt(value)
                  if (!isNaN(year)) {
                    const newDate = new Date(currentMonth)
                    newDate.setFullYear(year)
                    setCurrentMonth(newDate.toISOString().split('T')[0])
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
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(format(subMonths(new Date(currentMonth), 1), "MMMM yyyy", { locale: es }))} disabled={new Date(currentMonth) <= new Date()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentMonth(new Date().toISOString().split('T')[0])} disabled={new Date(currentMonth) <= new Date()}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(format(addMonths(new Date(currentMonth), 1), "MMMM yyyy", { locale: es }))} disabled={new Date(currentMonth) <= new Date()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!isDailyView ? (
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
                const monthStart = startOfMonth(new Date(currentMonth))
                const monthEnd = endOfMonth(new Date(currentMonth))
                const startDate = monthStart
                const endDate = monthEnd

                // Ajustar para que comience en domingo
                const daysToAdd = getDay(startDate) === 0 ? 0 : 7 - getDay(startDate)
                const daysToSubtract = getDay(startDate)

                const startDateAdjusted = addDays(startDate, -daysToSubtract)
                const endDateAdjusted = addDays(endDate, daysToAdd)

                const days = eachDayOfInterval({
                  start: startDateAdjusted,
                  end: endDateAdjusted,
                })

                // Asegurarse de que tenemos exactamente 42 días (6 semanas)
                const totalDays = Math.ceil(days.length / 7) * 7
                while (days.length < totalDays) {
                  days.push(addDays(days[days.length - 1], 1))
                }

                return days.map((day) => {
                  const isCurrentMonth = day.getMonth() === new Date(currentMonth).getMonth()
                  const dayTrainings = trainings.filter(training => 
                    isSameDay(new Date(training.fecha_inicio), day)
                  )
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`border-t border-r min-h-[80px] p-1 cursor-pointer hover:bg-gray-50 ${isCurrentMonth ? '' : 'bg-gray-50 text-gray-400'}`}
                      onClick={() => onSelectDate(day)}
                    >
                      <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                      {dayTrainings.map((training) => {
                        const status = getTrainingStatus(training)
                        return (
                          <div
                            key={training.id}
                            className="text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80"
                            style={{ backgroundColor: status.color.includes('blue') ? '#dbeafe' : 
                                     status.color.includes('yellow') ? '#fef3c7' :
                                     status.color.includes('green') ? '#dcfce7' : '#fee2e2' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTrainingClick(training)
                            }}
                          >
                            <div className="truncate">{training.titulo}</div>
                            <div className="truncate text-gray-600">
                              {format(new Date(training.fecha_inicio), "HH:mm")}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Entrenamientos para {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
              </h2>
            </div>

            <div className="space-y-2">
              {trainings
                .filter((training) => isSameDay(new Date(training.fecha_inicio), new Date()))
                .map((training) => {
                  const status = getTrainingStatus(training)
                  return (
                    <div
                      key={training.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleTrainingClick(training)}
                    >
                      <div>
                        <h3 className="font-medium">{training.titulo}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(training.fecha_inicio), "HH:mm")} -{" "}
                          {format(new Date(training.fecha_fin), "HH:mm")}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cliente: {training.cliente?.usuario?.nombre || training.cliente?.codigo || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Entrenador: {training.entrenador?.nombre || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>
                          {status.icon}
                          {status.label}
                        </Badge>
                        {user?.role !== "CLIENTE" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTraining(training)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTraining(training.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Entrenamiento</DialogTitle>
          </DialogHeader>
          <TrainingForm
            onSubmit={handleSubmitTraining}
            onCancel={() => setIsFormOpen(false)}
            initialDate={isDailyView ? new Date() : undefined}
            isDailyView={isDailyView}
            clients={clients}
            trainers={trainers}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Entrenamiento</DialogTitle>
          </DialogHeader>
          {selectedTraining && (
            <TrainingDetailsForm
              training={selectedTraining}
              onUpdate={handleSubmitTraining}
              onDelete={() => handleDeleteTraining(selectedTraining.id)}
              onClose={() => setIsEditFormOpen(false)}
              onChangeStatus={(id, newStatus) => handleSubmitTraining({ ...selectedTraining, estado: newStatus })}
              clients={clients}
              trainers={trainers}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

