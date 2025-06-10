import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import { X, Mail, Phone, MapPin, Calendar, Shield, Activity, Users } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { User } from "../types/user"

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null

  const getRoleName = (idRol: number) => {
    const roles = {
      1: "Administrador",
      2: "Entrenador",
      3: "Cliente",
      4: "Beneficiario"
    };
    return roles[idRol as keyof typeof roles] || "Desconocido";
  };

  const getRoleBadge = (idRol: number) => {
    const styles = {
      1: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      2: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      3: "bg-green-100 text-green-800 hover:bg-green-100",
      4: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    };
    return styles[idRol as keyof typeof styles] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  const getStatusBadge = (estado: boolean) => {
    return estado 
      ? "bg-green-100 text-green-800 hover:bg-green-100" 
      : "bg-red-100 text-red-800 hover:bg-red-100";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Detalles del Usuario
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with user info */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">
                {user.nombre} {user.apellido}
              </h2>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getRoleBadge(user.id_rol)}>{getRoleName(user.id_rol)}</Badge>
                <Badge className={getStatusBadge(user.estado)}>{user.estado ? "Activo" : "Inactivo"}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Documento</p>
                  <p className="text-sm text-gray-500">
                    {user.tipo_documento} - {user.numero_documento}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de Nacimiento</p>
                  <p className="text-sm text-gray-500">
                    {user.fecha_nacimiento
                      ? format(new Date(user.fecha_nacimiento), "dd/MM/yyyy", { locale: es })
                      : "No especificada"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Correo Electrónico</p>
                  <p className="text-sm text-gray-500">{user.correo}</p>
                </div>
              </div>

              {user.telefono && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Teléfono</p>
                    <p className="text-sm text-gray-500">{user.telefono}</p>
                  </div>
                </div>
              )}

              {user.direccion && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dirección</p>
                    <p className="text-sm text-gray-500">{user.direccion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Última Actualización</p>
                  <p className="text-sm text-gray-500">
                    {user.fecha_actualizacion
                      ? format(new Date(user.fecha_actualizacion), "dd/MM/yyyy HH:mm", { locale: es })
                      : "No especificada"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Asistencias Totales</p>
                  <p className="text-sm text-gray-500">{user.asistencias_totales || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
