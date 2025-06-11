import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { format, isBefore, startOfDay, differenceInMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { clientService } from "@/features/clients/services/client.service";
import { contractService } from "@/features/contracts/services/contract.service";
import type { Client, Contract, Trainer } from "@/shared/types/index";
import type { Training } from "@/shared/types/training";
import { mapDbClientToUiClient, mapDbContractToUiContract } from "@/shared/types/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { CalendarIcon, Clock, User, Dumbbell, FileText } from "lucide-react"

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
  clients: Array<{ id: string; name: string }>;
  trainers: Array<{ id: string; name: string }>;
}

export function TrainingForm({ onSubmit, onCancel, initialDate, clients = [], trainers = [] }: TrainingFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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
      fecha_inicio: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      fecha_fin: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      id_cliente: 0,
      id_entrenador: 0,
      titulo: "Entrenamiento Personalizado",
    },
  });

  const watchFields = watch();

  const summaryData = useMemo(() => {
    const client = clients.find(c => c.id === watchFields.id_cliente?.toString());
    const trainer = trainers.find(t => t.id === watchFields.id_entrenador?.toString());
    const startDate = watchFields.fecha_inicio ? new Date(watchFields.fecha_inicio) : null;
    const endDate = watchFields.fecha_fin ? new Date(watchFields.fecha_fin) : null;
    
    let duration = null;
    if (startDate && endDate) {
        duration = differenceInMinutes(endDate, startDate);
    }

    return {
        clientName: client?.name || 'No seleccionado',
        trainerName: trainer?.name || 'No seleccionado',
        startDate,
        endDate,
        duration,
    }
  }, [watchFields, clients, trainers]);

  const handleClientChange = (clientId: string) => {
    const id = parseInt(clientId, 10);
    setValue("id_cliente", id);
  };

  const handleTrainerChange = (trainerId: string) => {
    const id = parseInt(trainerId, 10);
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
    const selectedDate = new Date(date)
    return !isBefore(startOfDay(selectedDate), startOfDay(new Date()))
  }

  const validClients = Array.isArray(clients) ? clients.filter(c => c && c.id && c.name) : [];
  const validTrainers = Array.isArray(trainers) ? trainers.filter(t => t && t.id && t.name) : [];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8 p-1">
      {/* Columna de Resumen */}
      <div className="md:col-span-1 space-y-6">
          <Card className="h-full">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Resumen del Entrenamiento
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-1">
                      <Label className="text-gray-500 flex items-center gap-2"><User className="h-4 w-4" /> Cliente</Label>
                      <p className="font-medium text-base truncate">{summaryData.clientName}</p>
                  </div>
                  <div className="space-y-1">
                      <Label className="text-gray-500 flex items-center gap-2"><Dumbbell className="h-4 w-4" /> Entrenador</Label>
                      <p className="font-medium text-base truncate">{summaryData.trainerName}</p>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center gap-2 font-medium">
                          <CalendarIcon className="h-4 w-4" /> Fechas
                      </div>
                      <div />
                      <div className="text-gray-600">
                          <strong>Inicio:</strong> {summaryData.startDate ? format(summaryData.startDate, "dd/MM/yy HH:mm", { locale: es }) : "-"}
                      </div>
                      <div className="text-gray-600">
                          <strong>Fin:</strong> {summaryData.endDate ? format(summaryData.endDate, "dd/MM/yy HH:mm", { locale: es }) : "-"}
                      </div>
                  </div>

                  <div className="border-t pt-4">
                      <div className="flex items-center gap-2 font-medium">
                          <Clock className="h-4 w-4" /> Duración
                      </div>
                      <p className="text-gray-600 text-sm">
                          {summaryData.duration !== null ? `${summaryData.duration} minutos` : "..."}
                      </p>
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* Columna de Formulario */}
      <div className="md:col-span-2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            {...register("titulo")}
            placeholder="Ingrese el título del entrenamiento"
          />
          {errors.titulo && <p className="text-sm text-red-500">{errors.titulo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            {...register("descripcion")}
            placeholder="Ingrese la descripción del entrenamiento"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
            <Input
              id="fecha_inicio"
              type="datetime-local"
              {...register("fecha_inicio", { validate: validateDate })}
            />
            {errors.fecha_inicio && <p className="text-sm text-red-500">{errors.fecha_inicio.message || 'Fecha inválida'}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_fin">Fecha de fin</Label>
            <Input
              id="fecha_fin"
              type="datetime-local"
              {...register("fecha_fin")}
            />
            {errors.fecha_fin && <p className="text-sm text-red-500">{errors.fecha_fin.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Select onValueChange={handleClientChange}>
              <SelectTrigger><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger>
              <SelectContent>
                {validClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_cliente && <p className="text-sm text-red-500">{errors.id_cliente.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entrenador">Entrenador</Label>
            <Select onValueChange={handleTrainerChange}>
              <SelectTrigger><SelectValue placeholder="Seleccione un entrenador" /></SelectTrigger>
              <SelectContent>
                {validTrainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id.toString()}>{trainer.name || 'Sin nombre'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_entrenador && <p className="text-sm text-red-500">{errors.id_entrenador.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select
            onValueChange={(value) => setValue("estado", value as TrainingFormData["estado"])}
            defaultValue="Programado"
          >
            <SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Programado">Programado</SelectItem>
              <SelectItem value="En proceso" disabled>En proceso</SelectItem>
              <SelectItem value="Completado" disabled>Completado</SelectItem>
              <SelectItem value="Cancelado" disabled>Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800">
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
