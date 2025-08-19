import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Swal from 'sweetalert2'

// UI Components
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Calendar } from "@/shared/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"

// Icons
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Eye, 
  Trash2, 
  CalendarIcon, 
  Users, 
  Clock, 
  CheckCircle 
} from "lucide-react"

// Types and Services
import { AttendanceRecord, UserRole } from "@/shared/types/types"
import { attendanceService, AdminAttendanceRecord, AdminAttendanceResponse } from "../services/attendanceService";
import { formatTimeFromDB, formatDateFromDB } from "@/shared/utils/date";

const formatFullDateTime = (dateTimeString: string): string => {
  try {
    if (!dateTimeString) return 'N/A';
    
    if (dateTimeString.includes('T')) {
      const [datePart, timePart] = dateTimeString.split('T');
      const timeOnly = timePart.split('.')[0];
      
      const formattedDate = formatDateFromDB(datePart);
      const formattedTime = formatTimeFromDB(timeOnly);
      
      return `${formattedDate} ${formattedTime}`;
    }
    
    return dateTimeString;
  } catch (error) {
    return dateTimeString;
  }
};

export default function AttendanceRegistry() {
  // Constants
  const [userRole] = useState<UserRole>(1)

  // State
  const [attendanceData, setAttendanceData] = useState<AdminAttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isManualRegistryOpen, setIsManualRegistryOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AdminAttendanceRecord | null>(null);
  const [documentNumber, setDocumentNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)

  // Load initial data
  useEffect(() => {
    fetchAttendanceData()
  }, [selectedDate, currentPage])

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const data = await attendanceService.getAttendances({
        page: currentPage,
        limit: pageSize,
        fecha_inicio: startOfDay.toISOString(),
        fecha_fin: endOfDay.toISOString()
      });
      
      if (data.success && data.data) {
        setAttendanceData(data.data);
        setTotalRecords(data.pagination.total);
      } else {
        setAttendanceData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      setAttendanceData([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las asistencias. Intente nuevamente.',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!searchTerm) return attendanceData.filter(record => record.estado === "Activo")
    
    const term = searchTerm.toLowerCase()
    return attendanceData.filter((record) => {
      const matchesSearch =
        record.persona_asistencia?.usuario?.nombre.toLowerCase().includes(term) ||
        record.persona_asistencia?.usuario?.apellido.toLowerCase().includes(term) ||
        record.persona_asistencia?.usuario?.numero_documento.includes(searchTerm) ||
        record.persona_asistencia?.codigo.toLowerCase().includes(term)

      return matchesSearch && record.estado === "Activo"
    })
  }, [attendanceData, searchTerm])

  // Event handlers
  const handleManualRegistry = async () => {
    const trimmedDocument = documentNumber.trim()
    if (!trimmedDocument) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingrese un número de documento válido',
        confirmButtonColor: '#3085d6',
      })
      return
    }

    try {
      setIsLoading(true)
      const newRecord = await attendanceService.registerAttendance(trimmedDocument)
      setAttendanceData((prev) => [newRecord, ...prev])
      setDocumentNumber("")
      setIsManualRegistryOpen(false)
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Asistencia registrada exitosamente',
        confirmButtonColor: '#3085d6',
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al registrar la asistencia"
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#3085d6',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecord = async (id: number) => {
    if (!id || isNaN(id)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de asistencia inválido',
        confirmButtonColor: '#3085d6',
      })
      return
    }

    try {
      await attendanceService.deleteAttendance(id)
      setAttendanceData((prev) =>
        prev.map((record) =>
          record.id === id
            ? { ...record, estado: "Eliminado" as const, fecha_actualizacion: new Date().toISOString() }
            : record,
        ),
      )
      
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Registro eliminado exitosamente',
        confirmButtonColor: '#3085d6',
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar el registro'
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#3085d6',
      })
    }
  }

  const handleViewDetails = async (id: number) => {
    if (!id || isNaN(id)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de asistencia inválido',
        confirmButtonColor: '#3085d6',
      })
      return
    }

    try {
      const record = await attendanceService.getAttendanceDetails(id)
      setSelectedRecord(record)
      setIsDetailsOpen(true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar los detalles del registro'
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#3085d6',
      })
    }
  }

  const handleRefresh = () => {
    fetchAttendanceData()
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asistencia</h1>
            <p className="text-gray-600 mt-1">
              Registro y seguimiento de asistencias de clientes - {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refrescar
            </Button>
            <Dialog open={isManualRegistryOpen} onOpenChange={setIsManualRegistryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Asistencia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Asistencia Manual</DialogTitle>
                  <DialogDescription>
                    Ingrese el número de documento del cliente para registrar su asistencia.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="document">Número de Documento</Label>
                    <Input
                      id="document"
                      placeholder="Ej: 12345678"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualRegistry();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsManualRegistryOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleManualRegistry} disabled={!documentNumber.trim() || isLoading}>
                    {isLoading ? "Registrando..." : "Registrar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Asistencias Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Última Asistencia</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredData.length > 0 ? formatTimeFromDB(filteredData[0].hora_registro) : "--:--"}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estado Sistema</p>
                  <p className="text-2xl font-bold text-green-600">Activo</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar Cliente</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nombre, documento o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label>Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "dd/MM/yyyy", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Registros de Asistencia 
              {isLoading && <span className="text-sm text-gray-500 ml-2">(Cargando...)</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Cargando asistencias...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                <p className="text-gray-600 mb-4">
                  No se encontraron asistencias para el {format(selectedDate, "dd 'de' MMMM", { locale: es })}.
                </p>
                <Button onClick={() => setIsManualRegistryOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primera Asistencia
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Estado Contrato</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Estado Asistencia</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {record.persona_asistencia?.usuario?.nombre || 'N/A'} {record.persona_asistencia?.usuario?.apellido || ''}
                            </div>
                            <div className="text-sm text-gray-600">
                              {record.persona_asistencia?.codigo || 'N/A'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-mono">
                          {record.persona_asistencia?.usuario?.numero_documento || 'N/A'}
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {record.contrato?.codigo || 'N/A'}
                            </div>
                            <div className="text-sm">
                              <Badge 
                                variant={record.contrato?.estado === "Activo" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {record.contrato?.estado || 'N/A'}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="font-mono">
                          {formatTimeFromDB(record.hora_registro)}
                        </TableCell>

                        <TableCell>
                          <Badge 
                            variant={record.estado === "Activo" ? "default" : "destructive"}
                          >
                            {record.estado}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(Number(record.id))}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginación */}
        {totalRecords > pageSize && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalRecords)} de {totalRecords} registros
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage * pageSize >= totalRecords}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles de Asistencia</DialogTitle>
              <DialogDescription>
                Información completa del registro de asistencia
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6">
                {/* Información del Cliente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información del Cliente</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Código</Label>
                      <p className="font-mono">{selectedRecord.persona_asistencia?.codigo || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Documento</Label>
                      <p className="font-mono">{selectedRecord.persona_asistencia?.usuario?.numero_documento || 'N/A'}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <Label className="text-sm font-medium text-gray-600">Nombre Completo</Label>
                      <p className="font-medium">
                        {selectedRecord.persona_asistencia?.usuario?.nombre || 'N/A'} {selectedRecord.persona_asistencia?.usuario?.apellido || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del Contrato */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Información del Contrato</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Código Contrato</Label>
                      <p className="font-mono">{selectedRecord.contrato?.codigo || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Membresía</Label>
                      <p>{selectedRecord.contrato?.membresia?.nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Precio</Label>
                      <p className="font-mono">
                        ${selectedRecord.contrato?.membresia_precio ? Number(selectedRecord.contrato?.membresia_precio).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha Inicio</Label>
                      <p>{selectedRecord.contrato?.fecha_inicio ? formatDateFromDB(selectedRecord.contrato.fecha_inicio) : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha Fin</Label>
                      <p>{selectedRecord.contrato?.fecha_fin ? formatDateFromDB(selectedRecord.contrato.fecha_fin) : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estado Contrato</Label>
                      <Badge variant={selectedRecord.contrato?.estado === "Activo" ? "default" : "secondary"}>
                        {selectedRecord.contrato?.estado || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Información de la Asistencia */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Detalles de la Asistencia</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha de Uso</Label>
                      <p>{formatDateFromDB(selectedRecord.fecha_uso)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Hora Registro</Label>
                      <p className="font-mono">{formatTimeFromDB(selectedRecord.hora_registro)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Estado Asistencia</Label>
                      <Badge variant={selectedRecord.estado === "Activo" ? "default" : "destructive"}>
                        {selectedRecord.estado}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha Registro</Label>
                      <p className="font-mono">{formatFullDateTime(selectedRecord.fecha_registro)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Última Actualización</Label>
                      <p className="font-mono">
                        {selectedRecord.fecha_actualizacion 
                          ? formatFullDateTime(selectedRecord.fecha_actualizacion)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Usuario Registro</Label>
                      <p className="font-mono">ID: {selectedRecord.usuario_registro || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
