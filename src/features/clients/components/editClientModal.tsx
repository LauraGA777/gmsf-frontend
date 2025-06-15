import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { User, Plus, Trash2, Phone, Mail, Calendar, Home } from "lucide-react";
import { clientService } from "@/features/clients/services/client.service";
import type { Client } from "@/shared/types/client";
import Swal from "sweetalert2";
import { format, parseISO } from 'date-fns';

const emergencyContactSchema = z.object({
  id: z.number().optional(),
  nombre_contacto: z.string().min(3, "Nombre es requerido"),
  telefono_contacto: z.string().regex(/^\d{7,15}$/, "Teléfono inválido"),
  relacion_contacto: z.string().min(2, "Relación es requerida").optional(),
  es_mismo_beneficiario: z.boolean().default(false),
});

const updateClientSchema = z.object({
  usuario: z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    correo: z.string().email("Correo electrónico inválido"),
    telefono: z.string().regex(/^\d{7,15}$/, "Teléfono debe tener entre 7 y 15 dígitos").optional().or(z.literal("")),
    direccion: z.string().optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    fecha_nacimiento: z.string().refine((date) => new Date(date) < new Date(), {
      message: "La fecha de nacimiento no puede ser en el futuro.",
    }),
  }),
  contactos_emergencia: z.array(emergencyContactSchema).optional(),
  relacion: z.string().optional(),
  estado: z.boolean().optional(),
});

type UpdateClientFormValues = z.infer<typeof updateClientSchema>;

interface EditClientModalProps {
  client: Client;
  onUpdateClient: (clientId: number, updates: Partial<UpdateClientFormValues>) => Promise<void>;
  onClose: () => void;
}

export function EditClientModal({ client, onUpdateClient, onClose }: EditClientModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateClientFormValues>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      usuario: {
        nombre: client.usuario?.nombre || "",
        apellido: client.usuario?.apellido || "",
        correo: client.usuario?.correo || "",
        telefono: client.usuario?.telefono || "",
        direccion: client.usuario?.direccion || "",
        genero: client.usuario?.genero,
        fecha_nacimiento: client.usuario?.fecha_nacimiento ? format(parseISO(client.usuario.fecha_nacimiento.toString()), 'yyyy-MM-dd') : "",
      },
      contactos_emergencia: client.contactos_emergencia || [],
      relacion: client.relacion,
      estado: client.estado,
    },
  });
  
  const { fields: emergencyContacts, append, remove } = useFieldArray({
    control,
    name: "contactos_emergencia",
  });

  const onSubmit = async (data: UpdateClientFormValues) => {
    setIsLoading(true);
    try {
      await onUpdateClient(client.id_persona, data);
       Swal.fire({
        title: '¡Éxito!',
        text: 'Cliente actualizado correctamente',
        icon: 'success',
        confirmButtonColor: '#000',
        timer: 3000,
        timerProgressBar: true,
      });
      onClose();
    } catch (error: any) {
      console.error('Error updating client:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Error al actualizar el cliente.',
        icon: 'error',
        confirmButtonColor: '#000',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Cliente: {client.usuario?.nombre} {client.usuario?.apellido}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           <Card>
            <CardHeader><CardTitle>Información Personal</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input {...register("usuario.nombre")} />
                {errors.usuario?.nombre && <p className="text-sm text-red-500">{errors.usuario.nombre.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input {...register("usuario.apellido")} />
                {errors.usuario?.apellido && <p className="text-sm text-red-500">{errors.usuario.apellido.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input type="email" {...register("usuario.correo")} />
                {errors.usuario?.correo && <p className="text-sm text-red-500">{errors.usuario.correo.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input {...register("usuario.telefono")} />
                {errors.usuario?.telefono && <p className="text-sm text-red-500">{errors.usuario.telefono.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <Input type="date" {...register("usuario.fecha_nacimiento")} />
                {errors.usuario?.fecha_nacimiento && <p className="text-sm text-red-500">{errors.usuario.fecha_nacimiento.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input {...register("usuario.direccion")} />
              </div>
               <div className="space-y-2">
                <Label>Género</Label>
                  <Controller
                    control={control}
                    name="usuario.genero"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Seleccione género" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                          <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
              </div>
              <div className="space-y-2">
                <Label>Estado del Cliente</Label>
                  <Controller
                    control={control}
                    name="estado"
                    render={({ field }) => (
                       <Select onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)}>
                        <SelectTrigger><SelectValue placeholder="Seleccione estado" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Activo</SelectItem>
                          <SelectItem value="false">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader><CardTitle>Contactos de Emergencia</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2 border rounded-md mb-2 relative">
                  <Input {...register(`contactos_emergencia.${index}.nombre_contacto`)} placeholder="Nombre" />
                  <Input {...register(`contactos_emergencia.${index}.telefono_contacto`)} placeholder="Teléfono" />
                  <Input {...register(`contactos_emergencia.${index}.relacion_contacto`)} placeholder="Relación" />
                  <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="absolute top-1 right-1 h-6 w-6 p-0"><Trash2 className="h-3 w-3"/></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ nombre_contacto: '', telefono_contacto: '', es_mismo_beneficiario: false })}>
                <Plus className="h-4 w-4 mr-2"/> Agregar Contacto
              </Button>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800">
              {isLoading ? "Actualizando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </>
  );
}
