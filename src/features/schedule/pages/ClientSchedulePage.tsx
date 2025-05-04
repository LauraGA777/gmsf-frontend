import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Button } from "@/shared/components/button";
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
import type { Training } from "@/shared/types";
import { format, isSameDay, addDays, subDays, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { Input } from "@/shared/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/tabs";
import { ScheduleComponent } from "@/features/schedule/components/ScheduleComponent";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/dialog";
import { TrainingForm } from "@/features/schedule/components/TrainingForm";
import { TrainingDetailsForm } from "@/features/schedule/components/TrainingDetailsForm";

export function ClientSchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "daily">("daily");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), "MMMM yyyy", { locale: es }));

  // Datos de ejemplo para servicios agendados (convertidos al formato Training)
  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: 1,
      client: "Juan Pérez",
      clientId: "0001",
      trainer: "Carlos Ruiz",
      trainerId: "t1",
      service: "Entrenamiento personalizado",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Activo",
    },
    {
      id: 2,
      client: "María González",
      clientId: "0002",
      trainer: "Ana Gómez",
      trainerId: "t2",
      service: "Entrenamiento personalizado",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000),
      maxCapacity: 1,
      occupiedSpots: 1,
      status: "Activo",
    },
  ]);

  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
  const [hasActiveMembership, setHasActiveMembership] = useState<boolean>(false);

  // Trainers y servicios para el buscador
  const trainers: string[] = ["Carlos Ruiz", "Ana Gómez", "Miguel Sánchez", "Laura Martínez"];
  const services: string[] = ["Entrenamiento personalizado", "GAP", "Yoga", "Pilates", "Crossfit", "Funcional", "Zumba", "Spinning"];
  const statusOptions: string[] = ["Activo", "Pendiente", "Completado", "Cancelado"];

  // Verificar si el usuario tiene membresía activa
  useEffect(() => {
    if (user?.contract?.estado === "Activo") {
      setHasActiveMembership(true);
    } else {
      setHasActiveMembership(false);
    }
  }, [user]);

  // Filtrar entrenamientos según la fecha seleccionada y el rol del usuario
  useEffect(() => {
    let filtered = [...trainings];

    // Filtrar por fecha si estamos en vista diaria
    if (viewMode === "daily") {
      filtered = filtered.filter((training) => isSameDay(new Date(training.date), selectedDate));
    }

    // Si es cliente, solo mostrar sus propias citas
    if (user?.role === "client" && user.clientId) {
      filtered = filtered.filter((training) => training.clientId === user.clientId);
    }

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (training) =>
          training.client.toLowerCase().includes(term) ||
          training.trainer.toLowerCase().includes(term) ||
          training.service.toLowerCase().includes(term) ||
          training.status.toLowerCase().includes(term)
      );
    }

    setFilteredTrainings(filtered);
  }, [user, trainings, selectedDate, viewMode, searchTerm]);

  // Agrupar entrenamientos por hora para la vista diaria
  const groupedTrainings = useMemo(() => {
    const hours: { [key: string]: Training[] } = {};

    filteredTrainings.forEach((training) => {
      if (training.startTime) {
        const hour = format(new Date(training.startTime), "HH:mm");
        if (!hours[hour]) {
          hours[hour] = [];
        }
        hours[hour].push(training);
      }
    });

    return hours;
  }, [filteredTrainings]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEditTraining = (id: number, updatedTraining: Partial<Training>) => {
    // Solo permitir editar citas propias
    if (user?.role === "client" && selectedTraining?.clientId !== user.clientId) {
      Swal.fire({
        title: "Acceso denegado",
        text: "Solo puedes editar las citas que tú mismo has agendado",
        icon: "warning",
        confirmButtonColor: "#000",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const updatedTrainings = trainings.map((training) =>
      training.id === id ? { ...training, ...updatedTraining } : training
    );

    setTrainings(updatedTrainings);
    setIsEditFormOpen(false);

    // Pequeño retraso para asegurar que el modal se cierre primero
    setTimeout(() => {
      Swal.fire({
        title: "¡Actualizado!",
        text: "El servicio ha sido actualizado correctamente.",
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      });
    }, 300);
  };

  const handleAddTraining = () => {
    // Verificar si el usuario tiene un contrato activo antes de abrir el formulario
    if (!hasActiveMembership) {
      Swal.fire({
        title: "Contrato inactivo",
        text: "No tienes un contrato activo. Para agendar servicios, necesitas tener una membresía vigente.",
        icon: "warning",
        confirmButtonColor: "#000",
        timer: 10000,
        timerProgressBar: true,
      });
      return;
    }

    setIsFormOpen(true);
  };

  const handleAddTrainingSubmit = (newTraining: Omit<Training, "id">) => {
    // Validar que todos los campos requeridos estén completos
    if (
      !newTraining.client ||
      !newTraining.trainer ||
      !newTraining.service ||
      !newTraining.date ||
      !newTraining.startTime ||
      !newTraining.endTime
    ) {
      Swal.fire({
        title: "Datos incompletos",
        text: "Por favor, completa todos los campos requeridos para agendar un entrenamiento personalizado.",
        icon: "error",
        confirmButtonColor: "#000",
      });
      return;
    }

    const id = Math.max(0, ...trainings.map((t) => t.id)) + 1;

    // Añadir clientId según el usuario actual
    const trainingToAdd: Training = {
      ...newTraining,
      id,
      clientId: user?.clientId || "",
      // Para servicios personalizados, siempre es capacidad 1
      maxCapacity: 1,
      occupiedSpots: 1,
    };

    setTrainings([...trainings, trainingToAdd]);
    setIsFormOpen(false);

    // Pequeño retraso para asegurar que el modal se cierre primero
    setTimeout(() => {
      Swal.fire({
        title: "¡Servicio agendado!",
        text: `Se ha programado ${newTraining.service} con ${newTraining.trainer} para ${format(new Date(newTraining.startTime || newTraining.date), "HH:mm")} a ${format(new Date(newTraining.endTime || new Date(newTraining.date.getTime() + 60 * 60 * 1000)), "HH:mm")}`,
        icon: "success",
        confirmButtonColor: "#000",
        timer: 5000,
        timerProgressBar: true,
      });
    }, 300);
  };

  const handleTrainingClick = (training: Training) => {
    setSelectedTraining(training);
    setTimeout(() => {
      setIsEditFormOpen(true);
    }, 100); // Asegurar que el estado se actualice antes de abrir el modal
  };

  const handleChangeStatus = (id: number, newStatus: Training["status"]) => {
    // Solo permitir cambiar estado de citas propias
    if (user?.role === "client" && selectedTraining?.clientId !== user.clientId) {
      Swal.fire({
        title: "Acceso denegado",
        text: "Solo puedes modificar las citas que tú mismo has agendado",
        icon: "warning",
        confirmButtonColor: "#000",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const updatedTrainings = trainings.map((training) =>
      training.id === id ? { ...training, status: newStatus } : training
    );

    setTrainings(updatedTrainings);

    Swal.fire({
      title: "Estado actualizado",
      text: `El servicio ahora está ${newStatus.toLowerCase()}.`,
      icon: "success",
      confirmButtonColor: "#000",
      timer: 5000,
      timerProgressBar: true,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mi Agenda</h1>
            <p className="text-gray-500">
              {viewMode === "daily"
                ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
                : currentMonth}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Tabs
              defaultValue="daily"
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "daily" | "calendar")}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="daily" className="flex items-center gap-1">
                  <Clock3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Vista Diaria</span>
                  <span className="sm:hidden">Diaria</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Vista Calendario</span>
                  <span className="sm:hidden">Calendario</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              onClick={handleAddTraining}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agendar entrenamiento</span>
              <span className="sm:hidden">Agendar</span>
            </Button>
          </div>
        </div>

        {viewMode === "daily" && (
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setSelectedDate(new Date())}
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>Hoy</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {Object.keys(groupedTrainings).length > 0 ? (
                Object.keys(groupedTrainings)
                  .sort()
                  .map((hour) => (
                    <Card key={hour} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 py-3">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {hour}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                          {groupedTrainings[hour].map((training) => (
                            <div
                              key={training.id}
                              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleTrainingClick(training)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{training.service}</h3>
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <User className="h-3.5 w-3.5 mr-1" />
                                    <span className="mr-3">{training.client}</span>
                                    <Dumbbell className="h-3.5 w-3.5 mr-1" />
                                    <span>{training.trainer}</span>
                                  </div>
                                </div>
                                <Badge
                                  className={`
                                    ${training.status === "Activo" ? "bg-green-100 text-green-800" : ""}
                                    ${training.status === "Pendiente" ? "bg-yellow-100 text-yellow-800" : ""}
                                    ${training.status === "Completado" ? "bg-blue-100 text-blue-800" : ""}
                                    ${training.status === "Cancelado" ? "bg-red-100 text-red-800" : ""}
                                  `}
                                >
                                  {training.status === "Activo" && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                                  {training.status === "Pendiente" && <AlertCircle className="h-3.5 w-3.5 mr-1" />}
                                  {training.status === "Completado" && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                                  {training.status === "Cancelado" && <XCircle className="h-3.5 w-3.5 mr-1" />}
                                  {training.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No hay citas programadas</h3>
                  <p className="mt-2 text-gray-500">
                    No hay citas programadas para este día. Puedes agendar un nuevo entrenamiento usando el botón "Agendar entrenamiento".
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === "calendar" && (
          <ScheduleComponent
            trainings={filteredTrainings}
            onSelectDate={handleSelectDate}
            selectedDate={selectedDate}
            onTrainingClick={handleTrainingClick}
          />
        )}
      </div>

      {/* Modal para agregar nuevo entrenamiento */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]" aria-describedby="training-form-description">
          <DialogHeader>
            <DialogTitle>Agendar Nuevo Entrenamiento</DialogTitle>
          </DialogHeader>
          <DialogDescription id="training-form-description" className="sr-only">
            Formulario para agendar un nuevo entrenamiento
          </DialogDescription>
          <TrainingForm
            onSubmit={handleAddTrainingSubmit}
            onCancel={() => setIsFormOpen(false)}
            trainers={trainers}
            services={services}
            initialDate={selectedDate}
            isClient={user?.role === "client"}
            clientName={user?.name || ""}
            clientsWithActiveContracts={[
              { id: "1", name: "Juan Pérez" },
              { id: "0002", name: "María González" }
            ]}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para editar entrenamiento */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-[600px]" aria-describedby="training-details-description">
          <DialogHeader>
            <DialogTitle>Detalles del Entrenamiento</DialogTitle>
          </DialogHeader>
          <DialogDescription id="training-details-description" className="sr-only">
            Detalles y opciones para gestionar el entrenamiento seleccionado
          </DialogDescription>
          {selectedTraining && (
            <TrainingDetailsForm
              training={selectedTraining}
              onUpdate={(updates) => handleEditTraining(selectedTraining.id, updates)}
              onChangeStatus={(status) => handleChangeStatus(selectedTraining.id, status)}
              onClose={() => setIsEditFormOpen(false)}
              isClient={user?.role === "client"}
              isEditable={user?.role !== "client" || selectedTraining.clientId === user?.clientId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}