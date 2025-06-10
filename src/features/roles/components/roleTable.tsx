"use client"

import { useState, useEffect } from "react"
import { Eye, Edit, Trash, CheckCircle, AlertTriangle, Search, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import type { Role } from "@/shared/types/role"

interface RoleTableProps {
  roles: Role[]
  onView: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onAdd: () => void
}

const getStatusStyles = (status: string) => {
  if (status === "Activo") {
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

export const RoleTable: React.FC<RoleTableProps> = ({ roles, onView, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [displayedRoles, setDisplayedRoles] = useState<Role[]>(roles)
  const [currentPage, setCurrentPage] = useState(1)
  const rolesPerPage = 10

  // Filtrar roles según el término de búsqueda
  useEffect(() => {
    const filtered = roles.filter((role) =>
      [role.name, role.description]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setDisplayedRoles(filtered)
    setCurrentPage(1) // Reinicia a la primera página al cambiar el término de búsqueda
  }, [searchTerm, roles])

  // Obtener roles paginados
  const getPaginatedRoles = () => {
    const startIndex = (currentPage - 1) * rolesPerPage
    const endIndex = startIndex + rolesPerPage
    return displayedRoles.slice(startIndex, endIndex)
  }

  // Calcular el número total de páginas
  const totalPages = Math.ceil(displayedRoles.length / rolesPerPage)

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="ml-3 text-2xl font-bold text-gray-800">Gestión de Roles</h2>
          <div className="flex items-center justify-between mb-4 m-4">
            <div className="text-sm text-gray-500 mr-4">
              Mostrando {getPaginatedRoles().length} de {displayedRoles.length} roles
            </div>
            <Button variant="default" size="sm" onClick={onAdd} className="h-10 px-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Añadir Rol
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción"
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
                Descripción
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
          <tbody className="divide-y divide-gray-200">
            {getPaginatedRoles().length > 0 ? (
              getPaginatedRoles().map((role) => {
                const { styles, label, icon } = getStatusStyles(role.status || "Activo")
                return (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{role.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles}`}>
                        {icon} {label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-6">
                        <button
                          onClick={() => onView(role)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" color="black" />
                        </button>
                        <button
                          onClick={() => onEdit(role)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Editar rol"
                        >
                          <Edit className="h-4 w-4" color="black" />
                        </button>
                        <button
                          onClick={() => onDelete(role)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar rol"
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
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay roles disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
  )
}
