import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/shared/contexts/authContext";
import { Button } from "@/shared/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Dumbbell,
  CalendarDays,
  Plus,
} from "lucide-react";
import Swal from "sweetalert2";
import { Training } from "@/shared/types/training";
import { format, isSameDay, addDays, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScheduleComponent } from "@/features/schedule/components/ScheduleComponent";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { TrainingForm } from "@/features/schedule/components/TrainingForm";
import { TrainingDetailsForm } from "@/features/schedule/components/TrainingDetailsForm";
import { scheduleService } from "@/features/schedule/services/schedule.service";
import { useToast } from "@/shared/components/ui/use-toast";

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

export function ClientSchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "daily">("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchedTrainings, setFetchedTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, _setCurrentMonth] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!user?.personId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Siempre obtener solo los entrenamientos del cliente
      const trainingsResponse = await scheduleService.getClientSchedule(parseInt(user.personId, 10));

      // Si no hay datos, establecer array vacío en lugar de error
      if (trainingsResponse.data && Array.isArray(trainingsResponse.data)) {
        setFetchedTrainings(trainingsResponse.data);
      } else {
        // Si no hay datos, establecer array vacío
        setFetchedTrainings([]);
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching data:", err);
      // En caso de error, establecer array vacío para mostrar el mensaje informativo
      setFetchedTrainings([]);
      setError("No se pudieron cargar los datos de la agenda.")
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
      const personId = parseInt(user.personId, 10);
      filtered = filtered.filter(t => t.id_cliente === personId);
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

    // Refuerzo: solo mostrar entrenamientos del cliente
    if ((user?.id_rol === 3 || user?.id_rol === 4) && user?.personId) {
      const personId = parseInt(user.personId, 10);
      filtered = filtered.filter(t => t.id_cliente === personId);
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



  // Los clientes no pueden crear, editar o eliminar entrenamientos
  const handleSubmitTraining = async () => {
    toast({
      title: "Acceso Denegado",
      description: "Los clientes no pueden modificar entrenamientos. Contacta a tu entrenador.",
      variant: "destructive",
    });
  }

  // Los clientes no pueden agregar entrenamientos
  const handleAddTraining = () => {
    toast({
      title: "Acceso Denegado",
      description: "Los clientes no pueden agendar entrenamientos. Contacta a tu entrenador.",
      variant: "destructive",
    });
  };

  // Los clientes solo pueden ver detalles, no editar
  const handleTrainingClick = (training: Training) => {
    setSelectedTraining(training);
    // Mostrar solo información de lectura
    toast({
      title: "Información del Entrenamiento",
      description: `${training.titulo} - ${training.entrenador?.nombre} ${training.entrenador?.apellido}`,
      variant: "default",
    });
  };

  // Los clientes no pueden eliminar entrenamientos
  const handleDeleteTraining = async (id: number) => {
    toast({
      title: "Acceso Denegado",
      description: "Los clientes no pueden cancelar entrenamientos. Contacta a tu entrenador.",
      variant: "destructive",
    });
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
          {/* Solo mostrar el botón Agendar si NO es cliente o beneficiario */}
          {user?.id_rol !== 3 && user?.id_rol !== 4 && (
            <Button onClick={handleAddTraining} className="flex items-center gap-1 whitespace-nowrap">
              <Plus className="h-4 w-4" />Agendar
            </Button>
          )}
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
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes entrenamientos agendados
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {viewMode === "daily" 
                      ? "No hay entrenamientos programados para este día."
                      : "No tienes entrenamientos programados en tu agenda."
                    }
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Los entrenamientos serán agendados por tu entrenador. 
                      Contacta con él para programar tus sesiones.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === "calendar" && (
        <>
          {displayedTrainings.length > 0 ? (
            <ScheduleComponent
              trainings={displayedTrainings}
              onTrainingClick={handleTrainingClick}
              onAddTraining={handleAddTraining}
              onUpdateTrainingDate={() => {
                toast({
                  title: "Acceso Denegado",
                  description: "Los clientes no pueden modificar fechas de entrenamientos.",
                  variant: "destructive",
                });
              }}
            />
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes entrenamientos agendados
                </h3>
                <p className="text-gray-500 mb-4">
                  No tienes entrenamientos programados en tu agenda.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    Los entrenamientos serán agendados por tu entrenador. 
                    Contacta con él para programar tus sesiones.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Los clientes no pueden crear, editar o eliminar entrenamientos */}
      {/* Los diálogos han sido removidos para evitar modificaciones */}
    </div>
  );
}