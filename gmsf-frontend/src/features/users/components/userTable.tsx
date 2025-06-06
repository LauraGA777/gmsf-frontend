import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"

import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Edit, Eye, MoreHorizontal, Plus, Trash, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Swal from "sweetalert2"
import type { User } from "../types/user"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

interface UserTableProps {
  users: User[]
  onEdit: (user: User) => void
  onView: (user: User) => void
  onToggleStatus: (userId: string) => void
  onAdd: () => void
  onDelete: (userId: string) => void
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function UserTable({
  users,
  onEdit,
  onView,
  onToggleStatus,
  onAdd,
  onDelete,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Filter users based on search term and status filter
  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase()

    const matchesSearch =
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(searchTermLower) ||
      user.correo.toLowerCase().includes(searchTermLower) ||
      `${user.tipoDocumento}-${user.numeroDocumento}`.toLowerCase().includes(searchTermLower)

    if (!matchesSearch) return false

    if (statusFilter === "active" && !user.estado) return false
    if (statusFilter === "inactive" && user.estado) return false

    return true
  })

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * 10, currentPage * 10)

  useEffect(() => {
    onPageChange(1)
  }, [searchTerm, statusFilter])

  const getRoleBadge = (rol: string) => {
    const styles = {
      Administrador: "bg-purple-100 text-purple-800",
      Entrenador: "bg-blue-100 text-blue-800",
      Cliente: "bg-green-100 text-green-800",
      Beneficiario: "bg-orange-100 text-orange-800",
    }
    return styles[rol as keyof typeof styles] || "bg-gray-100 text-gray-800"
  }

  const getStatusBadge = (estado: boolean) => {
    return estado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const handleToggleStatus = async (userId: string, isActive: boolean, user: User) => {
    if (isActive && user.contratosActivos && user.contratosActivos > 0) {
      await Swal.fire({
        title: "¡Operación bloqueada!",
        text: `Este usuario tiene ${user.contratosActivos} contratos activos`,
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#000000",
      })
      return
    }

    const result = await Swal.fire({
      title: isActive ? "¿Desactivar usuario?" : "¿Activar usuario?",
      text: isActive ? "Verifique que no tenga contratos activos" : "¿Está seguro que desea activar este usuario?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6B7280",
      confirmButtonText: isActive ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      onToggleStatus(userId)
      await Swal.fire({
        title: isActive ? "¡Desactivado!" : "¡Activado!",
        text: `El usuario ha sido ${isActive ? "desactivado" : "activado"} correctamente`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  const handleDelete = async (userId: string, user: User) => {
    if (user.estado) {
      await Swal.fire({
        title: "¡Operación no permitida!",
        text: "Solo se pueden eliminar usuarios inactivos",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#000000",
      })
      return
    }

    const result = await Swal.fire({
      title: `Eliminar a ${user.nombre} ${user.apellido}`,
      html: `
        <p><strong>Documento:</strong> ${user.tipoDocumento}-${user.numeroDocumento}</p>
        <p><strong>Última actividad:</strong> ${user.ultimaActividad ? format(new Date(user.ultimaActividad), "dd/MM/yyyy", { locale: es }) : "No disponible"}</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      onDelete(userId)
    }
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Users className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios registrados</h3>
            <p className="text-gray-500 mb-4">Comience agregando el primer usuario al sistema</p>
            <Button onClick={onAdd} className="bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Usuario
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Usuarios</h2>
        <Button onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Usuario
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Última Actividad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Cargando usuarios...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    {user.nombre} {user.apellido}
                  </TableCell>
                  <TableCell>{user.correo}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadge(user.rol)}>{user.rol}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(user.estado)}>
                      {user.estado ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.ultimaActividad
                      ? format(new Date(user.ultimaActividad), "dd/MM/yyyy HH:mm", { locale: es })
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.estado, user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          {user.estado ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                        {!user.estado && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(user.id, user)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash className="w-4 h-4 mr-2" />
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
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
