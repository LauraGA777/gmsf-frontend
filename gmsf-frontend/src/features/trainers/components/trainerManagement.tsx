import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { TrainerTable } from "./trainerTable"
import { TrainerModal } from "./trainerModal"
import { TrainerDetailModal } from "./trainerDetailModal"
import type { Trainer, TrainerFormData } from "@/shared/types/trainer"
import { trainerService } from "../services/trainerService"
import { Pagination } from "@/shared/layout/pagination"
import Swal from "sweetalert2"

export const TrainerManagement: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null)
  const [modalTitle, setModalTitle] = useState("Crear Entrenador")
  const [searchTerm, setSearchTerm] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedTrainers, setPaginatedTrainers] = useState<Trainer[]>([])

  // Función para cargar los entrenadores - ahora es reutilizable
  const fetchTrainers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await trainerService.getTrainers()
      setTrainers(data)
      setFilteredTrainers(data)
    } catch (error) {
      console.error("Error fetching trainers:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los entrenadores. Por favor, intente de nuevo.",
        icon: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial de datos
  useEffect(() => {
    fetchTrainers()
  }, [fetchTrainers])

  // Filter trainers based on search term
  useEffect(() => {
    const filtered = trainers.filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.phone.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredTrainers(filtered)
    setCurrentPage(1)
  }, [searchTerm, trainers])

  // Update pagination
  useEffect(() => {
    const total = Math.ceil(filteredTrainers.length / itemsPerPage)
    setTotalPages(total || 1)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedTrainers(filteredTrainers.slice(startIndex, endIndex))
  }, [filteredTrainers, currentPage, itemsPerPage])

  const handleCreateTrainer = () => {
    setSelectedTrainer(null)
    setModalTitle("Crear Entrenador")
    setIsModalOpen(true)
  }

  const handleEditTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    setModalTitle("Editar Entrenador")
    setIsModalOpen(true)
  }

  const handleViewTrainer = (trainer: Trainer) => {
    setSelectedTrainer(trainer)
    setIsDetailModalOpen(true)
  }

  const handleDeleteTrainer = async (trainer: Trainer) => {
    const result = await Swal.fire({
      title: "¿Eliminar entrenador?",
      text: `¿Está seguro de que desea eliminar al entrenador "${trainer.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#000000FF",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        await trainerService.deleteTrainer(trainer.id)
        // Actualizar la lista de entrenadores después de eliminar
        await fetchTrainers()
        setIsDetailModalOpen(false)

        Swal.fire({
          title: "¡Eliminado!",
          text: "El entrenador ha sido eliminado correctamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error deleting trainer:", error)
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el entrenador.",
          icon: "error",
        })
      }
    }
  }

  const handleSaveTrainer = async (trainerData: TrainerFormData) => {
    try {
      setIsModalOpen(false) // Cerrar el modal inmediatamente para evitar múltiples envíos

      if (selectedTrainer) {
        // Update existing trainer
        await trainerService.updateTrainer(selectedTrainer.id, trainerData)
      } else {
        // Create new trainer
        await trainerService.createTrainer(trainerData)
      }

      // Recargar los datos para mostrar los cambios
      await fetchTrainers()

      // Mostrar mensaje de éxito
      Swal.fire({
        title: "¡Guardado!",
        text: selectedTrainer ? "Entrenador actualizado correctamente." : "Entrenador creado correctamente.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error saving trainer:", error)
      // Mostrar mensaje de error
      Swal.fire({
        title: "Error",
        text: "No se pudo guardar el entrenador.",
        icon: "error",
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4">
        <TrainerTable
          trainers={paginatedTrainers}
          onView={handleViewTrainer}
          onEdit={handleEditTrainer}
          onDelete={handleDeleteTrainer}
          onAdd={handleCreateTrainer}
        />
      </div>

      {filteredTrainers.length > itemsPerPage && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      <TrainerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTrainer}
        trainer={selectedTrainer || undefined}
        title={modalTitle}
      />

      {selectedTrainer && (
        <TrainerDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          trainer={selectedTrainer}
          onEdit={handleEditTrainer}
          onDelete={handleDeleteTrainer}
        />
      )}
    </div>
  )
}