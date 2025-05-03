import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/shared/components/button"
import { Label } from "@/shared/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { format, addDays, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, User, CalendarPlus2Icon as CalendarIcon2, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { Client } from "@/shared/types"
import { Badge } from "@/shared/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"
import { DatePicker } from "@/shared/components/date-picker"
import { mockMemberships } from "@/features/data/mockData"


interface RenewMembershipModalProps {
  client: Client
  onSubmit: (clientId: string, updates: Partial<Client>) => void
  onClose: () => void
}

export function RenewMembershipModal({ client, onSubmit, onClose }: RenewMembershipModalProps) {
  const [membershipType, setMembershipType] = useState(client.membershipType || "")
  const [startDate, setStartDate] = useState<Date>(
    client.membershipEndDate && client.membershipEndDate > new Date() ? client.membershipEndDate : new Date(),
  )
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(30)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Usar las membresías del sistema
  const memberships = mockMemberships

  // Obtener el estado actual de la membresía
  const getMembershipStatus = () => {
    if (!client.membershipEndDate || client.status === "Inactivo") {
      return { label: "Sin membresía activa", color: "bg-gray-100 text-gray-800", icon: AlertTriangle }
    }

    const today = new Date()
    const daysRemaining = differenceInDays(client.membershipEndDate, today)

    if (daysRemaining < 0) {
      return {
        label: "Membresía vencida",
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
        detail: `Venció hace ${Math.abs(daysRemaining)} días`,
      }
    }

    if (daysRemaining <= 7) {
      return {
        label: "Por vencer pronto",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
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

  // Calcular fecha de fin según la membresía seleccionada
  useEffect(() => {
    const membership = memberships.find((m) => m.nombre === membershipType)
    if (membership) {
      setSelectedDuration(membership.duracion_dias)
      setEndDate(addDays(startDate, membership.duracion_dias))
    } else {
      // Si no se encuentra la membresía, usar 30 días por defecto
      setSelectedDuration(30)
      setEndDate(addDays(startDate, 30))
    }
  }, [membershipType, startDate])

  // Formatear precio en COP
  const formatCOP = (price: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simular procesamiento
    setTimeout(() => {
      const updatedClient: Client = {
        ...client,
        membershipType,
        membershipEndDate: endDate,
        status: "Activo",
      }

      onSubmit(client.id, updatedClient)
      setIsProcessing(false)
    }, 500)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Renovar Membresía</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid grid-cols-2 mb-3">
            <TabsTrigger value="client">Cliente</TabsTrigger>
            <TabsTrigger value="membership">Nueva Membresía</TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Información del cliente */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-sm">Información del Cliente</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Nombre</p>
                    <p className="text-sm font-medium">{client.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Documento</p>
                      <p className="text-sm font-medium">
                        {client.documentType} {client.documentNumber}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                      <p className="text-sm font-medium">{client.phone || "No especificado"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email</p>
                    <p className="text-sm font-medium">{client.email}</p>
                  </div>
                </div>
              </div>

              {/* Estado actual de la membresía */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-sm">Membresía Actual</h3>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Tipo de Membresía</p>
                    <p className="text-sm font-medium">{client.membershipType || "Sin membresía"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium">Estado</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={membershipStatus.color}>
                        <MembershipIcon className="h-3.5 w-3.5 mr-1" />
                        {membershipStatus.label}
                      </Badge>
                    </div>
                  </div>

                  {client.membershipEndDate && (
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Fecha de Vencimiento</p>
                      <div className="flex items-center gap-2">
                        <CalendarIcon2 className="h-3.5 w-3.5 text-gray-500" />
                        <p className="text-sm font-medium">
                          {format(client.membershipEndDate, "dd MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{membershipStatus.detail}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="membership" className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm">Nueva Membresía</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="membershipType" className="text-xs font-medium">
                    Tipo de Membresía
                  </Label>
                  <Select value={membershipType} onValueChange={setMembershipType}>
                    <SelectTrigger id="membershipType" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberships.map((membership) => (
                        <SelectItem key={membership.id} value={membership.nombre}>
                          {membership.nombre} - {formatCOP(membership.precio)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="text-xs bg-blue-50 p-2 rounded-md mt-2">
                    <p className="font-medium">Descripción:</p>
                    <p className="text-gray-700">
                      {memberships.find((m) => m.nombre === membershipType)?.descripcion || ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <DatePicker
                    date={startDate}
                    setDate={(date) => date && setStartDate(date)}
                    label="Fecha de Inicio"
                    placeholder="Seleccionar fecha"
                    size="sm"
                    fromYear={new Date().getFullYear() - 1}
                    toYear={new Date().getFullYear() + 5}
                    subtitle="Seleccione la fecha de inicio de la membresía"
                  />

                  <div className="mt-3">
                    <Label htmlFor="endDate" className="text-xs font-medium">
                      Fecha de Finalización
                    </Label>
                    <div className="flex items-center gap-2 mt-1 p-2 border rounded-md bg-gray-100 text-sm">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>{endDate ? format(endDate, "dd MMMM, yyyy", { locale: es }) : "Calculando..."}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Duración: {selectedDuration} días</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-3 border-t mt-3">
          <Button type="submit" className="bg-black hover:bg-gray-800" disabled={isProcessing} size="sm">
            {isProcessing ? "Procesando..." : "Renovar Membresía"}
          </Button>
        </div>
      </form>
    </div>
  )
}
