import { useState, useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Calendar, DollarSign, User, Clock, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { clientService } from "@/features/clients/services/client.service";
import { membershipService } from "@/features/memberships/services/membership.service";
import { contractService } from "@/features/contracts/services/contract.service";
import type { Client as DbClient, Membership, ContractFormData, UIClient } from "@/shared/types";
import { mapDbClientToUiClient } from "@/shared/types";
import Swal from "sweetalert2";

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

export const NewContractForm = memo(function NewContractForm({
  isOpen,
  onClose,
  onSuccess,
}: NewContractFormProps) {
  const [clients, setClients] = useState<UIClient[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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

  const selectedMembership = memberships.find(
    (m) => Number(m.id) === watchedIdMembresia
  );

  // Load clients and memberships on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        const [clientsResponse, membershipsResponse] = await Promise.all([
          clientService.getActiveClients(),
          membershipService.getMemberships()
        ]);

        // Map clients safely
        const clientsData = clientsResponse?.data || [];
        if (Array.isArray(clientsData)) {
          const validClients = clientsData.filter(
            (client): client is DbClient =>
              client && (client.id_persona || (client as any).id)
          );
          const mappedClients = validClients
            .map((client) => {
              try {
                return mapDbClientToUiClient(client);
              } catch (err) {
                console.warn("Error mapping client:", client, err);
                return null;
              }
            })
            .filter((client): client is UIClient => client !== null);
          setClients(mappedClients);
        }

        // Set memberships
        const membershipsData = membershipsResponse?.data || [];
        console.log("--- DEBUG: Raw memberships from API ---", membershipsData);
        if (Array.isArray(membershipsData)) {
          setMemberships(
            membershipsData.filter((membership) => membership && membership.estado)
          );
        }

      } catch (error) {
        console.error("Error loading data:", error);
        Swal.fire({
          title: 'Error',
          text: 'Error al cargar los datos necesarios',
          icon: 'error',
          confirmButtonColor: '#000',
          stopKeydownPropagation: false,
          timer: 5000,
          timerProgressBar: true
        });
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen) {
      loadData();
      reset();
    }
  }, [isOpen, reset]);

  // Calculate end date and price based on selected membership and start date
  const calculatedEndDate =
    selectedMembership && watchedFechaInicio
      ? contractService.calculateEndDate(
          new Date(watchedFechaInicio),
          selectedMembership.vigencia_dias
        )
      : null;

  const calculatedPrice = selectedMembership?.precio || 0;

  const handleClientChange = (value: string) => {
    setValue("id_persona", parseInt(value), { shouldValidate: true });
  };

  const handleMembershipChange = (value: string) => {
    setValue("id_membresia", parseInt(value), { shouldValidate: true });
  };

  const onSubmit = async (data: ContractFormValues) => {
    console.log("--- DEBUG: onSubmit triggered ---");
    console.log("Form data:", data);
    console.log("Available memberships in state:", memberships);

    const finalSelectedMembership = memberships.find(
      (m) => Number(m.id) === data.id_membresia
    );

    console.log("Found membership on submit:", finalSelectedMembership);

    if (!finalSelectedMembership) {
      Swal.fire({
        title: "Error",
        text: "Debe seleccionar una membresía",
        icon: "error",
        confirmButtonColor: "#000",
        stopKeydownPropagation: false,
        timer: 5000,
        timerProgressBar: true
      });
      return;
    }

    // Validate data
    const validation = contractService.validateContractData({
      ...data,
      membresia_precio: calculatedPrice,
    });

    if (!validation.isValid) {
      Swal.fire({
        title: "Datos inválidos",
        text: validation.errors.join("\\n"),
        icon: "error",
        confirmButtonColor: "#000",
        stopKeydownPropagation: false,
        timer: 5000,
        timerProgressBar: true
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

      console.log("--- DEBUG: Sending this object to API ---", contractData);
      await contractService.createContract(contractData);

      await Swal.fire({
        title: "¡Éxito!",
        text: "Contrato creado correctamente",
        icon: "success",
        confirmButtonColor: "#000",
        timer: 3000,
        timerProgressBar: true,
      });

      reset();
      onSuccess();
      onClose();

    } catch (error: any) {
      console.error("Error creating contract:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Error al crear el contrato. Verifique que el cliente no tenga un contrato activo.";
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#000",
        stopKeydownPropagation: false,
        timer: 5000,
        timerProgressBar: true
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
        onPointerDownOutside={(e) => {
            if ((e.target as HTMLElement)?.closest('.swal2-container')) {
                e.preventDefault();
            }
        }}
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear Nuevo Contrato
          </DialogTitle>
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
});
