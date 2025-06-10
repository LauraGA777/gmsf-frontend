"use client"

import { useState, useEffect } from "react"
import { Eye, Edit, Trash, CheckCircle, AlertTriangle, Search, Plus, Table } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import type { Trainer } from "@/shared/types/trainer"

interface TrainerTableProps {
  trainers: Trainer[]
  onView: (trainer: Trainer) => void
  onEdit: (trainer: Trainer) => void
  onDelete: (trainer: Trainer) => void
  onAdd: () => void
}

const getTrainerStatusStyles = (isActive: boolean) => {
  if (isActive) {
    return {
      styles: "bg-green-50 text-green-800 border-green-100",
      label: "Activo",
      icon: <CheckCircle className="h-3.5 w-3.5 m-1" aria-hidden="true" />,
    }
  }
  return {
    styles: "bg-red-50 text-red-800 border-red-100",
    label: "Inactivo",
    icon: <AlertTriangle className="h-3.5 w-3.5 m-1" aria-hidden="true" />,
  }
}

export const TrainerTable: React.FC<TrainerTableProps> = ({ trainers, onView, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [displayedTrainers, setDisplayedTrainers] = useState<Trainer[]>(trainers)
  const [currentPage, setCurrentPage] = useState(1)
  const trainersPerPage = 10

  // Filtrar entrenadores según el término de búsqueda
  useEffect(() => {
    const filtered = trainers.filter((trainer) =>
      [trainer.name, trainer.email, trainer.phone, trainer.specialty]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setDisplayedTrainers(filtered)
    setCurrentPage(1) // Reinicia a la primera página al cambiar el término de búsqueda
  }, [searchTerm, trainers])

  // Obtener entrenadores paginados
  const getPaginatedTrainers = () => {
    const startIndex = (currentPage - 1) * trainersPerPage
    const endIndex = startIndex + trainersPerPage
    return displayedTrainers.slice(startIndex, endIndex)
  }

  // Calcular el número total de páginas
  const totalPages = Math.ceil(displayedTrainers.length / trainersPerPage)

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="ml-3 text-2xl font-bold text-gray-800">Gestión de Entrenadores</h2>
          <div className="flex items-center justify-between mb-4 m-4">
            <div className="text-sm text-gray-500 mr-4">
              Mostrando {displayedTrainers.length} de {trainers.length} entrenadores
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={onAdd} // Llama a la función pasada como prop
              className="h-10 px-4 flex items-center gap-2 "
            >
              <Plus className="h-4 w-4 " />
              Añadir Entrenador
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email, teléfono o especialidad"
              className="ml-3 h-9 pl-9"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="mr-4 h-9 px-4"
            disabled={!searchTerm}
          >
            Limpiar
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Teléfono
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Especialidad
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className=" divide-y divide-gray-200">
            {getPaginatedTrainers().length > 0 ? (
              getPaginatedTrainers().map((trainer) => {
                const { styles, label, icon } = getTrainerStatusStyles(trainer.isActive)
                return (
                  <tr key={trainer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trainer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{trainer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{trainer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{trainer.specialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles}`}>
                        {icon} {label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-6">
                        <button
                          onClick={() => onView(trainer)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" color="black" />
                        </button>
                        <button
                          onClick={() => onEdit(trainer)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Editar entrenador"
                        >
                          <Edit className="h-4 w-4" color="black" />
                        </button>
                        <button
                          onClick={() => onDelete(trainer)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar entrenador"
                        >
                          <Trash className="h-4 w-4" color="black" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay entrenadores disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Paginador */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mr-2"
            >
              Anterior
            </Button>
            <span className="text-sm text-gray-500 flex items-center">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-2"
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
