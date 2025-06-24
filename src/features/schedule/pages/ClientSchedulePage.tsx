import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/shared/contexts/authContext";
import { Button } from "@/shared/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  User,
  Dumbbell,
  CalendarDays,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";
import { Training, TrainingsResponse, AvailabilityResponse } from "@/shared/types/training";
import { format, isSameDay, addDays, subDays, isToday, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScheduleComponent } from "@/features/schedule/components/ScheduleComponent";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import { TrainingForm } from "@/features/schedule/components/TrainingForm";
import { TrainingDetailsForm } from "@/features/schedule/components/TrainingDetailsForm";
import { scheduleService } from "@/features/schedule/services/schedule.service";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/components/ui/use-toast";

export function ClientSchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "daily">("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedTrainings, setFetchedTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [trainers, setTrainers] = useState<Array<{ id: string; name: string }>>([]);
  const [clientsWithActiveContracts, setClientsWithActiveContracts] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!user?.personId) return;

    try {
      setIsLoading(true);
      
      const trainersPromise = scheduleService.getActiveTrainers();
      
      let trainingsPromise;
      if (viewMode === 'calendar') {
        trainingsPromise = scheduleService.getMonthlySchedule(new Date(currentMonth).getFullYear(), new Date(currentMonth).getMonth() + 1);
      } else {
        trainingsPromise = scheduleService.getClientSchedule(user.personId);
      }
      
      const clientsPromise = scheduleService.getActiveClients();

      const [trainersResponse, trainingsResponse, clientsResponse] = await Promise.all([
        trainersPromise,
        trainingsPromise,
        clientsPromise
      ]);

      if (trainersResponse.data) {
        const mappedTrainers = trainersResponse.data.map((t: any) => ({
          id: t.id.toString(),
          name: `${t.name}`,
        }));
        setTrainers(mappedTrainers);
      }

      if (trainingsResponse.data) {
        setFetchedTrainings(trainingsResponse.data);
      }

      if (clientsResponse.data) {
        const mappedClients = clientsResponse.data.map((c: any) => ({
          id: c.id.toString(),
          name: `${c.nombre} ${c.apellido}`
        }));
        setClientsWithActiveContracts(mappedClients)
      }

      setError(null)
    } catch (err) {
      setError("Error al cargar los datos de la agenda.")
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedDate, currentMonth, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData])
  
  const displayedTrainings = useMemo(() => {
    let filtered = [...fetchedTrainings];

    // For clients, filter to show only their own trainings
    if (user?.personId) {
      filtered = filtered.filter(t => t.id_cliente === user.personId);
    }

    if (viewMode === "daily") {
      filtered = filtered.filter((training) => isSameDay(new Date(training.fecha_inicio), selectedDate));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.titulo?.toLowerCase().includes(term) ||
        t.entrenador?.nombre?.toLowerCase().includes(term) ||
        t.entrenador?.apellido?.toLowerCase().includes(term) ||
        t.estado?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [user, fetchedTrainings, selectedDate, viewMode, searchTerm]);

  const groupedTrainings = useMemo(() => {
    const hours: { [key: string]: Training[] } = {};
    displayedTrainings.forEach((training) => {
      if (training.fecha_inicio) {
        const hour = format(new Date(training.fecha_inicio), "HH:mm");
        if (!hours[hour]) hours[hour] = [];
        hours[hour].push(training);
      }
    });
    return hours;
  }, [displayedTrainings]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSubmitTraining = async (data: Partial<Training>) => {
    try {
      setIsLoading(true);
      if (selectedTraining) {
        await scheduleService.updateTraining(selectedTraining.id, data);
      } else {
        await scheduleService.createTraining({ ...data, id_cliente: user?.personId });
      }
      setIsFormOpen(false);
      setIsEditFormOpen(false);
      
      await fetchData();

      toast({
        title: selectedTraining ? "¡Actualizado!" : "¡Agendado!",
        description: `Tu entrenamiento ha sido ${selectedTraining ? "actualizado" : "agendado"} correctamente.`,
        type: "success",
      });

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Hubo un problema al guardar el entrenamiento.";
      toast({ title: "Error", description: errorMessage, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddTraining = () => {
    const hasActiveContract = clientsWithActiveContracts.some(c => c.id === user?.personId.toString());
    if (!hasActiveContract) {
      toast({
        title: "Contrato Requerido",
        description: "Necesitas un contrato activo o por vencer para agendar nuevos entrenamientos.",
        type: "info",
      });
      return;
    }
    setSelectedTraining(null);
    setIsFormOpen(true);
  };

  const handleTrainingClick = (training: Training) => {
    setSelectedTraining(training);
    setIsEditFormOpen(true);
  };

  const handleDeleteTraining = async (id: number) => {
    setIsEditFormOpen(false);
    setTimeout(() => {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción cancelará el entrenamiento.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await scheduleService.deleteTraining(id);
            await fetchData();
            toast({ title: "Cancelado", description: "El entrenamiento ha sido cancelado.", type: "success" });
          } catch (error) {
            toast({ title: "Error", description: "No se pudo cancelar el entrenamiento.", type: "error" });
          }
        }
      });
    }, 300);
  }

  const getStatusBadge = (estado: "Programado" | "Completado" | "Cancelado" | "En proceso") => {
    const config = {
      Programado: { class: "bg-blue-100 text-blue-800", icon: <Clock3 className="h-3.5 w-3.5 mr-1" /> },
      "En proceso": { class: "bg-yellow-100 text-yellow-800", icon: <AlertCircle className="h-3.5 w-3.5 mr-1" /> },
      Completado: { class: "bg-green-100 text-green-800", icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> },
      Cancelado: { class: "bg-red-100 text-red-800", icon: <XCircle className="h-3.5 w-3.5 mr-1" /> },
    };
    const { class: className, icon } = config[estado] || { class: "bg-gray-100 text-gray-800", icon: <AlertCircle className="h-3.5 w-3.5 mr-1" /> };
    return (
      <Badge className={className}>
        {icon}
        {estado}
      </Badge>
    );
  }
  
  if (isLoading) return <div className="flex justify-center items-center h-screen"><p>Cargando tu agenda...</p></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mi Agenda</h1>
          <p className="text-gray-500 capitalize">
            {viewMode === "daily"
              ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
              : format(new Date(currentMonth), "MMMM yyyy", { locale: es })
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily"><Clock3 className="h-4 w-4 mr-2" />Diaria</TabsTrigger>
              <TabsTrigger value="calendar"><CalendarDays className="h-4 w-4 mr-2" />Calendario</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleAddTraining} className="flex items-center gap-1 whitespace-nowrap">
            <Plus className="h-4 w-4" />Agendar
          </Button>
        </div>
      </div>

      {viewMode === "daily" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => setSelectedDate(subDays(selectedDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>Hoy</Button>
              <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Buscar por título, entrenador..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {Object.keys(groupedTrainings).length > 0 ? (
              Object.keys(groupedTrainings).sort().map((hour) => (
                <Card key={hour}>
                  <CardHeader className="bg-gray-50 py-3"><CardTitle className="text-sm font-medium flex items-center"><Clock className="h-4 w-4 mr-2 text-gray-500" />{hour}</CardTitle></CardHeader>
                  <CardContent className="p-0 divide-y">
                    {groupedTrainings[hour].map((training) => (
                      <div key={training.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleTrainingClick(training)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{training.titulo}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Dumbbell className="h-3.5 w-3.5 mr-1" />
                              <span>{training.entrenador?.nombre} {training.entrenador?.apellido}</span>
                            </div>
                          </div>
                          {getStatusBadge(training.estado as any)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No tienes nada agendado</h3>
                <p className="mt-2 text-gray-500">No hay entrenamientos programados para este día.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "calendar" && (
        <ScheduleComponent
          trainings={displayedTrainings}
          onSelectDate={handleSelectDate}
          selectedDate={selectedDate}
          onTrainingClick={handleTrainingClick}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          onAddTraining={handleAddTraining}
        />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader><DialogTitle>Agendar Entrenamiento</DialogTitle></DialogHeader>
          <TrainingForm
            onSubmit={handleSubmitTraining}
            onCancel={() => setIsFormOpen(false)}
            initialDate={selectedDate}
            clients={clientsWithActiveContracts.filter(c => c.id === user?.personId.toString())}
            trainers={trainers}
          />
        </DialogContent>
      </Dialog>

      {selectedTraining && (
        <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader><DialogTitle>Detalles del Entrenamiento</DialogTitle></DialogHeader>
            <TrainingDetailsForm
              training={selectedTraining}
              onUpdate={handleSubmitTraining}
              onDelete={() => handleDeleteTraining(selectedTraining.id)}
              onClose={() => setIsEditFormOpen(false)}
              trainers={trainers}
              clients={clientsWithActiveContracts}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}