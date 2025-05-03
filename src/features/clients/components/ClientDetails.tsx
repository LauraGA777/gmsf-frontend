import { format, differenceInDays } from "date-fns"
import { Button } from "@/shared/components/button"
import { Badge } from "@/shared/components/badge"
import type { Client } from "@/shared/types"
import { User, Mail, Phone, Calendar, CreditCard, UserCheck, AlertCircle, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"

interface ClientDetailsProps {
  client: Client
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Detalles del Cliente</h2>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="membership">Membresía</TabsTrigger>
          {client.isBeneficiary === false && <TabsTrigger value="beneficiary">Beneficiario</TabsTrigger>}
        </TabsList>

        <TabsContent value="personal" className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-600" />
              <p className="font-semibold text-sm">Información Personal</p>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Nombre Completo</p>
                <p className="font-medium">{client.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500 font-medium">Tipo de Documento</p>
                  <p className="font-medium">{client.documentType || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Número de Documento</p>
                  <p className="font-medium">{client.documentNumber || "No especificado"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-start gap-1">
                  <Mail className="h-3 w-3 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-500 font-medium">Correo Electrónico</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  <Phone className="h-3 w-3 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-500 font-medium">Teléfono</p>
                    <p className="font-medium">{client.phone || "No especificado"}</p>
                  </div>
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
                  <p className="text-gray-500 font-medium">Estado</p>
                  <Badge
                    className={client.status === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {client.status}
                  </Badge>
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
              </div>

              {client.membershipEndDate && (
                <div className="flex items-start gap-1">
                  <Calendar className="h-3 w-3 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-500 font-medium">Fecha de Vencimiento</p>
                    <p className="font-medium">{format(new Date(client.membershipEndDate), "dd/MM/yyyy")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {client.isBeneficiary === false && (
          <TabsContent value="beneficiary" className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-gray-600" />
                <p className="font-semibold text-sm">Información del Beneficiario</p>
              </div>

              <div className="space-y-2 text-sm">
                {client.beneficiaryName && (
                  <div>
                    <p className="text-gray-500 font-medium">Nombre del Beneficiario</p>
                    <p className="font-medium">{client.beneficiaryName}</p>
                  </div>
                )}

                {client.beneficiaryRelation && (
                  <div>
                    <p className="text-gray-500 font-medium">Relación</p>
                    <p className="font-medium">{client.beneficiaryRelation}</p>
                  </div>
                )}

                {client.beneficiaryDocumentType && client.beneficiaryDocumentNumber && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-500 font-medium">Tipo de Documento</p>
                      <p className="font-medium">{client.beneficiaryDocumentType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Número de Documento</p>
                      <p className="font-medium">{client.beneficiaryDocumentNumber}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {client.beneficiaryEmail && (
                    <div className="flex items-start gap-1">
                      <Mail className="h-3 w-3 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-500 font-medium">Correo Electrónico</p>
                        <p className="font-medium">{client.beneficiaryEmail}</p>
                      </div>
                    </div>
                  )}

                  {client.beneficiaryPhone && (
                    <div className="flex items-start gap-1">
                      <Phone className="h-3 w-3 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-500 font-medium">Teléfono</p>
                        <p className="font-medium">{client.beneficiaryPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <div className="mt-4 flex justify-end border-t pt-3">
        <Button size="sm" onClick={onClose} className="bg-black hover:bg-gray-800">
          Cerrar
        </Button>
      </div>
    </div>
  )
}

