"use client"

import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Plus, Search, MoreHorizontal, RefreshCw, Edit, Eye, Trash2, RotateCcw, Power, Shield } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { roleService } from "../services/roleService"
import type { Role, PermissionSelection } from "@/shared/types/role"
import Swal from "sweetalert2"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { RoleModal } from "../components/roleModal"
import { RoleDetailModal } from "../components/roleDetailModal"
import { usePermissions } from "@/shared/hooks/usePermissions"

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Hook de permisos
  const { hasPrivilege } = usePermissions()

  // Verificar permisos específicos
  const canCreate = hasPrivilege("Gestión de roles", "Crear")
  const canEdit = hasPrivilege("Gestión de roles", "Actualizar")
  const canDelete = hasPrivilege("Gestión de roles", "Eliminar")
  const canView = hasPrivilege("Gestión de roles", "Leer")

  useEffect(() => {
    loadRoles()
  }, [])

  useEffect(() => {
    filterRoles()
  }, [roles, searchTerm, statusFilter])

  const loadRoles = async () => {
    try {
      setIsLoading(true)
      const data = await roleService.getRoles()
      setRoles(data)
    } catch (error) {
      console.error("Error loading roles:", error)
      setError("Error al cargar los roles")
    } finally {
      setIsLoading(false)
    }
  }

  const filterRoles = () => {
    let filtered = [...roles]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (role) => role.name.toLowerCase().includes(term) || role.description.toLowerCase().includes(term),
      )
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter((role) => {
        const roleStatus = role.status === "Activo"
        return roleStatus === isActive
      })
    }

    setFilteredRoles(filtered)
  }

  const handleViewDetails = (role: Role) => {
    setSelectedRole(role)
    setIsDetailsOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setIsModalOpen(true)
  }

  const handleSaveRole = async (roleData: Omit<Role, "id">, selectedPermissions: PermissionSelection[]) => {
    try {
      if (editingRole) {
        await roleService.updateRole(
          {
            ...roleData,
            id: editingRole.id,
          },
          selectedPermissions,
        )
      } else {
        await roleService.createRole(roleData, selectedPermissions)
      }
      await loadRoles()
      setIsModalOpen(false)
      setEditingRole(null)
    } catch (error) {
      console.error("Error saving role:", error)
      throw error
    }
  }

  const handleDeleteRole = async (role: Role) => {
    const result = await Swal.fire({
      title: "¿Eliminar rol?",
      text: `¿Está seguro que desea eliminar el rol ${role.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        await roleService.deleteRole(role.id.toString())
        await loadRoles()

        Swal.fire({
          title: "¡Eliminado!",
          text: "El rol ha sido eliminado correctamente",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error deleting role:", error)
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el rol. Puede que tenga usuarios asignados.",
          icon: "error",
          confirmButtonColor: "#000",
        })
      }
    }
  }

  const handleToggleStatus = async (role: Role) => {
    const isActive = role.status === "Activo"
    const result = await Swal.fire({
      title: isActive ? "¿Desactivar rol?" : "¿Activar rol?",
      text: isActive
        ? `¿Está seguro que desea desactivar el rol ${role.name}?`
        : `¿Está seguro que desea activar el rol ${role.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6B7280",
      confirmButtonText: isActive ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        await roleService.toggleRoleStatus(role.id.toString())
        await loadRoles()

        Swal.fire({
          title: isActive ? "¡Desactivado!" : "¡Activado!",
          text: `El rol ha sido ${isActive ? "desactivado" : "activado"} correctamente`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error("Error toggling role status:", error)
        Swal.fire({
          title: "Error",
          text: "No se pudo cambiar el estado del rol",
          icon: "error",
          confirmButtonColor: "#000",
        })
      }
    }
  }

  // Sort roles by codigo before pagination
  const sortedRoles = filteredRoles.sort((a, b) => {
    if (a.codigo && b.codigo) {
      return a.codigo.localeCompare(b.codigo)
    }
    return 0
  })

  const paginatedRoles = sortedRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(sortedRoles.length / itemsPerPage)

  if (roles.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Shield className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay roles registrados</h3>
            <p className="text-gray-500 mb-4">Comience agregando el primer rol al sistema</p>
            {canCreate && (
              <Button onClick={() => setIsModalOpen(true)} className="bg-black hover:bg-gray-800">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Rol
              </Button>
            )}
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
              loadRoles()
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
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-gray-600">Gestión de roles y permisos del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadRoles} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          {canCreate && (
            <Button
              onClick={() => {
                setEditingRole(null)
                setIsModalOpen(true)
              }}
              className="bg-black hover:bg-gray-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Rol
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
                  placeholder="Buscar por nombre o descripción..."
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

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Lista de Roles ({filteredRoles.length})
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
                  <TableHead>Descripción</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Shield className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron roles</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.codigo}</TableCell>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">{role.permisos?.length || 0} módulos</Badge>
                      </TableCell>
                      <TableCell>
                        {role.status === "Activo" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {role.createdAt ? format(new Date(role.createdAt), "dd/MM/yyyy", { locale: es }) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canView && (
                              <DropdownMenuItem onClick={() => handleViewDetails(role)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                            )}
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleToggleStatus(role)}>
                                {role.status === "Activo" ? (
                                  <Power className="w-4 h-4 mr-2" />
                                ) : (
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                )}
                                {role.status === "Activo" ? "Desactivar" : "Activar"}
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteRole(role)}
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

      {/* Role Details Modal */}
      {selectedRole && (
        <RoleDetailModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          role={selectedRole}
          onEdit={handleEditRole}
          onDelete={handleDeleteRole}
        />
      )}

      {/* New/Edit Role Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingRole(null)
        }}
        onSave={handleSaveRole}
        role={editingRole || undefined}
        title={editingRole ? "Editar Rol" : "Nuevo Rol"}
      />
    </div>
  )
}
