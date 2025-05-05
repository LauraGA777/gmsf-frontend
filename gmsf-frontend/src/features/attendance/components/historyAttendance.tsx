import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Asistencia {
  id: number
  cliente: string
  membresia: string
  fecha: Date
  estado: "en_curso" | "finalizado"
}

const asistencias: Asistencia[] = [
  {
    id: 1,
    cliente: "Juan Pérez",
    membresia: "Mensual Premium",
    fecha: new Date(2023, 3, 15, 10, 30),
    estado: "finalizado",
  },
  {
    id: 2,
    cliente: "María López",
    membresia: "Trimestral",
    fecha: new Date(2023, 3, 15, 11, 45),
    estado: "finalizado",
  },
  {
    id: 3,
    cliente: "Carlos Rodríguez",
    membresia: "Anual",
    fecha: new Date(2023, 3, 15, 14, 15),
    estado: "finalizado",
  },
  {
    id: 4,
    cliente: "Ana Martínez",
    membresia: "Diario",
    fecha: new Date(2023, 3, 15, 16, 0),
    estado: "finalizado",
  },
  {
    id: 5,
    cliente: "Pedro González",
    membresia: "Mensual Premium",
    fecha: new Date(),
    estado: "en_curso",
  },
]

export function HistoryAttendance() {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [membresia, setMembresia] = useState("todas")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Asistencias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
            <Input id="fecha-inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha-fin">Fecha Fin</Label>
            <Input id="fecha-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="membresia">Membresía</Label>
            <Select value={membresia} onValueChange={setMembresia}>
              <SelectTrigger id="membresia">
                <SelectValue placeholder="Seleccionar membresía" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="mensual">Mensual Premium</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
                <SelectItem value="diario">Diario</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Membresía</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asistencias.map((asistencia) => (
                  <TableRow key={asistencia.id}>
                    <TableCell>{format(asistencia.fecha, "dd/MM/yyyy HH:mm", { locale: es })}</TableCell>
                    <TableCell>{asistencia.cliente}</TableCell>
                    <TableCell>{asistencia.membresia}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          asistencia.estado === "en_curso" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {asistencia.estado === "en_curso" ? "En curso" : "Finalizado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline">Exportar a Excel</Button>
          <Button variant="outline">Exportar a PDF</Button>
        </div>
      </CardContent>
    </Card>
  )
}
