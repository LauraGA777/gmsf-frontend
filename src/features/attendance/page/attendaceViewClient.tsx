import { useState, useMemo, useEffect } from "react" // ✅ Agregado useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Calendar } from "@/shared/components/ui/calendar"
import { Progress } from "@/shared/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Search, TrendingUp, Clock, Target, Award, CalendarDays, User, CreditCard, Loader2 } from "lucide-react" // ✅ Agregado Loader2
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Client, Contract } from "@/shared/types/index"
import { useAuth } from "@/shared/contexts/authContext"
import { attendanceService } from "../services/attendanceService" // ✅ Agregado import
import { toast } from "sonner" // ✅ Agregado import

interface ClientAttendance {
    id: number
    fecha_uso: string
    hora_registro: string
    estado: "Activo" | "Eliminado"
    fecha_registro: string
}

interface ClientInfo {
    codigo: string
    nombre: string
    apellido: string
    documento: string
    email: string
    telefono: string
    contrato: {
        tipo: string
        estado: "Activo" | "Inactivo" | "Vencido"
        fecha_inicio: string
        fecha_vencimiento: string
        dias_restantes: number
    }
}

// Función para mapear Attendance a ClientAttendance
const mapAttendanceToClientAttendance = (attendance: any): ClientAttendance => { // ✅ Cambiado a 'any' para evitar errores de tipado
    return {
        id: attendance.id,
        fecha_uso: format(new Date(attendance.fecha_uso || attendance.fecha || new Date()), 'yyyy-MM-dd'), // ✅ Mejorado manejo de fechas
        hora_registro: format(new Date(attendance.hora_entrada || attendance.fecha_uso || new Date()), 'HH:mm:ss'),
        estado: attendance.estado === 'Presente' ? "Activo" : "Eliminado",
        fecha_registro: new Date(attendance.fecha_registro || attendance.fecha_uso || new Date()).toISOString(), // ✅ Simplificado
    }
}

// Función para mapear Client a ClientInfo
const mapClientToClientInfo = (client: Client, contract?: Contract): ClientInfo => {
    const usuario = client.usuario || {}

    // Calcular días restantes
    const fechaFin = contract?.fecha_fin ? new Date(contract.fecha_fin) : new Date()
    const hoy = new Date()
    const diasRestantes = Math.max(0, Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)))

    return {
        codigo: client.codigo || `CLI${client.id_persona?.toString().padStart(3, '0')}`,
        nombre: usuario.nombre || 'Sin nombre',
        apellido: usuario.apellido || 'Sin apellido',
        documento: usuario.numero_documento || 'Sin documento',
        email: usuario.correo || 'sin-email@ejemplo.com',
        telefono: usuario.telefono || 'Sin teléfono',
        contrato: {
            tipo: contract?.membresia?.nombre || 'Membresía Básica',
            estado: contract?.estado === 'Activo' ? 'Activo' : contract?.estado === 'Vencido' ? 'Vencido' : 'Inactivo', // ✅ Mejorado estado
            fecha_inicio: contract?.fecha_inicio ? format(new Date(contract.fecha_inicio), 'yyyy-MM-dd') : '2024-01-01',
            fecha_vencimiento: contract?.fecha_fin ? format(new Date(contract.fecha_fin), 'yyyy-MM-dd') : '2024-12-31',
            dias_restantes: diasRestantes,
        },
    }
}

export default function ClientAttendanceView() {
    const { user } = useAuth()
    const [attendanceData, setAttendanceData] = useState<ClientAttendance[]>([])
    const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())

    useEffect(() => {
        const loadClientData = async () => {
            if (!user?.numero_documento) {
                toast.error("No se pudo obtener la información del usuario")
                return
            }

            try {
                setIsLoading(true)

                // Obtener asistencias del cliente
                const attendancesResponse = await attendanceService.searchAttendances({
                    codigo_usuario: user.codigo || user.numero_documento,
                    page: 1,
                    limit: 1000,
                    orderBy: 'fecha_uso',
                    direction: 'DESC'
                })

                // Mapear las asistencias
                const mappedAttendances = attendancesResponse.data.map(mapAttendanceToClientAttendance)
                setAttendanceData(mappedAttendances)

                // Simular información del cliente (esto debería venir de un endpoint específico)
                const mockClient: Client = {
                    id_persona: user.id || 0,
                    codigo: user.codigo || `CLI${user.id?.toString().padStart(3, '0')}`,
                    fecha_registro: new Date(),
                    fecha_actualizacion: new Date(),
                    estado: true,
                    usuario: {
                        id: user.id || 0,
                        codigo: user.codigo || '',
                        nombre: user.nombre || '',
                        apellido: user.apellido || '',
                        correo: user.correo || '',
                        telefono: user.telefono || '',
                        tipo_documento: user.tipo_documento || 'CC',
                        numero_documento: user.numero_documento || '',
                        fecha_nacimiento: new Date(),
                        estado: true,
                    }
                }

                // Simular contrato (esto también debería venir de un endpoint)
                const mockContract: Contract = {
                    id: 1,
                    codigo: 'CON001',
                    id_persona: user.id || 0,
                    id_membresia: 1,
                    fecha_inicio: new Date('2024-01-01'),
                    fecha_fin: new Date('2024-12-31'),
                    estado: 'Activo',
                    fecha_registro: new Date(),
                    fecha_actualizacion: new Date(),
                    membresia: {
                        id: 1,
                        codigo: 'MEM001',
                        nombre: 'Membresía Premium',
                        descripcion: 'Acceso completo al gimnasio',
                        precio: 50000,
                        duracion_meses: 12,
                        estado: true,
                        fecha_registro: new Date(),
                        fecha_actualizacion: new Date()
                    }
                }

                const mappedClientInfo = mapClientToClientInfo(mockClient, mockContract)
                setClientInfo(mappedClientInfo)

            } catch (error) {
                console.error('Error loading client data:', error)
                toast.error("Error al cargar los datos del cliente")
            } finally {
                setIsLoading(false)
            }
        }

        loadClientData()
    }, [user])

    // Filtrar datos por búsqueda
    const filteredData = useMemo(() => {
        return attendanceData.filter((record) => {
            const matchesSearch =
                format(new Date(record.fecha_uso), "dd/MM/yyyy").includes(searchTerm) ||
                record.hora_registro.includes(searchTerm)

            return matchesSearch && record.estado === "Activo"
        })
    }, [attendanceData, searchTerm])

    // Estadísticas del mes actual
    const currentMonthStats = useMemo(() => {
        const currentMonth = new Date()
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)

        const monthAttendances = attendanceData.filter((record) => {
            const recordDate = new Date(record.fecha_uso)
            return recordDate >= monthStart && recordDate <= monthEnd && record.estado === "Activo"
        })

        const totalDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd }).length
        const attendanceDays = monthAttendances.length
        const attendancePercentage = (attendanceDays / totalDaysInMonth) * 100

        return {
            totalDays: attendanceDays,
            percentage: Math.round(attendancePercentage),
            goal: 20,
            streak: calculateStreak(),
        }
    }, [attendanceData])

    // Calcular racha actual
    function calculateStreak(): number {
        const sortedAttendances = [...attendanceData]
            .filter((record) => record.estado === "Activo")
            .sort((a, b) => new Date(b.fecha_uso).getTime() - new Date(a.fecha_uso).getTime())

        let streak = 0
        let currentDate = new Date()

        for (const attendance of sortedAttendances) {
            const attendanceDate = new Date(attendance.fecha_uso)
            const daysDiff = Math.floor((currentDate.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24))

            if (daysDiff <= streak + 1) {
                streak++
                currentDate = attendanceDate
            } else {
                break
            }
        }

        return streak
    }

    // Obtener asistencias del mes seleccionado para el calendario
    const getMonthAttendances = (month: Date) => {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        return attendanceData.filter((record) => {
            const recordDate = new Date(record.fecha_uso)
            return recordDate >= monthStart && recordDate <= monthEnd && record.estado === "Activo"
        })
    }

    // Verificar si una fecha tiene asistencia
    const hasAttendance = (date: Date) => {
        return attendanceData.some((record) => isSameDay(new Date(record.fecha_uso), date) && record.estado === "Activo")
    }

    // ✅ Movido fuera de la función calculateStreak
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando tu historial de asistencias...</p>
                </div>
            </div>
        )
    }

    if (!clientInfo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
                    <p className="text-gray-600">No se pudo cargar la información del cliente</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mi Historial de Asistencias</h1>
                        <p className="text-gray-600 mt-1">Seguimiento de tu progreso en el gimnasio</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                        <User className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="font-medium text-gray-900">
                                {clientInfo.nombre} {clientInfo.apellido}
                            </p>
                            <p className="text-sm text-gray-600">{clientInfo.codigo}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Este Mes</p>
                                    <p className="text-2xl font-bold text-gray-900">{currentMonthStats.totalDays}</p>
                                    <p className="text-xs text-gray-500">días asistidos</p>
                                </div>
                                <CalendarDays className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Racha Actual</p>
                                    <p className="text-2xl font-bold text-orange-600">{currentMonthStats.streak}</p>
                                    <p className="text-xs text-gray-500">días consecutivos</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Meta Mensual</p>
                                    <p className="text-2xl font-bold text-green-600">{currentMonthStats.percentage}%</p>
                                    <Progress value={currentMonthStats.percentage} className="mt-2" />
                                </div>
                                <Target className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Membresía</p>
                                    <p className="text-lg font-bold text-purple-600">{clientInfo.contrato.tipo}</p>
                                    <p className="text-xs text-gray-500">{clientInfo.contrato.dias_restantes} días restantes</p>
                                </div>
                                <Award className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="history" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="history">Historial</TabsTrigger>
                        <TabsTrigger value="calendar">Calendario</TabsTrigger>
                        <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
                    </TabsList>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        {/* Filter Section */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="search">Buscar en mi historial</Label>
                                        <div className="relative mt-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="search"
                                                placeholder="Buscar por fecha o hora..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* History Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mis Asistencias</CardTitle>
                                <CardDescription>Historial completo de tus visitas al gimnasio</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {filteredData.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                                        <p className="text-gray-600">No se encontraron asistencias con los filtros aplicados.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Día de la Semana</TableHead>
                                                    <TableHead>Hora de Ingreso</TableHead>
                                                    <TableHead>Duración Estimada</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredData.map((record) => {
                                                    const date = new Date(record.fecha_uso)
                                                    const dayName = format(date, "EEEE", { locale: es })
                                                    return (
                                                        <TableRow key={record.id} className="hover:bg-gray-50">
                                                            <TableCell>
                                                                <div className="font-medium">{format(date, "dd/MM/yyyy", { locale: es })}</div>
                                                            </TableCell>
                                                            <TableCell className="capitalize">{dayName}</TableCell>
                                                            <TableCell className="font-mono">{record.hora_registro}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-sm text-gray-600">~90 min</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="default">Completada</Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Calendar Tab */}
                    <TabsContent value="calendar" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Calendario de Asistencias</CardTitle>
                                    <CardDescription>Vista mensual de tus días de entrenamiento</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        month={selectedMonth}
                                        onMonthChange={setSelectedMonth}
                                        modifiers={{
                                            attendance: (date) => hasAttendance(date),
                                        }}
                                        modifiersStyles={{
                                            attendance: {
                                                backgroundColor: "#10b981",
                                                color: "white",
                                                fontWeight: "bold",
                                            },
                                        }}
                                        className="rounded-md border"
                                    />
                                    <div className="mt-4 flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span>Días con asistencia</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumen del Mes</CardTitle>
                                    <CardDescription>{format(selectedMonth, "MMMM yyyy", { locale: es })}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-600">{getMonthAttendances(selectedMonth).length}</p>
                                            <p className="text-sm text-blue-600">Días asistidos</p>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <p className="text-2xl font-bold text-green-600">
                                                {Math.round(
                                                    (getMonthAttendances(selectedMonth).length /
                                                        eachDayOfInterval({
                                                            start: startOfMonth(selectedMonth),
                                                            end: endOfMonth(selectedMonth),
                                                        }).length) *
                                                    100,
                                                )}
                                                %
                                            </p>
                                            <p className="text-sm text-green-600">Del mes</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium">Últimas asistencias:</h4>
                                        {getMonthAttendances(selectedMonth)
                                            .slice(0, 5)
                                            .map((record) => (
                                                <div key={record.id} className="flex justify-between items-center py-2 border-b">
                                                    <span className="text-sm">{format(new Date(record.fecha_uso), "dd/MM", { locale: es })}</span>
                                                    <span className="text-sm font-mono text-gray-600">{record.hora_registro}</span>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Personal</CardTitle>
                                    <CardDescription>Tus datos de cliente</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Código Cliente</Label>
                                            <p className="font-mono text-lg">{clientInfo.codigo}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Documento</Label>
                                            <p className="font-mono text-lg">{clientInfo.documento}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Nombre Completo</Label>
                                        <p className="text-lg font-medium">
                                            {clientInfo.nombre} {clientInfo.apellido}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                                        <p className="text-lg">{clientInfo.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                                        <p className="text-lg">{clientInfo.telefono}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Mi Membresía</CardTitle>
                                    <CardDescription>Detalles de tu contrato actual</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-8 w-8 text-purple-600" />
                                        <div>
                                            <p className="text-lg font-medium">{clientInfo.contrato.tipo}</p>
                                            <Badge variant={clientInfo.contrato.estado === "Activo" ? "default" : "destructive"}>
                                                {clientInfo.contrato.estado}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Fecha Inicio</Label>
                                            <p>{format(new Date(clientInfo.contrato.fecha_inicio), "dd/MM/yyyy", { locale: es })}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Vencimiento</Label>
                                            <p>{format(new Date(clientInfo.contrato.fecha_vencimiento), "dd/MM/yyyy", { locale: es })}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Días Restantes</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Progress value={((365 - clientInfo.contrato.dias_restantes) / 365) * 100} className="flex-1" />
                                            <span className="text-sm font-medium">{clientInfo.contrato.dias_restantes} días</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">Estadísticas Generales</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-blue-600">Total Asistencias</p>
                                                <p className="font-bold text-blue-900">{attendanceData.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600">Promedio Mensual</p>
                                                <p className="font-bold text-blue-900">{Math.round(attendanceData.length / 3)} días</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}