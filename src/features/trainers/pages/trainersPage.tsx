"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Plus, Search, MoreHorizontal, RefreshCw, Edit, Eye, Trash2, RotateCcw, Power, Dumbbell } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { trainerService } from "../services/trainerService"
import type { Trainer } from "@/shared/types/trainer"
import Swal from "sweetalert2"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { TrainerModal } from "../components/trainerModal"
import { TrainerDetailModal } from "../components/trainerDetailModal"

export function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadTrainers()
  }, [])

  useEffect(() => {
    filterTrainers()
  }, [trainers, searchTerm, statusFilter])

  const loadTrainers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Usar el método mejorado que obtiene información completa del usuario
      const response = await trainerService.getTrainersWithCompleteUserInfo()

      // Verificar si la respuesta es un array
      if (Array.isArray(response)) {
        setTrainers(response)
      } else if (response && Array.isArray(response.data)) {
        // Si la respuesta viene envuelta en un objeto con propiedad data
        setTrainers(response.data)
      } else {
        console.error("Unexpected response format:", response)
        setTrainers([])
        setError("Formato de respuesta inesperado del servidor")
      }
    } catch (error) {
      console.error("Error loading trainers:", error)
      setTrainers([]) // Asegurar que trainers sea siempre un array
      setError(error.message || "Error al cargar los entrenadores")
    } finally {
      setIsLoading(false)
    }
  }

  const filterTrainers = () => {
    // Verificar que trainers sea un array antes de filtrar
    if (!Array.isArray(trainers)) {
      setFilteredTrainers([])
      return
    }

    let filtered = [...trainers]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (trainer) =>
          trainer.name?.toLowerCase().includes(term) ||
          trainer.lastName?.toLowerCase().includes(term) ||
          trainer.email?.toLowerCase().includes(term) ||
          trainer.documentNumber?.toLowerCase().includes(term) ||
          trainer.specialty?.toLowerCase().includes(term),
      )
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter((trainer) => trainer.isActive === isActive)
    }

    // Ordenar por código de entrenador (ascendente)
    filtered.sort((a, b) => {
      const codeA = a.codigo || ""
      const codeB = b.codigo || ""
      return codeA.localeCompare(codeB, undefined, { numeric: true })
    })

    setFilteredTrainers(filtered)
  }

  const handleViewDetails = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    setIsDetailsOpen(true)
  }

  const handleEditTrainer = (trainer: Trainer) => {
    setEditingTrainer(trainer)
    setIsModalOpen(true)
  }

  const handleSaveTrainer = async (trainerData: Omit<Trainer, "id">) => {
    try {
      if (editingTrainer) {
        const updatedTrainer: Trainer = {
          ...editingTrainer,
          ...trainerData,
        }
        await trainerService.updateTrainer(updatedTrainer)
      } else {
        await trainerService.createTrainer(trainerData)
      }

      // Recargar la lista de entrenadores
      await loadTrainers()

      // Cerrar el modal
      setIsModalOpen(false)
      setEditingTrainer(null)
    } catch (error) {
      console.error("Error saving trainer:", error)
      // El error se maneja en el modal, así que solo lo propagamos
      throw error
    }
  }

  const handleDeleteTrainer = async (trainer: Trainer) => {
    const result = await Swal.fire({
      title: "¿Eliminar entrenador?",
      text: `¿Está seguro que desea eliminar a ${trainer.name} ${trainer.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      allowEscapeKey: false,
    })

    if (result.isConfirmed) {
      try {
        await trainerService.deleteTrainer(trainer.id)
        await loadTrainers()

        Swal.fire({
          title: "¡Eliminado!",
          text: "El entrenador ha sido eliminado correctamente",
          icon: "success",
          confirmButtonColor: "#000",
          confirmButtonText: "Cerrar",
          timer: 5000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
        })
      } catch (error) {
        console.error("Error deleting trainer:", error)
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el entrenador",
          icon: "error",
          confirmButtonColor: "#000",
          confirmButtonText: "Cerrar",
          timer: 5000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
        })
      }
    }
  }

  const handleToggleStatus = async (trainer: Trainer) => {
    const result = await Swal.fire({
      title: trainer.isActive ? "¿Desactivar entrenador?" : "¿Activar entrenador?",
      text: trainer.isActive
        ? `¿Está seguro que desea desactivar a ${trainer.name} ${trainer.lastName}?`
        : `¿Está seguro que desea activar a ${trainer.name} ${trainer.lastName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6B7280",
      confirmButtonText: trainer.isActive ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
      allowEscapeKey: false,
    })

    if (result.isConfirmed) {
      try {
        const updatedTrainer = { ...trainer, isActive: !trainer.isActive }
        await trainerService.updateTrainer(updatedTrainer)
        await loadTrainers()

        Swal.fire({
          title: trainer.isActive ? "¡Desactivado!" : "¡Activado!",
          text: `El entrenador ha sido ${trainer.isActive ? "desactivado" : "activado"} correctamente`,
          icon: "success",
          confirmButtonColor: "#000",
          confirmButtonText: "Cerrar",
          timer: 5000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
        })
      } catch (error) {
        console.error("Error toggling trainer status:", error)
        Swal.fire({
          title: "Error",
          text: "No se pudo cambiar el estado del entrenador",
          icon: "error",
          confirmButtonColor: "#000",
          confirmButtonText: "Cerrar",
          timer: 5000,
          timerProgressBar: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
        })
      }
    }
  }

  const paginatedTrainers = filteredTrainers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage)

  if (trainers.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Dumbbell className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entrenadores registrados</h3>
            <p className="text-gray-500 mb-4">Comience agregando el primer entrenador al sistema</p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Entrenador
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => {
              setError(null)
              loadTrainers()
            }}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Entrenadores</h1>
          <p className="text-gray-600">Gestión de entrenadores del gimnasio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTrainers} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => {
              setEditingTrainer(null)
              setIsModalOpen(true)
            }}
            className="bg-black hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Entrenador
          </Button>
        </div>
      </div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, correo, documento o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Lista de Entrenadores ({filteredTrainers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Dumbbell className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron entrenadores</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTrainers.map((trainer) => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">{trainer.codigo || "N/A"}</TableCell>
                      <TableCell className="font-medium">
                        {trainer.name} {trainer.lastName}
                      </TableCell>
                      <TableCell>{trainer.specialty || "N/A"}</TableCell>
                      <TableCell>{trainer.email || "N/A"}</TableCell>
                      <TableCell>{trainer.phone || "N/A"}</TableCell>
                      <TableCell className="font-medium">
                        {trainer.documentNumber && trainer.documentNumber !== "No disponible" ? (
                          trainer.documentNumber
                        ) : (
                          <span className="text-orange-600">Información incompleta</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {trainer.isActive ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {trainer.hireDate ? format(new Date(trainer.hireDate), "dd/MM/yyyy", { locale: es }) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(trainer)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTrainer(trainer)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(trainer)}>
                              {trainer.isActive ? (
                                <Power className="w-4 h-4 mr-2" />
                              ) : (
                                <RotateCcw className="w-4 h-4 mr-2" />
                              )}
                              {trainer.isActive ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTrainer(trainer)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            Anterior
          </Button>
          <span className="py-2 px-3 text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <TrainerDetailModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          trainer={selectedTrainer}
          onEdit={handleEditTrainer}
          onDelete={handleDeleteTrainer}
        />
      )}

      {/* New/Edit Trainer Modal */}
      <TrainerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTrainer(null)
        }}
        onSave={handleSaveTrainer}
        trainer={editingTrainer}
        title={editingTrainer ? "Editar Entrenador" : "Nuevo Entrenador"}
      />
    </div>
  )
}
