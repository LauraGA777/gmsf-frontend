"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Eye, Edit, Search, X, Plus, Users, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import Swal from "sweetalert2"
import type { Schedule } from "@/types"

interface ScheduleListProps {
  schedules: Schedule[]
  onAddSchedule: (schedule: Omit<Schedule, "id">) => void
  onUpdateSchedule: (id: number, updates: Partial<Schedule>) => void
  onDeleteSchedule: (id: number) => void
}

export function ScheduleList({ schedules, onAddSchedule, onUpdateSchedule, onDeleteSchedule }: ScheduleListProps) {
  const { user } = useAuth()
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([])
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [trainerFilter, setTrainerFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar programaciones
  useEffect(() => {
    let filtered = [...schedules]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (schedule) =>
          schedule.servicio_nombre?.toLowerCase().includes(term) ||
          schedule.entrenador_nombre?.toLowerCase().includes(term) ||
          schedule.codigo?.toLowerCase().includes(term),
      )
    }

    // Filtrar por estado
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((schedule) => schedule.estado === statusFilter)
    }

    // Filtrar por servicio
    if (serviceFilter && serviceFilter !== "all") {
      filtered = filtered.filter((schedule) => schedule.id_servicio.toString() === serviceFilter)
    }

    // Filtrar por entrenador
    if (trainerFilter && trainerFilter !== "all") {
      filtered = filtered.filter((schedule) => schedule.id_entrenador.toString() === trainerFilter)
    }

    setFilteredSchedules(filtered)
    setCurrentPage(1)
  }, [schedules, searchTerm, statusFilter, serviceFilter, trainerFilter])

  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsViewModalOpen(true)
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsEditModalOpen(true)
  }

  const handleDeleteSchedule = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas eliminar esta programación? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteSchedule(id)

        Swal.fire({
          title: "Eliminada",
          text: "La programación ha sido eliminada exitosamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  // Paginación
  const getPaginatedSchedules = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredSchedules.slice(startIndex, endIndex)
  }

  // Obtener servicios y entrenadores únicos para los filtros
  const uniqueServices = Array.from(new Set(schedules.map((s) => s.id_servicio)))
  const uniqueTrainers = Array.from(new Set(schedules.map((s) => s.id_entrenador)))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Programaciones</h2>

        {user?.role === "admin" && (
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-black hover:bg-gray-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Programación
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por servicio, entrenador o código"
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
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los servicios</SelectItem>
            {uniqueServices.map((id) => (
              <SelectItem key={id} value={id.toString()}>
                {schedules.find((s) => s.id_servicio === id)?.servicio_nombre || `Servicio ${id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={trainerFilter} onValueChange={setTrainerFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Entrenador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los entrenadores</SelectItem>
            {uniqueTrainers.map((id) => (
              <SelectItem key={id} value={id.toString()}>
                {schedules.find((s) => s.id_entrenador === id)?.entrenador_nombre || `Entrenador ${id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("")
            setStatusFilter("")
            setServiceFilter("")
            setTrainerFilter("")
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>

      {/* Tabla de programaciones */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Entrenador</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Horario</TableHead>
              <TableHead>Cupos</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedSchedules().length > 0 ? (
              getPaginatedSchedules().map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.codigo || `PR${schedule.id.toString().padStart(4, "0")}`}
                  </TableCell>
                  <TableCell>{schedule.servicio_nombre || `Servicio ${schedule.id_servicio}`}</TableCell>
                  <TableCell>{schedule.entrenador_nombre || `Entrenador ${schedule.id_entrenador}`}</TableCell>
                  <TableCell>{format(new Date(schedule.fecha), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {format(new Date(schedule.hora_inicio), "HH:mm")} - {format(new Date(schedule.hora_fin), "HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-500" />
                      <span>
                        {schedule.cupos_ocupados}/{schedule.cupo_maximo}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        schedule.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }
                    >
                      {schedule.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewSchedule(schedule)}>
                        <Eye className="h-4 w-4" />
                      </Button>

                      {user?.role === "admin" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEditSchedule(schedule)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Calendar className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron programaciones</p>
                    <p className="text-sm">Intenta con otros criterios de búsqueda</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {filteredSchedules.length > itemsPerPage && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, filteredSchedules.length)} de {filteredSchedules.length}{" "}
            programaciones
          </p>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(Math.ceil(filteredSchedules.length / itemsPerPage), prev + 1))
              }
              disabled={currentPage === Math.ceil(filteredSchedules.length / itemsPerPage)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modales */}
      {/* Modal de visualización */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Detalles de la Programación</DialogTitle>
          {selectedSchedule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Código</h3>
                  <p>{selectedSchedule.codigo || `PR${selectedSchedule.id.toString().padStart(4, "0")}`}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                  <Badge
                    className={
                      selectedSchedule.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedSchedule.estado}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Servicio</h3>
                  <p>{selectedSchedule.servicio_nombre || `Servicio ${selectedSchedule.id_servicio}`}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Entrenador</h3>
                  <p>{selectedSchedule.entrenador_nombre || `Entrenador ${selectedSchedule.id_entrenador}`}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
                  <p>{format(new Date(selectedSchedule.fecha), "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Horario</h3>
                  <p>
                    {format(new Date(selectedSchedule.hora_inicio), "HH:mm")} -{" "}
                    {format(new Date(selectedSchedule.hora_fin), "HH:mm")}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Cupos</h3>
                  <p>
                    {selectedSchedule.cupos_ocupados}/{selectedSchedule.cupo_maximo}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de registro</h3>
                  <p>{format(new Date(selectedSchedule.fecha_registro), "dd/MM/yyyy")}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button onClick={() => setIsViewModalOpen(false)}>Cerrar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

