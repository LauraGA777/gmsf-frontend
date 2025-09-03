import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { CalendarIcon, Clock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { scheduleService } from "@/features/schedule/services/schedule.service";
import { useToast } from "@/shared/components/ui/use-toast";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface AvailableSlot {
  hora: string;
  disponible: boolean;
  razon?: string;
  entrenadores: Array<{
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
  }>;
}

interface ClientBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClientBookingForm({ isOpen, onClose, onSuccess }: ClientBookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedTrainer, setSelectedTrainer] = useState<number>();
  const [title, setTitle] = useState("Sesión de Entrenamiento Personal");
  // Campos opcionales removidos por requerimiento
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(undefined);
      setAvailableSlots([]);
      setSelectedSlot("");
      setSelectedTrainer(undefined);
      setTitle("Sesión de Entrenamiento Personal");
  // Descripción y notas eliminadas
    }
  }, [isOpen]);

  // Load available slots when date changes
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        return;
      }

      try {
        setIsLoadingSlots(true);
        const dateString = format(selectedDate, "yyyy-MM-dd");
        const response = await scheduleService.getAvailableTimeSlots(dateString);
        setAvailableSlots(response.data || []);
        setSelectedSlot("");
        setSelectedTrainer(undefined);
      } catch (error) {
        console.error("Error loading available slots:", error);
        setAvailableSlots([]);
        toast({
          title: "Error",
          description: "No se pudieron cargar los horarios disponibles",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Validation: not in the past (considering 2-hour minimum)
    if (isBefore(date, twoHoursFromNow) && format(date, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
      toast({
        title: "Fecha no válida",
        description: "Debes agendar con al menos 2 horas de anticipación",
        variant: "destructive",
      });
      return;
    }

    // Validation: not more than 30 days ahead
    if (isAfter(date, thirtyDaysFromNow)) {
      toast({
        title: "Fecha no válida",
        description: "No puedes agendar con más de 30 días de anticipación",
        variant: "destructive",
      });
      return;
    }

    setSelectedDate(date);
  };

  const handleSlotSelect = (hora: string) => {
    setSelectedSlot(hora);
    
    // Find the slot and get available trainers
    const slot = availableSlots.find(s => s.hora === hora);
    if (slot && slot.entrenadores.length === 1) {
      // Auto-select trainer if only one available
      setSelectedTrainer(slot.entrenadores[0].id);
    } else {
      setSelectedTrainer(undefined);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !selectedTrainer) {
      toast({
        title: "Información incompleta",
        description: "Por favor selecciona fecha, horario y entrenador",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedSlot.split(':').map(Number);
    const startDate = new Date(selectedDate);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(hours + 1, minutes, 0, 0); // 1 hour duration

    const trainingData = {
      titulo: title,
      fecha_inicio: startDate.toISOString(),
      fecha_fin: endDate.toISOString(),
      id_entrenador: selectedTrainer,
    };

    try {
      setIsLoading(true);
      await scheduleService.bookTrainingForClient(trainingData);
      
      toast({
        title: "¡Entrenamiento agendado!",
        description: "Tu sesión ha sido programada exitosamente",
        variant: "default",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error booking training:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "No se pudo agendar el entrenamiento";
      
      toast({
        title: "Error al agendar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedTrainerInfo = () => {
    if (!selectedSlot || !selectedTrainer) return null;
    
    const slot = availableSlots.find(s => s.hora === selectedSlot);
    if (!slot) return null;
    
    return slot.entrenadores.find(t => t.id === selectedTrainer);
  };

  const selectedTrainerInfo = getSelectedTrainerInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Agendar Entrenamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información importante */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Horarios disponibles: 6:00 AM - 9:00 PM. Mínimo 2 horas de anticipación.
            </AlertDescription>
          </Alert>

          {/* Selección de fecha */}
          <div className="space-y-2">
            <Label htmlFor="date">Seleccionar Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => {
                    const now = new Date();
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const thirtyDaysFromNow = addDays(now, 30);
                    return isBefore(date, today) || isAfter(date, thirtyDaysFromNow);
                  }}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Selección de horario */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Horarios Disponibles</Label>
              {isLoadingSlots ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Cargando horarios...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.hora}
                      variant={selectedSlot === slot.hora ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSlotSelect(slot.hora)}
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {slot.hora}
                    </Button>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay horarios disponibles para esta fecha.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Selección de entrenador */}
          {selectedSlot && (
            <div className="space-y-2">
              <Label>Entrenador</Label>
              {(() => {
                const slot = availableSlots.find(s => s.hora === selectedSlot);
                const trainers = slot?.entrenadores || [];
                
                if (trainers.length === 1) {
                  const trainer = trainers[0];
                  return (
                    <div className="p-3 border rounded-lg bg-blue-50">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">
                          {trainer.usuario.nombre} {trainer.usuario.apellido}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {trainer.especialidad}
                        </Badge>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <Select value={selectedTrainer?.toString()} onValueChange={(value) => setSelectedTrainer(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un entrenador" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{trainer.usuario.nombre} {trainer.usuario.apellido}</span>
                              <Badge variant="outline" className="text-xs">
                                {trainer.especialidad}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  );
                }
              })()}
            </div>
          )}

          {/* Detalles del entrenamiento (sin descripción ni notas) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Sesión</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Sesión de Entrenamiento Personal"
                maxLength={100}
              />
            </div>
          </div>

          {/* Resumen de la reserva */}
          {selectedDate && selectedSlot && selectedTrainerInfo && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Resumen de tu reserva</span>
                </div>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Fecha:</strong> {format(selectedDate, "PPP", { locale: es })}</p>
                  <p><strong>Horario:</strong> {selectedSlot} - {format(new Date(`2000-01-01T${selectedSlot}:00`), "HH:mm", { locale: es }).replace(/(\d{2}):(\d{2})/, (_, h, m) => `${(parseInt(h) + 1).toString().padStart(2, '0')}:${m}`)}</p>
                  <p><strong>Entrenador:</strong> {selectedTrainerInfo.usuario.nombre} {selectedTrainerInfo.usuario.apellido}</p>
                  <p><strong>Especialidad:</strong> {selectedTrainerInfo.especialidad}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedDate || !selectedSlot || !selectedTrainer || isLoading}
              className="flex-1"
            >
              {isLoading ? "Agendando..." : "Confirmar Reserva"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
