import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { User } from "lucide-react";
import { format, parseISO } from 'date-fns';
import type { Trainer } from "@/shared/types/trainer";
import { useToast } from "@/shared/components/ui/use-toast";

// Schema for updating user data (some fields are optional)
const updateUserDataSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres").optional(),
  correo: z.string().email("Correo electrónico inválido").optional(),
  telefono: z.string().regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos").optional().or(z.literal("")),
  direccion: z.string().optional(),
  genero: z.enum(['M', 'F', 'O']).optional(),
  fecha_nacimiento: z.string().optional(),
});

// Schema for updating a trainer
export const updateTrainerSchema = z.object({
  usuario: updateUserDataSchema,
  especialidad: z.string().min(3, "La especialidad es requerida").optional(),
  estado: z.boolean().optional(),
});

export type UpdateTrainerFormValues = z.infer<typeof updateTrainerSchema>;

interface EditTrainerModalProps {
  trainer: Trainer;
  isOpen: boolean;
  onUpdateTrainer: (trainerId: number, updates: UpdateTrainerFormValues) => Promise<void>;
  onClose: () => void;
}

export function EditTrainerModal({ trainer, isOpen, onUpdateTrainer, onClose }: EditTrainerModalProps) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isLoading, isSubmitting },
  } = useForm<UpdateTrainerFormValues>({
    resolver: zodResolver(updateTrainerSchema),
    defaultValues: {
      usuario: {
        nombre: trainer.usuario?.nombre || "",
        apellido: trainer.usuario?.apellido || "",
        correo: trainer.usuario?.correo || "",
        telefono: trainer.usuario?.telefono || "",
        direccion: trainer.usuario?.direccion || "",
        genero: trainer.usuario?.genero as 'M' | 'F' | 'O' | undefined,
        fecha_nacimiento: trainer.usuario?.fecha_nacimiento ? format(parseISO(trainer.usuario.fecha_nacimiento.toString()), 'yyyy-MM-dd') : "",
      },
      especialidad: trainer.especialidad || "",
      estado: trainer.estado,
    },
  });
  
  const watchedGenero = watch("usuario.genero");
  const watchedEstado = watch("estado");

  useEffect(() => {
    setValue("usuario.genero", trainer.usuario?.genero as 'M' | 'F' | 'O' | undefined);
    setValue("estado", trainer.estado);
  }, [trainer, setValue]);
  

  const onSubmit: SubmitHandler<UpdateTrainerFormValues> = async (data) => {
    try {
      await onUpdateTrainer(trainer.id, data);
      onClose(); // Toast de éxito se maneja en la página principal
    } catch (error) {
        // Toast de error se maneja en la página principal
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Entrenador: {trainer.usuario?.nombre} {trainer.usuario?.apellido}
          </DialogTitle>
           <DialogDescription>
            Actualiza la información del entrenador. El documento no se puede cambiar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
             <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Tipo de Documento</Label>
                        <Input value={trainer.usuario?.tipo_documento} disabled />
                    </div>
                    <div className="space-y-1">
                        <Label>Número de Documento</Label>
                        <Input value={trainer.usuario?.numero_documento} disabled />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label>Nombre</Label>
                    <Input {...register("usuario.nombre")} />
                    {errors.usuario?.nombre && <p className="text-sm text-red-500">{errors.usuario.nombre.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Apellido</Label>
                    <Input {...register("usuario.apellido")} />
                    {errors.usuario?.apellido && <p className="text-sm text-red-500">{errors.usuario.apellido.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Correo Electrónico</Label>
                    <Input type="email" {...register("usuario.correo")} />
                    {errors.usuario?.correo && <p className="text-sm text-red-500">{errors.usuario.correo.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Teléfono</Label>
                    <Input type="tel" {...register("usuario.telefono")} />
                    {errors.usuario?.telefono && <p className="text-sm text-red-500">{errors.usuario.telefono.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Fecha de Nacimiento</Label>
                    <Input type="date" {...register("usuario.fecha_nacimiento")} />
                    {errors.usuario?.fecha_nacimiento && <p className="text-sm text-red-500">{errors.usuario.fecha_nacimiento.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label>Dirección</Label>
                    <Input {...register("usuario.direccion")} />
                </div>
                <div className="space-y-1">
                    <Label>Género</Label>
                    <Select value={watchedGenero || ''} onValueChange={(value) => setValue("usuario.genero", value as 'M' | 'F' | 'O')}>
                        <SelectTrigger><SelectValue placeholder="Seleccione género" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                            <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>Especialidad</Label>
                    <Input {...register("especialidad")} />
                    {errors.especialidad && <p className="text-sm text-red-500">{errors.especialidad.message}</p>}
                </div>
                 <div className="space-y-1">
                    <Label>Estado</Label>
                    <Select value={String(watchedEstado)} onValueChange={(value) => setValue("estado", value === 'true')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Activo</SelectItem>
                            <SelectItem value="false">Inactivo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isLoading || isSubmitting} className="bg-black hover:bg-gray-800 text-white">
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 