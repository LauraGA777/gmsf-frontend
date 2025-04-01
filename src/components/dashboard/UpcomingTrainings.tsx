import { format } from "date-fns"
import type { Training } from "@/types"

interface UpcomingTrainingsProps {
  trainings: Training[]
}

export function UpcomingTrainings({ trainings }: UpcomingTrainingsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2">
      <h2 className="text-lg font-semibold mb-4">Próximos entrenamientos</h2>
      {trainings.length > 0 ? (
        <div className="space-y-3">
          {trainings.map((training) => (
            <div key={training.id} className="p-3 border rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{training.service}</p>
                  <p className="text-sm text-gray-600">Cliente: {training.client}</p>
                  <p className="text-sm text-gray-600">Entrenador: {training.trainer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{format(new Date(training.date), "dd/MM/yyyy")}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(training.startTime || training.date), "HH:mm")} -
                    {training.endTime ? format(new Date(training.endTime), "HH:mm") : "No especificado"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay entrenamientos programados.</p>
      )}
    </div>
  )
}

