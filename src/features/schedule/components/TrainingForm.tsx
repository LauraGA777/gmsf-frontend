import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/shared/components/ui/command";
import { format, isBefore, startOfDay, differenceInMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { CalendarIcon, Clock, User, Dumbbell, FileText, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils";
import type { Training } from "@/shared/types/training";

const trainingSchema = z.object({
  titulo: z.string().min(1, "El título es requerido"),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
  fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
  id_cliente: z.number().min(1, "El cliente es requerido"),
  id_entrenador: z.number().min(1, "El entrenador es requerido"),
  estado: z.enum(["Programado", "En proceso", "Completado", "Cancelado"]),
}).refine((data) => {
  if (data.fecha_inicio && data.fecha_fin) {
    const startDate = new Date(data.fecha_inicio);
    const endDate = new Date(data.fecha_fin);
    const durationMinutes = differenceInMinutes(endDate, startDate);
    const durationHours = durationMinutes / 60;
    
    if (durationHours > 2) {
      return false;
    }
  }
  return true;
}, {
  message: "La duración del entrenamiento no puede exceder 2 horas",
  path: ["fecha_fin"],
});

type TrainingFormData = z.infer<typeof trainingSchema>;

interface TrainingFormProps {
  onSubmit: (data: Partial<Training>) => void;
  onCancel: () => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  clients: Array<{ id: string; name: string }>;
  trainers: Array<{ id: string; name: string }>;
}

export function TrainingForm({ onSubmit, onCancel, initialStartDate, initialEndDate, clients = [], trainers = [] }: TrainingFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<TrainingFormData>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      estado: "Programado",
      fecha_inicio: initialStartDate ? format(initialStartDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      fecha_fin: initialEndDate ? format(initialEndDate, "yyyy-MM-dd'T'HH:mm") : (initialStartDate ? format(initialStartDate, "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm")),
      id_cliente: 0,
      id_entrenador: 0,
      titulo: "",
    },
  });

  const watchFields = watch();

  const summaryData = useMemo(() => {
    const client = clients.find(c => c.id === watchFields.id_cliente?.toString());
    const trainer = trainers.find(t => t.id === watchFields.id_entrenador?.toString());
    const startDate = watchFields.fecha_inicio ? new Date(watchFields.fecha_inicio) : null;
    const endDate = watchFields.fecha_fin ? new Date(watchFields.fecha_fin) : null;
    
    let duration = null;
    let durationText = '...';
    
    if (startDate && endDate) {
        const durationMinutes = differenceInMinutes(endDate, startDate);
        if (durationMinutes >= 0) {
            duration = durationMinutes;
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            
            if (hours > 0) {
                durationText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
            } else {
                durationText = `${minutes}m`;
            }
        } else {
            durationText = 'Duración inválida';
        }
    }

    return {
        clientName: client?.name || 'No seleccionado',
        trainerName: trainer?.name || 'No seleccionado',
        startDate,
        endDate,
        duration,
        durationText,
    }
  }, [watchFields, clients, trainers]);

  const handleFormSubmit = async (data: TrainingFormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        ...data,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: new Date(data.fecha_fin)
      });
    } catch (error) {
      console.error("Error submitting training:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateDate = (date: string) => {
    const selectedDate = new Date(date)
    return !isBefore(startOfDay(selectedDate), startOfDay(new Date()))
  }

  const validClients = Array.isArray(clients) ? clients.filter(c => c && c.id && c.name) : [];
  const validTrainers = Array.isArray(trainers) ? trainers.filter(t => t && t.id && t.name) : []; // t.id es el ID del entrenador (tabla Trainer)

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
                      <p className={cn("text-sm", 
                          summaryData.duration !== null && summaryData.duration > 120 
                            ? "text-red-600 font-medium" 
                            : "text-gray-600")}>
                          {summaryData.durationText}
                          {summaryData.duration !== null && summaryData.duration > 120 && 
                            " (excede 2 horas)"}
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
            <Controller
                control={control}
                name="id_cliente"
                render={({ field }) => (
                    <div className="space-y-2">
                        <Label htmlFor="cliente">Cliente</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                    {field.value ? validClients.find(c => c.id === field.value.toString())?.name : "Seleccione un cliente"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar cliente..." />
                                    <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                                    <CommandGroup>
                                        {validClients.map(client => (
                                            <CommandItem
                                                key={client.id}
                                                value={client.name}
                                                onSelect={() => {
                                                    setValue("id_cliente", parseInt(client.id, 10));
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", field.value === parseInt(client.id, 10) ? "opacity-100" : "opacity-0")} />
                                                {client.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.id_cliente && <p className="text-sm text-red-500">{errors.id_cliente.message}</p>}
                    </div>
                )}
            />
            
            <Controller
                control={control}
                name="id_entrenador"
                render={({ field }) => (
                    <div className="space-y-2">
                        <Label htmlFor="entrenador">Entrenador</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                    {field.value ? validTrainers.find(t => t.id === field.value.toString())?.name : "Seleccione un entrenador"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Buscar entrenador..." />
                                    <CommandEmpty>No se encontró el entrenador.</CommandEmpty>
                                    <CommandGroup>
                                        {validTrainers.map(trainer => (
                                            <CommandItem
                                                key={trainer.id}
                                                value={trainer.name}
                                                onSelect={() => {
                                                    setValue("id_entrenador", parseInt(trainer.id, 10));
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", field.value === parseInt(trainer.id, 10) ? "opacity-100" : "opacity-0")} />
                                                {trainer.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.id_entrenador && <p className="text-sm text-red-500">{errors.id_entrenador.message}</p>}
                    </div>
                )}
            />
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
          <Button 
            type="submit" 
            disabled={isLoading || (summaryData.duration !== null && summaryData.duration > 120)} 
            className={cn(
              "bg-black hover:bg-gray-800",
              summaryData.duration !== null && summaryData.duration > 120 && 
              "bg-gray-400 cursor-not-allowed"
            )}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
        
        {summaryData.duration !== null && summaryData.duration > 120 && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 font-medium">
              ⚠️ La duración excede las 2 horas permitidas. Por favor, ajuste las fechas para poder guardar el entrenamiento.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
