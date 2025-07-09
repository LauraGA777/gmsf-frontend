import React, { useState, useEffect } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { 
  RefreshCw, 
  Clock, 
  Users, 
  MapPin, 
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { format, addDays, addHours } from 'date-fns';
import { es } from 'date-fns/locale';

interface Training {
  id: number;
  title: string;
  instructor: string;
  time: string;
  date: string;
  duration: number;
  participants: number;
  maxParticipants: number;
  location: string;
  type: 'grupal' | 'individual' | 'especializada';
  status: 'programada' | 'en_progreso' | 'completada' | 'cancelada';
}

export function UpcomingTrainings() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateMockTrainings = (): Training[] => {
    const now = new Date();
    const trainings: Training[] = [];
    
    const trainingTypes = [
      { title: 'Yoga Matutino', instructor: 'Ana García', type: 'grupal' as const, duration: 60 },
      { title: 'Entrenamiento Funcional', instructor: 'Carlos Ruiz', type: 'grupal' as const, duration: 45 },
      { title: 'Pilates', instructor: 'María López', type: 'grupal' as const, duration: 50 },
      { title: 'Spinning', instructor: 'Pedro Martínez', type: 'grupal' as const, duration: 45 },
      { title: 'Crossfit', instructor: 'Laura Sánchez', type: 'grupal' as const, duration: 60 },
      { title: 'Entrenamiento Personal', instructor: 'Diego Herrera', type: 'individual' as const, duration: 60 },
      { title: 'Rehabilitación', instructor: 'Dr. Morales', type: 'especializada' as const, duration: 40 },
      { title: 'Aqua Aeróbicos', instructor: 'Elena Vega', type: 'grupal' as const, duration: 45 },
    ];
    
    const locations = ['Sala 1', 'Sala 2', 'Sala de Yoga', 'Piscina', 'Gimnasio Principal'];
    
    // Generar entrenamientos para los próximos 3 días
    for (let day = 0; day < 3; day++) {
      const trainingDate = addDays(now, day);
      const numTrainings = Math.floor(Math.random() * 4) + 2; // 2-5 entrenamientos por día
      
      for (let i = 0; i < numTrainings; i++) {
        const trainingType = trainingTypes[Math.floor(Math.random() * trainingTypes.length)];
        const startHour = 6 + Math.floor(Math.random() * 14); // Entre 6 AM y 8 PM
        const trainingTime = addHours(new Date(trainingDate.getFullYear(), trainingDate.getMonth(), trainingDate.getDate()), startHour);
        
        const maxParticipants = trainingType.type === 'individual' ? 1 : Math.floor(Math.random() * 15) + 10;
        const participants = Math.floor(Math.random() * maxParticipants);
        
        trainings.push({
          id: trainings.length + 1,
          title: trainingType.title,
          instructor: trainingType.instructor,
          time: format(trainingTime, 'HH:mm'),
          date: format(trainingDate, 'yyyy-MM-dd'),
          duration: trainingType.duration,
          participants,
          maxParticipants,
          location: locations[Math.floor(Math.random() * locations.length)],
          type: trainingType.type,
          status: trainingTime > now ? 'programada' : 'completada'
        });
      }
    }
    
    return trainings.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockTrainings = generateMockTrainings();
      setTrainings(mockTrainings);
    } catch (error) {
      console.error('Error loading trainings data:', error);
      setError('Error al cargar próximas sesiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTypeColor = (type: Training['type']) => {
    switch (type) {
      case 'grupal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'individual':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'especializada':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: Training['status']) => {
    switch (status) {
      case 'programada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completada':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <AlertDescription className="flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button
            onClick={loadData}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (trainings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
        <Calendar className="h-8 w-8 mb-2" />
        <p className="text-sm">No hay sesiones programadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Próximas Sesiones
        </h3>
        <button
          onClick={loadData}
          disabled={loading}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {trainings.map((training) => {
          const occupancyPercentage = (training.participants / training.maxParticipants) * 100;
          const trainingDateTime = new Date(`${training.date} ${training.time}`);
          const isToday = format(trainingDateTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div
              key={training.id}
              className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                isToday 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' 
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {training.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTypeColor(training.type)}`}
                    >
                      {training.type}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{training.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{training.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {training.time} ({training.duration} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(trainingDateTime, 'dd/MM', { locale: es })}
                        {isToday && ' (Hoy)'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(training.status)}`}
                  >
                    {training.status}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3" />
                    <span className={getOccupancyColor(occupancyPercentage)}>
                      {training.participants}/{training.maxParticipants}
                    </span>
                  </div>
                  
                  <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        occupancyPercentage >= 90 ? 'bg-red-500' :
                        occupancyPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {trainings.filter(t => t.status === 'programada').length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Programadas
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(trainings.reduce((sum, t) => sum + (t.participants / t.maxParticipants), 0) / trainings.length * 100)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ocupación promedio
          </div>
        </div>
      </div>
    </div>
  );
}

