import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const dataAsistenciasPorHora = [
  { hora: "6-8", asistencias: 15 },
  { hora: "8-10", asistencias: 25 },
  { hora: "10-12", asistencias: 18 },
  { hora: "12-14", asistencias: 12 },
  { hora: "14-16", asistencias: 8 },
  { hora: "16-18", asistencias: 20 },
  { hora: "18-20", asistencias: 35 },
  { hora: "20-22", asistencias: 28 },
]

export function ReportsAttendance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informes de Asistencias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asistencias por Hora Pico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dataAsistenciasPorHora}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hora" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="asistencias" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Exportar a Excel</Button>
            <Button variant="outline">Exportar a PDF</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
