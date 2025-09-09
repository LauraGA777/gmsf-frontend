import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { User, AlertTriangle } from "lucide-react";
import { EmailInput } from "@/shared/components/ui/email-input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { BirthDateInput } from "@/shared/components/ui/birth-date-input";
import { AddressInput } from "@/shared/components/ui/address-input";
import type { Trainer } from "@/shared/types/trainer";
import { formatDateForInput, formatDateForBackend } from "@/shared/utils/dateUtils";

// Función para validar fecha de nacimiento con edad mínima para entrenadores
const validateTrainerBirthDate = (dateString: string) => {
  if (!dateString) return true; // Opcional
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  if (date > today) return false;
  
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= 16; // Mínimo 16 años para entrenadores
  }
  
  return age >= 16;
};

// Función para validar dirección colombiana
const validateColombianAddress = (address: string) => {
  if (!address || address.trim().length === 0) return true; // Opcional
  
  const trimmedAddress = address.trim();
  if (trimmedAddress.length < 5) return false;
  
  // Caracteres permitidos
  const allowedChars = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-]+$/;
  if (!allowedChars.test(trimmedAddress)) return false;
  
  // Tipos de vía válidos
  const roadTypes = ['calle', 'cl', 'carrera', 'cra', 'cr', 'diagonal', 'dg', 'transversal', 'tv', 'avenida', 'av', 'autopista'];
  const startsWithValidRoad = roadTypes.some(type => 
    trimmedAddress.toLowerCase().startsWith(type.toLowerCase())
  );
  
  if (!startsWithValidRoad) return false;
  
  // Debe contener números
  if (!/\d/.test(trimmedAddress)) return false;
  
  // Formato básico (flexible)
  const hasBasicFormat = /\d+.*#.*\d+.*-.*\d+/i.test(trimmedAddress);
  return hasBasicFormat;
};

// Schema for updating user data (some fields are optional)
const updateUserDataSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres").optional(),
  correo: z.string()
    .min(5, "El correo electrónico debe tener mínimo 5 caracteres")
    .max(100, "El correo electrónico es demasiado largo")
    .email("Formato de correo electrónico inválido")
    .refine((email) => {
      const [localPart] = email.split('@');
      return localPart.length >= 1 && localPart.length <= 80;
    }, "La parte local del correo debe tener entre 1 y 80 caracteres")
    .optional(),
  telefono: z.string()
    .min(5, "El teléfono debe tener mínimo 5 caracteres")
    .max(20, "El teléfono debe tener máximo 20 caracteres")
    .regex(/^\d+$/, "El teléfono solo puede contener números")
    .optional()
    .or(z.literal("")),
  direccion: z.string()
    .optional()
    .refine((addr) => !addr || validateColombianAddress(addr), "Formato de dirección inválido. Use formato colombiano: Tipo vía + número # número - número"),
  genero: z.enum(['M', 'F', 'O']).optional(),
  fecha_nacimiento: z.string()
    .optional()
    .refine((date) => !date || validateTrainerBirthDate(date), "El entrenador debe tener al menos 16 años"),
  tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']).optional(),
  numero_documento: z.string().min(5, "El número de documento debe tener al menos 5 caracteres").max(20, "El número de documento debe tener máximo 20 caracteres").optional(),
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
        fecha_nacimiento: trainer.usuario?.fecha_nacimiento ? formatDateForInput(trainer.usuario.fecha_nacimiento.toString()) : "",
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
      // Asegurar que la fecha esté en formato correcto para el backend
      const processedData = {
        ...data,
        usuario: data.usuario ? {
          ...data.usuario,
          fecha_nacimiento: data.usuario.fecha_nacimiento ? formatDateForBackend(data.usuario.fecha_nacimiento) : data.usuario.fecha_nacimiento
        } : data.usuario
      };
      
      await onUpdateTrainer(trainer.id, processedData);
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
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipo de Documento</Label>
                        <Input value={trainer.usuario?.tipo_documento} disabled className="h-10" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Número de Documento</Label>
                        <Input value={trainer.usuario?.numero_documento} disabled className="h-10" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Nombre *</Label>
                    <Input 
                        {...register("usuario.nombre")} 
                        placeholder="Ej: Juan Carlos"
                        className="h-10"
                        required
                    />
                    {errors.usuario?.nombre && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4"/>
                            {errors.usuario.nombre.message}
                        </p>
                    )}
                </div>
                
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Apellido *</Label>
                    <Input 
                        {...register("usuario.apellido")} 
                        placeholder="Ej: Rodríguez García"
                        className="h-10"
                        required
                    />
                    {errors.usuario?.apellido && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4"/>
                            {errors.usuario.apellido.message}
                        </p>
                    )}
                </div>
                
                <div className="space-y-2">
                    <EmailInput
                        value={watch("usuario.correo") || ""}
                        onChange={(value) => setValue("usuario.correo", value)}
                        label="Correo Electrónico"
                        required={true}
                        forceShowError={!!errors.usuario?.correo}
                    />
                </div>
                
                <div className="space-y-2">
                    <PhoneInput
                        value={watch("usuario.telefono") || ""}
                        onChange={(value) => setValue("usuario.telefono", value)}
                        label="Teléfono *"
                        required={false}
                        forceShowError={!!errors.usuario?.telefono}
                    />
                </div>
                
                {/* Dirección - después del teléfono */}
                <div className="space-y-2">
                    <AddressInput
                        value={watch("usuario.direccion") || ""}
                        onChange={(value) => setValue("usuario.direccion", value)}
                        label="Dirección *"
                        required={false}
                        forceShowError={!!errors.usuario?.direccion}
                    />
                </div>
                
                <div className="space-y-2">
                    <BirthDateInput
                        value={watch("usuario.fecha_nacimiento") || ""}
                        onChange={(value) => setValue("usuario.fecha_nacimiento", value)}
                        label="Fecha de Nacimiento *"
                        required={false}
                        forceShowError={!!errors.usuario?.fecha_nacimiento}
                        role="entrenador"
                        placeholder="dd/mm/aaaa"
                    />
                </div>
                
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Género</Label>
                    <Select value={watchedGenero || ''} onValueChange={(value) => setValue("usuario.genero", value as 'M' | 'F' | 'O')}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seleccione género" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                            <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Especialidad *</Label>
                    <Input 
                        {...register("especialidad")} 
                        placeholder="Ej: Fitness, Yoga, CrossFit, Pilates"
                        className="h-10"
                        required
                    />
                    {errors.especialidad && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4"/>
                            {errors.especialidad.message}
                        </p>
                    )}
                </div>
                
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Estado *</Label>
                    <Select value={String(watchedEstado)} onValueChange={(value) => setValue("estado", value === 'true')} required>
                        <SelectTrigger className="h-10">
                            <SelectValue />
                        </SelectTrigger>
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