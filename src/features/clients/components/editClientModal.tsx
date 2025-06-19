import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { User, Plus, Trash2, Users, Phone, Mail, FileText, Calendar, Search, ShieldCheck, Contact, AlertTriangle, CheckCircle } from "lucide-react";
import type { Client } from "@/shared/types";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useToast } from "@/shared/components/ui/use-toast";

const emergencyContactSchema = z.object({
  id: z.number().optional(),
  nombre_contacto: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  telefono_contacto: z.string().regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos"),
  relacion_contacto: z.string().min(3, "La relación debe tener al menos 3 caracteres"),
  es_mismo_beneficiario: z.boolean(),
});

const beneficiarySchema = z.object({
  id: z.number().optional(),
  usuario: z.object({
    id: z.number().optional(),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
    correo: z.string().email("Correo electrónico inválido"),
    telefono: z.string().regex(/^\d{7,15}$/, "El teléfono debe tener entre 7 y 15 dígitos").optional().or(z.literal("")),
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
        return age >= 13;
      },
      { message: "El beneficiario debe tener al menos 13 años" }
    ),
  }),
  relacion: z.string().min(3, "La relación debe tener al menos 3 caracteres"),
});

const updateClientSchema = z.object({
  usuario: z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    apellido: z.string().min(3, "El apellido debe tener al menos 3 caracteres"),
    correo: z.string().email("Correo electrónico inválido"),
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
        return age >= 13;
      },
      { message: "El cliente debe tener al menos 13 años" }
    ),
  }),
  contactos_emergencia: z.array(emergencyContactSchema)
    .min(1, "Se requiere al menos un contacto de emergencia"),
  beneficiarios: z.array(beneficiarySchema).optional(),
  estado: z.boolean().optional(),
});

type UpdateClientFormValues = z.infer<typeof updateClientSchema>;

interface EditClientModalProps {
  client: Client;
  onUpdateClient: (clientId: number, updates: any) => Promise<void>;
  onClose: () => void;
}

export function EditClientModal({ client, onUpdateClient, onClose }: EditClientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userExists, setUserExists] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateClientFormValues>({
    resolver: zodResolver(updateClientSchema) as any,
    defaultValues: {
      usuario: {
        nombre: client.usuario?.nombre || "",
        apellido: client.usuario?.apellido || "",
        correo: client.usuario?.correo || "",
        telefono: client.usuario?.telefono || "",
        direccion: client.usuario?.direccion || "",
        genero: client.usuario?.genero,
        tipo_documento: client.usuario?.tipo_documento || "CC",
        numero_documento: client.usuario?.numero_documento || "",
        fecha_nacimiento: client.usuario?.fecha_nacimiento ? format(parseISO(client.usuario.fecha_nacimiento.toString()), 'yyyy-MM-dd') : "",
      },
      contactos_emergencia: (client.contactos_emergencia || []).map(c => ({
        id: c.id,
        nombre_contacto: c.nombre_contacto,
        telefono_contacto: c.telefono_contacto,
        relacion_contacto: c.relacion_contacto || '',
        es_mismo_beneficiario: c.es_mismo_beneficiario,
      })),
      beneficiarios: (client.beneficiarios || []).map(b => ({
        id: b.persona_beneficiaria?.id_persona,
        usuario: {
          id: b.persona_beneficiaria?.usuario?.id,
          nombre: b.persona_beneficiaria?.usuario?.nombre || "",
          apellido: b.persona_beneficiaria?.usuario?.apellido || "",
          correo: b.persona_beneficiaria?.usuario?.correo || "",
          telefono: b.persona_beneficiaria?.usuario?.telefono || "",
          tipo_documento: b.persona_beneficiaria?.usuario?.tipo_documento || "CC",
          numero_documento: b.persona_beneficiaria?.usuario?.numero_documento || "",
          fecha_nacimiento: b.persona_beneficiaria?.usuario?.fecha_nacimiento 
            ? format(parseISO(b.persona_beneficiaria.usuario.fecha_nacimiento.toString()), 'yyyy-MM-dd') 
            : "",
        },
        relacion: b.relacion || "",
      })),
      estado: client.estado,
    },
  });
  
  const { fields: emergencyContacts, append: appendEmergencyContact, remove: removeEmergencyContact } = useFieldArray({
    control,
    name: "contactos_emergencia",
  });

  const { fields: beneficiaries, append: appendBeneficiary, remove: removeBeneficiary } = useFieldArray({
    control,
    name: "beneficiarios",
  });

  const watchedGenero = watch("usuario.genero");

  const onSubmit = async (data: UpdateClientFormValues) => {
    console.log("Datos del formulario a enviar:", JSON.stringify(data, null, 2));
    setIsLoading(true);
    try {
      if (!client.id_persona) {
        throw new Error("ID del cliente no encontrado");
      }
      await onUpdateClient(client.id_persona, data);
      toast({
        title: '¡Éxito!',
        description: 'Cliente actualizado correctamente',
        type: 'success',
      });
      onClose();
    } catch (error: any) {
      console.error('Error al actualizar cliente:', error);
      console.error('Detalles del error:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al actualizar el cliente.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Cliente: {client.usuario?.nombre} {client.usuario?.apellido}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error("Errores de validación del formulario:", errors);
          
          // Mostrar mensaje específico según el tipo de error
          let errorMessage = 'Por favor, revisa los campos marcados en rojo.';
          
          if (errors.contactos_emergencia) {
            errorMessage = 'Se requiere al menos un contacto de emergencia.';
          } else if (errors.usuario?.fecha_nacimiento) {
            errorMessage = 'El cliente debe tener al menos 13 años.';
          }
          
          toast({
            type: 'error',
            title: 'Formulario inválido',
            description: errorMessage,
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
                    Información personal del cliente titular.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Tipo de Documento</Label>
                        <Select value={client.usuario?.tipo_documento} disabled>
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
                      <div className="space-y-1">
                        <Label>Número de Documento</Label>
                        <Input value={client.usuario?.numero_documento} disabled />
                      </div>
                    </div>
                  </div>

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
                    <div className="space-y-1">
                      <Label>Estado del Cliente</Label>
                      <Select onValueChange={(val) => setValue("estado", val === 'true')} value={String(client.estado)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Activo</SelectItem>
                          <SelectItem value="false">Inactivo</SelectItem>
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
                        <Controller
                          control={control}
                          name={`beneficiarios.${index}.usuario.tipo_documento`}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger><SelectValue placeholder="Tipo Doc." /></SelectTrigger>
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
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800">
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
