import { useState, useMemo, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
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
import { Badge } from "@/shared/components/ui/badge"
import { Calendar } from "@/shared/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { Search, Plus, RefreshCw, Eye, Trash2, CalendarIcon, Users, Clock, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AttendanceRecord, UserRole } from "@/shared/types/types"
import Swal from 'sweetalert2'
import { attendanceService } from "../services/attendanceService"

export default function AttendanceRegistry() {
    const [userRole] = useState<UserRole>(1) // 1 = Administrador
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isManualRegistryOpen, setIsManualRegistryOpen] = useState(false)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
    const [documentNumber, setDocumentNumber] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [stats, setStats] = useState({
      total: 0,
      activos: 0,
      eliminados: 0
    })
  
    // Cargar datos iniciales
    useEffect(() => {
      fetchAttendanceData()
      fetchStats()
    }, [page])
  
    // Obtener datos de asistencia
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true)
        const response = await attendanceService.getAttendances(page)
        setAttendanceData(response.data)
        setTotalPages(response.totalPages)
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los registros de asistencia',
          confirmButtonColor: '#3085d6',
        })
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
  
    // Obtener estadísticas
    const fetchStats = async () => {
      try {
        const response = await attendanceService.getAttendanceStats(selectedDate)
        setStats(response)
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      }
    }
  
    // Filtrar datos
    const filteredData = useMemo(() => {
      if (!searchTerm) return attendanceData
      
      return attendanceData.filter((record) => {
        const matchesSearch =
          record.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.cliente.documento.includes(searchTerm) ||
          record.cliente.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  
        return matchesSearch && record.estado === "Activo"
      })
    }, [attendanceData, searchTerm])
  
    // Registrar asistencia manual
    const handleManualRegistry = async () => {
      const trimmedDocument = documentNumber.trim();
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
        fetchStats() // Actualizar estadísticas
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Error al registrar la asistencia"
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6',
        })
        console.error("Error detallado:", error)
      } finally {
        setIsLoading(false)
      }
    }
  
    // Eliminar registro
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
        fetchStats() // Actualizar estadísticas
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar el registro'
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6',
        })
        console.error("Error detallado:", error)
      }
    }
  
    // Refrescar datos
    const handleRefresh = () => {
      fetchAttendanceData()
      fetchStats()
    }
  
    // Buscar registros
    const handleSearch = async () => {
      if (!searchTerm.trim()) {
        fetchAttendanceData()
        return
      }
  
      try {
        setIsLoading(true)
        const response = await attendanceService.searchAttendances(searchTerm, page)
        setAttendanceData(response.data)
        setTotalPages(response.totalPages)
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al buscar registros',
          confirmButtonColor: '#3085d6',
        })
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
  
    // Ver detalles del registro
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
        console.error("Error detallado:", error)
      }
    }
  
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asistencia</h1>
              <p className="text-gray-600 mt-1">Registro y seguimiento de asistencias de clientes</p>
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
                      {filteredData.length > 0 ? filteredData[0].hora_registro : "--:--"}
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
  
          {/* Filter Section */}
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
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
  
          {/* Data Table Section */}
          <Card>
            <CardHeader>
              <CardTitle>Registros de Asistencia</CardTitle>
              <CardDescription>
                Lista de asistencias para el {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                  <p className="text-gray-600 mb-4">No se encontraron asistencias para los filtros seleccionados.</p>
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
                        <TableHead>Membresía</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((record) => (
                        <TableRow key={record.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {record.cliente?.nombre || 'N/A'} {record.cliente?.apellido || ''}
                              </div>
                              <div className="text-sm text-gray-600">{record.cliente?.codigo || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{record.cliente?.documento || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={record.contrato?.estado === "Activo" ? "default" : "secondary"}>
                              {record.contrato?.tipo || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">{record.hora_registro || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={record.contrato?.estado === "Activo" ? "default" : "destructive"}>
                              {record.contrato?.estado || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(Number(record.id))}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {userRole === 1 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción cambiará el estado del registro a "Eliminado". Esta acción no se puede
                                        deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteRecord(Number(record.id))}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
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
  
          {/* Details Modal */}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Detalles de Asistencia</DialogTitle>
              </DialogHeader>
              {selectedRecord && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Código Cliente</Label>
                      <p className="font-mono">{selectedRecord.cliente.codigo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Documento</Label>
                      <p className="font-mono">{selectedRecord.cliente.documento}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nombre Completo</Label>
                    <p className="font-medium">
                      {selectedRecord.cliente.nombre} {selectedRecord.cliente.apellido}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Membresía</Label>
                    <p>{selectedRecord.contrato.tipo}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fecha</Label>
                      <p>{format(new Date(selectedRecord.fecha_uso), "dd/MM/yyyy", { locale: es })}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Hora</Label>
                      <p className="font-mono">{selectedRecord.hora_registro}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Registrado por</Label>
                    <p>{selectedRecord.usuario_registro}</p>
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
  