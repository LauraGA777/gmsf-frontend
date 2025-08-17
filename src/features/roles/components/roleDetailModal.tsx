import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import { Button } from "@/shared/components/ui/button"
import { Shield, User, Calendar, Check, AlertTriangle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import type { Role, UserInfo } from "@/shared/types/role"
import { roleService } from "../services/roleService"

interface RoleDetailModalProps {
  isOpen: boolean
  onClose: () => void
  role: Role | null
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleDetailModal({ isOpen, onClose, role, onEdit, onDelete }: RoleDetailModalProps) {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (isOpen && role) {
      loadUsersForRole(role.id)
    } else {
      // Limpiar datos cuando se cierra el modal
      setUsers([])
    }
  }, [isOpen, role])

  const loadUsersForRole = async (roleId: number) => {
    try {
      setLoadingUsers(true)
      const usersData = await roleService.getUsersByRole(roleId)
      setUsers(usersData)
    } catch (error) {
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  if (!role) return null

  // Calcular fechas una sola vez
  const createdDate = role.fecha_creacion || role.createdAt
  const updatedDate = role.fecha_actualizacion || role.updatedAt

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detalles del Rol
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with role info */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{role.name}</h2>
              <p className="text-sm text-gray-500">Usuarios asignados: {loadingUsers ? "Cargando..." : users.length}</p>
              <p className="text-sm text-gray-500">
                Permisos: {role.permisos?.length || 0} | Privilegios: {role.privilegios?.length || 0}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge
                  className={
                    role.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {role.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Código</h4>
                  <p className="mt-1 text-sm text-gray-800">{role.codigo || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Estado</h4>
                  <p className="mt-1 text-sm text-gray-800">{role.isActive ? "Activo" : "Inactivo"}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                <p className="mt-1 text-sm text-gray-800">{role.description || "No se proporcionó descripción"}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Users assigned to this role */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Usuarios Asignados ({loadingUsers ? "..." : users.length})
            </h3>
            {loadingUsers ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Cargando usuarios...</span>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {users.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          {usuario.nombre} {usuario.apellido}
                        </span>
                        <p className="text-xs text-gray-500">{usuario.correo}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{usuario.codigo}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="bg-gray-200 p-2 rounded-full">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-500">No hay usuarios asignados a este rol</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Creado por</p>
                  <p className="text-sm text-gray-500">{"Admin"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de Creación</p>
                  <p className="text-sm text-gray-500">
                    {createdDate ? new Date(createdDate).toLocaleDateString("es-ES") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Última Actualización</p>
                  <p className="text-sm text-gray-500">
                    {updatedDate ? new Date(updatedDate).toLocaleDateString("es-ES") : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Permissions and Privileges */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Permisos y Privilegios Asignados
            </h3>

            {/* Permisos Section */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">
                Permisos ({role.permisos?.length || 0})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {role.permisos && role.permisos.length > 0 ? (
                  role.permisos.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800">{permission.nombre}</span>
                          {permission.descripcion && <p className="text-xs text-gray-500">{permission.descripcion}</p>}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Permiso</Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-gray-200 p-2 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-500">No hay permisos asignados a este rol</span>
                  </div>
                )}
              </div>
            </div>

            {/* Privilegios Section */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">
                Privilegios ({role.privilegios?.length || 0})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {role.privilegios && role.privilegios.length > 0 ? (
                  role.privilegios.map((privilege) => (
                    <div key={privilege.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800">{privilege.nombre}</span>
                          {privilege.descripcion && <p className="text-xs text-gray-500">{privilege.descripcion}</p>}
                          {privilege.codigo && <p className="text-xs text-gray-400">Código: {privilege.codigo}</p>}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Privilegio</Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-gray-200 p-2 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-500">No hay privilegios asignados a este rol</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button onClick={() => role && onDelete(role)} variant="destructive">
              Eliminar
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button onClick={() => role && onEdit(role)} className="bg-black hover:bg-gray-800">
                Editar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
