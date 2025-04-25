"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"
import { format, isSameDay } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrainingDetailsForm } from "@/components/forms/TrainingDetailsForm"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { Training } from "@/types"
import { useAuth } from "@/context/AuthContext"

interface EnhancedCalendarViewProps {
  trainings: Training[]
  onSelectDate: (date: Date) => void
  onDeleteTraining?: (id: number) => void
  onEditTraining?: (id: number, updatedTraining: Partial<Training>) => void
  onAddTraining?: () => void
}

export function EnhancedCalendarView({
  trainings,
  onSelectDate,
  onDeleteTraining,
  onEditTraining,
  onAddTraining,
}: EnhancedCalendarViewProps) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTrainings, setSelectedTrainings] = useState<Training[]>([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)

  // Actualizar entrenamientos seleccionados cuando cambia la fecha o los entrenamientos
  useEffect(() => {
    if (selectedDate) {
      const filtered = trainings.filter((training) => isSameDay(new Date(training.date), selectedDate))
      setSelectedTrainings(filtered)
    }
  }, [selectedDate, trainings])

  // Manejar cambio de fecha
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      onSelectDate(date)
    }
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

    const dayTrainings = trainings.filter((training) => isSameDay(new Date(training.date), day))

    return (
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">{day.getDate()}</div>
        {dayTrainings.length > 0 && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Calendario de Entrenamientos</h2>
        <p className="text-sm text-gray-500 mb-4">Visualiza los entrenamientos programados</p>

        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          locale={es}
          className="rounded-md border"
          components={{
            Day: ({ date, ...props }) => (
              <button
                {...props}
                className="relative w-9 h-9 p-0 font-normal aria-selected:opacity-100"
              >
                {renderDay(date)}
              </button>
            ),
          }}
        />
      </div>

      {/* Entrenamientos del día seleccionado */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Entrenamientos para {selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es }) : ""}
          </h2>

          {canModifyTrainings && onAddTraining && (
            <Button onClick={onAddTraining} className="bg-black hover:bg-gray-800 text-white" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agendar entrenamiento
            </Button>
          )}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Entrenamiento</DialogTitle>
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
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

