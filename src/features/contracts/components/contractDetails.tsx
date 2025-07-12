import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import type { Contract } from "@/shared/types"
import {
  User,
  CreditCard,
  Calendar,
  Clock,
  FileSignature,
  Mail,
  Phone,
  Info,
} from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { formatCOP } from "@/shared/lib/formatCop"
import { Separator } from "@/shared/components/ui/separator"

interface ContractDetailsProps {
  contract: Contract
  isOpen: boolean
  onClose: () => void
}

const getStatusBadge = (estado: Contract["estado"]) => {
  const statusConfig = {
    Activo: { color: "bg-green-100 text-green-800", label: "Activo" },
    Congelado: { color: "bg-blue-100 text-blue-800", label: "Congelado" },
    Vencido: { color: "bg-red-100 text-red-800", label: "Vencido" },
    Cancelado: { color: "bg-gray-100 text-gray-800", label: "Cancelado" },
    "Por vencer": { color: "bg-yellow-100 text-yellow-800", label: "Por vencer" },
  }
  const config = statusConfig[estado]
  return <Badge className={`${config.color}`}>{config.label}</Badge>
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
  <div className="flex items-center space-x-3">
    <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-500">{value}</p>
    </div>
  </div>
)

export function ContractDetails({ contract, isOpen, onClose }: ContractDetailsProps) {
  const { persona, membresia } = contract

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Detalles del Contrato
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FileSignature className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">
                Contrato: {membresia?.nombre || "No especificado"}
              </h2>
              <p className="text-sm text-gray-500">
                Cliente: {persona?.usuario?.nombre} {persona?.usuario?.apellido}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusBadge(contract.estado)}
                <Badge variant="outline" className="font-mono">{contract.codigo}</Badge>
              </div>
              {contract.estado === 'Congelado' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Motivo de congelamiento:</p>
                      <p className="text-sm text-blue-800 mt-1">
                        {contract.motivo || 'No se especificó un motivo para el congelamiento'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {contract.estado === 'Cancelado' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Motivo de cancelación:</p>
                      <p className="text-sm text-red-800 mt-1">
                        {contract.motivo || 'No se especificó un motivo para la cancelación'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contract Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                icon={Calendar} 
                label="Fecha de Inicio" 
                value={format(new Date(contract.fecha_inicio), "dd 'de' MMMM, yyyy", { locale: es })} 
              />
              <DetailItem 
                icon={Calendar} 
                label="Fecha de Fin" 
                value={format(new Date(contract.fecha_fin), "dd 'de' MMMM, yyyy", { locale: es })} 
              />
              <DetailItem 
                icon={Clock} 
                label="Vigencia del Contrato" 
                value={`${differenceInDays(new Date(contract.fecha_fin), new Date(contract.fecha_inicio))} días`} 
              />
            </div>
          </div>

          <Separator />

          {/* Membership Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Membresía</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem 
                icon={Info} 
                label="Nombre de la Membresía" 
                value={membresia?.nombre ?? "No especificado"} 
              />
              <DetailItem 
                icon={CreditCard} 
                label="Precio Pagado" 
                value={formatCOP(contract.membresia_precio)} 
              />
              <DetailItem 
                icon={Clock} 
                label="Vigencia" 
                value={`${membresia?.vigencia_dias ?? '...'} días`} 
              />
              <DetailItem 
                icon={Clock} 
                label="Días de Acceso" 
                value={`${membresia?.dias_acceso ?? '...'} días`} 
              />
            </div>
          </div>
          
          <Separator />

          {/* Client Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
            <div className="space-y-3">
              <DetailItem 
                icon={User}
                label="Nombre Completo"
                value={`${persona?.usuario?.nombre ?? ''} ${persona?.usuario?.apellido ?? ''}`.trim() || 'No especificado'}
              />
              <DetailItem
                icon={Mail}
                label="Correo Electrónico"
                value={persona?.usuario?.correo ?? "No especificado"}
              />
              <DetailItem
                icon={Phone}
                label="Teléfono"
                value={persona?.usuario?.telefono ?? "No especificado"}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button onClick={onClose} variant="outline">Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

