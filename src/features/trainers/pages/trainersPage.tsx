import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { 
  Plus, 
  Search, 
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { trainerService } from "../services/trainerService"
import type { TrainerDisplayData } from "@/shared/types/trainer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { TrainerModal } from "../components/trainerModal"
import { useToast } from "@/shared/components/ui/use-toast"
import { usePermissions } from "@/shared/hooks/usePermissions"
import Swal from "sweetalert2"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

export function TrainersPage() {
  const [trainers, setTrainers] = useState<TrainerDisplayData[]>([])
  const [filteredTrainers, setFilteredTrainers] = useState<TrainerDisplayData[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editingTrainer, setEditingTrainer] = useState<TrainerDisplayData | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  const { hasPrivilege } = usePermissions()

  const canCreate = hasPrivilege('ENTRENADORES', 'TRAINER_CREATE')
  const canUpdate = hasPrivilege('ENTRENADORES', 'TRAINER_UPDATE')
  const canDelete = hasPrivilege('ENTRENADORES', 'TRAINER_DELETE')

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

      const response = await trainerService.getTrainersWithCompleteUserInfo()
      
      if (Array.isArray(response)) {
        setTrainers(response)
      } else {
        console.error("Unexpected response format:", response)
        setTrainers([])
        setError("Formato de respuesta inesperado del servidor")
      }
    } catch (error) {
      console.error("Error loading trainers:", error)
      setTrainers([])
      setError((error as Error)?.message || "Error al cargar los entrenadores")
    } finally {
      setIsLoading(false)
    }
  }

  const filterTrainers = () => {
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
    setCurrentPage(1) // Reset page when filters change
  }

  const handleSaveTrainer = async (trainerData: Omit<TrainerDisplayData, "id">) => {
    try {
      if (editingTrainer) {
        if (!canUpdate) {
          toast({
            title: "Error",
            description: "No tienes permisos para actualizar entrenadores",
            variant: "destructive",
          })
          return
        }
        const updatedTrainer: TrainerDisplayData = {
          ...editingTrainer,
          ...trainerData,
        }
        await trainerService.updateTrainer(updatedTrainer)
        toast({
          title: "¡Éxito!",
          description: "Entrenador actualizado correctamente",
        })
      } else {
        if (!canCreate) {
          toast({
            title: "Error",
            description: "No tienes permisos para crear entrenadores",
            variant: "destructive",
          })
          return
        }
        await trainerService.createTrainer(trainerData)
        toast({
          title: "¡Éxito!",
          description: "Entrenador creado correctamente",
        })
      }

      await loadTrainers()
      setIsModalOpen(false)
      setEditingTrainer(undefined)
    } catch (error) {
      console.error("Error saving trainer:", error)
      toast({
        title: "Error",
        description: (error as Error)?.message || "Error al guardar el entrenador",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleEditTrainer = (trainer: TrainerDisplayData) => {
    if (!canUpdate) {
      toast({
        title: "Error",
        description: "No tienes permisos para actualizar entrenadores",
        variant: "destructive",
      })
      return
    }
    setEditingTrainer(trainer)
    setIsModalOpen(true)
  }

  const handleDeleteTrainer = async (trainer: TrainerDisplayData) => {
    if (!canDelete) {
      toast({
        title: "Error",
        description: "No tienes permisos para eliminar entrenadores",
        variant: "destructive",
      })
      return
    }
    
    const result = await Swal.fire({
      title: "¿Eliminar entrenador?",
      text: `¿Estás seguro de que deseas eliminar a ${trainer.name} ${trainer.lastName}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        await trainerService.deleteTrainer(trainer.id?.toString() || "")
        await loadTrainers()
        toast({
          title: "¡Éxito!",
          description: "Entrenador eliminado correctamente",
        })
      } catch (error) {
        console.error("Error deleting trainer:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el entrenador",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleStatus = async (trainer: TrainerDisplayData) => {
    if (!canUpdate) {
      toast({
        title: "Error",
        description: "No tienes permisos para actualizar entrenadores",
        variant: "destructive",
      })
      return
    }
    
    try {
      const updatedTrainer = { ...trainer, isActive: !trainer.isActive }
      await trainerService.updateTrainer(updatedTrainer)
      await loadTrainers()
      toast({
        title: "¡Éxito!",
        description: `Entrenador ${trainer.isActive ? "desactivado" : "activado"} correctamente`,
      })
    } catch (error) {
      console.error("Error toggling trainer status:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del entrenador",
        variant: "destructive",
      })
    }
  }

  const handleNewTrainer = () => {
    if (!canCreate) {
      toast({
        title: "Error",
        description: "No tienes permisos para crear entrenadores",
        variant: "destructive",
      })
      return
    }
    setEditingTrainer(undefined)
    setIsModalOpen(true)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTrainers = filteredTrainers.slice(startIndex, endIndex)

  if (trainers.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entrenadores registrados</h3>
              <p className="text-gray-500 mb-4">Comience agregando el primer entrenador al sistema</p>
              {canCreate && (
                <Button onClick={handleNewTrainer} className="bg-black hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Entrenador
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
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
          <p className="text-gray-600">Gestión de entrenadores del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadTrainers}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {canCreate && (
            <Button onClick={handleNewTrainer} className="bg-black hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Entrenador
            </Button>
          )}
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
            <Users className="h-5 w-5" />
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
                  <TableHead>Correo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron entrenadores</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTrainers.map((trainer) => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">{trainer.codigo || 'N/A'}</TableCell>
                      <TableCell>{trainer.name} {trainer.lastName}</TableCell>
                      <TableCell>{trainer.email}</TableCell>
                      <TableCell>{trainer.documentNumber}</TableCell>
                      <TableCell>{trainer.specialty}</TableCell>
                      <TableCell>
                        {getStatusBadge(trainer.isActive)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTrainer(trainer)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(trainer)}>
                              {trainer.isActive ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            {canDelete && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTrainer(trainer)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredTrainers.length)} de{" "}
            {filteredTrainers.length} entrenadores
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <TrainerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTrainer(undefined)
        }}
        onSave={handleSaveTrainer}
        trainer={editingTrainer}
        title={editingTrainer ? "Editar Entrenador" : "Nuevo Entrenador"}
      />
    </div>
  )
}
