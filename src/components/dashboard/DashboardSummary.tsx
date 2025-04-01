interface DashboardSummaryProps {
  activeClients: number
  activeTrainings: number
  upcomingExpirations: number
}

export function DashboardSummary({ activeClients, activeTrainings, upcomingExpirations }: DashboardSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Resumen</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Clientes activos:</span>
          <span className="font-medium">{activeClients}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Entrenamientos programados:</span>
          <span className="font-medium">{activeTrainings}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Próximos vencimientos:</span>
          <span className="font-medium">{upcomingExpirations}</span>
        </div>
      </div>
    </div>
  )
}

