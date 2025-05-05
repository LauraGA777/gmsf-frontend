import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Edit, Eye, Search, Power, ChevronLeft, ChevronRight, SearchIcon } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Swal from 'sweetalert2';
import type { User } from "../types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onView: (user: User) => void;
    onToggleStatus: (userId: string) => void;
}

export function UserTable({ users, onEdit, onView, onToggleStatus }: UserTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; userId: string; isActive: boolean }>({
        isOpen: false,
        userId: "",
        isActive: false,
    });
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filtrar usuarios según el término de búsqueda y el filtro de estado
    const filteredUsers = users.filter((user) => {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Filter by search term
        const matchesSearch = 
            `${user.nombre} ${user.apellido}`.toLowerCase().includes(searchTermLower) ||
            user.correo.toLowerCase().includes(searchTermLower) ||
            `${user.tipoDocumento} ${user.numeroDocumento}`.toLowerCase().includes(searchTermLower) ||
            (user.telefono || "").toLowerCase().includes(searchTermLower) ||
            (user.estado ? "activo" : "inactivo").includes(searchTermLower) ||
            (user.fechaRegistro
                ? format(new Date(user.fechaRegistro), "dd/MM/yyyy", { locale: es }).toLowerCase()
                : ""
            ).includes(searchTermLower);
            
        if (!matchesSearch) {
            return false;
        }
        
        // Filter by status
        if (statusFilter === "active" && !user.estado) {
            return false;
        }
        if (statusFilter === "inactive" && user.estado) {
            return false;
        }
        
        return true;
    });

    // Paginación
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Resetear la página actual cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleToggleStatus = (userId: string, isActive: boolean) => {
        Swal.fire({
            title: isActive ? '¿Desactivar usuario?' : '¿Activar usuario?',
            text: isActive
                ? '¿Está seguro que desea desactivar este usuario?'
                : '¿Está seguro que desea activar este usuario?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: isActive ? '#d33' : '#000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: isActive ? 'Sí, desactivar' : 'Sí, activar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                onToggleStatus(userId);
                Swal.fire({
                    title: isActive ? 'Desactivado!' : 'Activado!',
                    text: isActive ? 'El usuario ha sido desactivado.' : 'El usuario ha sido activado.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    return (
        <Card className="shadow-sm rounded-lg">
            <CardHeader>
                <CardTitle>Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="search-term">Buscador</Label>
                            <div className="relative">
                                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search-term"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="status-filter">Estado</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="active">Activos</SelectItem>
                                    <SelectItem value="inactive">Inactivos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre Completo</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="hidden md:table-cell">Fecha Registro</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                            No se encontraron usuarios con los criterios de búsqueda
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.nombre} {user.apellido}
                                            </TableCell>
                                            <TableCell>{user.correo}</TableCell>
                                            <TableCell>
                                                {user.tipoDocumento} {user.numeroDocumento}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{user.telefono || "-"}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent inline-flex items-center ${user.estado ? " text-green-800" : " text-red-800"}`}
                                                >
                                                    {user.estado ? "Activo" : "Inactivo"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {user.fechaRegistro ? format(new Date(user.fechaRegistro), "dd/MM/yyyy", { locale: es }) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => onView(user)} title="Ver detalles">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => onEdit(user)} title="Editar">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggleStatus(user.id, user.estado)}
                                                        title={user.estado ? "Desactivar" : "Activar"}
                                                    >
                                                        <Power className={`h-4 w-4 ${user.estado ? "text-red-500" : "text-green-500"}`} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Componente de paginación actualizado para que coincida con el de membresías */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {paginatedUsers.length} de {filteredUsers.length} usuarios
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <span className="sr-only">Anterior</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="h-8 w-8 p-0"
                            >
                                <span className="sr-only">Siguiente</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}