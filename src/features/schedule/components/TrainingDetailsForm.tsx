import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { format, isBefore, startOfDay } from "date-fns"
import type { Training } from "@/shared/types/training"

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

interface TrainingDetailsFormProps {
    training: Training | null;
    onUpdate: (data: Partial<Training>) => void;
    onDelete: () => void;
    onClose: () => void;
    onChangeStatus: (id: number, newStatus: Training["estado"]) => void;
    trainers: Array<{ id: string; name: string }>;
    clients: Array<{ id: string; name: string }>;
}

export function TrainingDetailsForm({ training, onUpdate, onDelete, onClose, onChangeStatus, trainers = [], clients = [] }: TrainingDetailsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const today = startOfDay(new Date())

    if (!training) {
        return null;
    }

    // Validar que los arrays existen y no están vacíos
    const validTrainers = Array.isArray(trainers) ? trainers.filter(trainer => trainer && trainer.id && trainer.id.toString().trim() !== '') : [];
    const validClients = Array.isArray(clients) ? clients.filter(client => client && client.id && client.id.toString().trim() !== '') : [];

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
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

    const validateDate = (date: string) => {
        const selectedDate = new Date(date);
        return !isBefore(selectedDate, today);
    };

    const handleFormSubmit = async (data: TrainingFormData) => {
        setIsLoading(true)
        try {
            await onUpdate(data)
            onClose()
        } catch (error) {
            console.error("Error updating training:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteClick = () => {
        onDelete();
    };

    const handleStatusChange = (newStatus: Training["estado"]) => {
        onChangeStatus(training.id, newStatus);
    };

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
                <Label htmlFor="estado">Estado</Label>
                <Select
                    onValueChange={(value) => handleStatusChange(value as Training["estado"])}
                    defaultValue={training.estado}
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

            <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select 
                  onValueChange={(value) => setValue("id_cliente", parseInt(value))} 
                  value={watch("id_cliente")?.toString()}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        {validClients.length > 0 ? (
                            validClients.map(client => (
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
                 <Select 
                    onValueChange={(value) => setValue("id_entrenador", parseInt(value))} 
                    value={watch("id_entrenador")?.toString()}
                 >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione un entrenador" />
                    </SelectTrigger>
                    <SelectContent>
                        {validTrainers.length > 0 ? (
                            validTrainers.map(trainer => (
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

            <div className="flex justify-between items-center mt-4">
                <Button type="button" variant="destructive" onClick={handleDeleteClick}>
                    Eliminar
                </Button>
                <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar"}
                    </Button>
                </div>
            </div>
        </form>
    )
}
