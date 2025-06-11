import { format, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import type { Contract } from "@/shared/types"
import {
  User,
  CreditCard,
  Calendar as CalendarIcon,
  Clock,
  FileSignature,
  Mail,
  Phone,
  Info,
  BadgeCheck,
} from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"
import { formatCOP } from "@/shared/lib/utils"
import { Label } from "@/shared/components/ui/label"

interface ContractDetailsProps {
  contract: Contract
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
  const config = statusConfig[estado] || statusConfig["Activo"]
  return <Badge className={`${config.color}`}>{config.label}</Badge>
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) => (
  <div>
    <Label className="text-sm text-gray-500 flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</Label>
    <div className="font-medium text-base ml-6">{value}</div>
  </div>
)

export function ContractDetails({ contract, onClose }: ContractDetailsProps) {
  const { persona, membresia } = contract

  console.log('--- [UI] Data received in ContractDetails ---', contract);

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de Resumen (Izquierda) */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                <FileSignature className="h-5 w-5" />
                Resumen del Contrato
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <Label className="text-gray-500">Cliente</Label>
                    <p className="font-medium text-base truncate">
                    {persona?.usuario?.nombre} {persona?.usuario?.apellido}
                    </p>
                    <p className="font-mono text-sm text-gray-500">{contract.codigo}</p>
                </div>
                <div className="border-t pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <CalendarIcon className="h-4 w-4" /> Fechas
                    </div>
                    <div />
                    <div className="text-gray-600"><strong>Inicio:</strong> {format(new Date(contract.fecha_inicio), "dd/MM/yyyy", { locale: es })}</div>
                    <div className="text-gray-600"><strong>Fin:</strong> {format(new Date(contract.fecha_fin), "dd/MM/yyyy", { locale: es })}</div>
                </div>
                <div className="border-t pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4" /> Duración
                    </div>
                    <div />
                    <div className="text-gray-600"><strong>Vigencia:</strong> {differenceInDays(new Date(contract.fecha_fin), new Date(contract.fecha_inicio))} días</div>
                </div>
                <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <CreditCard className="h-5 w-5" />
                        Total: {formatCOP(contract.membresia_precio)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Membresía: {membresia?.nombre ?? '...'}
                    </p>
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Columna de Detalles (Derecha) */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/>Información General</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailItem icon={BadgeCheck} label="Estado" value={getStatusBadge(contract.estado)} />
                    <DetailItem icon={FileSignature} label="Código Contrato" value={contract.codigo} />
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/>Datos del Cliente</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailItem icon={User} label="Nombre" value={`${persona?.usuario?.nombre} ${persona?.usuario?.apellido}`} />
                    <DetailItem icon={Info} label="Documento" value={[persona?.usuario?.tipo_documento, persona?.usuario?.numero_documento].filter(Boolean).join(' ') || 'No especificado'} />
                    <DetailItem icon={Mail} label="Correo" value={persona?.usuario?.correo ?? 'No especificado'} />
                    <DetailItem icon={Phone} label="Teléfono" value={persona?.usuario?.telefono ?? 'No especificado'} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5"/>Datos de la Membresía</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailItem icon={Info} label="Nombre" value={membresia?.nombre ?? 'No especificado'} />
                    <DetailItem icon={CreditCard} label="Precio Pagado" value={formatCOP(contract.membresia_precio)} />
                     <DetailItem icon={Clock} label="Vigencia" value={`${membresia?.vigencia_dias ?? '...'} días`} />
                    <DetailItem icon={Clock} label="Días de Acceso" value={`${membresia?.dias_acceso ?? '...'} días`} />
                </CardContent>
            </Card>
        </div>
        </div>
        <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="bg-black hover:bg-gray-800">Cerrar</Button>
        </div>
    </div>
  )
}

