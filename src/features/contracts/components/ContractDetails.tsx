import { format, differenceInDays } from "date-fns"
import { Button } from "@/shared/components/button"
import { Badge } from "@/shared/components/badge"
import { useAuth } from "@/shared/contexts/AuthContext"
import Swal from "sweetalert2"
import type { Contract, Membership, Client } from "@/shared/types"
import { User, CreditCard, Calendar, Clock, Timer, RefreshCw, Ban } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"

interface ContractDetailsProps {
  contract: Contract
  memberships: Membership[]
  clients: Client[]
  onClose: () => void
  onRenew: (contract: Contract) => void
  onCancel: (id: number) => void
}

// Función para formatear precio en COP
const formatCOP = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function ContractDetails({ contract, memberships, clients, onClose, onRenew, onCancel }: ContractDetailsProps) {
  const { user } = useAuth()

  // Buscar el cliente correspondiente
  const client = clients.find((c) => Number(c.id) === contract.id_cliente)

  const getContractStatus = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endDate = new Date(contract.fecha_fin)
    endDate.setHours(0, 0, 0, 0)

    if (contract.estado === "Cancelado") {
      return { label: "Cancelado", color: "bg-red-100 text-red-800" }
    }

    if (endDate < today) {
      return { label: "Vencido", color: "bg-gray-100 text-gray-800" }
    }

    const daysRemaining = differenceInDays(endDate, today)

    if (daysRemaining <= 7) {
      return { label: `Por vencer (${daysRemaining} días)`, color: "bg-yellow-100 text-yellow-800" }
    }

    return { label: "Activo", color: "bg-green-100 text-green-800" }
  }

  const handleRenew = () => {
    onRenew(contract)
    onClose()
  }

  const handleCancel = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas cancelar este contrato? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cancelar contrato",
      cancelButtonText: "No, mantener activo",
      timer: 15000, // Longer timer for confirmation dialogs
      timerProgressBar: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onCancel(contract.id)
        onClose()

        Swal.fire({
          title: "Contrato cancelado",
          text: "El contrato ha sido cancelado exitosamente.",
          icon: "success",
          confirmButtonColor: "#000",
          timer: 5000,
          timerProgressBar: true,
        })
      }
    })
  }

  // Buscar la membresía para mostrar más información
  const membership = memberships.find((m) => m.id === contract.id_membresia)

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Detalles del Contrato</h2>

      <Tabs defaultValue="contract" className="w-full">
        <TabsList className="grid grid-cols-3 mb-3">
          <TabsTrigger value="contract">Contrato</TabsTrigger>
          <TabsTrigger value="client">Cliente</TabsTrigger>
          <TabsTrigger value="membership">Membresía</TabsTrigger>
        </TabsList>

        <TabsContent value="contract" className="space-y-3">
          {/* Información básica del contrato */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <p className="font-semibold text-sm">Información del Contrato</p>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Código de Contrato</p>
                <p className="font-medium">{contract.codigo || `C${contract.id.toString().padStart(4, "0")}`}</p>
              </div>

              <div>
                <p className="text-gray-500 font-medium">ID de Contrato</p>
                <p className="font-medium">{contract.id}</p>
              </div>

              <div>
                <p className="text-gray-500 font-medium">Estado</p>
                <Badge className={`${getContractStatus().color} px-2 py-0.5`}>{getContractStatus().label}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500 font-medium">Fecha de Inicio</p>
                  <p className="font-medium">{format(new Date(contract.fecha_inicio), "dd/MM/yyyy")}</p>
                </div>

                <div>
                  <p className="text-gray-500 font-medium">Fecha de Fin</p>
                  <p className="font-medium">{format(new Date(contract.fecha_fin), "dd/MM/yyyy")}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 font-medium">Duración</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-600" />
                  <p className="font-medium">
                    {differenceInDays(new Date(contract.fecha_fin), new Date(contract.fecha_inicio))} días
                  </p>
                </div>
              </div>

              {/* Días restantes */}
              {(() => {
                const today = new Date()
                const endDate = new Date(contract.fecha_fin)
                const daysRemaining = differenceInDays(endDate, today)

                if (contract.estado === "Activo" && daysRemaining > 0) {
                  return (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-500 font-medium">Días restantes</p>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3 text-gray-600" />
                        <p className="font-medium">{daysRemaining} días</p>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="client" className="space-y-3">
          {/* Información del cliente */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-600" />
              <p className="font-semibold text-sm">Cliente</p>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Nombre Completo</p>
                <p className="font-medium">{contract.cliente_nombre}</p>
              </div>

              {client && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-500 font-medium">Documento</p>
                      <p className="font-medium">
                        {client.documentType} {client.documentNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Teléfono</p>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Correo Electrónico</p>
                    <p className="font-medium">{client.email}</p>
                  </div>

                  {/* Información del beneficiario si no es el mismo cliente */}
                  {client.isBeneficiary === false && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-500 font-medium">Beneficiario</p>
                      <p className="font-medium">{client.beneficiaryName || "No especificado"}</p>
                      {client.beneficiaryRelation && (
                        <p className="text-xs text-gray-600">Relación: {client.beneficiaryRelation}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="membership" className="space-y-3">
          {/* Información de la membresía */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <p className="font-semibold text-sm">Membresía</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Tipo de Membresía</p>
                <p className="font-medium">{contract.membresia_nombre}</p>
              </div>

              <div>
                <p className="text-gray-500 font-medium">Precio</p>
                <p className="font-medium">{formatCOP(contract.membresia_precio || 0)}</p>
              </div>
            </div>

            {membership && (
              <div className="mt-2 text-sm">
                <p className="text-gray-500 font-medium">Descripción</p>
                <p className="text-gray-700">{membership.descripcion}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <p className="font-semibold text-sm">Historial de Cambios</p>
            </div>

            <div className="space-y-2 text-sm">
              {/* Aquí iría la lista de cambios de estado */}
              <p className="text-gray-500">No hay cambios registrados para este contrato.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex justify-end space-x-2 border-t pt-3">
        {contract.estado === "Activo" && (
          <Button variant="outline" size="sm" onClick={handleRenew} className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Renovar
          </Button>
        )}

        {user?.role === "admin" && contract.estado === "Activo" && (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center gap-1"
            onClick={handleCancel}
          >
            <Ban className="h-3 w-3" />
            Cancelar
          </Button>
        )}

        <Button size="sm" onClick={onClose} className="bg-black hover:bg-gray-800">
          Cerrar
        </Button>
      </div>
    </div>
  )
}

