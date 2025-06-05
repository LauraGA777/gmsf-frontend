import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import { X, Mail, Phone, MapPin, Calendar, Shield, Activity } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { User as UserType } from "../types/user"

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserType | null
}

export function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  if (!user) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Detalles del Usuario
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with user info */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">
                {user.nombre} {user.apellido}
              </h2>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getRoleBadge(user.rol)}>{user.rol}</Badge>
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
                    {user.tipoDocumento} - {user.numeroDocumento}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de Nacimiento</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(user.fechaNacimiento), "dd/MM/yyyy", { locale: es })}
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
                  <p className="text-sm font-medium text-gray-900">Fecha de Registro</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(user.fechaRegistro), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </div>

              {user.ultimaActividad && (
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Última Actividad</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(user.ultimaActividad), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {user.contratosActivos !== undefined && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Contratos Activos</p>
                <p className="text-2xl font-bold text-blue-600">{user.contratosActivos}</p>
              </div>
            )}
          </div>

          {/* Action History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Acciones</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Editado el {format(new Date(user.fechaRegistro), "dd/MM/yyyy", { locale: es })}
                  </span>
                  <span className="text-gray-500">por Admin</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Creado el {format(new Date(user.fechaRegistro), "dd/MM/yyyy", { locale: es })}
                  </span>
                  <span className="text-gray-500">por Sistema</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
