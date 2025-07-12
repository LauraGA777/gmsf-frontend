import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/shared/contexts/authContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Calendar } from "@/shared/components/ui/calendar";
import { Progress } from "@/shared/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Input } from "@/shared/components/ui/input";
import { 
  CalendarDays, 
  TrendingUp, 
  Target, 
  Award, 
  Clock, 
  Search,
  BarChart3,
  Calendar as CalendarIcon,
  Clock3,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isSameDay, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from "date-fns";
import { es } from "date-fns/locale";
import { attendanceService } from "../services/attendanceService";
import { toast } from "sonner";

interface AttendanceRecord {
  id: number;
  fecha_uso: string;
  hora_registro: string;
  estado: "Activo" | "Eliminado";
  fecha_registro: string;
}

// Componente para el estado de carga
const LoadingState = () => (
    <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mis Asistencias
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Cargando tus asistencias...</p>
            </div>
          </CardContent>
        </Card>
    </div>
);

// Componente para el estado sin asistencias
const NoAttendanceState = () => (
    <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-lg text-center shadow-lg">
            <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-tr from-green-300 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <BarChart3 className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-2xl font-extrabold">¡Es hora de empezar!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Aún no tienes asistencias. ¡Cada entrenamiento cuenta para alcanzar tus metas!
                </p>
                <div className="bg-teal-50 border-t border-b border-teal-200 px-6 py-4">
                    <p className="text-teal-800 font-medium flex items-center justify-center gap-3">
                        <TrendingUp className="h-5 w-5" />
                        <span>Tu progreso comenzará con tu primera visita.</span>
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
);


export function MyAttendancePage() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("daily");

  // Cargar datos de asistencia del cliente
  const fetchAttendanceData = async () => {
    if (!user?.personId) {
      toast.error("No se pudo obtener la información del usuario");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await attendanceService.searchAttendances({
        codigo_usuario: (user as any)?.codigo || (user as any)?.numero_documento,
        page: 1,
        limit: 1000,
        orderBy: 'fecha_uso',
        direction: 'DESC'
      });

      // Si no hay datos, establecer array vacío en lugar de error
      if (response.data && Array.isArray(response.data)) {
        const mappedAttendances = response.data.map((attendance: any) => ({
          id: attendance.id || 0,
          fecha_uso: format(new Date(attendance.fecha_uso || attendance.fecha || new Date()), 'yyyy-MM-dd'),
          hora_registro: format(new Date(attendance.hora_entrada || attendance.fecha_uso || new Date()), 'HH:mm:ss'),
          estado: attendance.estado === 'Presente' ? "Activo" : "Eliminado",
          fecha_registro: new Date(attendance.fecha_registro || attendance.fecha_uso || new Date()).toISOString(),
        }));
        setAttendanceData(mappedAttendances);
      } else {
        // Si no hay datos, establecer array vacío
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      // En caso de error, establecer array vacío para mostrar el mensaje informativo
      setAttendanceData([]);
      toast.error("No se pudieron cargar los datos de asistencia");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [user]);

  // Filtrar datos por búsqueda
  const filteredData = useMemo(() => {
    return attendanceData.filter((record) => {
      const matchesSearch = format(new Date(record.fecha_uso), "dd/MM/yyyy").includes(searchTerm) ||
                           record.hora_registro.includes(searchTerm);
      return matchesSearch && record.estado === "Activo";
    });
  }, [attendanceData, searchTerm]);

  // Estadísticas diarias
  const dailyStats = useMemo(() => {
    const today = new Date();
    const todayAttendances = attendanceData.filter(record => 
      isSameDay(new Date(record.fecha_uso), today) && record.estado === "Activo"
    );
    
    const yesterdayAttendances = attendanceData.filter(record => 
      isYesterday(new Date(record.fecha_uso)) && record.estado === "Activo"
    );

    return {
      today: todayAttendances.length,
      yesterday: yesterdayAttendances.length,
      hasAttendedToday: todayAttendances.length > 0,
      hasAttendedYesterday: yesterdayAttendances.length > 0
    };
  }, [attendanceData]);

  // Estadísticas semanales
  const weeklyStats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const weekAttendances = attendanceData.filter(record => {
      const recordDate = new Date(record.fecha_uso);
      return recordDate >= weekStart && recordDate <= weekEnd && record.estado === "Activo";
    });

    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const attendanceDays = weekDays.filter(day => 
      attendanceData.some(record => 
        isSameDay(new Date(record.fecha_uso), day) && record.estado === "Activo"
      )
    );

    return {
      total: weekAttendances.length,
      days: attendanceDays.length,
      percentage: Math.round((attendanceDays.length / 7) * 100),
      goal: 5, // Meta de 5 días por semana
      streak: calculateCurrentStreak()
    };
  }, [attendanceData]);

  // Estadísticas mensuales
  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    
    const monthAttendances = attendanceData.filter(record => {
      const recordDate = new Date(record.fecha_uso);
      return recordDate >= monthStart && recordDate <= monthEnd && record.estado === "Activo";
    });

    const totalDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;
    const attendanceDays = monthAttendances.length;
    const attendancePercentage = (attendanceDays / totalDaysInMonth) * 100;

    return {
      total: attendanceDays,
      percentage: Math.round(attendancePercentage),
      goal: 20, // Meta de 20 días por mes
      averagePerWeek: Math.round(attendanceDays / 4.33) // Promedio semanal
    };
  }, [attendanceData]);

  // Estadísticas anuales
  const yearlyStats = useMemo(() => {
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());
    
    const yearAttendances = attendanceData.filter(record => {
      const recordDate = new Date(record.fecha_uso);
      return recordDate >= yearStart && recordDate <= yearEnd && record.estado === "Activo";
    });

    const totalDaysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd }).length;
    const attendanceDays = yearAttendances.length;
    const attendancePercentage = (attendanceDays / totalDaysInYear) * 100;

    return {
      total: attendanceDays,
      percentage: Math.round(attendancePercentage),
      goal: 240, // Meta de 240 días por año
      averagePerMonth: Math.round(attendanceDays / 12),
      averagePerWeek: Math.round(attendanceDays / 52)
    };
  }, [attendanceData]);

  // Calcular racha actual
  function calculateCurrentStreak(): number {
    const sortedAttendances = [...attendanceData]
      .filter(record => record.estado === "Activo")
      .sort((a, b) => new Date(b.fecha_uso).getTime() - new Date(a.fecha_uso).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (const attendance of sortedAttendances) {
      const attendanceDate = new Date(attendance.fecha_uso);
      const daysDiff = Math.floor((currentDate.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = attendanceDate;
      } else {
        break;
      }
    }

    return streak;
  }

  // Verificar si hay asistencia en una fecha específica
  const hasAttendance = (date: Date) => {
    return attendanceData.some(record => 
      isSameDay(new Date(record.fecha_uso), date) && record.estado === "Activo"
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (attendanceData.length === 0) {
    return <NoAttendanceState />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Asistencias</h1>
          <p className="text-gray-600">Seguimiento de tu asistencia al gimnasio</p>
        </div>
        <Button onClick={fetchAttendanceData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoy</p>
                <p className="text-2xl font-bold">{dailyStats.today}</p>
              </div>
              <div className={`p-2 rounded-full ${dailyStats.hasAttendedToday ? 'bg-green-100' : 'bg-gray-100'}`}>
                {dailyStats.hasAttendedToday ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold">{weeklyStats.days}/7</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold">{monthlyStats.total}</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Racha Actual</p>
                <p className="text-2xl font-bold">{weeklyStats.streak}</p>
              </div>
              <div className="p-2 rounded-full bg-orange-100">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes vistas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Diario</TabsTrigger>
          <TabsTrigger value="weekly">Semanal</TabsTrigger>
          <TabsTrigger value="monthly">Mensual</TabsTrigger>
          <TabsTrigger value="yearly">Anual</TabsTrigger>
        </TabsList>

        {/* Vista Diaria */}
        <TabsContent value="daily" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calendario de Asistencias
                </CardTitle>
                <CardDescription>
                  Marca los días en que has asistido al gimnasio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    attended: (date) => hasAttendance(date),
                    today: (date) => isToday(date),
                  }}
                  modifiersStyles={{
                    attended: { backgroundColor: "hsl(var(--primary))", color: "white" },
                    today: { border: "2px solid hsl(var(--primary))" },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5" />
                  Asistencias Recientes
                </CardTitle>
                <CardDescription>
                  Últimas 10 asistencias registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData.slice(0, 10).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">
                            {format(new Date(record.fecha_uso), "EEEE, d 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-sm text-gray-600">
                            Registrado a las {record.hora_registro}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {format(new Date(record.fecha_uso), "dd/MM/yyyy")}
                      </Badge>
                    </div>
                  ))}
                  {filteredData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay asistencias registradas</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vista Semanal */}
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progreso Semanal
                </CardTitle>
                <CardDescription>
                  {format(startOfWeek(new Date(), { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Días asistidos</span>
                  <span className="text-sm text-gray-600">{weeklyStats.days}/7</span>
                </div>
                <Progress value={weeklyStats.percentage} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span>Meta: {weeklyStats.goal} días</span>
                  <span className="font-medium">{weeklyStats.percentage}%</span>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Racha Actual</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{weeklyStats.streak} días</p>
                  <p className="text-sm text-blue-700">¡Sigue así!</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos Semanales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Asistencias esta semana</span>
                    <Badge variant={weeklyStats.days >= weeklyStats.goal ? "default" : "secondary"}>
                      {weeklyStats.days}/{weeklyStats.goal}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Porcentaje de cumplimiento</span>
                    <Badge variant={weeklyStats.percentage >= 70 ? "default" : "secondary"}>
                      {weeklyStats.percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Racha más larga</span>
                    <Badge variant="outline">{weeklyStats.streak} días</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vista Mensual */}
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Resumen Mensual
                </CardTitle>
                <CardDescription>
                  {format(startOfMonth(new Date()), "MMMM yyyy", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{monthlyStats.total}</p>
                    <p className="text-sm text-gray-600">Días asistidos</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{monthlyStats.averagePerWeek}</p>
                    <p className="text-sm text-gray-600">Promedio semanal</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progreso mensual</span>
                    <span className="text-sm text-gray-600">{monthlyStats.total}/{monthlyStats.goal}</span>
                  </div>
                  <Progress value={(monthlyStats.total / monthlyStats.goal) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span>Meta: {monthlyStats.goal} días</span>
                    <span className="font-medium">{Math.round((monthlyStats.total / monthlyStats.goal) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas Detalladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Porcentaje de asistencia</span>
                    <Badge variant={monthlyStats.percentage >= 60 ? "default" : "secondary"}>
                      {monthlyStats.percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Promedio por semana</span>
                    <Badge variant="outline">{monthlyStats.averagePerWeek} días</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Días restantes para meta</span>
                    <Badge variant={monthlyStats.total >= monthlyStats.goal ? "default" : "secondary"}>
                      {Math.max(0, monthlyStats.goal - monthlyStats.total)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vista Anual */}
        <TabsContent value="yearly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Resumen Anual
                </CardTitle>
                <CardDescription>
                  {format(startOfYear(new Date()), "yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{yearlyStats.total}</p>
                    <p className="text-sm text-gray-600">Días totales</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{yearlyStats.averagePerMonth}</p>
                    <p className="text-sm text-gray-600">Promedio mensual</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progreso anual</span>
                    <span className="text-sm text-gray-600">{yearlyStats.total}/{yearlyStats.goal}</span>
                  </div>
                  <Progress value={(yearlyStats.total / yearlyStats.goal) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span>Meta: {yearlyStats.goal} días</span>
                    <span className="font-medium">{Math.round((yearlyStats.total / yearlyStats.goal) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Métricas Anuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Promedio semanal</span>
                    <Badge variant="outline">{yearlyStats.averagePerWeek} días</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Promedio mensual</span>
                    <Badge variant="outline">{yearlyStats.averagePerMonth} días</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Porcentaje de asistencia</span>
                    <Badge variant={yearlyStats.percentage >= 50 ? "default" : "secondary"}>
                      {yearlyStats.percentage}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Días restantes para meta</span>
                    <Badge variant={yearlyStats.total >= yearlyStats.goal ? "default" : "secondary"}>
                      {Math.max(0, yearlyStats.goal - yearlyStats.total)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tabla de asistencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Historial de Asistencias
          </CardTitle>
          <CardDescription>
            Busca y filtra tus asistencias registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar por fecha (dd/mm/yyyy) o hora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora de Registro</TableHead>
                  <TableHead>Día de la Semana</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.fecha_uso), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{record.hora_registro}</TableCell>
                    <TableCell>
                      {format(new Date(record.fecha_uso), "EEEE", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.estado === "Activo" ? "default" : "secondary"}>
                        {record.estado === "Activo" ? "Presente" : "Eliminado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No se encontraron asistencias
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 