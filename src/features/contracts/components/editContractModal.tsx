import { useMemo, useEffect, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Calendar } from "@/shared/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, FileSignature, DollarSign, List, User, Info, CalendarDays } from "lucide-react"
import { cn, formatCOP } from "@/shared/lib/utils"
import type { Contract, Membership } from "@/shared/types"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/shared/contexts/authContext"
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card"

const updateContractFormSchema = z.object({
  id_membresia: z.number({ required_error: "Debe seleccionar una membresía" }),
  fecha_inicio: z.date({ required_error: "La fecha de inicio es requerida" }),
  estado: z.enum(["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]),
})

type UpdateContractFormValues = z.infer<typeof updateContractFormSchema>

interface EditContractModalProps {
  contract: Contract
  memberships: Membership[]
  onUpdateContract: (data: Partial<Contract>) => void
  onClose: () => void
}

export function EditContractModal({ contract, memberships, onUpdateContract, onClose }: EditContractModalProps) {
  const { user } = useAuth()
  const [localMemberships, setLocalMemberships] = useState<Membership[]>(memberships)

  // Debug: Log contract and memberships data
  console.log('🔍 EditContractModal - Debug data:', {
    contractId: contract.id,
    contractMembershipId: contract.id_membresia,
    contractMembership: contract.membresia,
    membershipsCount: memberships.length,
    memberships: memberships.map(m => ({ id: m.id, nombre: m.nombre }))
  });

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateContractFormValues>({
    resolver: zodResolver(updateContractFormSchema),
    defaultValues: {
      id_membresia: contract.id_membresia,
      fecha_inicio: new Date(contract.fecha_inicio),
      estado: contract.estado,
    },
  })

  const watchMembershipId = watch("id_membresia")
  const watchStartDate = watch("fecha_inicio")
  const watchStatus = watch("estado")

  // Update local memberships when prop changes
  useEffect(() => {
    if (memberships.length > 0) {
      setLocalMemberships(memberships);
    }
  }, [memberships]);


  const summaryData = useMemo(() => {
    const membership = localMemberships.find(m => m.id === watchMembershipId);
    const startDate = watchStartDate;

    if (!membership || !startDate) {
        const originalMembership = localMemberships.find(m => m.id === contract.id_membresia);
        return {
            endDate: new Date(contract.fecha_fin),
            price: contract.membresia_precio,
            nombreMembresia: originalMembership?.nombre,
            vigencia: originalMembership?.vigencia_dias,
            diasAcceso: originalMembership?.dias_acceso,
        };
    }

    const newEndDate = addDays(startDate, membership.vigencia_dias);

    return {
        endDate: newEndDate,
        price: membership.precio,
        nombreMembresia: membership.nombre,
        vigencia: membership.vigencia_dias,
        diasAcceso: membership.dias_acceso,
    };
  }, [watchMembershipId, watchStartDate, localMemberships, contract]);

  useEffect(() => {
    reset({
      id_membresia: contract.id_membresia,
      fecha_inicio: new Date(contract.fecha_inicio),
      estado: contract.estado,
    })
  }, [contract, reset])

  const onSubmit = (data: UpdateContractFormValues) => {
    const updateData = {
      ...data, 
      fecha_inicio: format(new Date(data.fecha_inicio), "yyyy-MM-dd"),
      usuario_actualizacion: user?.id ? Number(user.id) : undefined,
    }
    onUpdateContract(updateData as unknown as Partial<Contract>)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8 p-1">
      {/* Columna de Resumen (Izquierda) */}
      <div className="md:col-span-1 space-y-6">
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
                {contract.persona?.usuario?.nombre} {contract.persona?.usuario?.apellido}
                </p>
                <p className="font-mono text-sm text-gray-500">{contract.codigo}</p>
            </div>
             <div className="border-t pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-2 font-medium">
                    <CalendarIcon className="h-4 w-4" /> Fechas
                </div>
                <div />
                <div className="text-gray-600"><strong>Inicio:</strong> {watchStartDate ? format(watchStartDate, "dd/MM/yyyy", { locale: es }) : "-"}</div>
                <div className="text-gray-600"><strong>Fin:</strong> {summaryData.endDate ? format(summaryData.endDate, "dd/MM/yyyy", { locale: es }) : "..."}</div>
            </div>
            <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <DollarSign className="h-5 w-5" />
                    Total: {formatCOP(summaryData.price)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    Membresía: {summaryData.nombreMembresia ?? '...'}
                </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna de Formulario (Derecha) */}
      <div className="md:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="estado" className="flex items-center gap-2"><List className="h-4 w-4" />Estado</Label>
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="estado"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Congelado">Congelado</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                    <SelectItem value="Por vencer">Por vencer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.estado && <p className="text-red-500 text-sm">{errors.estado.message}</p>}
          </div>
          
          {/* Membership - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="id_membresia" className="flex items-center gap-2"><User className="h-4 w-4" />Membresía</Label>
             <Controller
              name="id_membresia"
              control={control}
              render={({ field }) => {
                const selectedMembership = localMemberships.find(m => m.id === field.value);
                // Si no encontramos la membresía en la lista, usar la información del contrato
                const membershipName = selectedMembership?.nombre || 
                                     contract.membresia?.nombre || 
                                     "Membresía";
                
                return (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={String(field.value)}
                    disabled={true}
                  >
                    <SelectTrigger id="id_membresia" className="bg-gray-50">
                      <SelectValue>
                        {membershipName}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {localMemberships.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
              <Info className="h-3 w-3"/> 
              La membresía no puede ser modificada en contratos existentes.
            </p>
          </div>
        </div>
        
        {watchStatus === "Congelado" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
               <div className="flex">
                   <div className="flex-shrink-0">
                       <Info className="h-5 w-5 text-blue-400" />
                   </div>
                   <div className="ml-3">
                       <p className="text-sm text-blue-700">
                           Al congelar, la fecha de finalización del contrato se extenderá automáticamente por el tiempo que permanezca en este estado.
                       </p>
                   </div>
               </div>
           </div>
        )}

        {/* Start Date */}
        <div className="space-y-2">
            <Label htmlFor="fecha_inicio" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Fecha de Inicio</Label>
            <Controller
                name="fecha_inicio"
                control={control}
                render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>
                )}
            />
            {errors.fecha_inicio && <p className="text-red-500 text-sm">{errors.fecha_inicio.message}</p>}
        </div>

        <div className="flex justify-end gap-4 pt-4 col-span-1 sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-black hover:bg-gray-800">
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </form>
  )
}
