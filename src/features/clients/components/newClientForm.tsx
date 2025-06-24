import { useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { User, Plus, Trash2, Users, Phone, Mail, FileText, Calendar, Search, ShieldCheck, Contact, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { clientService } from "@/features/clients/services/client.service";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useToast } from "@/shared/components/ui/use-toast";

const emergencyContactSchema = z.object({
  nombre_contacto: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  telefono_contacto: z.string()
    .refine(
      (val) => /^\d{7,15}$/.test(val),
      "El teléfono debe tener entre 7 y 15 dígitos"
    ),
  relacion_contacto: z.string().min(3, "La relación debe tener al menos 3 caracteres"),
  es_mismo_beneficiario: z.boolean(),
});

const userDataSchema = z.object({
  id: z.number().optional(),
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  apellido: z.string()
    .min(3, "El apellido debe tener al menos 3 caracteres")
    .max(100, "El apellido no puede tener más de 100 caracteres"),
  correo: z.string()
    .email("Correo electrónico inválido")
    .min(5, "El correo es demasiado corto")
    .max(100, "El correo no puede tener más de 100 caracteres"),
  contrasena: z.string().optional(), // La contraseña es opcional para clientes
  telefono: z.string()
    .refine(
      (val) => val === "" || /^\d{7,15}$/.test(val),
      "El teléfono debe tener entre 7 y 15 dígitos"
    )
    .optional()
    .or(z.literal("")),
  direccion: z.string()
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .optional(),
  genero: z.enum(['M', 'F', 'O']).optional(),
  tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
  numero_documento: z.string()
    .min(5, "El número de documento debe tener al menos 5 caracteres")
    .max(20, "El número de documento no puede tener más de 20 caracteres"),
  fecha_nacimiento: z.string().refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 13;
    },
    { message: "El cliente debe tener al menos 13 años" }
  ),
});

const beneficiarySchema = z.object({
  usuario: userDataSchema,
  relacion: z.string().min(3, "La relación debe tener al menos 3 caracteres"),
});

const createClientSchema = z.object({
  usuario: userDataSchema,
  contactos_emergencia: z.array(emergencyContactSchema)
    .min(1, "Se requiere al menos un contacto de emergencia"),
  beneficiarios: z.array(beneficiarySchema).optional(),
  es_beneficiario_propio: z.boolean(),
});

type CreateClientFormValues = z.infer<typeof createClientSchema>;

interface NewClientFormProps {
  isOpen: boolean;
  onCreateClient: (data: CreateClientFormValues) => Promise<void>;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewClientForm({ isOpen, onCreateClient, onClose, onSuccess }: NewClientFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isUserFound, setIsUserFound] = useState(false);
  const [isAlreadyClient, setIsAlreadyClient] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [userExists, setUserExists] = useState(false);
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
    resolver: zodResolver(createClientSchema) as any,
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
  const watchedGenero = watch("usuario.genero");
  const watchedEsBeneficiarioPropio = watch("es_beneficiario_propio");

  const { fields: emergencyContacts, append: appendEmergencyContact, remove: removeEmergencyContact } = useFieldArray({
    control,
    name: "contactos_emergencia",
  });

  const { fields: beneficiaries, append: appendBeneficiary, remove: removeBeneficiary } = useFieldArray({
    control,
    name: "beneficiarios",
  });

  const handleCheckUser = async () => {
    setUserNotFound(false);
    setIsUserFound(false);
    setIsAlreadyClient(false);
    if (!numeroDocumento || numeroDocumento.length < 5 || !tipoDocumento) {
      return;
    }
    setIsCheckingUser(true);
    try {
      const { data: user } = await clientService.checkUserByDocument(tipoDocumento, numeroDocumento);
      
      if (user.isAlreadyClient) {
        setIsAlreadyClient(true);
        setIsUserFound(true);
      } else {
        setValue("usuario.id", user.id);
        setValue("usuario.nombre", user.nombre);
        setValue("usuario.apellido", user.apellido);
        setValue("usuario.correo", user.correo);
        setValue("usuario.telefono", user.telefono || "");
        setValue("usuario.direccion", user.direccion || "");
        setValue("usuario.genero", user.genero || null);
        setValue("usuario.tipo_documento", user.tipo_documento);
        setValue("usuario.fecha_nacimiento", format(new Date(user.fecha_nacimiento), 'yyyy-MM-dd'));
        setIsUserFound(true);
        setUserNotFound(false);
      }
    } catch (error) {
      setIsUserFound(false);
      setValue("usuario.id", undefined);
      if (numeroDocumento) {
        setValue("usuario.contrasena", numeroDocumento);
      }
      setUserNotFound(true);
    } finally {
      setIsCheckingUser(false);
    }
  };
  
  const onSubmit: SubmitHandler<CreateClientFormValues> = async (formData) => {
    console.log("Datos del formulario a enviar:", JSON.stringify(formData, null, 2));
    setIsLoading(true);
    try {
      await onCreateClient(formData);
      toast({
        title: '¡Éxito!',
        description: 'Cliente creado correctamente',
        type: 'success',
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
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsUserFound(false);
    setUserNotFound(false);
    setIsAlreadyClient(false);
    onClose();
  };

  const handleDocumentFocus = () => {
    setIsUserFound(false);
    setUserNotFound(false);
    setIsAlreadyClient(false);
  };

  const handleDocumentChange = async () => {
    if (tipoDocumento && numeroDocumento && numeroDocumento.length >= 5) {
      try {
        const response = await fetch(`/api/clients/check-document/${tipoDocumento}/${numeroDocumento}`);
        const data = await response.json() as { exists: boolean };
        setUserExists(data.exists);
        if (data.exists) {
          toast({
            title: 'Usuario Existente',
            description: 'Este documento ya está registrado en el sistema.',
            type: 'info',
          });
        }
      } catch (error) {
        console.error('Error al verificar documento:', error);
      }
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
          console.error("Errores de validación del formulario:", JSON.stringify(errors, null, 2));
          
          let errorMessage = 'Por favor, revisa los campos marcados en rojo.';
          
          if (errors.contactos_emergencia) {
            errorMessage = 'Se requiere al menos un contacto de emergencia válido. Verifica los números de teléfono.';
          } else if (errors.usuario?.fecha_nacimiento) {
            errorMessage = 'El cliente debe tener al menos 13 años.';
          }
          
          toast({
            title: 'Formulario inválido',
            description: errorMessage,
            type: 'error',
          });
        })} className="space-y-4">
          <Tabs defaultValue="titular" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="titular">1. Titular</TabsTrigger>
              <TabsTrigger value="contactos">2. Contactos</TabsTrigger>
              <TabsTrigger value="beneficiarios">3. Beneficiarios</TabsTrigger>
            </TabsList>

            <TabsContent value="titular" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Titular</CardTitle>
                  <CardDescription>
                    Ingresa el documento para buscar un usuario existente o registrar uno nuevo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                        <Select onValueChange={(value) => setValue("usuario.tipo_documento", value as any)} defaultValue="CC">
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
                        <Input id="numero_documento" {...register("usuario.numero_documento")} onBlur={handleCheckUser} onFocus={handleDocumentFocus} />
                        {isCheckingUser && (
                          <RefreshCw className="absolute right-3 top-8 h-4 w-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isUserFound && !isAlreadyClient && (
                    <Badge variant="outline" className="border-green-600 bg-green-50 text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Usuario encontrado. Datos auto-completados.
                    </Badge>
                  )}
                  
                  {isAlreadyClient && (
                     <Badge variant="destructive" className="border-red-600 bg-red-50 text-red-700">
                       <AlertTriangle className="h-4 w-4 mr-2" />
                       Este usuario ya está registrado como cliente.
                     </Badge>
                  )}

                  {userNotFound && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center my-2">
                      <div className="flex justify-center items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2"/>
                        <p className="font-semibold text-yellow-800">Usuario no encontrado</p>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        El número de documento no está registrado. Debe crear el usuario primero antes de registrarlo como cliente.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <Label>Nombre *</Label>
                      <Input 
                        {...register("usuario.nombre")} 
                        placeholder="Ej: Juan David"
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
                      />
                      {errors.usuario?.apellido && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-4 w-4"/>
                          {errors.usuario.apellido.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Correo Electrónico *</Label>
                      <Input 
                        type="email" 
                        {...register("usuario.correo")} 
                        placeholder="Ej: juan.perez@email.com"
                      />
                      {errors.usuario?.correo && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-4 w-4"/>
                          {errors.usuario.correo.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Teléfono</Label>
                      <Input 
                        type="tel"
                        {...register("usuario.telefono")} 
                        placeholder="Ej: 3001234567"
                      />
                      {errors.usuario?.telefono && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-4 w-4"/>
                          {errors.usuario.telefono.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Fecha de Nacimiento *</Label>
                      <Input 
                        type="date" 
                        {...register("usuario.fecha_nacimiento")}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {errors.usuario?.fecha_nacimiento && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-4 w-4"/>
                          {errors.usuario.fecha_nacimiento.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Dirección</Label>
                      <Input 
                        {...register("usuario.direccion")} 
                        placeholder="Ej: Calle 123 #45-67, Barrio"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Género</Label>
                      <Select 
                        value={watchedGenero || ''} 
                        onValueChange={(value) => setValue("usuario.genero", value as any)}
                      >
                        <SelectTrigger>
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
              </Card>
            </TabsContent>

            <TabsContent value="contactos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5"/>
                    Contactos de Emergencia
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
                            <Label>Teléfono *</Label>
                            <Input 
                              type="tel"
                              {...register(`contactos_emergencia.${index}.telefono_contacto`)}
                              placeholder="Ej: 3001234567"
                            />
                            {errors.contactos_emergencia?.[index]?.telefono_contacto && (
                              <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-4 w-4"/>
                                {errors.contactos_emergencia[index].telefono_contacto.message}
                              </p>
                            )}
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
              </Card>
            </TabsContent>
            
            <TabsContent value="beneficiarios">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5"/>
                    Beneficiarios
                  </CardTitle>
                  <CardDescription>
                    Agregue los beneficiarios del titular. Los campos marcados con * son obligatorios.
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
                          <Label>Correo Electrónico *</Label>
                          <Input 
                            type="email"
                            {...register(`beneficiarios.${index}.usuario.correo`)} 
                            placeholder="Ej: maria.perez@email.com"
                          />
                          {errors.beneficiarios?.[index]?.usuario?.correo && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-4 w-4"/>
                              {errors.beneficiarios[index].usuario?.correo?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label>Teléfono</Label>
                          <Input 
                            type="tel"
                            {...register(`beneficiarios.${index}.usuario.telefono`)} 
                            placeholder="Ej: 3001234567"
                          />
                          {errors.beneficiarios?.[index]?.usuario?.telefono && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-4 w-4"/>
                              {errors.beneficiarios[index].usuario?.telefono?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label>Tipo de Documento *</Label>
                          <Select 
                            onValueChange={(v) => setValue(`beneficiarios.${index}.usuario.tipo_documento`, v as any)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                              <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                              <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                              <SelectItem value="PP">Pasaporte</SelectItem>
                              <SelectItem value="DIE">Doc. de Identificación Extranjero</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Número de Documento *</Label>
                          <Input 
                            {...register(`beneficiarios.${index}.usuario.numero_documento`)} 
                            placeholder="Ej: 1234567890"
                          />
                          {errors.beneficiarios?.[index]?.usuario?.numero_documento && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-4 w-4"/>
                              {errors.beneficiarios[index].usuario?.numero_documento?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label>Fecha de Nacimiento *</Label>
                          <Input 
                            type="date" 
                            {...register(`beneficiarios.${index}.usuario.fecha_nacimiento`)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                          {errors.beneficiarios?.[index]?.usuario?.fecha_nacimiento && (
                            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-4 w-4"/>
                              {errors.beneficiarios[index].usuario?.fecha_nacimiento?.message}
                            </p>
                          )}
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
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || isAlreadyClient} className="bg-black hover:bg-gray-800">
              {isLoading ? "Guardando..." : "Crear Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 