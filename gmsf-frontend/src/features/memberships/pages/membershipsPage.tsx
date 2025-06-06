import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { 
  Plus, 
  Search, 
  DollarSign, 
  Calendar,
  MoreHorizontal,
  RefreshCw,
  Edit,
  Eye,
  Trash2,
  RotateCcw,
  Power
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useGym } from "@/shared/contexts/gymContext";
import { membershipService } from "@/features/memberships/services/membership.service";
import type { Membership } from "@/shared/types";
import Swal from "sweetalert2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

// Componente del formulario de membresía
function MembershipForm({ 
  membership, 
  onSave, 
  onCancel 
}: { 
  membership?: Membership;
  onSave: (data: Partial<Membership>) => Promise<void>;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Membership>>({
    nombre: membership?.nombre || '',
    descripcion: membership?.descripcion || '',
    precio: membership?.precio || 0,
    dias_acceso: membership?.dias_acceso || 1,
    vigencia_dias: membership?.vigencia_dias || 30,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = membershipService.validateMembershipData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving membership:', error);
      setErrors(['Error al guardar la membresía']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <ul className="text-red-600 text-sm">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Nombre de la Membresía</label>
        <Input
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          placeholder="Ej: Membresía Premium"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg resize-none"
          rows={3}
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Describe los beneficios de esta membresía..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Precio ($)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={formData.precio}
            onChange={(e) => setFormData(prev => ({ ...prev, precio: Number(e.target.value) }))}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Días de Acceso</label>
          <Input
            type="number"
            min="1"
            value={formData.dias_acceso}
            onChange={(e) => setFormData(prev => ({ ...prev, dias_acceso: Number(e.target.value) }))}
            placeholder="30"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Días de Vigencia Total</label>
        <Input
          type="number"
          min="1"
          value={formData.vigencia_dias}
          onChange={(e) => setFormData(prev => ({ ...prev, vigencia_dias: Number(e.target.value) }))}
          placeholder="30"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Debe ser mayor o igual a los días de acceso
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : (membership ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
}

export function MembershipsPage() {
  const {
    memberships,
    membershipsLoading,
    refreshMemberships,
    contracts
  } = useGym();

  const [filteredMemberships, setFilteredMemberships] = useState<Membership[]>([]);
  const [isNewMembershipOpen, setIsNewMembershipOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);

  useEffect(() => {
    filterMemberships();
  }, [memberships, searchTerm, statusFilter]);

  const filterMemberships = () => {
    let filtered = [...memberships];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(membership => 
        membership.nombre.toLowerCase().includes(term) ||
        membership.codigo.toLowerCase().includes(term) ||
        membership.descripcion?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(membership => membership.estado === isActive);
    }

    setFilteredMemberships(filtered);
  };

  const getStatusBadge = (estado: boolean) => {
    return estado ? (
      <Badge className="bg-green-100 text-green-800">Activa</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactiva</Badge>
    );
  };

  const getActiveContracts = (membershipId: string) => {
    return contracts.filter(c => 
      Number(c.id_membresia) === Number(membershipId) && c.estado === 'Activo'
    ).length;
  };

  const handleViewDetails = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsDetailsOpen(true);
  };

  const handleEditMembership = (membership: Membership) => {
    setEditingMembership(membership);
    setIsNewMembershipOpen(true);
  };

  const handleCreateMembership = async (data: Partial<Membership>) => {
    try {
      await membershipService.createMembership(data);
      await refreshMemberships();
      setIsNewMembershipOpen(false);
      setEditingMembership(null);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Membresía creada correctamente',
        icon: 'success',
        confirmButtonColor: '#000',
      });
    } catch (error) {
      console.error('Error creating membership:', error);
      throw error;
    }
  };

  const handleUpdateMembership = async (data: Partial<Membership>) => {
    if (!editingMembership) return;
    
    try {
      await membershipService.updateMembership(editingMembership.id, data);
      await refreshMemberships();
      setIsNewMembershipOpen(false);
      setEditingMembership(null);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Membresía actualizada correctamente',
        icon: 'success',
        confirmButtonColor: '#000',
      });
    } catch (error) {
      console.error('Error updating membership:', error);
      throw error;
    }
  };

  const handleToggleMembershipStatus = async (membership: Membership) => {
    try {
      const action = membership.estado ? 'desactivar' : 'reactivar';
      const result = await Swal.fire({
        title: `¿Está seguro de ${action} esta membresía?`,
        text: membership.estado ? 
          'Al desactivar la membresía, no se podrán crear nuevos contratos con ella.' :
          'Al reactivar la membresía, estará disponible para nuevos contratos.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#000',
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Sí, ${action}`,
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        if (membership.estado) {
          await membershipService.deactivateMembership(membership.id);
        } else {
          await membershipService.reactivateMembership(membership.id);
        }
        
        await refreshMemberships();
        
        Swal.fire({
          title: '¡Éxito!',
          text: `Membresía ${action}da correctamente`,
          icon: 'success',
          confirmButtonColor: '#000',
        });
      }
    } catch (error) {
      console.error('Error toggling membership status:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cambiar el estado de la membresía',
        icon: 'error',
        confirmButtonColor: '#000',
      });
    }
  };

  const MembershipActionsMenu = ({ membership }: { membership: Membership }) => {
    const activeContracts = getActiveContracts(membership.id);
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleViewDetails(membership)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEditMembership(membership)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleToggleMembershipStatus(membership)}>
            {membership.estado ? (
              <>
                <Power className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reactivar
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Membresías</h1>
          <p className="text-gray-600">Gestión de planes de membresía</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshMemberships}
            disabled={membershipsLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${membershipsLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => setIsNewMembershipOpen(true)}
            className="bg-black hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Membresía
          </Button>
        </div>
      </div>

      {/* Debugging Info - Temporal */}
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold text-orange-800">🔍 Información de Debug (Temporal)</h3>
            <p><strong>Loading:</strong> {membershipsLoading ? 'Sí' : 'No'}</p>
            <p><strong>Cantidad de membresías:</strong> {memberships?.length || 0}</p>
            <p><strong>Datos en bruto:</strong> {JSON.stringify(memberships, null, 2).substring(0, 200)}...</p>
            <p><strong>Estado del contexto:</strong> {memberships ? 'Definido' : 'Undefined'}</p>
            <p><strong>API URL:</strong> https://gmsf-backend.vercel.app</p>
            <p><strong>Token disponible:</strong> {localStorage.getItem('accessToken') ? 'Sí' : 'No'}</p>
            <p><strong>Usuario logueado:</strong> {localStorage.getItem('user') ? 'Sí' : 'No'}</p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  console.log('🧪 Datos completos de membresías:', memberships);
                  console.log('🧪 Estado de loading:', membershipsLoading);
                  refreshMemberships();
                }}
              >
                🔄 Refrescar y Log
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={async () => {
                  try {
                    console.log('🧪 Intentando crear membresía de prueba...');
                    const testMembership = {
                      nombre: 'Membresía de Prueba',
                      descripcion: 'Esta es una membresía de prueba para verificar la conexión',
                      precio: 50000,
                      dias_acceso: 30,
                      vigencia_dias: 30
                    };
                    const result = await membershipService.createMembership(testMembership);
                    console.log('✅ Membresía de prueba creada:', result);
                    refreshMemberships();
                  } catch (error) {
                    console.error('❌ Error creando membresía de prueba:', error);
                  }
                }}
              >
                🧪 Crear Prueba
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={async () => {
                  try {
                    console.log('🌐 Probando conexión básica con backend...');
                    const response = await fetch('https://gmsf-backend.vercel.app/memberships', {
                      method: 'GET',
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('📡 Response status:', response.status);
                    console.log('📡 Response headers:', [...response.headers.entries()]);
                    
                    if (!response.ok) {
                      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    console.log('📦 Data received:', data);
                  } catch (error) {
                    console.error('❌ Error en conexión:', error);
                  }
                }}
              >
                🌐 Test API
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, código o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activas</SelectItem>
                <SelectItem value="inactive">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Memberships Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Lista de Membresías ({filteredMemberships.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {membershipsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acceso/Vigencia</TableHead>
                  <TableHead>Contratos Activos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No se encontraron membresías</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMemberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell className="font-medium">
                        {membership.codigo}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {membership.nombre}
                          </span>
                          <span className="text-sm text-gray-500 line-clamp-1">
                            {membership.descripcion}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          ${membership.precio.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {membership.dias_acceso} días acceso
                          </span>
                          <span className="text-xs text-gray-500">
                            {membership.vigencia_dias} días vigencia
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {getActiveContracts(membership.id)} activos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(membership.estado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <MembershipActionsMenu membership={membership} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New/Edit Membership Modal */}
      <Dialog open={isNewMembershipOpen} onOpenChange={setIsNewMembershipOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingMembership ? 'Editar Membresía' : 'Nueva Membresía'}
            </DialogTitle>
          </DialogHeader>
          <MembershipForm
            membership={editingMembership || undefined}
            onSave={editingMembership ? handleUpdateMembership : handleCreateMembership}
            onCancel={() => {
              setIsNewMembershipOpen(false);
              setEditingMembership(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Membership Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Detalles de la Membresía
            </DialogTitle>
          </DialogHeader>
          {selectedMembership && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Código</Label>
                  <p className="text-lg font-semibold">{selectedMembership.codigo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedMembership.estado)}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                <p className="text-xl font-bold">{selectedMembership.nombre}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">Descripción</Label>
                <p className="text-gray-700">{selectedMembership.descripcion}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Precio</Label>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedMembership.precio.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Días de Acceso</Label>
                  <p className="text-xl font-semibold">{selectedMembership.dias_acceso}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Días de Vigencia</Label>
                  <p className="text-xl font-semibold">{selectedMembership.vigencia_dias}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Contratos Activos</Label>
                  <p className="text-lg font-semibold text-blue-600">
                    {getActiveContracts(selectedMembership.id)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                  <p className="text-sm">
                    {format(new Date(selectedMembership.fecha_creacion), "dd/MM/yyyy HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
} 