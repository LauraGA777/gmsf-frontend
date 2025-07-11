import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { Calendar, DollarSign, User, Clock, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { clientService } from "@/features/clients/services/client.service";
import { membershipService } from "@/features/memberships/services/membership.service";
import { contractService } from "@/features/contracts/services/contract.service";
import type { Membership, ContractFormData, UIClient } from "@/shared/types";
import { mapDbClientToUiClient } from "@/shared/types";
import { useToast } from "@/shared/components/ui/use-toast";

const contractSchema = z.object({
  id_persona: z.number().min(1, "Debe seleccionar un cliente"),
  id_membresia: z.number().min(1, "Debe seleccionar una membresía"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface NewContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewContractForm({
  isOpen,
  onClose,
  onSuccess,
}: NewContractFormProps) {
  const [clients, setClients] = useState<UIClient[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    mode: "onChange",
    defaultValues: {
      id_persona: 0,
      id_membresia: 0,
      fecha_inicio: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const watchedIdMembresia = watch("id_membresia");
  const watchedFechaInicio = watch("fecha_inicio");

  const selectedMembership = useMemo(() => 
    memberships.find((m) => m.id === watchedIdMembresia),
    [memberships, watchedIdMembresia]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [clientsResponse, membershipsResponse] = await Promise.all([
          clientService.getActiveClients(),
          membershipService.getMemberships({ estado: true })
        ]);

        if (clientsResponse.data) {
          const mappedClients = clientsResponse.data
            .map(client => {
              try {
                return mapDbClientToUiClient(client);
              } catch (err) {
                return null;
              }
            })
            .filter((client): client is UIClient => client !== null);
          setClients(mappedClients);
        }

        if (membershipsResponse.data) {
          setMemberships(membershipsResponse.data);
        }

      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error al cargar los datos necesarios para el formulario.',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen) {
      loadData();
      reset(); // Reset form when modal opens
    }
  }, [isOpen, reset, toast]);

  const { calculatedEndDate, calculatedPrice } = useMemo(() => {
    if (selectedMembership && watchedFechaInicio) {
      const endDate = addDays(new Date(watchedFechaInicio), selectedMembership.vigencia_dias);
      return {
        calculatedEndDate: endDate,
        calculatedPrice: selectedMembership.precio,
      };
    }
    return { calculatedEndDate: null, calculatedPrice: 0 };
  }, [selectedMembership, watchedFechaInicio]);

  const handleClientChange = (value: string) => {
    setValue("id_persona", parseInt(value, 10) || 0, { shouldValidate: true });
  };

  const handleMembershipChange = (value: string) => {
    setValue("id_membresia", parseInt(value, 10) || 0, { shouldValidate: true });
  };

  const onSubmit = async (data: ContractFormValues) => {
    if (!selectedMembership) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar una membresía válida.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const contractData: ContractFormData = {
        id_persona: data.id_persona,
        id_membresia: data.id_membresia,
        fecha_inicio: data.fecha_inicio,
        membresia_precio: calculatedPrice,
      };

      await contractService.createContract(contractData);

      toast({
        title: "¡Éxito!",
        description: "Contrato creado correctamente.",
        variant: "default",
      });

      reset();
      onSuccess();
      onClose();

    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error al crear el contrato.";
      
      toast({
        title: "Error en la creación",
        description: errorMessage,
        variant: "destructive",
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
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear Nuevo Contrato
          </DialogTitle>
          <DialogDescription>
            Complete el formulario para crear un nuevo contrato.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select onValueChange={handleClientChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <SelectItem
                        key={client.id}
                        value={client.id.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-sm text-gray-500">
                            {client.codigo}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-8 py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No hay clientes disponibles
                      </p>
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.id_persona && (
                <p className="text-sm text-red-500">
                  {errors.id_persona.message}
                </p>
              )}
            </div>

            {/* Membership Selection */}
            <div className="space-y-2">
              <Label htmlFor="membresia">Membresía *</Label>
              <Select onValueChange={handleMembershipChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una membresía" />
                </SelectTrigger>
                <SelectContent>
                  {memberships.length > 0 ? (
                    memberships.map((membership) => (
                      <SelectItem
                        key={membership.id}
                        value={membership.id.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {membership.nombre}
                          </span>
                          <span className="text-sm text-gray-500">
                            ${membership.precio.toLocaleString()} -{" "}
                            {membership.vigencia_dias} días
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-8 py-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        No hay membresías disponibles
                      </p>
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.id_membresia && (
                <p className="text-sm text-red-500">
                  {errors.id_membresia.message}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
              <Input
                id="fecha_inicio"
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                {...register("fecha_inicio")}
              />
              {errors.fecha_inicio && (
                <p className="text-sm text-red-500">
                  {errors.fecha_inicio.message}
                </p>
              )}
            </div>

            {/* Contract Summary */}
            {selectedMembership && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Resumen del Contrato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Fechas
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Inicio:</strong>{" "}
                          {watchedFechaInicio
                            ? format(
                                new Date(
                                  `${watchedFechaInicio}T00:00:00`
                                ),
                                "dd/MM/yyyy",
                                { locale: es }
                              )
                            : "-"}
                        </p>
                        <p>
                          <strong>Fin:</strong>{" "}
                          {calculatedEndDate
                            ? format(calculatedEndDate, "dd/MM/yyyy", {
                                locale: es,
                              })
                            : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        Duración
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Vigencia:</strong>{" "}
                          {selectedMembership.vigencia_dias} días
                        </p>
                        <p>
                          <strong>Accesos:</strong>{" "}
                          {selectedMembership.dias_acceso} días
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <DollarSign className="h-5 w-5" />
                      Total: ${calculatedPrice.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Precio de la membresía: {selectedMembership.nombre}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isValid}
                className="bg-black hover:bg-gray-800"
              >
                {isLoading ? "Creando..." : "Crear Contrato"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
