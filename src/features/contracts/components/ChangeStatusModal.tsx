import type React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/components/ui/dialog"
import type { Contract } from "@/shared/types"
import { useAuth } from "@/shared/contexts/authContext"
import { Info } from "lucide-react"

const changeStatusSchema = z.object({
    estado: z.enum(["Activo", "Congelado", "Vencido", "Cancelado", "Por vencer"]),
})

type ChangeStatusFormValues = z.infer<typeof changeStatusSchema>

interface ChangeStatusModalProps {
    contract: Contract
    onUpdateContract: (data: Partial<ChangeStatusFormValues> & { usuario_actualizacion?: number }) => void
    onClose: () => void
}

export function ChangeStatusModal({ contract, onUpdateContract, onClose }: ChangeStatusModalProps) {
    const { user } = useAuth()

    const {
        handleSubmit,
        control,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ChangeStatusFormValues>({
        resolver: zodResolver(changeStatusSchema),
        defaultValues: {
            estado: contract.estado,
        },
    })

    const watchStatus = watch("estado")

    const onSubmit = (data: ChangeStatusFormValues) => {
        const updateData: Partial<ChangeStatusFormValues> & { usuario_actualizacion?: number } = {
            estado: data.estado,
            usuario_actualizacion: user?.id ? Number(user.id) : undefined,
        }
        onUpdateContract(updateData)
        onClose()
    }
    
    const statusOptions: Contract["estado"][] = [
        "Activo",
        "Congelado",
        "Vencido",
        "Cancelado",
        "Por vencer",
    ]

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
                <DialogTitle>Cambiar estado del contrato</DialogTitle>
                <DialogDescription>
                    Selecciona el nuevo estado para el contrato <span className="font-mono">{contract.codigo}</span>.
                </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Controller
                        name="estado"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="estado">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map(status => (
                                        <SelectItem key={status} value={status} disabled={status === contract.estado}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.estado && <p className="text-red-500 text-sm">{errors.estado.message}</p>}
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
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </DialogFooter>
        </form>
    )
} 