import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { format, isBefore, startOfDay } from "date-fns";
import { clientService } from "@/features/clients/services/client.service";
import { contractService } from "@/features/contracts/services/contract.service";
import type { Client, Contract, Trainer } from "@/shared/types/index";
import type { Training } from "@/shared/types/training";
import { mapDbClientToUiClient, mapDbContractToUiContract } from "@/shared/types/index";

const trainingSchema = z.object({
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
  fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
  id_cliente: z.number().min(1, "El cliente es requerido"),
  id_entrenador: z.number().min(1, "El entrenador es requerido"),
  estado: z.enum(["Programado", "En proceso", "Completado", "Cancelado"]),
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface TrainingFormProps {
  onSubmit: (data: Partial<Training>) => void;
  onCancel: () => void;
  initialDate?: Date;
  isDailyView?: boolean;
  clients: Client[];
  trainers: Trainer[];
}

export function TrainingForm({ onSubmit, onCancel, initialDate, isDailyView = false, clients = [], trainers = [] }: TrainingFormProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const today = startOfDay(new Date());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      estado: "Programado",
      fecha_inicio: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : format(today, "yyyy-MM-dd'T'HH:mm"),
      fecha_fin: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : format(today, "yyyy-MM-dd'T'HH:mm"),
      id_cliente: 0,
      id_entrenador: 0,
    },
  });

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await contractService.getContracts();
        // Verificar que la respuesta tiene la estructura esperada
        const contractsData = response?.data?.data || response?.data || [];
        if (Array.isArray(contractsData)) {
          const mappedContracts = contractsData.map(mapDbContractToUiContract);
          if (selectedClientId) {
            setContracts(mappedContracts.filter(contract => contract.id_cliente === selectedClientId));
          } else {
            setContracts([]);
          }
        } else {
          console.warn('Contracts response is not an array:', response);
          setContracts([]);
        }
      } catch (error) {
        console.error("Error fetching contracts:", error);
        setContracts([]);
      }
    };

    fetchContracts();
  }, [selectedClientId]);

  const handleClientChange = (clientId: string) => {
    const id = parseInt(clientId, 10);
    setSelectedClientId(id);
    setValue("id_cliente", id);
  };

  const handleTrainerChange = (trainerId: string) => {
    const id = parseInt(trainerId, 10);
    setSelectedTrainerId(id);
    setValue("id_entrenador", id);
  };

  const handleFormSubmit = async (data: TrainingFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting training:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateDate = (date: string) => {
    const selectedDate = new Date(date);
    if (isDailyView) {
      return true;
    }
    return !isBefore(selectedDate, today);
  };

  // Validar que los arrays existen y no están vacíos
  const validClients = Array.isArray(clients) ? clients.filter(client => client && client.id && client.id.toString().trim() !== '') : [];
  const validTrainers = Array.isArray(trainers) ? trainers.filter(trainer => trainer && trainer.id && trainer.id.toString().trim() !== '') : [];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          {...register("titulo")}
          placeholder="Ingrese el título del entrenamiento"
        />
        {errors.titulo && (
          <p className="text-sm text-red-500">{errors.titulo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          {...register("descripcion")}
          placeholder="Ingrese la descripción del entrenamiento"
        />
        {errors.descripcion && (
          <p className="text-sm text-red-500">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
          <Input
            id="fecha_inicio"
            type="datetime-local"
            {...register("fecha_inicio", {
              validate: validateDate
            })}
          />
          {errors.fecha_inicio && (
            <p className="text-sm text-red-500">
              {errors.fecha_inicio.type === "validate" 
                ? "No se pueden agendar entrenamientos para fechas pasadas" 
                : errors.fecha_inicio.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_fin">Fecha de fin</Label>
          <Input
            id="fecha_fin"
            type="datetime-local"
            {...register("fecha_fin", {
              validate: validateDate
            })}
          />
          {errors.fecha_fin && (
            <p className="text-sm text-red-500">
              {errors.fecha_fin.type === "validate" 
                ? "No se pueden agendar entrenamientos para fechas pasadas" 
                : errors.fecha_fin.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cliente">Cliente</Label>
        <Select onValueChange={handleClientChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un cliente" />
          </SelectTrigger>
          <SelectContent>
            {validClients.length > 0 ? (
              validClients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name || 'Sin nombre'}
                </SelectItem>
              ))
            ) : (
              <div className="px-8 py-6 text-center">
                <p className="text-sm text-muted-foreground">No hay clientes disponibles</p>
              </div>
            )}
          </SelectContent>
        </Select>
        {errors.id_cliente && (
          <p className="text-sm text-red-500">{errors.id_cliente.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="entrenador">Entrenador</Label>
        <Select onValueChange={handleTrainerChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un entrenador" />
          </SelectTrigger>
          <SelectContent>
            {validTrainers.length > 0 ? (
              validTrainers.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id.toString()}>
                  {trainer.name || 'Sin nombre'}
                </SelectItem>
              ))
            ) : (
              <div className="px-8 py-6 text-center">
                <p className="text-sm text-muted-foreground">No hay entrenadores disponibles</p>
              </div>
            )}
          </SelectContent>
        </Select>
        {errors.id_entrenador && (
          <p className="text-sm text-red-500">{errors.id_entrenador.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="estado">Estado</Label>
        <Select
          onValueChange={(value) => setValue("estado", value as TrainingFormData["estado"])}
          defaultValue="Programado"
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Programado">Programado</SelectItem>
            <SelectItem value="En proceso">En proceso</SelectItem>
            <SelectItem value="Completado">Completado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        {errors.estado && (
          <p className="text-sm text-red-500">{errors.estado.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || validClients.length === 0 || validTrainers.length === 0}>
          {isLoading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
