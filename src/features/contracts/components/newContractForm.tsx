import { useState, useEffect, useMemo, useRef } from "react";
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
  numero_documento: z.string().min(1, "El número de documento es requerido"),
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
  const [selectedClient, setSelectedClient] = useState<UIClient | null>(null);
  const [clients, setClients] = useState<UIClient[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [searchingClient, setSearchingClient] = useState(false);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [checkingActiveContract, setCheckingActiveContract] = useState(false);
  const [clientHasActiveContract, setClientHasActiveContract] = useState(false);
  const [activeContractInfo, setActiveContractInfo] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
      numero_documento: "",
      id_membresia: 0,
      fecha_inicio: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const watchedIdMembresia = watch("id_membresia");
  const watchedFechaInicio = watch("fecha_inicio");
  const watchedNumeroDocumento = watch("numero_documento");

  const selectedMembership = useMemo(() => 
    memberships.find((m) => m.id === watchedIdMembresia),
    [memberships, watchedIdMembresia]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const membershipsResponse = await membershipService.getMemberships({ estado: true });

        if (membershipsResponse.data) {
          setMemberships(membershipsResponse.data);
        }

      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error al cargar las membresías.',
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

  const searchClientByDocument = async (numeroDocumento: string) => {
    if (!numeroDocumento || numeroDocumento.length < 2) {
      setSelectedClient(null);
      setClients([]);
      return;
    }

    setSearchingClient(true);
    try {
      console.log('Searching for clients with:', numeroDocumento);
      
      // Usar getClients con filtro de búsqueda en lugar de searchClients
      const clientsResponse = await clientService.getClients({
        search: numeroDocumento,
        estado: true,
        limit: 20
      });
      
      console.log('Search response:', clientsResponse);
      
      if (clientsResponse.data) {
        const mappedClients = clientsResponse.data
          .map(client => {
            try {
              return mapDbClientToUiClient(client);
            } catch (err) {
              console.error('Error mapping client:', err);
              return null;
            }
          })
          .filter((client): client is UIClient => client !== null);
        
        console.log('Mapped clients:', mappedClients);
        setClients(mappedClients);

        // Si hay una coincidencia exacta por número de documento, seleccionarla automáticamente
        const exactMatch = mappedClients.find(client => 
          client.documentNumber === numeroDocumento
        );
        
        if (exactMatch) {
          console.log('Found exact match:', exactMatch);
          setSelectedClient(exactMatch);
          // Check if client has active contracts
          checkClientActiveContracts(parseInt(exactMatch.id));
        } else {
          setSelectedClient(null);
          setClientHasActiveContract(false);
          setActiveContractInfo(null);
        }
      }
    } catch (error) {
      console.error('Error searching clients:', error);
      toast({
        title: 'Error',
        description: 'Error al buscar clientes. Verifica la consola para más detalles.',
        variant: 'destructive',
      });
      setClients([]);
      setSelectedClient(null);
      setClientHasActiveContract(false);
      setActiveContractInfo(null);
    } finally {
      setSearchingClient(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedNumeroDocumento) {
        searchClientByDocument(watchedNumeroDocumento);
        setShowClientDropdown(true);
      } else {
        setSelectedClient(null);
        setClients([]);
        setShowClientDropdown(false);
        setClientHasActiveContract(false);
        setActiveContractInfo(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [watchedNumeroDocumento]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMembershipChange = (value: string) => {
    const membershipId = parseInt(value, 10) || 0;
    setValue("id_membresia", membershipId, { shouldValidate: true });
  };

  const handleClientSelect = (client: UIClient) => {
    setSelectedClient(client);
    setValue("numero_documento", client.documentNumber, { shouldValidate: true });
    setShowClientDropdown(false);
    
    // Check if client has active contracts
    checkClientActiveContracts(parseInt(client.id));
  };

  const checkClientActiveContracts = async (clientId: number) => {
    setCheckingActiveContract(true);
    setClientHasActiveContract(false);
    setActiveContractInfo(null);

    try {
      const contractCheck = await contractService.checkClientActiveContracts(clientId);
      
      if (contractCheck.hasActiveContract) {
        setClientHasActiveContract(true);
        setActiveContractInfo(contractCheck.activeContract);
        
        toast({
          title: "Cliente con contrato activo",
          description: `Este cliente ya tiene un contrato ${contractCheck.contractType?.toLowerCase()}. No se puede crear un nuevo contrato.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking active contracts:', error);
      toast({
        title: 'Error',
        description: 'Error al verificar contratos activos del cliente.',
        variant: 'destructive',
      });
    } finally {
      setCheckingActiveContract(false);
    }
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

    if (!selectedClient) {
      toast({
        title: "Error de validación",
        description: "No se encontró un cliente con ese número de documento.",
        variant: "destructive",
      });
      return;
    }

    if (clientHasActiveContract) {
      toast({
        title: "Error de validación",
        description: "Este cliente ya tiene un contrato activo. No se puede crear un nuevo contrato.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const contractData: ContractFormData = {
        id_persona: parseInt(selectedClient.id.toString()),
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
      setSelectedClient(null);
      setClients([]);
      setShowClientDropdown(false);
      setClientHasActiveContract(false);
      setActiveContractInfo(null);
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
    setSelectedClient(null);
    setClients([]);
    setShowClientDropdown(false);
    setClientHasActiveContract(false);
    setActiveContractInfo(null);
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
            {/* Document Number Input */}
            <div className="space-y-2">
              <Label htmlFor="numero_documento">Número de Documento *</Label>
              <div className="relative" ref={dropdownRef}>
                <Input
                  id="numero_documento"
                  placeholder="Ingrese el número de documento del cliente"
                  {...register("numero_documento")}
                  onFocus={() => setShowClientDropdown(clients.length > 0)}
                />
                {searchingClient && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  </div>
                )}
                
                {/* Client suggestions dropdown */}
                {showClientDropdown && clients.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{client.name}</span>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Doc: {client.documentNumber}</p>
                            <p>Código: {client.codigo}</p>
                            {client.email && <p>Email: {client.email}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.numero_documento && (
                <p className="text-sm text-red-500">
                  {errors.numero_documento.message}
                </p>
              )}
              {selectedClient && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      Cliente seleccionado: {selectedClient.name}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Código: {selectedClient.codigo} | Doc: {selectedClient.documentNumber}
                  </p>
                </div>
              )}
              
              {clientHasActiveContract && activeContractInfo && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800">
                      ⚠️ Cliente con contrato activo
                    </span>
                  </div>
                  <div className="text-sm text-red-600 mt-1 space-y-1">
                    <p>Código: {activeContractInfo.codigo}</p>
                    <p>Estado: {activeContractInfo.estado}</p>
                    <p>Fecha fin: {activeContractInfo.fecha_fin ? new Date(activeContractInfo.fecha_fin).toLocaleDateString() : 'N/A'}</p>
                    <p className="font-medium mt-2">No se puede crear un nuevo contrato hasta que el actual termine o sea cancelado.</p>
                  </div>
                </div>
              )}
              
              {checkingActiveContract && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-800">
                      Verificando contratos activos...
                    </span>
                  </div>
                </div>
              )}
              
              {watchedNumeroDocumento && watchedNumeroDocumento.length >= 2 && !selectedClient && !searchingClient && clients.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    No se encontró ningún cliente con ese criterio de búsqueda.
                  </p>
                </div>
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
                disabled={isLoading || !isValid || clientHasActiveContract}
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
