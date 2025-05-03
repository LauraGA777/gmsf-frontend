import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/shared/components/button"
import { Label } from "@/shared/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { Calendar } from "@/shared/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/popover"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, User, CreditCard } from "lucide-react"
import { cn } from "@/shared/utils/utils"
import { formatCOP } from "@/shared/utils/utils"
import type { Contract, Membership } from "@/shared/types"
import { Badge } from "@/shared/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs"
import Swal from "sweetalert2"

interface EditContractModalProps {
  contract: Contract
  memberships: Membership[]
  onUpdateContract: (updatedData: Partial<Contract>) => void
  onClose: () => void
}

export function EditContractModal({ contract, memberships, onUpdateContract, onClose }: EditContractModalProps) {
  const [membershipId, setMembershipId] = useState<string>(contract.id_membresia.toString())
  const [startDate, setStartDate] = useState<Date>(new Date(contract.fecha_inicio))
  const [endDate, setEndDate] = useState<Date>(new Date(contract.fecha_fin))
  const [selectedDuration, setSelectedDuration] = useState<number>(
    memberships.find((m) => m.id === contract.id_membresia)?.duracion_dias || 30,
  )
  const [isProcessing, setIsProcessing] = useState(false)

  // Calcular fecha de fin según la membresía seleccionada
  useEffect(() => {
    const membership = memberships.find((m) => m.id.toString() === membershipId)
    if (membership) {
      setSelectedDuration(membership.duracion_dias)
      setEndDate(addDays(startDate, membership.duracion_dias))
    }
  }, [membershipId, startDate, memberships])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    const selectedMembership = memberships.find((m) => m.id.toString() === membershipId)

    if (!selectedMembership) {
      setIsProcessing(false)
      Swal.fire({
        title: "Error",
        text: "No se pudo encontrar la membresía seleccionada",
        icon: "error",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      })
      return
    }

    // Preparar los datos actualizados
    const updatedData: Partial<Contract> = {
      id_membresia: Number(membershipId),
      fecha_inicio: startDate,
      fecha_fin: endDate,
      membresia_nombre: selectedMembership.nombre,
      membresia_precio: selectedMembership.precio,
      estado: "Activo", // Asumimos que al editar, el contrato se activa
      precio_total: selectedMembership.precio // Actualizar el precio total también
    }

    // Mostrar mensaje de espera
    Swal.fire({
      title: "Actualizando contrato",
      text: "Por favor espere mientras se actualiza el contrato...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    // Actualizar el contrato
    onUpdateContract(updatedData)
    
    // Cerrar mensaje de espera y mostrar éxito
    setTimeout(() => {
      Swal.fire({
        title: "¡Contrato actualizado!",
        html: `
        <div class="text-left p-3 bg-gray-50 rounded-lg mb-3">
          <p class="mb-2"><strong>Cliente:</strong> ${contract.cliente_nombre}</p>
          <p class="mb-2"><strong>Membresía:</strong> ${selectedMembership.nombre}</p>
          <p class="mb-2"><strong>Nuevo periodo:</strong> ${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}</p>
          <p><strong>Valor:</strong> ${formatCOP(selectedMembership.precio)}</p>
        </div>
        `,
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      }).then(() => {
        setIsProcessing(false)
        onClose() // Cerrar el modal después de actualizar
      })
    }, 800)
  }

  return (
    <div className="p-4 max-w-3xl mx-auto overflow-x-hidden">
      <h2 className="text-xl font-bold mb-3">Editar Membresía del Contrato</h2>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-2 mb-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="membership">Membresía</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Información del contrato */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-sm">Información del Contrato</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">ID de Contrato</p>
                    <p className="font-medium">{contract.id}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Estado</p>
                    <Badge
                      className={`${contract.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {contract.estado}
                    </Badge>
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
                </div>
              </div>

              {/* Información del cliente */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-sm">Cliente</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Nombre Completo</p>
                    <p className="font-medium">{contract.cliente_nombre}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-500 font-medium">Documento</p>
                      <p className="font-medium">
                        {contract.cliente_documento_tipo} {contract.cliente_documento}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="membership" className="space-y-3">
            {/* Formulario para editar membresía */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm">Membresía</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="membershipId" className="text-xs font-medium">
                    Tipo de Membresía
                  </Label>
                  <Select value={membershipId} onValueChange={setMembershipId}>
                    <SelectTrigger id="membershipId" className="h-8 text-sm">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberships.map((membership) => (
                        <SelectItem key={membership.id} value={membership.id.toString()}>
                          {membership.nombre} - {formatCOP(membership.precio)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="text-xs bg-blue-50 p-2 rounded-md mt-2">
                    <p className="font-medium">Descripción:</p>
                    <p className="text-gray-700">
                      {memberships.find((m) => m.id.toString() === membershipId)?.descripcion || ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-xs font-medium">
                    Fecha de Inicio
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 text-sm bg-white rounded-md transition-colors hover:bg-gray-50",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {startDate ? (
                          format(startDate, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-0 shadow-md rounded-md border border-gray-200" 
                      align="start"
                      side="right"
                      sideOffset={10}
                      alignOffset={0}
                      avoidCollisions={false}
                      hideWhenDetached={false}
                      forceMount
                    >
                      <div className="p-1 w-full">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            if (date) {
                              setStartDate(date);
                              // Cerrar automáticamente el popover cuando se selecciona una fecha
                              setTimeout(() => {
                                document.body.click();
                              }, 100);
                            }
                          }}
                          initialFocus
                          locale={es}
                          captionLayout="dropdown-buttons"
                          fromYear={new Date().getFullYear() - 1}
                          toYear={new Date().getFullYear() + 5}
                          className="rounded-md border-0 w-full"
                          showHeader={true}
                          title="Fecha de inicio"
                          subtitle="Seleccione la fecha de inicio del contrato"
                          fixedWeeks
                          showOutsideDays
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <div className="mt-3">
                    <Label htmlFor="endDate" className="text-xs font-medium">
                      Fecha de Finalización
                    </Label>
                    <div className="flex items-center gap-2 mt-1 p-2 border rounded-md bg-gray-100 text-sm">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span>{endDate ? format(endDate, "dd/MM/yyyy") : "Calculando..."}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Duración: {selectedDuration} días</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-3 border-t mt-3">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button type="submit" className="bg-black hover:bg-gray-800" disabled={isProcessing} size="sm">
            {isProcessing ? "Procesando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
