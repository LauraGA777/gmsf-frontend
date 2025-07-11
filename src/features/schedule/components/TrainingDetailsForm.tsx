import { useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/shared/components/ui/command";
import { format, isBefore, startOfDay, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import type { Training } from "@/shared/types/training"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { CalendarIcon, Clock, User, Dumbbell, FileText, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/shared/lib/utils";

const trainingSchema = z.object({
    titulo: z.string().min(1, "El título es requerido"),
    descripcion: z.string().optional(),
    fecha_inicio: z.string().min(1, "La fecha de inicio es requerida"),
    fecha_fin: z.string().min(1, "La fecha de fin es requerida"),
    estado: z.enum(["Programado", "En proceso", "Completado", "Cancelado"]),
    id_cliente: z.number().min(1, "El cliente es requerido"),
    id_entrenador: z.number().min(1, "El entrenador es requerido"),
})

type TrainingFormData = z.infer<typeof trainingSchema>

interface TrainerOption {
    id: number;
    name: string;
}

interface ClientOption {
    id: number;
    name: string;
}

interface TrainingDetailsFormProps {
    training: Training | null;
    onUpdate: (data: Partial<Training>) => void;
    onDelete: () => void;
    onClose: () => void;
    trainers: TrainerOption[];
    clients: ClientOption[];
}

export function TrainingDetailsForm({ training, onUpdate, onDelete, onClose, trainers = [], clients = [] }: TrainingDetailsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    
    if (!training) {
        return null;
    }

    const isReadOnly = training.estado === "Completado" || training.estado === "Cancelado";
    const isInProgress = training.estado === "En proceso";

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
        control,
    } = useForm<TrainingFormData>({
        resolver: zodResolver(trainingSchema),
        defaultValues: {
            titulo: training.titulo || '',
            descripcion: training.descripcion || '',
            fecha_inicio: training.fecha_inicio ? format(new Date(training.fecha_inicio), "yyyy-MM-dd'T'HH:mm") : '',
            fecha_fin: training.fecha_fin ? format(new Date(training.fecha_fin), "yyyy-MM-dd'T'HH:mm") : '',
            estado: training.estado || 'Programado',
            id_cliente: training.id_cliente || 0,
            id_entrenador: training.id_entrenador || 0,
        },
    })

    const watchFields = watch();

    const summaryData = useMemo(() => {
        const client = clients.find(c => c.id === watchFields.id_cliente);
        const trainer = trainers.find(t => t.id === watchFields.id_entrenador);
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


    const validateDate = (date: string) => {
        const selectedDate = new Date(date)
        // No permitir agendar en días pasados. Se permite cualquier hora en el día de hoy.
        return !isBefore(startOfDay(selectedDate), startOfDay(new Date()))
    }

    const handleFormSubmit = async (data: TrainingFormData) => {
        setIsLoading(true)
        try {
            await onUpdate({
                ...data,
                id: training.id,
                fecha_inicio: new Date(data.fecha_inicio),
                fecha_fin: new Date(data.fecha_fin),
            });
            onClose()
        } catch (error) {
            console.error("Error updating training:", error)
        } finally {
            setIsLoading(false)
        }
    }

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
                        readOnly={isReadOnly}
                    />
                    {errors.titulo && <p className="text-sm text-red-500">{errors.titulo.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                        id="descripcion"
                        {...register("descripcion")}
                        placeholder="Ingrese la descripción del entrenamiento"
                        readOnly={isReadOnly}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
                        <Input
                            id="fecha_inicio"
                            type="datetime-local"
                            {...register("fecha_inicio", { validate: validateDate })}
                            readOnly={isReadOnly || isInProgress}
                        />
                        {errors.fecha_inicio && <p className="text-sm text-red-500">{errors.fecha_inicio.message || "Fecha inválida"}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fecha_fin">Fecha de fin</Label>
                        <Input
                            id="fecha_fin"
                            type="datetime-local"
                            {...register("fecha_fin")}
                            readOnly={isReadOnly || isInProgress}
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
                                    <PopoverTrigger asChild disabled={isReadOnly}>
                                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                            {field.value ? clients.find(c => c.id === field.value)?.name : "Seleccione un cliente"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar cliente..." />
                                            <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                                            <CommandGroup>
                                                {clients.map(client => (
                                                    <CommandItem
                                                        key={client.id}
                                                        value={client.name}
                                                        onSelect={() => {
                                                            setValue("id_cliente", client.id);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", field.value === client.id ? "opacity-100" : "opacity-0")} />
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
                                    <PopoverTrigger asChild disabled={isReadOnly}>
                                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                            {field.value ? trainers.find(t => t.id === field.value)?.name : "Seleccione un entrenador"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar entrenador..." />
                                            <CommandEmpty>No se encontró el entrenador.</CommandEmpty>
                                            <CommandGroup>
                                                {trainers.map(trainer => (
                                                    <CommandItem
                                                        key={trainer.id}
                                                        value={trainer.name}
                                                        onSelect={() => {
                                                            setValue("id_entrenador", trainer.id);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", field.value === trainer.id ? "opacity-100" : "opacity-0")} />
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
                    <Controller
                        name="estado"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger><SelectValue placeholder="Seleccione un estado" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Programado">Programado</SelectItem>
                                    <SelectItem value="En proceso">En proceso</SelectItem>
                                    <SelectItem value="Completado">Completado</SelectItem>
                                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {!isReadOnly && (
                    <div className="flex justify-between items-center pt-4">
                        <Button type="button" variant="destructive" onClick={onDelete}>
                            Eliminar
                        </Button>
                        <div className="flex space-x-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-black hover:bg-gray-800">
                                {isLoading ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </form>
    )
}
