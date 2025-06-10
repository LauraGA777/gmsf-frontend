import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { User, Plus, Trash2, Users, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { clientService } from "@/features/clients/services/client.service";
import type { ClientFormData, Client } from "@/shared/types";
import Swal from "sweetalert2";

const clientSchema = z.object({
  usuario: z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    correo: z.string().email("Correo electrónico inválido"),
    telefono: z.string().regex(/^\d{7,15}$/, "Teléfono debe tener entre 7 y 15 dígitos").optional().or(z.literal("")),
    direccion: z.string().optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(['CC', 'CE', 'TI', 'PP', 'DIE']),
    numero_documento: z.string().min(6, "Número de documento debe tener al menos 6 caracteres"),
    fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
  }),
  id_titular: z.number().optional(),
  relacion: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface NewClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingClient?: Client;
  isBeneficiary?: boolean;
  titularId?: number;
}

export function NewClientForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingClient, 
  isBeneficiary = false, 
  titularId 
}: NewClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [titulars, setTitulars] = useState<Client[]>([]);
  const [loadingTitulars, setLoadingTitulars] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      usuario: {
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        direccion: "",
        genero: undefined,
        tipo_documento: "CC",
        numero_documento: "",
        fecha_nacimiento: "",
      },
      id_titular: titularId,
      relacion: isBeneficiary ? "Beneficiario" : undefined,
    },
  });

  const watchedValues = watch();

  // Load titulars for beneficiary creation
  useEffect(() => {
    const loadTitulars = async () => {
      if (isBeneficiary && !titularId) {
        try {
          setLoadingTitulars(true);
          const response = await clientService.getEligibleTitulars();
          setTitulars(response.data);
        } catch (error) {
          console.error('Error loading titulars:', error);
        } finally {
          setLoadingTitulars(false);
        }
      }
    };

    if (isOpen) {
      loadTitulars();
    }
  }, [isOpen, isBeneficiary, titularId]);

  const handleTitularChange = (value: string) => {
    setValue("id_titular", parseInt(value));
  };

  const onSubmit = async (data: ClientFormValues) => {
    const validation = clientService.validateClientData(data);

    if (!validation.isValid) {
      Swal.fire({
        title: 'Datos inválidos',
        text: validation.errors.join('\n'),
        icon: 'error',
        confirmButtonColor: '#000',
      });
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (editingClient) {
        result = await clientService.updateClient(editingClient.id_persona, data);
      } else if (isBeneficiary && (titularId || data.id_titular)) {
        const selectedTitularId = titularId || data.id_titular!;
        result = await clientService.createBeneficiary(selectedTitularId, data);
      } else {
        result = await clientService.createClient(data);
      }

      Swal.fire({
        title: '¡Éxito!',
        text: editingClient 
          ? 'Cliente actualizado correctamente'
          : isBeneficiary 
            ? 'Beneficiario creado correctamente'
            : 'Cliente creado correctamente',
        icon: 'success',
        confirmButtonColor: '#000',
        timer: 3000,
        timerProgressBar: true,
      });

      reset();
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Error saving client:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Error al guardar el cliente.',
        icon: 'error',
        confirmButtonColor: '#000',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBeneficiary ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
            {editingClient 
              ? 'Editar Cliente'
              : isBeneficiary 
                ? 'Agregar Beneficiario'
                : 'Crear Nuevo Cliente'
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Titular Selection (for beneficiaries) */}
          {isBeneficiary && !titularId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Titular del Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="titular">Seleccionar Titular *</Label>
                  {loadingTitulars ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                    </div>
                  ) : (
                    <Select onValueChange={handleTitularChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el titular del plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {titulars.map((titular) => (
                          <SelectItem key={titular.id_persona} value={titular.id_persona.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {titular.usuario?.nombre} {titular.usuario?.apellido}
                              </span>
                              <span className="text-sm text-gray-500">
                                {titular.codigo} - {titular.usuario?.numero_documento}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="relacion">Relación con el Titular</Label>
                  <Input
                    id="relacion"
                    placeholder="Ej: Hijo, Cónyuge, Padre, etc."
                    {...register("relacion")}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" {...register("usuario.nombre")} />
                  {errors.usuario?.nombre && (
                    <p className="text-sm text-red-500">{errors.usuario.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input id="apellido" {...register("usuario.apellido")} />
                  {errors.usuario?.apellido && (
                    <p className="text-sm text-red-500">{errors.usuario.apellido.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                  <Select onValueChange={(value) => setValue("usuario.tipo_documento", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="PP">Pasaporte</SelectItem>
                      <SelectItem value="DIE">Documento de Identificación Extranjero</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_documento">Número de Documento *</Label>
                  <Input id="numero_documento" {...register("usuario.numero_documento")} />
                  {errors.usuario?.numero_documento && (
                    <p className="text-sm text-red-500">{errors.usuario.numero_documento.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    {...register("usuario.fecha_nacimiento")}
                  />
                  {errors.usuario?.fecha_nacimiento && (
                    <p className="text-sm text-red-500">{errors.usuario.fecha_nacimiento.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Select onValueChange={(value) => setValue("usuario.genero", value as any)}>
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

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico *</Label>
                <Input
                  id="correo"
                  type="email"
                  {...register("usuario.correo")}
                />
                {errors.usuario?.correo && (
                  <p className="text-sm text-red-500">{errors.usuario.correo.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    placeholder="3001234567"
                    {...register("usuario.telefono")}
                  />
                  {errors.usuario?.telefono && (
                    <p className="text-sm text-red-500">{errors.usuario.telefono.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle 123 #45-67"
                    {...register("usuario.direccion")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-black hover:bg-gray-800"
            >
              {isLoading 
                ? "Guardando..." 
                : editingClient 
                  ? "Actualizar Cliente"
                  : isBeneficiary
                    ? "Crear Beneficiario"
                    : "Crear Cliente"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 