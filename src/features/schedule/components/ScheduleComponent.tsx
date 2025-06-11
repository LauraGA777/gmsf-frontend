import { useCallback } from "react"
import { es } from "date-fns/locale"
import { format, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from "date-fns"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import type { Training } from "@/shared/types/training"
import { Badge } from "@/shared/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock3, XCircle } from "lucide-react"

interface ScheduleComponentProps {
  onSelectDate: (date: Date) => void
  onTrainingClick: (training: Training) => void
  selectedDate: Date
  trainings: Training[]
  currentMonth: string
  setCurrentMonth: (date: string) => void
  onAddTraining: () => void
}

export function ScheduleComponent({
  onSelectDate,
  onTrainingClick,
  trainings,
  currentMonth,
  setCurrentMonth,
  onAddTraining
}: ScheduleComponentProps) {
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

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Select
              value={format(new Date(currentMonth), "MMMM", { locale: es })}
              onValueChange={(value) => {
                const monthIndex = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"].indexOf(value.toLowerCase())
                if (monthIndex !== -1) {
                  const newDate = new Date(currentMonth)
                  newDate.setMonth(monthIndex)
                  setCurrentMonth(format(newDate, "yyyy-MM-dd"))
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
                  setCurrentMonth(format(newDate, "yyyy-MM-dd"))
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
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(format(subMonths(new Date(currentMonth), 1), "yyyy-MM-dd"))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentMonth(format(new Date(), "yyyy-MM-dd"))}>
              Hoy
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(format(addMonths(new Date(currentMonth), 1), "yyyy-MM-dd"))}>
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
              const monthStart = startOfMonth(new Date(currentMonth))
              const monthEnd = endOfMonth(new Date(currentMonth))
              const startDate = monthStart
              const endDate = monthEnd

              // Ajustar para que comience en domingo
              const daysToSubtract = getDay(startDate)

              const startDateAdjusted = addDays(startDate, -daysToSubtract)
              const daysInGrid = eachDayOfInterval({
                start: startDateAdjusted,
                end: addDays(startDateAdjusted, 41), // 6 weeks * 7 days
              })

              return daysInGrid.map((day) => {
                const isCurrentMonthFlag = day.getMonth() === new Date(currentMonth).getMonth()
                const dayTrainings = trainings.filter(training => 
                  isSameDay(new Date(training.fecha_inicio), day)
                )
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`border-t border-r min-h-[80px] p-1 cursor-pointer hover:bg-gray-50 ${isCurrentMonthFlag ? '' : 'bg-gray-50 text-gray-400'}`}
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
                            onTrainingClick(training)
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
      </div>
    </div>
  )
}

