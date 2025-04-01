"use client"

import { useState, useEffect } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Eye, Edit, Search, X, Plus, MessageSquare, Star, CheckCircle, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import Swal from "sweetalert2"
import type { Survey } from "@/types"

interface SurveyListProps {
  surveys: Survey[]
  onAddSurvey: (survey: Omit<Survey, "id">) => void
  onUpdateSurvey: (id: number, updates: Partial<Survey>) => void
  onDeleteSurvey: (id: number) => void
}

export function SurveyList({ surveys, onAddSurvey, onUpdateSurvey, onDeleteSurvey }: SurveyListProps) {
  const { user } = useAuth()
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([])
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar encuestas
  useEffect(() => {
    let filtered = [...surveys]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (survey) =>
          survey.titulo.toLowerCase().includes(term) ||
          (survey.descripcion && survey.descripcion.toLowerCase().includes(term)) ||
          (survey.servicio_nombre && survey.servicio_nombre.toLowerCase().includes(term)) ||
          survey.codigo?.toLowerCase().includes(term),
      )
    }

    // Filtrar por estado
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((survey) => (statusFilter === "active" ? survey.estado : !survey.estado))
    }

    // Filtrar por servicio
    if (serviceFilter && serviceFilter !== "all") {
      filtered = filtered.filter((survey) =>
        survey.id_servicio ? survey.id_servicio.toString() === serviceFilter : serviceFilter === "none",
      )
    }

    setFilteredSurveys(filtered)
    setCurrentPage(1)
  }, [surveys, searchTerm, statusFilter, serviceFilter])

  const handleViewSurvey = (survey: Survey) => {
    setSelectedSurvey(survey)
    setIsViewModalOpen(true)
  }

  const handleEditSurvey = (survey: Survey) => {
    setSelectedSurvey(survey)
    setIsEditModalOpen(true)
  }

  const handleDeleteSurvey = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas eliminar esta encuesta? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteSurvey(id)

        Swal.fire({
          title: "Eliminada",
          text: "La encuesta ha sido eliminada exitosamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  const handleToggleSurveyStatus = (id: number, currentStatus: boolean) => {
    Swal.fire({
      title: `¿${currentStatus ? "Desactivar" : "Activar"} encuesta?`,
      text: `¿Deseas ${currentStatus ? "desactivar" : "activar"} esta encuesta?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#d33" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Sí, ${currentStatus ? "desactivar" : "activar"}`,
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        onUpdateSurvey(id, { estado: !currentStatus })

        Swal.fire({
          title: `Encuesta ${currentStatus ? "desactivada" : "activada"}`,
          text: `La encuesta ha sido ${currentStatus ? "desactivada" : "activada"} exitosamente.`,
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  // Paginación
  const getPaginatedSurveys = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredSurveys.slice(startIndex, endIndex)
  }

  // Obtener servicios únicos para los filtros
  const uniqueServices = Array.from(new Set(surveys.filter((s) => s.id_servicio).map((s) => s.id_servicio)))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Encuestas de Satisfacción</h2>

        {user?.role === "admin" && (
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-black hover:bg-gray-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Encuesta
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por título, descripción o servicio"
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
            <SelectItem value="active">Activa</SelectItem>
            <SelectItem value="inactive">Inactiva</SelectItem>
          </SelectContent>
        </Select>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los servicios</SelectItem>
            <SelectItem value="none">Sin servicio específico</SelectItem>
            {uniqueServices.map((id) => (
              <SelectItem key={id} value={id?.toString() || ""}>
                {surveys.find((s) => s.id_servicio === id)?.servicio_nombre || `Servicio ${id}`}
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
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>

      {/* Tabla de encuestas */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Respuestas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getPaginatedSurveys().length > 0 ? (
              getPaginatedSurveys().map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell className="font-medium">
                    {survey.codigo || `E${survey.id.toString().padStart(4, "0")}`}
                  </TableCell>
                  <TableCell>{survey.titulo}</TableCell>
                  <TableCell>{survey.servicio_nombre || "General"}</TableCell>
                  <TableCell>{format(new Date(survey.fecha_inicio), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {survey.fecha_fin ? format(new Date(survey.fecha_fin), "dd/MM/yyyy") : "Sin fecha límite"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-gray-500" />
                      <span>{survey.respuestas_count || 0}</span>
                      {survey.calificacion_promedio && (
                        <div className="ml-2 flex items-center">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="ml-1 text-sm">{survey.calificacion_promedio.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={survey.estado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {survey.estado ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewSurvey(survey)}>
                        <Eye className="h-4 w-4" />
                      </Button>

                      {user?.role === "admin" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEditSurvey(survey)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={
                              survey.estado
                                ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                                : "text-green-600 hover:text-green-800 hover:bg-green-50"
                            }
                            onClick={() => handleToggleSurveyStatus(survey.id, survey.estado)}
                          >
                            {survey.estado ? <X className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleDeleteSurvey(survey.id)}
                          >
                            <Trash className="h-4 w-4" />
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
                    <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-lg font-medium">No se encontraron encuestas</p>
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

