import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { User, RefreshCw, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";
import { trainerService } from "../services/trainer.service";
import { useToast } from "@/shared/components/ui/use-toast";
import { useDebounce } from "@/shared/hooks/useDebounce";

const userDataSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
  correo: z.string().email("Correo electrónico inválido"),
  contrasena: z.string().optional().or(z.literal("")),
  telefono: z.string().regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos").optional().or(z.literal("")),
  direccion: z.string().optional(),
  genero: z.enum(['M', 'F', 'O']).optional(),
  tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
  numero_documento: z.string().min(5, "El número de documento debe tener al menos 5 caracteres"),
  fecha_nacimiento: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 15;
    },
    { message: "El entrenador debe tener al menos 15 años" }
  ),
});

export const createTrainerSchema = z.object({
  usuario: userDataSchema,
  especialidad: z.string().min(3, "La especialidad es requerida y debe tener al menos 3 caracteres"),
  estado: z.boolean().optional().default(true),
});

export type CreateTrainerFormValues = z.infer<typeof createTrainerSchema>;

interface NewTrainerFormProps {
  isOpen: boolean;
  onCreateTrainer: (data: CreateTrainerFormValues) => Promise<void>;
  onClose: () => void;
}

export function NewTrainerForm({ isOpen, onCreateTrainer, onClose }: NewTrainerFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingUser, setIsCheckingUser] = useState(false);
    const [userCheckResult, setUserCheckResult] = useState<{ exists: boolean, isTrainer: boolean, message: string, variant: 'success' | 'destructive' | 'info' } | null>(null);
    const { toast } = useToast();
  
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateTrainerFormValues>({
        resolver: zodResolver(createTrainerSchema),
        defaultValues: {
            usuario: {
                nombre: "",
                apellido: "",
                correo: "",
                contrasena: "",
                telefono: "",
                direccion: "",
                genero: undefined,
                tipo_documento: "CC",
                numero_documento: "",
                fecha_nacimiento: "",
            },
            especialidad: "",
            estado: true,
        },
    });

    const tipoDocumento = watch("usuario.tipo_documento");
    const numeroDocumento = watch("usuario.numero_documento");
  
    const debouncedNumeroDocumento = useDebounce(numeroDocumento, 500);

    useEffect(() => {
        if (!debouncedNumeroDocumento) {
            setUserCheckResult(null);
            return;
        }
    
        const checkUser = async () => {
            if (debouncedNumeroDocumento.length < 5 || !tipoDocumento) return;
      
            setIsCheckingUser(true);
            setUserCheckResult(null);
      
            try {
                const response = await trainerService.checkUserByDocument(tipoDocumento, debouncedNumeroDocumento);
        
                if (response.isTrainer) {
                    setUserCheckResult({ exists: true, isTrainer: true, message: "Este usuario ya está registrado como entrenador.", variant: "destructive" });
                } else if (response.userExists && response.userData) {
                    const { userData } = response;
                    setValue("usuario.id", userData.id);
                    setValue("usuario.nombre", userData.nombre);
                    setValue("usuario.apellido", userData.apellido);
                    setValue("usuario.correo", userData.correo);
                    setValue("usuario.telefono", userData.telefono || "");
                    setValue("usuario.direccion", userData.direccion || "");
                    setValue("usuario.genero", userData.genero as 'M' | 'F' | 'O' | undefined);
                    const parsedDate = userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento) : null;
                    if (parsedDate && !isNaN(parsedDate.getTime())) {
                        setValue("usuario.fecha_nacimiento", format(parsedDate, 'yyyy-MM-dd'));
                    }
                    setUserCheckResult({ exists: true, isTrainer: false, message: "Usuario encontrado. Datos autocompletados.", variant: "success" });
                } else {
                    setValue("usuario.id", undefined);
                    setValue("usuario.nombre", "");
                    setValue("usuario.apellido", "");
                    setValue("usuario.correo", "");
                    setValue("usuario.telefono", "");
                    setValue("usuario.direccion", "");
                    setValue("usuario.fecha_nacimiento", "");
                    setValue("usuario.genero", undefined);
                    setValue("usuario.contrasena", debouncedNumeroDocumento);
                    setUserCheckResult({ exists: false, isTrainer: false, message: "Usuario no encontrado. Complete el formulario para registrarlo.", variant: "info" });
                }
            } catch (error) {
                setUserCheckResult({ exists: false, isTrainer: false, message: "Error al verificar el usuario.", variant: "destructive" });
            } finally {
                setIsCheckingUser(false);
            }
        };

        checkUser();
    }, [debouncedNumeroDocumento, tipoDocumento, setValue]);

    const onSubmit: SubmitHandler<CreateTrainerFormValues> = async (formData) => {
        if (userCheckResult?.isTrainer) {
            toast({
                title: 'Acción no permitida',
                description: 'Este usuario ya está registrado como entrenador.',
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        try {
            await onCreateTrainer(formData);
            handleClose();
        } catch (error) {
            // El error ya se maneja en la página principal
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        setUserCheckResult(null);
        onClose();
    };

    const watchedGenero = watch("usuario.genero");
    const isSubmitDisabled = isLoading || userCheckResult?.isTrainer;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Crear Nuevo Entrenador
                    </DialogTitle>
                    <DialogDescription>
                        Ingresa el documento para buscar un usuario o registrar uno nuevo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                                        <Select onValueChange={(value) => setValue("usuario.tipo_documento", value as 'CC' | 'CE' | 'TI' | 'PP' | 'DIE')} defaultValue="CC">
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                                <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                                <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                                <SelectItem value="PP">Pasaporte</SelectItem>
                                                <SelectItem value="DIE">Doc. de Identificación Extranjero</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1 relative">
                                        <Label htmlFor="numero_documento">Número de Documento</Label>
                                        <Input id="numero_documento" {...register("usuario.numero_documento")} />
                                        {isCheckingUser && (
                                            <RefreshCw className="absolute right-3 top-8 h-4 w-4 animate-spin text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                    
                            {userCheckResult && (
                                <div className={`p-3 border rounded-lg text-center ${userCheckResult.variant === 'success' ? 'bg-green-50 border-green-200 text-green-800' : userCheckResult.variant === 'destructive' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                                    <div className="flex justify-center items-center">
                                        {userCheckResult.variant === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                                        {userCheckResult.variant === 'destructive' && <AlertTriangle className="h-5 w-5 mr-2" />}
                                        {userCheckResult.variant === 'info' && <Info className="h-5 w-5 mr-2" />}
                                        {userCheckResult.message}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="space-y-1">
                                    <Label>Nombre *</Label>
                                    <Input {...register("usuario.nombre")} />
                                    {errors.usuario?.nombre && <p className="text-sm text-red-500">{errors.usuario.nombre.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Apellido *</Label>
                                    <Input {...register("usuario.apellido")} />
                                    {errors.usuario?.apellido && <p className="text-sm text-red-500">{errors.usuario.apellido.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Correo Electrónico *</Label>
                                    <Input type="email" {...register("usuario.correo")} />
                                    {errors.usuario?.correo && <p className="text-sm text-red-500">{errors.usuario.correo.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Teléfono</Label>
                                    <Input type="tel" {...register("usuario.telefono")} />
                                    {errors.usuario?.telefono && <p className="text-sm text-red-500">{errors.usuario.telefono.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Fecha de Nacimiento *</Label>
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
                                    <Label>Especialidad *</Label>
                                    <Input {...register("especialidad")} />
                                    {errors.especialidad && <p className="text-sm text-red-500">{errors.especialidad.message}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
            
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitDisabled} className="bg-black hover:bg-gray-800 text-white">
                            {isLoading ? "Creando..." : "Crear Entrenador"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 