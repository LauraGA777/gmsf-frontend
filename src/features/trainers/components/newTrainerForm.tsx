import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { DocumentInput } from "@/shared/components/ui/document-input";
import { BirthDateInput } from "@/shared/components/ui/birth-date-input";
import { AddressInput } from "@/shared/components/ui/address-input";
import { EmailInput } from "@/shared/components/ui/email-input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { 
  createTrainerSchema, 
  CreateTrainerFormValues as ImportedCreateTrainerFormValues 
} from "@/shared/validators/document.validator";
import { formatDateForBackend } from "@/shared/utils/dateUtils";

export type CreateTrainerFormValues = ImportedCreateTrainerFormValues;

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
  
    const form = useForm<CreateTrainerFormValues>({
        resolver: zodResolver(createTrainerSchema) as any,
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

    const tipoDocumento = form.watch("usuario.tipo_documento");
    const numeroDocumento = form.watch("usuario.numero_documento");
  
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
                    setUserCheckResult({ 
                        exists: true, 
                        isTrainer: true, 
                        message: response.message || "Este usuario ya está registrado como entrenador.", 
                        variant: "destructive" 
                    });
                } else if (response.userExists && response.userData) {
                    const { userData } = response;
                    // Usuario encontrado pero no es entrenador - autocompletar
                    form.setValue("usuario.id", userData.id ? Number(userData.id) : undefined);
                    form.setValue("usuario.nombre", userData.nombre || "");
                    form.setValue("usuario.apellido", userData.apellido || "");
                    form.setValue("usuario.correo", userData.correo || "");
                    form.setValue("usuario.telefono", userData.telefono || "");
                    form.setValue("usuario.direccion", (userData as any).direccion || "");
                    form.setValue("usuario.genero", (userData as any).genero as 'M' | 'F' | 'O' | undefined);
                    const parsedDate = (userData as any).fecha_nacimiento ? new Date((userData as any).fecha_nacimiento) : null;
                    if (parsedDate && !isNaN(parsedDate.getTime())) {
                        form.setValue("usuario.fecha_nacimiento", format(parsedDate, 'yyyy-MM-dd'));
                    }
                    setUserCheckResult({ 
                        exists: true, 
                        isTrainer: false, 
                        message: "Usuario encontrado. Los datos se han autocompletado. Solo complete la especialidad para registrarlo como entrenador.", 
                        variant: "success" 
                    });
                } else {
                    // Usuario no encontrado - permitir crear nuevo usuario
                    form.setValue("usuario.id", undefined);
                    form.setValue("usuario.nombre", "");
                    form.setValue("usuario.apellido", "");
                    form.setValue("usuario.correo", "");
                    form.setValue("usuario.telefono", "");
                    form.setValue("usuario.direccion", "");
                    form.setValue("usuario.fecha_nacimiento", "");
                    form.setValue("usuario.genero", undefined);
                    form.setValue("usuario.contrasena", debouncedNumeroDocumento);
                    setUserCheckResult({ 
                        exists: false, 
                        isTrainer: false, 
                        message: "Usuario no encontrado. Puede proceder a registrar el nuevo entrenador.", 
                        variant: "info" 
                    });
                }
            } catch (error) {
                console.error("Error al verificar usuario:", error);
                setUserCheckResult({ 
                    exists: false, 
                    isTrainer: false, 
                    message: "Error al verificar el usuario. Intente nuevamente.", 
                    variant: "destructive" 
                });
            } finally {
                setIsCheckingUser(false);
            }
        };

        checkUser();
    }, [debouncedNumeroDocumento, tipoDocumento, form]);

    const onSubmit: SubmitHandler<CreateTrainerFormValues> = async (formData) => {
        if (userCheckResult?.isTrainer) {
            toast({
                title: 'Acción no permitida',
                description: 'Este usuario ya está registrado como entrenador.',
                variant: 'destructive',
            });
            return;
        }

        // Asegurar que la fecha esté en formato correcto para el backend
        const processedFormData = {
            ...formData,
            usuario: {
                ...formData.usuario,
                fecha_nacimiento: formData.usuario.fecha_nacimiento ? formatDateForBackend(formData.usuario.fecha_nacimiento) : formData.usuario.fecha_nacimiento
            }
        };

        // Para usuarios nuevos, establecer la contraseña como el número de documento
        if (!userCheckResult?.exists) {
            const trainerData = {
                ...processedFormData,
                usuario: {
                    ...processedFormData.usuario,
                    contrasena: processedFormData.usuario.numero_documento
                }
            };
            
            setIsLoading(true);
            try {
                await onCreateTrainer(trainerData);
                handleClose();
            } catch (error) {
                // El error ya se maneja en la página principal
            } finally {
                setIsLoading(false);
            }
        } else {
            // Para usuarios existentes, no enviar contraseña
            setIsLoading(true);
            try {
                await onCreateTrainer(processedFormData);
                handleClose();
            } catch (error) {
                // El error ya se maneja en la página principal
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleClose = () => {
        form.reset();
        setUserCheckResult(null);
        onClose();
    };

    const watchedGenero = form.watch("usuario.genero");
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

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg border">
                                <DocumentInput
                                    tipoDocumento={form.watch("usuario.tipo_documento")}
                                    numeroDocumento={form.watch("usuario.numero_documento")}
                                    onTipoDocumentoChange={(tipo) => form.setValue("usuario.tipo_documento", tipo)}
                                    onNumeroDocumentoChange={(numero) => form.setValue("usuario.numero_documento", numero)}
                                    showLabels={true}
                                    required={true}
                                    errors={{
                                        tipo_documento: form.formState.errors.usuario?.tipo_documento?.message,
                                        numero_documento: form.formState.errors.usuario?.numero_documento?.message
                                    }}
                                    showRealTimeValidation={true}
                                    disabled={isCheckingUser}
                                />
                                {isCheckingUser && (
                                    <div className="flex justify-center mt-2">
                                        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                                    </div>
                                )}
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
                                    <Input 
                                        {...form.register("usuario.nombre")} 
                                        className="h-10" 
                                        placeholder="Ej: Juan Carlos"
                                        required 
                                    />
                                    {form.formState.errors.usuario?.nombre && <p className="text-sm text-red-500">{form.formState.errors.usuario.nombre.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Apellido *</Label>
                                    <Input 
                                        {...form.register("usuario.apellido")} 
                                        className="h-10" 
                                        placeholder="Ej: Rodríguez García"
                                        required 
                                    />
                                    {form.formState.errors.usuario?.apellido && <p className="text-sm text-red-500">{form.formState.errors.usuario.apellido.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <EmailInput
                                        value={form.watch("usuario.correo") || ""}
                                        onChange={(value) => form.setValue("usuario.correo", value)}
                                        label="Correo Electrónico"
                                        required={true}
                                        forceShowError={!!form.formState.errors.usuario?.correo}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <PhoneInput
                                        value={form.watch("usuario.telefono") || ""}
                                        onChange={(value) => form.setValue("usuario.telefono", value)}
                                        label="Teléfono *"
                                        required={false}
                                        forceShowError={!!form.formState.errors.usuario?.telefono}
                                    />
                                </div>
                                {/* Dirección después del teléfono */}
                                <div className="space-y-1">
                                    <AddressInput
                                        value={form.watch("usuario.direccion") || ""}
                                        onChange={(value) => form.setValue("usuario.direccion", value)}
                                        label="Dirección *"
                                        required={false}
                                        forceShowError={!!form.formState.errors.usuario?.direccion}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <BirthDateInput
                                        value={form.watch("usuario.fecha_nacimiento") || ""}
                                        onChange={(value) => form.setValue("usuario.fecha_nacimiento", value)}
                                        role="entrenador"
                                        required={true}
                                        forceShowError={!!form.formState.errors.usuario?.fecha_nacimiento}
                                        label="Fecha de Nacimiento"
                                        placeholder="dd/mm/aaaa"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Género *</Label>
                                    <Select value={watchedGenero || ''} onValueChange={(value) => form.setValue("usuario.genero", value as 'M' | 'F' | 'O')}>
                                        <SelectTrigger className="h-10"><SelectValue placeholder="Seleccione género" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Masculino</SelectItem>
                                            <SelectItem value="F">Femenino</SelectItem>
                                            <SelectItem value="O">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Especialidad *</Label>
                                    <Input 
                                        {...form.register("especialidad")} 
                                        className="h-10" 
                                        placeholder="Ej: Fitness, Yoga, CrossFit, Pilates"
                                        required 
                                    />
                                    {form.formState.errors.especialidad && <p className="text-sm text-red-500">{form.formState.errors.especialidad.message}</p>}
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