import { format, differenceInDays } from "date-fns"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import type { Client } from "@/shared/types/client"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  FileText,
  ShieldCheck,
  Users
} from "lucide-react"
import { Separator } from "@/shared/components/ui/separator"

interface ClientDetailsProps {
  client: Client
  isOpen: boolean
  onClose: () => void
}

export function ClientDetails({ client, onClose }: ClientDetailsProps) {
  // Función para determinar el estado de la membresía
  const getMembershipStatus = () => {
    if (!client.membershipEndDate || client.status === "Inactivo") {
      return { label: "Sin membresía activa", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
    }

    const today = new Date()
    const daysRemaining = differenceInDays(client.membershipEndDate, today)

    if (daysRemaining < 0) {
      return {
        label: "Membresía vencida",
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        detail: `Venció hace ${Math.abs(daysRemaining)} días`,
      }
    }

    if (daysRemaining <= 7) {
      return {
        label: "Por vencer pronto",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
        detail: `Vence en ${daysRemaining} días`,
      }
    }

    return {
      label: "Activa",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      detail: `Vence en ${daysRemaining} días`,
    }
  }

  const membershipStatus = getMembershipStatus()
  const MembershipIcon = membershipStatus.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[700px] max-h-[90vh] overflow-y-auto"
        aria-labelledby={titleId}
      >
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle id={titleId} className="text-xl font-bold flex items-center gap-2">
                {client.usuario?.nombre} {client.usuario?.apellido}
              </DialogTitle>
              <p className="text-sm font-normal text-gray-500 mt-1">Código: {client.codigo}</p>
            </div>
            <Badge className={getStatusBadge(client.estado)}>{client.estado ? "Activo" : "Inactivo"}</Badge>
          </div>
          <DialogDescription className="sr-only">
            Información detallada del cliente {client.usuario?.nombre} {client.usuario?.apellido}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <Separator />

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Documento</p>
                  <p className="text-sm text-gray-500">
                    {client.usuario?.tipo_documento} - {client.usuario?.numero_documento}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de Nacimiento</p>
                  <p className="text-sm text-gray-500">
                    {client.usuario?.fecha_nacimiento
                      ? format(new Date(client.usuario.fecha_nacimiento), "dd/MM/yyyy", { locale: es })
                      : "No especificada"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="membership" className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <p className="font-semibold text-sm">Información de Membresía</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500 font-medium">Tipo de Membresía</p>
                  <p className="font-medium">{client.membershipType || "No especificado"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">Correo Electrónico</p>
                  <p className="text-sm text-gray-500">{client.usuario?.correo}</p>
                </div>
              </div>

              <div className="flex items-start gap-1">
                <Calendar className="h-3 w-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-gray-500 font-medium">Estado de Membresía</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={membershipStatus.color}>
                      <MembershipIcon className="h-3 w-3 mr-1 inline" />
                      {membershipStatus.label}
                    </Badge>
                    {membershipStatus.detail && (
                      <span className="text-xs text-gray-500">{membershipStatus.detail}</span>
                    )}
                  </div>
                </div>
              )}
              {client.usuario?.direccion && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dirección</p>
                    <p className="text-sm text-gray-500">{client.usuario.direccion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Emergency Contacts */}
          {client.contactos_emergencia && client.contactos_emergencia.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gray-500" />
                  Contactos de Emergencia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.contactos_emergencia.map((contact, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 pt-1">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{contact.nombre_contacto} ({contact.relacion_contacto})</p>
                        <p className="text-sm text-gray-500">{contact.telefono_contacto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Beneficiaries */}
          {client.beneficiarios && client.beneficiarios.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  Beneficiarios
                </h3>
                <div className="space-y-4">
                  {client.beneficiarios.map((beneficiary, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{beneficiary.persona_beneficiaria?.usuario?.nombre} {beneficiary.persona_beneficiaria?.usuario?.apellido}</p>
                          <p className="text-sm text-gray-500">Relación: {beneficiary.relacion}</p>
                        </div>
                        <Badge variant="secondary">{beneficiary.persona_beneficiaria?.usuario?.tipo_documento} {beneficiary.persona_beneficiaria?.usuario?.numero_documento}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Correo: {beneficiary.persona_beneficiaria?.usuario?.correo}</p>
                        {beneficiary.persona_beneficiaria?.usuario?.telefono && <p>Teléfono: {beneficiary.persona_beneficiaria.usuario.telefono}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* System Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fecha de Registro</p>
                  <p className="text-sm text-gray-500">
                    {client.fecha_registro
                      ? format(new Date(client.fecha_registro), "dd/MM/yyyy HH:mm", { locale: es })
                      : "No especificada"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Última Actualización</p>
                  <p className="text-sm text-gray-500">
                    {client.fecha_actualizacion
                      ? format(new Date(client.fecha_actualizacion), "dd/MM/yyyy HH:mm", { locale: es })
                      : "No especificada"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

