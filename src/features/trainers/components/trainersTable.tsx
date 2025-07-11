import { useState, useMemo } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Dumbbell,
  Power,
  RotateCcw
} from "lucide-react"
import { TrainerDetailModal } from "./trainerDetailModal"
import { TrainerModal } from "./trainerModal"
import { useAuth } from "@/shared/contexts/authContext"
import { usePermissions } from "@/shared/hooks/usePermissions"
import type { TrainerDisplayData } from "@/shared/types/trainer"
import Swal from "sweetalert2"
import { Badge } from "@/shared/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

interface TrainersTableProps {
  trainers: TrainerDisplayData[]
  isLoading: boolean
  onUpdateTrainer: (trainer: TrainerDisplayData) => Promise<void>
  onDeleteTrainer: (trainer: TrainerDisplayData) => Promise<void>
  onToggleStatus: (trainer: TrainerDisplayData) => Promise<void>
}

export function TrainersTable({ 
  trainers, 
  isLoading,
  onUpdateTrainer,
  onDeleteTrainer,
  onToggleStatus,
}: TrainersTableProps) {
  const { hasPrivilege } = usePermissions()
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerDisplayData | null>(null)
  
  const canUpdate = useMemo(() => hasPrivilege('ENTRENADORES', 'TRAINER_UPDATE'), [hasPrivilege])
  const canDelete = useMemo(() => hasPrivilege('ENTRENADORES', 'TRAINER_DELETE'), [hasPrivilege])

  const handleViewTrainer = (trainer: TrainerDisplayData) => {
    setSelectedTrainer(trainer)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedTrainer(null)
  }

  const handleEditTrainer = (trainer: TrainerDisplayData) => {
    if (!canUpdate) return
    setSelectedTrainer(trainer)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedTrainer(null)
  }

  const handleSaveTrainer = async (trainerData: Omit<TrainerDisplayData, "id" | "codigo">) => {
    if (!selectedTrainer) return
    
    const updatedTrainer: TrainerDisplayData = {
      ...selectedTrainer,
      ...trainerData,
    }
    
    await onUpdateTrainer(updatedTrainer)
    setIsEditModalOpen(false)
    setSelectedTrainer(null)
  }

  const handleDelete = async (trainer: TrainerDisplayData) => {
    if (!canDelete) return
    
    const result = await Swal.fire({
      title: "¿Eliminar entrenador?",
      text: `¿Está seguro que desea eliminar a ${trainer.name} ${trainer.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    })

    if (result.isConfirmed) {
      await onDeleteTrainer(trainer)
    }
  }

  const handleToggleStatus = async (trainer: TrainerDisplayData) => {
    if (!canUpdate) return
    
    const result = await Swal.fire({
      title: trainer.isActive ? "¿Desactivar entrenador?" : "¿Activar entrenador?",
      text: trainer.isActive
        ? `¿Está seguro que desea desactivar a ${trainer.name} ${trainer.lastName}?`
        : `¿Está seguro que desea activar a ${trainer.name} ${trainer.lastName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: trainer.isActive ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar"
    })

    if (result.isConfirmed) {
      await onToggleStatus(trainer)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Especialidad</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Dumbbell className="h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">No se encontraron entrenadores</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            trainers.map((trainer) => (
              <TableRow key={trainer.id}>
                <TableCell className="font-medium">{trainer.codigo || "N/A"}</TableCell>
                <TableCell className="font-medium">
                  {trainer.name} {trainer.lastName}
                </TableCell>
                <TableCell>{trainer.specialty || "N/A"}</TableCell>
                <TableCell>{trainer.email || "N/A"}</TableCell>
                <TableCell className="font-medium">
                  {trainer.documentType} {trainer.documentNumber}
                </TableCell>
                <TableCell>
                  {trainer.isActive ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewTrainer(trainer)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      {canUpdate && (
                        <DropdownMenuItem onClick={() => handleEditTrainer(trainer)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {canUpdate && (
                        <DropdownMenuItem onClick={() => handleToggleStatus(trainer)}>
                          {trainer.isActive ? (
                            <Power className="w-4 h-4 mr-2" />
                          ) : (
                            <RotateCcw className="w-4 h-4 mr-2" />
                          )}
                          {trainer.isActive ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(trainer)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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

      {selectedTrainer && (
        <TrainerDetailModal
          trainer={selectedTrainer}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          onEdit={handleEditTrainer}
          onDelete={handleDelete}
        />
      )}
      
      {selectedTrainer && isEditModalOpen && (
        <TrainerModal
          trainer={selectedTrainer}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveTrainer}
          title="Editar Entrenador"
        />
      )}
    </>
  )
}