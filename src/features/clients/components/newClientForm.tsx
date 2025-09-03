import { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { User, Plus, Trash2, Users, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Info, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { format } from "date-fns";
import { clientService } from "@/features/clients/services/client.service";
import { useToast } from "@/shared/components/ui/use-toast";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { DocumentInput } from "@/shared/components/ui/document-input";
import { BirthDateInput } from "@/shared/components/BirthDateInput";
import { AddressInput } from "@/shared/components/AddressInput";
import { EmailInput } from "@/shared/components/EmailInput";
import { PhoneInput } from "@/shared/components/PhoneInput";
import { 
  createClientSchema, 
  CreateClientFormValues as ImportedCreateClientFormValues
} from "@/shared/validators/document.validator";
import { formatDateForBackend } from "@/shared/utils/dateUtils";

export type CreateClientFormValues = ImportedCreateClientFormValues;

interface NewClientFormProps {
  isOpen: boolean;
  onCreateClient: (data: CreateClientFormValues) => Promise<void>;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewClientForm({ isOpen, onCreateClient, onClose, onSuccess }: NewClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isUserFound, setIsUserFound] = useState(false);
  const [isAlreadyClient, setIsAlreadyClient] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  
  // Estados para navegación paso a paso
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
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
      contactos_emergencia: [],
      beneficiarios: [],
      es_beneficiario_propio: false,
    },
  });

  const tipoDocumento = watch("usuario.tipo_documento");
  const numeroDocumento = watch("usuario.numero_documento");
  
  const debouncedNumeroDocumento = useDebounce(numeroDocumento, 500);

  useEffect(() => {
    // Si el campo de documento está vacío, limpiamos todo y salimos.
    if (!debouncedNumeroDocumento) {
      setIsUserFound(false);
      setUserNotFound(false);
      setIsAlreadyClient(false);
      // No limpiamos los campos aquí para evitar el problema de re-renderizado
      return;
    }
    
    const handleCheckUser = async () => {
      if (debouncedNumeroDocumento.length < 5 || !tipoDocumento) {
        return; // No hacer nada si el documento no es válido
      }
      
      setIsCheckingUser(true);
      // No reseteamos los estados aquí para evitar parpadeos
      
      try {
        const response = await clientService.checkUserByDocument(tipoDocumento, debouncedNumeroDocumento);
        
        if (response.userExists && response.userData) {
          const userData = response.userData;
          
          // Verificar si ya es cliente
          if (userData.isAlreadyClient) {
            setIsAlreadyClient(true);
            setIsUserFound(true);
            setUserNotFound(false);
            toast({ title: "Usuario ya registrado", description: "Este usuario ya figura como cliente.", variant: "destructive" });
          } else {
            // Usuario encontrado, pero no es cliente. Autocompletar.
            setValue("usuario.id", userData.id);
            setValue("usuario.nombre", userData.nombre);
            setValue("usuario.apellido", userData.apellido);
            setValue("usuario.correo", userData.correo);
            setValue("usuario.telefono", userData.telefono || "");
            setValue("usuario.direccion", userData.direccion || "");
            setValue("usuario.genero", userData.genero || undefined);
            setValue("usuario.tipo_documento", userData.tipo_documento);

            const parsedDate = userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento) : null;
            if (parsedDate && !isNaN(parsedDate.getTime())) {
              setValue("usuario.fecha_nacimiento", format(parsedDate, 'yyyy-MM-dd'));
            } else {
              setValue("usuario.fecha_nacimiento", "");
            }
            
            setIsUserFound(true);
            setUserNotFound(false);
            setIsAlreadyClient(false);
            toast({ title: "Usuario Encontrado", description: "Datos del usuario autocompletados.", variant: "success" });
          }
        } else {
          // Usuario no encontrado
          setUserNotFound(true);
          setIsUserFound(false);
          setIsAlreadyClient(false);
          // Limpiamos los campos solo cuando confirmamos que el usuario NO existe
          setValue("usuario.id", undefined);
          setValue("usuario.nombre", "");
          setValue("usuario.apellido", "");
          setValue("usuario.correo", "");
          setValue("usuario.telefono", "");
          setValue("usuario.direccion", "");
          setValue("usuario.fecha_nacimiento", "");
          setValue("usuario.genero", undefined);
          setValue("usuario.contrasena", debouncedNumeroDocumento);
          toast({ title: "Usuario no encontrado", description: "Puede proceder a registrar el nuevo usuario.", variant: "default" });
        }
      } catch (error: any) {
        // Error en la consulta - asumir que el usuario no existe
        setUserNotFound(true);
        setIsUserFound(false);
        setIsAlreadyClient(false);
        // Limpiamos los campos
        setValue("usuario.id", undefined);
        setValue("usuario.nombre", "");
        setValue("usuario.apellido", "");
        setValue("usuario.correo", "");
        setValue("usuario.telefono", "");
        setValue("usuario.direccion", "");
        setValue("usuario.fecha_nacimiento", "");
        setValue("usuario.genero", undefined);
        setValue("usuario.contrasena", debouncedNumeroDocumento);
        
        console.warn('Error checking user by document:', error);
        toast({ title: "Error de red", description: "No se pudo conectar con el servidor.", variant: "destructive" });
      } finally {
        setIsCheckingUser(false);
      }
    };

    handleCheckUser();
  }, [debouncedNumeroDocumento, tipoDocumento, setValue, toast]);

  const { fields: emergencyContacts, append: appendEmergencyContact, remove: removeEmergencyContact } = useFieldArray({
    control,
    name: "contactos_emergencia",
  });

  const { fields: beneficiaries, append: appendBeneficiary, remove: removeBeneficiary } = useFieldArray({
    control,
    name: "beneficiarios",
  });

  const watchedGenero = watch("usuario.genero");

  // Funciones de validación para cada sección
  const validateSection1 = () => {
    const values = watch();
    const requiredFields = [
      values.usuario?.tipo_documento,
      values.usuario?.numero_documento,
      values.usuario?.nombre,
      values.usuario?.apellido,
      values.usuario?.correo,
      values.usuario?.fecha_nacimiento
    ];
    
    const hasErrors = !!(
      errors.usuario?.tipo_documento ||
      errors.usuario?.numero_documento ||
      errors.usuario?.nombre ||
      errors.usuario?.apellido ||
      errors.usuario?.correo ||
      errors.usuario?.fecha_nacimiento
    );
    
    const allFieldsFilled = requiredFields.every(field => field && field.trim() !== "");
    return allFieldsFilled && !hasErrors && !isAlreadyClient;
  };

  const validateSection2 = () => {
    const contacts = watch("contactos_emergencia") || [];
    if (contacts.length === 0) return false;
    
    const validContacts = contacts.every(contact => 
      contact.nombre_contacto && 
      contact.telefono_contacto && 
      contact.relacion_contacto &&
      contact.nombre_contacto.trim() !== "" &&
      contact.telefono_contacto.trim() !== "" &&
      contact.relacion_contacto.trim() !== ""
    );
    
    const hasContactErrors = errors.contactos_emergencia && 
      Array.isArray(errors.contactos_emergencia) &&
      errors.contactos_emergencia.some(contactError => contactError);
    
    return validContacts && !hasContactErrors;
  };

  // Navegación entre secciones
  const goToNextSection = () => {
    if (currentStep === 1 && validateSection1()) {
      setCompletedSteps(prev => [...prev.filter(step => step !== 1), 1]);
      setCurrentStep(2);
    } else if (currentStep === 2 && validateSection2()) {
      setCompletedSteps(prev => [...prev.filter(step => step !== 2), 2]);
      setCurrentStep(3);
    }
  };

  const goToPreviousSection = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToSection = (section: number) => {
    if (section === 1) {
      setCurrentStep(1);
    } else if (section === 2 && completedSteps.includes(1)) {
      setCurrentStep(2);
    } else if (section === 3 && completedSteps.includes(1) && completedSteps.includes(2)) {
      setCurrentStep(3);
    }
  };

  const onSubmit: SubmitHandler<CreateClientFormValues> = async (formData) => {
    console.log("Datos del formulario a enviar:", JSON.stringify(formData, null, 2));
    setIsLoading(true);
    try {
      // Asegurar que las fechas estén en formato correcto para el backend
      const processedData = {
        ...formData,
        usuario: {
          ...formData.usuario,
          fecha_nacimiento: formData.usuario.fecha_nacimiento ? formatDateForBackend(formData.usuario.fecha_nacimiento) : formData.usuario.fecha_nacimiento
        },
        beneficiarios: formData.beneficiarios?.map(beneficiario => ({
          ...beneficiario,
          usuario: {
            ...beneficiario.usuario,
            fecha_nacimiento: beneficiario.usuario.fecha_nacimiento ? formatDateForBackend(beneficiario.usuario.fecha_nacimiento) : beneficiario.usuario.fecha_nacimiento
          }
        }))
      };
      
      await onCreateClient(processedData);
      toast({
        title: '¡Éxito!',
        description: 'Cliente creado correctamente',
        variant: 'default',
      });
      reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al crear cliente:', error);
      console.error('Detalles del error:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al crear el cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear Nuevo Cliente (Titular)
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para registrar un nuevo cliente. Todos los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error("Errores de validación del formulario:", errors);
          
          let errorMessage = 'Por favor, revisa los campos marcados en rojo.';
          
          if (errors.contactos_emergencia) {
            errorMessage = 'Se requiere al menos un contacto de emergencia válido. Verifica los números de teléfono.';
          } else if (errors.usuario?.fecha_nacimiento) {
            errorMessage = 'El cliente debe tener al menos 13 años.';
          }
          
          toast({
            title: 'Formulario inválido',
            description: errorMessage,
            variant: 'destructive',
          });
        })} className="space-y-4">
          
          {/* Indicador de progreso */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                    currentStep === step 
                      ? 'bg-black text-white border-black' 
                      : completedSteps.includes(step)
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }`}
                  onClick={() => goToSection(step)}
                >
                  {completedSteps.includes(step) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === step 
                    ? 'text-black' 
                    : completedSteps.includes(step)
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}>
                  {step === 1 && 'Titular'}
                  {step === 2 && 'Contactos'}
                  {step === 3 && 'Beneficiaros'}
                </span>
                {step < 3 && (
                  <ArrowRight className={`ml-4 h-4 w-4 ${
                    completedSteps.includes(step) ? 'text-green-500' : 'text-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Sección 1: Titular */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Sección 1: Información del Titular</CardTitle>
                <CardDescription>
                  Ingresa el documento para buscar un usuario existente o registrar uno nuevo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <DocumentInput
                      tipoDocumento={watch("usuario.tipo_documento")}
                      numeroDocumento={watch("usuario.numero_documento")}
                      onTipoDocumentoChange={(tipo) => setValue("usuario.tipo_documento", tipo)}
                      onNumeroDocumentoChange={(numero) => setValue("usuario.numero_documento", numero)}
                      showLabels={true}
                      required={true}
                      errors={{
                        tipo_documento: errors.usuario?.tipo_documento?.message,
                        numero_documento: errors.usuario?.numero_documento?.message
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

                  {isUserFound && !isAlreadyClient && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                      <div className="flex justify-center items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Usuario encontrado. Datos auto-completados.
                      </div>
                    </div>
                  )}
                  
                  {isAlreadyClient && (
                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                       <div className="flex justify-center items-center">
                         <AlertTriangle className="h-5 w-5 mr-2" />
                         Este usuario ya está registrado como cliente.
                       </div>
                     </div>
                  )}

                  {userNotFound && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center my-2">
                      <div className="flex justify-center items-center">
                        <Info className="h-5 w-5 text-blue-500 mr-2"/>
                        <p className="font-semibold text-blue-800">Usuario no encontrado</p>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        Complete el formulario para registrar al nuevo usuario y cliente. La contraseña por defecto será su número de documento.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <Label>Nombre *</Label>
                      <Input 
                        {...register("usuario.nombre")} 
                        placeholder="Ej: Juan David"
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
                    <div className="space-y-1">
                      <Label>Apellido *</Label>
                      <Input 
                        {...register("usuario.apellido")} 
                        placeholder="Ej: Pérez Gómez"
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
                    <div className="space-y-1">
                      <EmailInput
                        value={watch("usuario.correo") || ""}
                        onChange={(value) => setValue("usuario.correo", value)}
                        label="Correo Electrónico"
                        required={true}
                        forceShowError={!!errors.usuario?.correo}
                      />
                    </div>
                    <div className="space-y-1">
                      <PhoneInput
                        value={watch("usuario.telefono") || ""}
                        onChange={(value) => setValue("usuario.telefono", value)}
                        label="Teléfono *"
                        required={false}
                        forceShowError={!!errors.usuario?.telefono}
                      />
                    </div>
                    {/* Dirección después del teléfono */}
                    <div className="space-y-1">
                      <AddressInput
                        value={watch("usuario.direccion") || ""}
                        onChange={(value) => setValue("usuario.direccion", value)}
                        label="Dirección *"
                        required={false}
                        forceShowError={!!errors.usuario?.direccion}
                      />
                    </div>
                    <div className="space-y-1">
                      <BirthDateInput
                        value={watch("usuario.fecha_nacimiento") || ""}
                        onChange={(value) => setValue("usuario.fecha_nacimiento", value)}
                        role="cliente"
                        required={true}
                        forceShowError={!!errors.usuario?.fecha_nacimiento}
                        label="Fecha de Nacimiento"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Género *</Label>
                      <Select 
                        value={watchedGenero || ''} 
                        onValueChange={(value) => setValue("usuario.genero", value as 'M' | 'F' | 'O')}
                      >
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
                  </div>
                </CardContent>
                
                {/* Botón siguiente para sección 1 */}
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

          {/* Sección 2: Contactos */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5"/>
                  Sección 2: Contactos de Emergencia
                </CardTitle>
                <CardDescription>
                  Agregue al menos un contacto de emergencia. Todos los campos son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    {emergencyContacts.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-md space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label>Nombre del Contacto *</Label>
                            <Input 
                              {...register(`contactos_emergencia.${index}.nombre_contacto`)} 
                              placeholder="Ej: Juan Pérez"
                            />
                            {errors.contactos_emergencia?.[index]?.nombre_contacto && (
                              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.contactos_emergencia[index].nombre_contacto.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <PhoneInput
                              value={watch(`contactos_emergencia.${index}.telefono_contacto`) || ""}
                              onChange={(value) => setValue(`contactos_emergencia.${index}.telefono_contacto`, value)}
                              label="Teléfono"
                              required={true}
                              forceShowError={!!errors.contactos_emergencia?.[index]?.telefono_contacto}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Relación *</Label>
                            <Input 
                              {...register(`contactos_emergencia.${index}.relacion_contacto`)}
                              placeholder="Ej: Padre, Madre, Hermano"
                            />
                            {errors.contactos_emergencia?.[index]?.relacion_contacto && (
                              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.contactos_emergencia[index].relacion_contacto.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                            onClick={() => removeEmergencyContact(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Eliminar Contacto
                          </Button>
                        </div>
                      </div>
                    ))}
                    {emergencyContacts.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No hay contactos de emergencia agregados
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={() => appendEmergencyContact({ 
                      nombre_contacto: '', 
                      telefono_contacto: '', 
                      relacion_contacto: '', 
                      es_mismo_beneficiario: false 
                    })}
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
                        Siguiente: Información Opcional
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading || isAlreadyClient || !validateSection1() || !validateSection2()}
                        className={`${
                          (validateSection1() && validateSection2() && !isAlreadyClient) 
                            ? 'bg-black hover:bg-gray-800 text-white' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isLoading ? "Creando..." : "Crear Cliente"}
                      </Button>
                    </div>
                  </div>
                  {!validateSection2() && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Agregue al menos un contacto de emergencia completo para continuar o crear el cliente
                    </p>
                  )}
                </div>
              </Card>
            )}

          {/* Sección 3: Información Opcional (Beneficiarios) */}
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
              <CardContent className="space-y-3">
                  {beneficiaries.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="font-semibold text-base">Beneficiario {index + 1}</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => removeBeneficiary(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2"/>
                          Eliminar
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label>Nombre *</Label>
                          <Input 
                            {...register(`beneficiarios.${index}.usuario.nombre`)} 
                            placeholder="Ej: María"
                          />
                          {errors.beneficiarios?.[index]?.usuario?.nombre && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-4 w-4"/>
                              {errors.beneficiarios[index].usuario?.nombre?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label>Apellido *</Label>
                          <Input 
                            {...register(`beneficiarios.${index}.usuario.apellido`)} 
                            placeholder="Ej: Pérez Gómez"
                          />
                          {errors.beneficiarios?.[index]?.usuario?.apellido && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-4 w-4"/>
                              {errors.beneficiarios[index].usuario?.apellido?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <EmailInput
                            value={watch(`beneficiarios.${index}.usuario.correo`) || ""}
                            onChange={(value) => setValue(`beneficiarios.${index}.usuario.correo`, value)}
                            label="Correo Electrónico"
                            required={true}
                            forceShowError={!!errors.beneficiarios?.[index]?.usuario?.correo}
                          />
                        </div>
                        <div className="space-y-1">
                          <PhoneInput
                            value={watch(`beneficiarios.${index}.usuario.telefono`) || ""}
                            onChange={(value) => setValue(`beneficiarios.${index}.usuario.telefono`, value)}
                            label="Teléfono"
                            required={false}
                            forceShowError={!!errors.beneficiarios?.[index]?.usuario?.telefono}
                          />
                        </div>
                        {/* Documentos del beneficiario */}
                        <div className="col-span-full">
                          <DocumentInput
                            tipoDocumento={watch(`beneficiarios.${index}.usuario.tipo_documento`) || 'CC'}
                            numeroDocumento={watch(`beneficiarios.${index}.usuario.numero_documento`) || ''}
                            onTipoDocumentoChange={(tipo) => setValue(`beneficiarios.${index}.usuario.tipo_documento`, tipo)}
                            onNumeroDocumentoChange={(numero) => setValue(`beneficiarios.${index}.usuario.numero_documento`, numero)}
                            showLabels={true}
                            required={true}
                            errors={{
                              tipo_documento: errors.beneficiarios?.[index]?.usuario?.tipo_documento?.message,
                              numero_documento: errors.beneficiarios?.[index]?.usuario?.numero_documento?.message
                            }}
                            showRealTimeValidation={true}
                          />
                        </div>
                        <div className="space-y-1">
                          <BirthDateInput
                            value={watch(`beneficiarios.${index}.usuario.fecha_nacimiento`) || ""}
                            onChange={(value) => setValue(`beneficiarios.${index}.usuario.fecha_nacimiento`, value)}
                            role="cliente"
                            required={true}
                            forceShowError={!!errors.beneficiarios?.[index]?.usuario?.fecha_nacimiento}
                            label="Fecha de Nacimiento"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Relación con el Titular *</Label>
                          <Input 
                            {...register(`beneficiarios.${index}.relacion`)}
                            placeholder="Ej: Hijo/a, Cónyuge, Padre/Madre"
                          />
                          {errors.beneficiarios?.[index]?.relacion && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-4 w-4"/>
                              {errors.beneficiarios[index].relacion?.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {beneficiaries.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No hay beneficiarios agregados
                    </div>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={() => appendBeneficiary({ 
                      usuario: { 
                        tipo_documento: 'CC',
                        nombre: '',
                        apellido: '',
                        correo: '',
                        telefono: '',
                        numero_documento: '',
                        fecha_nacimiento: '',
                        genero: undefined
                      }, 
                      relacion: '' 
                    })}
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
                      disabled={isLoading || isAlreadyClient || !validateSection1() || !validateSection2()}
                      className={`${
                        (validateSection1() && validateSection2() && !isAlreadyClient) 
                          ? 'bg-black hover:bg-gray-800 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? "Creando..." : "Crear Cliente"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Los beneficiarios son opcionales. Puede crear el cliente sin agregarlos.
                  </p>
                </div>
              </Card>
            )}
        </form>
      </DialogContent>
    </Dialog>
  );
} 