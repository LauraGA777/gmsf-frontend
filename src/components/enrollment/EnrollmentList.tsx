"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Eye, Search, X, CheckCircle, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import Swal from "sweetalert2"
import type { Enrollment, Schedule } from "@/types"

interface EnrollmentListProps {
  enrollments: Enrollment[]
  schedules: Schedule[]
  onUpdateEnrollment: (id: number, updates: Partial<Enrollment>) => void
  onCancelEnrollment: (id: number) => void
  onMarkAttendance: (id: number) => void
}

export function EnrollmentList({
  enrollments,
  schedules,
  onUpdateEnrollment,
  onCancelEnrollment,
  onMarkAttendance,
}: EnrollmentListProps) {
  const { user } = useAuth()
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([])
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [scheduleFilter, setScheduleFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar inscripciones
  useEffect(() => {
    let filtered = [...enrollments]

    // Si es cliente, solo mostrar sus inscripciones
    if (user?.role === "client" && user.clientId) {
      filtered = filtered.filter((enrollment) => enrollment.id_persona.toString() === user.clientId)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (enrollment) =>
          enrollment.persona_nombre?.toLowerCase().includes(term) ||
          schedules
            .find((s) => s.id === enrollment.id_programacion)
            ?.servicio_nombre?.toLowerCase()
            .includes(term) ||
          schedules
            .find((s) => s.id === enrollment.id_programacion)
            ?.entrenador_nombre?.toLowerCase()
            .includes(term),
      )
    }

    // Filtrar por estado
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((enrollment) => enrollment.estado === statusFilter)
    }

    // Filtrar por programación
    if (scheduleFilter && scheduleFilter !== "all") {
      filtered = filtered.filter((enrollment) => enrollment.id_programacion.toString() === scheduleFilter)
    }

    setFilteredEnrollments(filtered)
    setCurrentPage(1)
  }, [enrollments, user, searchTerm, statusFilter, scheduleFilter, schedules])

  const handleViewEnrollment = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setIsViewModalOpen(true)
  }

  const handleCancelEnrollment = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cancelar esta inscripción?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        onCancelEnrollment(id)

        Swal.fire({
          title: "Cancelada",
          text: "La inscripción ha sido cancelada exitosamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  const handleMarkAttendance = (id: number) => {
    Swal.fire({
      title: "Confirmar asistencia",
      text: "¿Deseas marcar esta inscripción como asistida?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, confirmar asistencia",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onMarkAttendance(id)

        Swal.fire({
          title: "Asistencia registrada",
          text: "La asistencia ha sido registrada exitosamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  // Paginación
  const getPaginatedEnrollments = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredEnrollments.slice(startIndex, endIndex)
  }

  // Obtener programaciones únicas para los filtros
  const uniqueSchedules = Array.from(new Set(enrollments.map((e) => e.id_programacion)))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inscripciones</h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente, servicio o entrenador"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Confirmado">Confirmado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
            <SelectItem value="Asistió">Asistió</SelectItem>
          </SelectContent>
        </Select>

        <Select value={scheduleFilter} onValueChange={setScheduleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Programación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las programaciones</SelectItem>
            {uniqueSchedules.map((id) => {
              const schedule = schedules.find((s) => s.id === id)
              return (
                <SelectItem key={id} value={id.toString()}>
                  {schedule
                    ? `${schedule.servicio_nombre || "Servicio"} - ${format(new Date(schedule.fecha), "dd/MM/yyyy")}`
                    : `Programación ${id}`}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("")
            setStatusFilter("")
            setScheduleFilter("")
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>

      {/* Tabla de inscripciones */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Entrenador</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedEnrollments().length > 0 ? (
              getPaginatedEnrollments().map((enrollment) => {
                const schedule = schedules.find((s) => s.id === enrollment.id_programacion)
                return (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.persona_nombre || `Cliente ${enrollment.id_persona}`}
                    </TableCell>
                    <TableCell>{schedule?.servicio_nombre || `Servicio ${schedule?.id_servicio || "N/A"}`}</TableCell>
                    <TableCell>{schedule ? format(new Date(schedule.fecha), "dd/MM/yyyy") : "N/A"}</TableCell>
                    <TableCell>
                      {schedule
                        ? `${format(new Date(schedule.hora_inicio), "HH:mm")} - ${format(new Date(schedule.hora_fin), "HH:mm")}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {schedule?.entrenador_nombre || `Entrenador ${schedule?.id_entrenador || "N/A"}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          enrollment.estado === "Confirmado"
                            ? "bg-blue-100 text-blue-800"
                            : enrollment.estado === "Asistió"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {enrollment.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewEnrollment(enrollment)}>
                          <Eye className="h-4 w-4" />
                        </Button>

                        {enrollment.estado === "Confirmado" && (
                          <>
                            {user?.role === "admin" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                onClick={() => handleMarkAttendance(enrollment.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleCancelEnrollment(enrollment.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <User className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron inscripciones</p>
                    <p className="text-sm">Intenta con otros criterios de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

