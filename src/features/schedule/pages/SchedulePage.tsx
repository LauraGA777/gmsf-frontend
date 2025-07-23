import { useState, useEffect, useCallback } from "react"
import { ProtectedRoute } from "../../auth/components/protectedRoute"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog"
import { TrainingForm } from "@/features/schedule/components/TrainingForm"
import { TrainingDetailsForm } from "@/features/schedule/components/TrainingDetailsForm"
import { useAuth } from "@/shared/contexts/authContext"
import Swal from "sweetalert2"
import { Card, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ScheduleComponent } from "@/features/schedule/components/ScheduleComponent"
import { scheduleService } from "@/features/schedule/services/schedule.service"
import { Training as TrainingIndex } from "@/shared/types"
import { Training } from "@/shared/types/training"
import { useToast } from "@/shared/components/ui/use-toast"
import { ScheduleSkeleton } from "@/shared/components/ui/schedule-skeleton"
import { EmptyState } from "@/shared/components/ui/empty-state"
import { Calendar, Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog"

interface Option {
    id: number;
    name: string;
}

interface ActiveClient {
    id: number;
    codigo: string;
    estado: boolean;
    usuario: {
        id: number;
        nombre: string;
        apellido: string;
        correo: string;
        telefono?: string;
    };
}

interface ActiveTrainer {
    id: number;
    codigo: string;
    especialidad: string;
    estado: boolean;
    usuario: {
        id: number;
        nombre: string;
        apellido: string;
        correo: string;
        telefono?: string;
    };
}

export function SchedulePage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isEditFormOpen, setIsEditFormOpen] = useState(false)
    const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
    const [initialDates, setInitialDates] = useState<{ start?: Date, end?: Date }>({});
    const [fetchedTrainings, setFetchedTrainings] = useState<Training[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [trainers, setTrainers] = useState<Option[]>([])
    const [clientsWithActiveContracts, setClientsWithActiveContracts] = useState<Option[]>([])
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [trainingToDelete, setTrainingToDelete] = useState<number | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            
            const clientsPromise = scheduleService.getActiveClients();
            const trainersPromise = scheduleService.getActiveTrainers();
            // Fetch all trainings, FullCalendar will handle filtering by view
            const trainingsPromise = scheduleService.getTrainings({});
            
            const [clientsResponse, trainersResponse, trainingsResponse] = await Promise.all([
                clientsPromise,
                trainersPromise,
                trainingsPromise
            ]);

            if (clientsResponse.data) {
                const mappedClients = clientsResponse.data
                    .filter((c: ActiveClient) => c && c.id && c.usuario)
                    .map((c: ActiveClient) => ({
                        id: c.id,
                        name: `${c.usuario.nombre} ${c.usuario.apellido}`
                    }));
                setClientsWithActiveContracts(mappedClients)
            }
            
            if (trainersResponse.data) {
                console.log('🔍 DEBUG: Datos de entrenadores recibidos:', trainersResponse.data);
                
                const mappedTrainers = trainersResponse.data
                    .filter((t: ActiveTrainer) => t && t.id && t.usuario?.nombre)
                    .map((t: ActiveTrainer) => ({
                        id: t.id,
                        name: `${t.usuario?.nombre || ''} ${t.usuario?.apellido || ''}`.trim(),
                    }));
                
                console.log('🔍 DEBUG: Entrenadores mapeados:', mappedTrainers);
                setTrainers(mappedTrainers);
            } else {
                console.log('❌ DEBUG: No hay datos de entrenadores en la respuesta');
            }

            if (trainingsResponse.data) {
                // Filter trainings based on user role on the client side
                let filtered: Training[] = trainingsResponse.data;
                if (user?.role?.codigo === "CLIENTE" && user.personId) {
                    const personId = parseInt(user.personId, 10);
                    if (!isNaN(personId)) {
                        filtered = filtered.filter((training) => training.id_cliente === personId)
                    }
                }
                else if (user?.role?.codigo === "ENTRENADOR" && user.trainerId) {
                    const trainerId = parseInt(user.trainerId, 10);
                    if (!isNaN(trainerId)) {
                        filtered = filtered.filter((training) => training.id_entrenador === trainerId)
                    }
                }
                setFetchedTrainings(filtered);
            }

            setError(null)
        } catch (err) {
            setError("Error al cargar los datos")
            console.error("Error fetching data:", err)
            setFetchedTrainings([])
            setClientsWithActiveContracts([])
            setTrainers([])
        } finally {
            setIsLoading(false)
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData])


    const handleSubmitTraining = async (data: Partial<TrainingIndex>) => {
        const isUpdating = "id" in data
        try {
            if (isUpdating) {
                await scheduleService.updateTraining(data.id!, data)
                toast({ title: "Éxito", description: "Entrenamiento actualizado." })
            } else {
                await scheduleService.createTraining(data)
                toast({ title: "Éxito", description: "Entrenamiento creado." })
            }
            fetchData()
            handleCloseForm()
            return Promise.resolve()
        } catch (error: any) {
            const action = isUpdating ? "actualizar" : "crear"
            let errorMessage = `No se pudo ${action} el entrenamiento. Inténtelo de nuevo.`
            
            // Verificar si es un error de validación de duración
            if (error?.response?.data?.message?.includes("exceder 2 horas")) {
                errorMessage = "La duración del entrenamiento no puede exceder 2 horas. Por favor, ajuste las fechas."
            } else if (error?.response?.data?.message?.includes("conflicto") || error?.response?.data?.message?.includes("Conflicto")) {
                errorMessage = "Ya existe un entrenamiento programado en ese horario. Por favor, seleccione otro horario."
            } else if (error?.response?.data?.message?.includes("contrato")) {
                errorMessage = "El cliente no tiene un contrato activo para agendar entrenamientos."
            } else if (error?.response?.data?.message?.includes("entrenador")) {
                errorMessage = "El entrenador seleccionado no está disponible."
            } else if (error?.response?.data?.message?.includes("fecha pasada")) {
                errorMessage = "No se puede agendar un entrenamiento en una fecha pasada."
            }
            
            console.error(`Error al ${action} el entrenamiento:`, error)
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
            throw error
        }
    }

    const handleUpdateTrainingDate = async (trainingId: number, newStartDate: Date, newEndDate: Date) => {
        try {
            await scheduleService.updateTraining(trainingId, { 
                fecha_inicio: newStartDate,
                fecha_fin: newEndDate
            });
            toast({ title: "Éxito", description: "El entrenamiento ha sido reagendado." });
            fetchData();
        } catch (error) {
            console.error("Error updating training date:", error);
            toast({ title: "Error", description: "No se pudo reagendar el entrenamiento.", variant: "destructive" });
            // Optionally refetch to revert the change in the UI
            fetchData();
        }
    };
    
    const handleTrainingClick = (training: Training) => {
        setSelectedTraining(training)
        setIsEditFormOpen(true)
    }

    // Función auxiliar para realizar la eliminación real
    const performDeleteTraining = async (id: number) => {
        try {
            await scheduleService.deleteTraining(id)
            toast({ title: "Éxito", description: "El entrenamiento ha sido cancelado." })
            fetchData()
            handleCloseForm()
        } catch (error) {
            console.error("Error al cancelar el entrenamiento:", error)
            toast({ title: "Error", description: "No se pudo cancelar el entrenamiento.", variant: "destructive" })
        }
    }

    // Método principal usando SweetAlert2 (mejorado)
    // Ventaja: Diseño más atractivo y familiar
    // Desventaja: Posibles conflictos de enfoque (corregido con setTimeout)
    const handleDeleteTraining = async (id: number) => {
        // Cerrar el diálogo de edición primero para evitar conflictos de enfoque
        setIsEditFormOpen(false)
        
        // Usar setTimeout para permitir que el diálogo se cierre completamente
        setTimeout(() => {
            Swal.fire({
                title: "¿Estás seguro?",
                text: "Esta acción no se puede deshacer.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#6b7280",
                confirmButtonText: "Sí, cancelar",
                cancelButtonText: "No",
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await performDeleteTraining(id)
                }
            })
        }, 300)
    }



    const handleConfirmDelete = async () => {
        if (trainingToDelete) {
            await performDeleteTraining(trainingToDelete)
            setTrainingToDelete(null)
        }
    }

    const handleAddTraining = (selection?: { start?: Date, end?: Date }) => {
        setSelectedTraining(null);
        setInitialDates({ start: selection?.start, end: selection?.end });
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false)
        setIsEditFormOpen(false)
        setSelectedTraining(null)
        setInitialDates({});
    }

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-full p-4 sm:p-6 space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                            <Calendar className="h-6 w-6" />
                            Agenda de Entrenamientos
                        </CardTitle>
                        {user?.role?.codigo !== 'CLIENTE' && (
                            <Button onClick={() => handleAddTraining()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Agendar
                            </Button>
                        )}
                    </CardHeader>
                </Card>
                <div className="flex-grow min-h-0">
                    {isLoading ? (
                        <ScheduleSkeleton />
                    ) : error ? (
                        <EmptyState title="Error" description={error} />
                    ) : (
                        <ScheduleComponent
                            trainings={fetchedTrainings}
                            onTrainingClick={handleTrainingClick}
                            onAddTraining={handleAddTraining}
                            onUpdateTrainingDate={handleUpdateTrainingDate}
                        />
                    )}
                </div>
            </div>

            <Dialog open={isFormOpen || isEditFormOpen} onOpenChange={handleCloseForm}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{selectedTraining ? "Detalles del Entrenamiento" : "Agendar Nuevo Entrenamiento"}</DialogTitle>
                        <DialogDescription>
                            {selectedTraining ? "Puedes ver o modificar los detalles del entrenamiento aquí." : "Completa el formulario para agendar un nuevo entrenamiento."}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTraining ? (
                        <TrainingDetailsForm
                            training={selectedTraining}
                            onDelete={() => handleDeleteTraining(selectedTraining.id)}
                            // Alternativa: usar diálogo nativo en lugar de SweetAlert2
                            // onDelete={() => handleDeleteTrainingNative(selectedTraining.id)}
                            onClose={handleCloseForm}
                            onUpdate={(data) => handleSubmitTraining({ id: selectedTraining.id, ...data } as Partial<TrainingIndex>)}
                            trainers={trainers}
                            clients={clientsWithActiveContracts}
                        />
                    ) : (
                        <TrainingForm
                            onSubmit={(data) => handleSubmitTraining(data as Partial<TrainingIndex>)}
                            onCancel={handleCloseForm}
                            trainers={trainers.map(t => ({...t, id: t.id.toString()}))}
                            clients={clientsWithActiveContracts.map(c => ({...c, id: c.id.toString()}))}
                            initialStartDate={initialDates.start}
                            initialEndDate={initialDates.end}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación nativo alternativo */}
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="¿Estás seguro?"
                description="Esta acción no se puede deshacer. El entrenamiento será cancelado permanentemente."
                confirmText="Sí, cancelar"
                cancelText="No"
                variant="destructive"
            />
        </ProtectedRoute>
    )
}

export default SchedulePage