import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Eye, Edit, Power, Plus, Search } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { formatCOP, formatDays, truncateText } from "@/shared/lib/utils"
import { FilterStatus } from "@/shared/types/membership"

interface MembershipTableProps {
  memberships: any[]
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
  onViewDetails: (membership: any) => void
  onEdit: (membership: any) => void
  onToggleStatus: (membership: any) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: FilterStatus
  onFilterChange: (value: FilterStatus) => void
  onCreateNew: () => void
}

export function MembershipTable({
  memberships,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onCreateNew,
  searchTerm,
  onSearchChange,
  
}: MembershipTableProps) {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="ml-3 text-2xl font-bold text-gray-800">Gestión de Membresías</h2>
          <div className="flex items-center justify-between mb-4 m-4">
            <div className="text-sm text-gray-500 mr-4">
              Mostrando {totalItems === 0 ? 0 : (currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} de {totalItems} membresías
            </div>
            <Button variant="default" size="sm" onClick={onCreateNew} className="h-10 px-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Añadir Membresía
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Buscar por código o nombre"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="ml-3 h-9 pl-9"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => onSearchChange("")}
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Descripción
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Días Acceso/Vigencia
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {memberships.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay membresías disponibles
                </td>
              </tr>
            ) : (
              memberships.map((membership) => (
                <tr key={membership.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className="font-mono">
                      {membership.code}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{membership.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-500">{truncateText(membership.description)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold">{formatCOP(membership.price)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-500">
                      {formatDays(membership.accessDays, membership.validityDays)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={membership.isActive ? "default" : "secondary"}
                      className={membership.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {membership.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-6">
                      <button
                        onClick={() => onViewDetails(membership)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" color="black" />
                      </button>
                      <button
                        onClick={() => onEdit(membership)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Editar membresía"
                      >
                        <Edit className="h-4 w-4" color="black" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(membership)}
                        className="text-gray-600 hover:text-gray-900"
                        title={membership.isActive ? "Desactivar" : "Activar"}
                      >
                        <Power 
                          className={`h-4 w-4 ${membership.isActive ? "text-red-500" : "text-green-500"}`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="flex justify-center flex-1">
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                {"<"}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                {">"}
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
