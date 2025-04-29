import { format } from "date-fns"
import type { Training } from "@/types"

interface UpcomingTrainingsProps {
  trainings: Training[]
}

export function UpcomingTrainings({ trainings }: UpcomingTrainingsProps) {
  return (
    <div className="w-full">
      {trainings.length > 0 ? (
        <div className="space-y-3">
          {trainings.map((training) => (
            <div key={training.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">{training.service}</p>
                  <p className="text-sm text-gray-600">Cliente: {training.client}</p>
                  <p className="text-sm text-gray-600">Entrenador: {training.trainer}</p>
                </div>
                <div className="text-left md:text-right mt-2 md:mt-0">
                  <p className="text-sm font-medium text-indigo-600">{format(new Date(training.date), "dd/MM/yyyy")}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(training.startTime || training.date), "HH:mm")} -
                    {training.endTime ? format(new Date(training.endTime), "HH:mm") : "No especificado"}
                  </p>
                  <span className={`inline-flex items-center rounded-full mt-1 px-2 py-1 text-xs font-medium ${
                    training.status === "Activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {training.status}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex justify-between">
                <span>{training.occupiedSpots} / {training.maxCapacity} cupos ocupados</span>
                <span className="text-indigo-600 hover:underline cursor-pointer">Ver detalles</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-gray-500">No hay entrenamientos programados.</p>
        </div>
      )}
    </div>
  )
}

