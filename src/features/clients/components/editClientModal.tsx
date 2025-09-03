import { useState } from "react";
import { useForm, useFieldArray, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { User, Plus, Trash2, Users, ShieldCheck, AlertTriangle, ArrowRight, ArrowLeft, Check } from "lucide-react";
import type { Client } from "@/shared/types";
import { useToast } from "@/shared/components/ui/use-toast";
import { EmailInput } from "@/shared/components/EmailInput";
import { PhoneInput } from "@/shared/components/PhoneInput";
import { BirthDateInput } from "@/shared/components/BirthDateInput";
import { AddressInput } from "@/shared/components/AddressInput";
import { formatDateForInput, formatDateForBackend } from "@/shared/utils/dateUtils";

// Función para validar fecha de nacimiento con edad mínima
const validateBirthDate = (dateString: string, minAge: number) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  if (date > today) return false;
  
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
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

const emergencyContactSchema = z.object({
  id: z.number().optional(),
  nombre_contacto: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  telefono_contacto: z.string()
    .min(5, "El teléfono debe tener mínimo 5 caracteres")
    .max(20, "El teléfono debe tener máximo 20 caracteres")
    .regex(/^\d+$/, "El teléfono solo puede contener números"),
  relacion_contacto: z.string().min(3, "La relación debe tener al menos 3 caracteres").optional().or(z.literal('')),
  es_mismo_beneficiario: z.boolean().optional(),
});

const beneficiarySchema = z.object({
  id: z.number().optional(),
  usuario: z.object({
    id: z.number().optional(),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
    correo: z.string()
      .min(5, "El correo electrónico debe tener mínimo 5 caracteres")
      .max(80, "El correo electrónico debe tener máximo 80 caracteres en la parte local")
      .email("Formato de correo electrónico inválido")
      .refine((email) => {
        const [localPart] = email.split('@');
        return localPart.length >= 1 && localPart.length <= 80;
      }, "La parte local del correo debe tener entre 1 y 80 caracteres"),
    telefono: z.string()
      .min(5, "El teléfono debe tener mínimo 5 caracteres")
      .max(20, "El teléfono debe tener máximo 20 caracteres")
      .regex(/^\d+$/, "El teléfono solo puede contener números")
      .optional().or(z.literal('')),
    tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: z.string().min(5, "El número de documento debe tener al menos 5 caracteres").max(20, "El número de documento debe tener máximo 20 caracteres"),
    fecha_nacimiento: z.string()
      .refine((date) => validateBirthDate(date, 13), "El beneficiario debe tener al menos 13 años"),
    genero: z.enum(['M', 'F', 'O']).optional(),
    direccion: z.string()
      .optional()
      .refine((addr) => !addr || validateColombianAddress(addr), "Formato de dirección inválido. Use formato colombiano: Tipo vía + número # número - número"),
  }),
  relacion_con_titular: z.string().min(3, "La relación con el titular es requerida"),
});

const updateClientSchema = z.object({
  usuario: z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
    correo: z.string()
      .min(5, "El correo electrónico debe tener mínimo 5 caracteres")
      .max(100, "El correo electrónico es demasiado largo")
      .email("Formato de correo electrónico inválido")
      .refine((email) => {
        const [localPart] = email.split('@');
        return localPart.length >= 1 && localPart.length <= 80;
      }, "La parte local del correo debe tener entre 1 y 80 caracteres"),
    telefono: z.string()
      .min(5, "El teléfono debe tener mínimo 5 caracteres")
      .max(20, "El teléfono debe tener máximo 20 caracteres")
      .regex(/^\d+$/, "El teléfono solo puede contener números")
      .optional().or(z.literal('')),
    direccion: z.string()
      .optional()
      .refine((addr) => !addr || validateColombianAddress(addr), "Formato de dirección inválido. Use formato colombiano: Tipo vía + número # número - número"),
    genero: z.enum(['M', 'F', 'O']).optional(),
    fecha_nacimiento: z.string()
      .refine((date) => validateBirthDate(date, 13), "El cliente debe tener al menos 13 años"),
  }),
  estado: z.boolean(),
  contactos_emergencia: z.array(emergencyContactSchema),
  beneficiarios: z.array(beneficiarySchema),
});

export type UpdateClientFormValues = z.infer<typeof updateClientSchema>;

interface EditClientModalProps {
  client: Client & { usuario: NonNullable<Client['usuario']> };
  onUpdateClient: (clientId: number, updates: UpdateClientFormValues) => Promise<void>;
  onClose: () => void;
}

export function EditClientModal({ client, onUpdateClient, onClose }: EditClientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Estado para la navegación paso a paso
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateClientFormValues>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      usuario: {
        nombre: client.usuario.nombre || "",
        apellido: client.usuario.apellido || "",
        correo: client.usuario.correo || "",
        telefono: client.usuario.telefono || "",
        direccion: client.usuario.direccion || "",
        genero: client.usuario.genero as 'M' | 'F' | 'O' | undefined,
        fecha_nacimiento: client.usuario.fecha_nacimiento ? formatDateForInput(client.usuario.fecha_nacimiento.toString()) : "",
      },
      estado: client.estado,
      contactos_emergencia: client.contactos_emergencia?.map(contacto => ({
        id: contacto.id,
        nombre_contacto: contacto.nombre_contacto || "",
        telefono_contacto: contacto.telefono_contacto || "",
        relacion_contacto: contacto.relacion_contacto || "",
        es_mismo_beneficiario: contacto.es_mismo_beneficiario || false,
      })) || [],
      beneficiarios: client.beneficiarios?.map(b => ({
        id: b.id_persona,
        usuario: {
          id: b.persona_beneficiaria?.usuario?.id,
          nombre: b.persona_beneficiaria?.usuario?.nombre || "",
          apellido: b.persona_beneficiaria?.usuario?.apellido || "",
          correo: b.persona_beneficiaria?.usuario?.correo || "",
          telefono: b.persona_beneficiaria?.usuario?.telefono || "",
          tipo_documento: b.persona_beneficiaria?.usuario?.tipo_documento as 'CC' | 'CE' | 'TI' | 'PP' | 'DIE' || 'CC',
          numero_documento: b.persona_beneficiaria?.usuario?.numero_documento || "",
          fecha_nacimiento: b.persona_beneficiaria?.usuario?.fecha_nacimiento ? formatDateForInput(b.persona_beneficiaria.usuario.fecha_nacimiento.toString()) : "",
          direccion: "",
        },
        relacion_con_titular: b.relacion || "",
      })) || [],
    },
  });

  const {
    fields: emergencyContacts,
    append: appendEmergencyContact,
    remove: removeEmergencyContact,
  } = useFieldArray({
    control,
    name: "contactos_emergencia",
  });

  const {
    fields: beneficiaries,
    append: appendBeneficiary,
    remove: removeBeneficiary,
  } = useFieldArray({
    control,
    name: "beneficiarios",
  });

  const watchedGenero = watch("usuario.genero");
  const watchedEstado = watch("estado");

  // Funciones de validación para cada sección
  const validateSection1 = (): boolean => {
    const formData = watch();
    const { nombre, apellido, correo, telefono, fecha_nacimiento, direccion } = formData.usuario;
    return !!(nombre && apellido && correo && telefono && fecha_nacimiento && direccion);
  };

  const validateSection2 = (): boolean => {
    const emergencyContacts = watch("contactos_emergencia");
    return emergencyContacts.some(contact => 
      contact.nombre_contacto && 
      contact.telefono_contacto && 
      contact.relacion_contacto
    );
  };

  // Funciones de navegación
  const goToNextSection = () => {
    if (currentStep < 3) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToSection = (section: number) => {
    if (section === 1 || completedSteps.includes(section - 1)) {
      setCurrentStep(section);
    }
  };

  const addNewEmergencyContact = () => {
    appendEmergencyContact({
      nombre_contacto: "",
      telefono_contacto: "",
      relacion_contacto: "",
      es_mismo_beneficiario: false,
    });
  };

  const addNewBeneficiary = () => {
    appendBeneficiary({
      usuario: {
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        tipo_documento: "CC",
        numero_documento: "",
        fecha_nacimiento: "",
        direccion: "",
      },
      relacion_con_titular: "",
    });
  };

  const onSubmit = async (data: UpdateClientFormValues) => {
    try {
      setIsLoading(true);
      
      // Asegurar que las fechas estén en formato correcto para el backend
      const processedData = {
        ...data,
        usuario: {
          ...data.usuario,
          fecha_nacimiento: data.usuario.fecha_nacimiento ? formatDateForBackend(data.usuario.fecha_nacimiento) : data.usuario.fecha_nacimiento
        },
        beneficiarios: data.beneficiarios?.map(beneficiario => ({
          ...beneficiario,
          usuario: {
            ...beneficiario.usuario,
            fecha_nacimiento: beneficiario.usuario.fecha_nacimiento ? formatDateForBackend(beneficiario.usuario.fecha_nacimiento) : beneficiario.usuario.fecha_nacimiento
          }
        }))
      };
      
      await onUpdateClient(client.id_persona, processedData);
      onClose();
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleInvalidSubmit = (errors: FieldErrors<UpdateClientFormValues>) => {
    const errorMessages: string[] = [];
    
    if (errors.usuario) {
      Object.entries(errors.usuario).forEach(([_, error]) => {
        if (error && typeof error === 'object' && 'message' in error) {
          errorMessages.push(error.message as string);
        }
      });
    }
    
    if (errors.contactos_emergencia) {
      errorMessages.push("Hay errores en los contactos de emergencia");
    }
    
    if (errors.beneficiarios) {
      errorMessages.push("Hay errores en los beneficiarios");
    }

    const errorMessage = errorMessages.length > 0 ? errorMessages.join(', ') : 'Hay errores en el formulario';
    
    toast({
      variant: 'destructive',
      title: 'Formulario inválido',
      description: errorMessage,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5"/>
            Editar Cliente: {client.usuario?.nombre} {client.usuario?.apellido}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, handleInvalidSubmit)} className="space-y-4">
          {/* Indicador de progreso */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors ${
                      step === currentStep 
                        ? 'bg-black text-white' 
                        : completedSteps.includes(step)
                        ? 'bg-green-500 text-white'
                        : step < currentStep || completedSteps.includes(step - 1)
                        ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={() => goToSection(step)}
                  >
                    {completedSteps.includes(step) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${
                    step === currentStep ? 'font-medium text-black' : 'text-gray-600'
                  }`}>
                    {step === 1 ? 'Titular' : step === 2 ? 'Contactos' : 'Beneficiarios'}
                  </span>
                  {step < 3 && <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />}
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Sección 1: Información del Titular */}
            {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5"/>
                  Sección 1: Información del Titular
                </CardTitle>
                <CardDescription>
                  Información personal del cliente titular. Los campos marcados con * son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {/* Documento (Solo lectura) */}
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Tipo de Documento</Label>
                        <Input value={client.usuario?.tipo_documento} disabled className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Número de Documento</Label>
                        <Input value={client.usuario?.numero_documento} disabled className="h-10" />
                      </div>
                    </div>
                  </div>

                  {/* Información Personal */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nombre *</Label>
                      <Input 
                        {...register("usuario.nombre")} 
                        placeholder="Ingrese el nombre"
                        className="h-10"
                        required
                      />
                      {errors.usuario?.nombre && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-4 w-4"/>
                          {errors.usuario.nombre.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Apellido *</Label>
                      <Input 
                        {...register("usuario.apellido")} 
                        placeholder="Ingrese el apellido"
                        className="h-10"
                        required
                      />
                      {errors.usuario?.apellido && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-4 w-4"/>
                          {errors.usuario.apellido.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Email con validación */}
                    <div className="space-y-2">
                      <EmailInput
                        value={watch("usuario.correo") || ""}
                        onChange={(value) => setValue("usuario.correo", value)}
                        label="Correo Electrónico"
                        required={true}
                        forceShowError={!!errors.usuario?.correo}
                      />
                    </div>
                    
                    {/* Teléfono con validación */}
                    <div className="space-y-2">
                      <PhoneInput
                        value={watch("usuario.telefono") || ""}
                        onChange={(value) => setValue("usuario.telefono", value)}
                        label="Teléfono *"
                        required={false}
                        forceShowError={!!errors.usuario?.telefono}
                      />
                    </div>
                    
                    {/* Dirección con validación colombiana - después del teléfono */}
                    <div className="space-y-2">
                      <AddressInput
                        value={watch("usuario.direccion") || ""}
                        onChange={(value) => setValue("usuario.direccion", value)}
                        label="Dirección *"
                        required={false}
                        forceShowError={!!errors.usuario?.direccion}
                      />
                    </div>
                    
                    {/* Fecha de nacimiento con validación */}
                    <div className="space-y-2">
                      <BirthDateInput
                        value={watch("usuario.fecha_nacimiento") || ""}
                        onChange={(value) => setValue("usuario.fecha_nacimiento", value)}
                        label="Fecha de Nacimiento"
                        required={true}
                        forceShowError={!!errors.usuario?.fecha_nacimiento}
                        role="cliente"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Género *</Label>
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
                      <Label className="text-sm font-medium">Estado del Cliente *</Label>
                      <Select onValueChange={(val) => setValue("estado", val === 'true')} value={String(watchedEstado)} required>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccione estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Activo</SelectItem>
                          <SelectItem value="false">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                
                {/* Botones de navegación para sección 1 */}
                <div className="px-6 pb-6">
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={goToNextSection}
                      disabled={!validateSection1()}
                      className={`${
                        validateSection1() 
                          ? 'bg-black hover:bg-gray-800 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Siguiente: Contactos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  {!validateSection1() && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Complete todos los campos obligatorios para continuar
                    </p>
                  )}
                </div>
              </Card>
            )}

          {/* Sección 2: Contactos de Emergencia */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5"/>
                  Sección 2: Contactos de Emergencia
                </CardTitle>
                <CardDescription>
                  Añade contactos de emergencia para el cliente. Al menos un contacto completo es requerido.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                    {emergencyContacts.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg bg-gray-50 relative">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => removeEmergencyContact(index)}
                        >
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                        
                        <Label className="font-medium text-base mb-3 block">
                          Contacto de Emergencia {index + 1}
                        </Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Nombre del Contacto</Label>
                            <Input 
                              {...register(`contactos_emergencia.${index}.nombre_contacto`)} 
                              placeholder="Nombre completo" 
                              className="h-10"
                            />
                            {errors.contactos_emergencia?.[index]?.nombre_contacto && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.contactos_emergencia[index]?.nombre_contacto?.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <PhoneInput
                              value={watch(`contactos_emergencia.${index}.telefono_contacto`) || ""}
                              onChange={(value) => setValue(`contactos_emergencia.${index}.telefono_contacto`, value)}
                              label="Teléfono de Contacto"
                              required={true}
                              forceShowError={!!errors.contactos_emergencia?.[index]?.telefono_contacto}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Relación</Label>
                            <Input 
                              {...register(`contactos_emergencia.${index}.relacion_contacto`)} 
                              placeholder="Padre, Madre, Hermano, etc." 
                              className="h-10"
                            />
                            {errors.contactos_emergencia?.[index]?.relacion_contacto && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.contactos_emergencia[index]?.relacion_contacto?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {emergencyContacts.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay contactos de emergencia registrados</p>
                        <p className="text-sm">Los contactos de emergencia son opcionales pero recomendados</p>
                      </div>
                    )}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={addNewEmergencyContact}
                  >
                    <Plus className="h-4 w-4 mr-2"/> 
                    Agregar Contacto de Emergencia
                  </Button>
                </CardContent>
                
                {/* Botones de navegación para sección 2 */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={goToPreviousSection}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Anterior: Titular
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        onClick={goToNextSection}
                        disabled={!validateSection2()}
                        variant="outline"
                        className={`${
                          validateSection2() 
                            ? 'border-gray-300 hover:bg-gray-50' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        Siguiente: Beneficiarios
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading || !validateSection1() || !validateSection2()}
                        className={`${
                          (validateSection1() && validateSection2()) 
                            ? 'bg-black hover:bg-gray-800 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? "Actualizando..." : "Actualizar Cliente"}
                      </Button>
                    </div>
                  </div>
                  {!validateSection2() && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Agregue al menos un contacto de emergencia completo para continuar o actualizar el cliente
                    </p>
                  )}
                </div>
              </Card>
            )}

          {/* Sección 3: Beneficiarios */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5"/>
                  Sección 3: Información Opcional - Beneficiarios
                </CardTitle>
                <CardDescription>
                  Agregue los beneficiarios del titular. Esta sección es opcional.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {beneficiaries.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg bg-gray-50 relative">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50" 
                        onClick={() => removeBeneficiary(index)}
                      >
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                      
                      <Label className="font-medium text-base mb-4 block">
                        Beneficiario {index + 1}
                      </Label>
                      
                      <div className="space-y-4">
                        {/* Información Personal */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Nombre</Label>
                            <Input 
                              {...register(`beneficiarios.${index}.usuario.nombre`)} 
                              placeholder="Nombre del beneficiario" 
                              className="h-10"
                            />
                            {errors.beneficiarios?.[index]?.usuario?.nombre && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.beneficiarios[index]?.usuario?.nombre?.message}
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Apellido</Label>
                            <Input 
                              {...register(`beneficiarios.${index}.usuario.apellido`)} 
                              placeholder="Apellido del beneficiario" 
                              className="h-10"
                            />
                            {errors.beneficiarios?.[index]?.usuario?.apellido && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.beneficiarios[index]?.usuario?.apellido?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Email y Teléfono */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <EmailInput
                              value={watch(`beneficiarios.${index}.usuario.correo`) || ""}
                              onChange={(value) => setValue(`beneficiarios.${index}.usuario.correo`, value)}
                              label="Correo Electrónico"
                              required={true}
                              forceShowError={!!errors.beneficiarios?.[index]?.usuario?.correo}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <PhoneInput
                              value={watch(`beneficiarios.${index}.usuario.telefono`) || ""}
                              onChange={(value) => setValue(`beneficiarios.${index}.usuario.telefono`, value)}
                              label="Teléfono"
                              required={false}
                              forceShowError={!!errors.beneficiarios?.[index]?.usuario?.telefono}
                            />
                          </div>
                        </div>
                        
                        {/* Documento */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Tipo de Documento</Label>
                            <Controller
                              control={control}
                              name={`beneficiarios.${index}.usuario.tipo_documento`}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Seleccione tipo de documento" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                    <SelectItem value="PP">Pasaporte</SelectItem>
                                    <SelectItem value="DIE">Doc. de Identificación Extranjero</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Número de Documento</Label>
                            <Input 
                              {...register(`beneficiarios.${index}.usuario.numero_documento`)} 
                              placeholder="Número de documento" 
                              maxLength={20} 
                              className="h-10"
                            />
                            {errors.beneficiarios?.[index]?.usuario?.numero_documento && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.beneficiarios[index]?.usuario?.numero_documento?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Fecha de Nacimiento y Relación */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <BirthDateInput
                              value={watch(`beneficiarios.${index}.usuario.fecha_nacimiento`) || ""}
                              onChange={(value) => setValue(`beneficiarios.${index}.usuario.fecha_nacimiento`, value)}
                              label="Fecha de Nacimiento"
                              required={true}
                              forceShowError={!!errors.beneficiarios?.[index]?.usuario?.fecha_nacimiento}
                              role="cliente"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Relación con Titular</Label>
                            <Input 
                              {...register(`beneficiarios.${index}.relacion_con_titular`)} 
                              placeholder="Hijo/a, Esposo/a, Padre, etc." 
                              className="h-10"
                            />
                            {errors.beneficiarios?.[index]?.relacion_con_titular && (
                              <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.beneficiarios[index]?.relacion_con_titular?.message}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Dirección (opcional) */}
                        <div className="space-y-2">
                          <AddressInput
                            value={watch(`beneficiarios.${index}.usuario.direccion`) || ""}
                            onChange={(value) => setValue(`beneficiarios.${index}.usuario.direccion`, value)}
                            label="Dirección (Opcional)"
                            required={false}
                            forceShowError={!!errors.beneficiarios?.[index]?.usuario?.direccion}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {beneficiaries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay beneficiarios registrados</p>
                      <p className="text-sm">Los beneficiarios son opcionales y permiten acceso adicional a la membresía</p>
                    </div>
                  )}
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addNewBeneficiary}
                  >
                    <Plus className="h-4 w-4 mr-2"/> 
                    Agregar Beneficiario
                  </Button>
                </CardContent>
                
                {/* Botones de navegación para sección 3 */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={goToPreviousSection}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Anterior: Contactos
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !validateSection1() || !validateSection2()}
                      className={`${
                        (validateSection1() && validateSection2()) 
                          ? 'bg-black hover:bg-gray-800 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? "Actualizando..." : "Actualizar Cliente"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Los beneficiarios son opcionales. Puede actualizar el cliente sin agregarlos.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
