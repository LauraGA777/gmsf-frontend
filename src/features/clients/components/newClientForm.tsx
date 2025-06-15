import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { User, Plus, Trash2, Users, Phone, Mail, FileText, Calendar, Search, ShieldCheck, Contact, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { clientService } from "@/features/clients/services/client.service";
import Swal from "sweetalert2";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

const emergencyContactSchema = z.object({
  nombre_contacto: z.string().min(3, "Nombre es requerido"),
  telefono_contacto: z.string().regex(/^\d{7,15}$/, "Teléfono inválido"),
  relacion_contacto: z.string().min(2, "Relación es requerida"),
  es_mismo_beneficiario: z.boolean().default(false),
});

const userDataSchema = z.object({
  id: z.number().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  correo: z.string().email("Correo electrónico inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  telefono: z.string().regex(/^\d{7,15}$/, "Teléfono debe tener entre 7 y 15 dígitos").optional().or(z.literal("")),
  direccion: z.string().optional(),
  genero: z.enum(['M', 'F', 'O']).optional(),
  tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
  numero_documento: z.string().min(5, "Número de documento debe tener al menos 5 caracteres"),
  fecha_nacimiento: z.string().refine((date) => new Date(date) < new Date(), {
    message: "La fecha de nacimiento no puede ser en el futuro.",
  }),
});

const beneficiarySchema = z.object({
  usuario: userDataSchema.omit({ contrasena: true }),
  relacion: z.string().min(2, "La relación es requerida"),
  contactos_emergencia: z.array(emergencyContactSchema).optional(),
});

const clientFormSchema = z.object({
  usuario: userDataSchema,
  contactos_emergencia: z.array(emergencyContactSchema).optional(),
  beneficiarios: z.array(beneficiarySchema).optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface NewClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewClientForm({ isOpen, onClose, onSuccess }: NewClientFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isUserFound, setIsUserFound] = useState(false);
  const [isAlreadyClient, setIsAlreadyClient] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      usuario: { tipo_documento: "CC" },
      contactos_emergencia: [],
      beneficiarios: [],
    },
  });

  const tipoDocumento = watch("usuario.tipo_documento");
  const numeroDocumento = watch("usuario.numero_documento");
  const watchedGenero = watch("usuario.genero");

  const { fields: emergencyContacts, append: appendEmergencyContact, remove: removeEmergencyContact } = useFieldArray({ control, name: "contactos_emergencia" });
  const { fields: beneficiaries, append: appendBeneficiary, remove: removeBeneficiary } = useFieldArray({ control, name: "beneficiarios" });

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
      setUserNotFound(true);
    } finally {
      setIsCheckingUser(false);
    }
  };
  
  const onSubmit = async (data: ClientFormValues) => {
    setIsLoading(true);
    if (isUserFound) {
      delete data.usuario.contrasena;
    } else if (!data.usuario.contrasena) {
      Swal.fire('Error de validación', 'La contraseña es requerida para nuevos usuarios.', 'error');
      setIsLoading(false);
      return;
    }
    
    try {
       await clientService.createClient(data);
       Swal.fire({ title: '¡Éxito!', text: 'Cliente creado correctamente', icon: 'success', confirmButtonColor: '#000', timer: 3000, timerProgressBar: true });
       reset();
       onSuccess();
       onClose();
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Error al guardar el cliente.', icon: 'error', confirmButtonColor: '#000' });
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear Nuevo Cliente (Titular)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                      <Label>Nombre</Label>
                      <Input {...register("usuario.nombre")} />
                      {errors.usuario?.nombre && <p className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertTriangle className="h-4 w-4"/>{errors.usuario.nombre.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Apellido</Label>
                      <Input {...register("usuario.apellido")} />
                      {errors.usuario?.apellido && <p className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertTriangle className="h-4 w-4"/>{errors.usuario.apellido.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Correo Electrónico</Label>
                      <Input type="email" {...register("usuario.correo")} />
                      {errors.usuario?.correo && <p className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertTriangle className="h-4 w-4"/>{errors.usuario.correo.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Teléfono</Label>
                      <Input {...register("usuario.telefono")} />
                      {errors.usuario?.telefono && <p className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertTriangle className="h-4 w-4"/>{errors.usuario.telefono.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Fecha de Nacimiento</Label>
                      <Input type="date" {...register("usuario.fecha_nacimiento")} />
                      {errors.usuario?.fecha_nacimiento && <p className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertTriangle className="h-4 w-4"/>{errors.usuario.fecha_nacimiento.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Dirección</Label>
                      <Input {...register("usuario.direccion")} />
                    </div>
                    <div className="space-y-1">
                      <Label>Género</Label>
                      <Select value={watchedGenero || ''} onValueChange={(value) => setValue("usuario.genero", value as any)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione género" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                          <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {!isUserFound && (
                      <div className="space-y-1">
                        <Label>Contraseña</Label>
                        <Input type="password" {...register("usuario.contrasena")} />
                        {errors.usuario?.contrasena && <p className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertTriangle className="h-4 w-4"/>{errors.usuario.contrasena.message}</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contactos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Contactos de Emergencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {emergencyContacts.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <Input {...register(`contactos_emergencia.${index}.nombre_contacto`)} placeholder="Nombre del Contacto" />
                        <Input {...register(`contactos_emergencia.${index}.telefono_contacto`)} placeholder="Teléfono" />
                        <Input {...register(`contactos_emergencia.${index}.relacion_contacto`)} placeholder="Relación" />
                        <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => removeEmergencyContact(index)}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendEmergencyContact({ nombre_contacto: '', telefono_contacto: '', relacion_contacto: '', es_mismo_beneficiario: false })}>
                    <Plus className="h-4 w-4 mr-2"/> Agregar Contacto
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="beneficiarios">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/>Beneficiarios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {beneficiaries.map((field, index) => (
                    <div key={field.id} className="p-3 border rounded-md space-y-3 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-red-500 hover:text-red-700" onClick={() => removeBeneficiary(index)}>
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                      <Label className="font-semibold text-base">Beneficiario {index + 1}</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input {...register(`beneficiarios.${index}.usuario.nombre`)} placeholder="Nombre" />
                        <Input {...register(`beneficiarios.${index}.usuario.apellido`)} placeholder="Apellido" />
                        <Input {...register(`beneficiarios.${index}.usuario.correo`)} placeholder="Correo" />
                        <Input {...register(`beneficiarios.${index}.usuario.telefono`)} placeholder="Teléfono" />
                        <Select onValueChange={(v) => setValue(`beneficiarios.${index}.usuario.tipo_documento`, v as any)}>
                          <SelectTrigger><SelectValue placeholder="Tipo Doc." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CC">CC</SelectItem>
                            <SelectItem value="TI">TI</SelectItem>
                            <SelectItem value="CE">CE</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input {...register(`beneficiarios.${index}.usuario.numero_documento`)} placeholder="Num. Documento" />
                        <Input type="date" {...register(`beneficiarios.${index}.usuario.fecha_nacimiento`)} />
                        <Input {...register(`beneficiarios.${index}.relacion`)} placeholder="Relación con titular"/>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendBeneficiary({ usuario: { tipo_documento: 'CC' }, relacion: '' } as any)}>
                    <Plus className="h-4 w-4 mr-2"/> Agregar Beneficiario
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