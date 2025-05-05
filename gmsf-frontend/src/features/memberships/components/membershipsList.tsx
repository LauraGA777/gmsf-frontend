import { useEffect, useState } from "react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { ChevronLeft, ChevronRight, Edit, Eye, MoreVertical, Power, Trash } from "lucide-react"
import { showDeleteConfirmation, showSuccess } from "@/shared/lib/sweetAlert"
import { formatCOP } from "@/shared/lib/formatCop"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"


interface Membresia {
    id: number
    nombre: string
    precio: number
    estado: "activo" | "inactivo"
    dias_acceso: number
    vigencia_dias: number
    servicios: string[]
}

const membresias: Membresia[] = [
    {
        id: 1,
        nombre: "Mensual Premium",
        precio: 120000,
        estado: "activo",
        dias_acceso: 30,
        vigencia_dias: 35,
        servicios: ["Gimnasio", "Piscina", "Sauna"],
    },
    {
        id: 2,
        nombre: "Trimestral",
        precio: 300000,
        estado: "activo",
        dias_acceso: 90,
        vigencia_dias: 100,
        servicios: ["Gimnasio", "Piscina", "Sauna", "Clases grupales"],
    },
    {
        id: 3,
        nombre: "Anual",
        precio: 950000,
        estado: "activo",
        dias_acceso: 365,
        vigencia_dias: 380,
        servicios: ["Gimnasio", "Piscina", "Sauna", "Clases grupales", "Entrenador personal"],
    },
    {
        id: 4,
        nombre: "Diario",
        precio: 15000,
        estado: "activo",
        dias_acceso: 1,
        vigencia_dias: 1,
        servicios: ["Gimnasio"],
    },
    {
        id: 5,
        nombre: "Fin de semana",
        precio: 25000,
        estado: "inactivo",
        dias_acceso: 2,
        vigencia_dias: 2,
        servicios: ["Gimnasio", "Piscina"],
    },
]

export function MembershipsList() {
    const [data, setData] = useState<Membresia[]>(membresias)
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleDelete = async (id: number) => {
        const membresia = data.find((item) => item.id === id);
        if (!membresia) return;

        try {
            // Mostrar confirmación con SweetAlert2
            const confirmed = await showDeleteConfirmation(
                membresia.estado === "activo" ? "¿Desactivar membresía?" : "¿Activar membresía?",
                `¿Está seguro que desea ${membresia.estado === "activo" ? "desactivar" : "activar"} la membresía "${membresia.nombre}"?`,
                membresia.servicios,
            );

            if (confirmed) {
                // Crear nuevo array con el estado actualizado
                const newData = data.map((item) => 
                    item.id === id 
                        ? { ...item, estado: item.estado === "activo" ? "inactivo" : "activo" }
                        : item
                );
                // Mostrar notificación de éxito
                showSuccess(
                    membresia.estado === "activo" ? "Membresía desactivada" : "Membresía activada",
                    `La membresía ha sido ${membresia.estado === "activo" ? "desactivada" : "activada"} correctamente`
                );
            }
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            Swal.fire({
                title: 'Error',
                text: 'Hubo un error al actualizar el estado de la membresía',
                icon: 'error'
            });
        }
    };

    // Filtrar membresías según el término de búsqueda y el filtro de estado
    const filteredMembresias = data.filter((membresia) => {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Filtrar por término de búsqueda
        const matchesSearch = 
            membresia.nombre.toLowerCase().includes(searchTermLower) ||
            (membresia.estado ? "activo" : "inactivo").includes(searchTermLower);
            
        if (!matchesSearch) {
            return false;
        }
        
        // Filtrar por estado
        if (statusFilter === "active" && membresia.estado !== "activo") {
            return false;
        }
        if (statusFilter === "inactive" && membresia.estado !== "inactivo") {
            return false;
        }
        
        return true;
    });

    // Paginación
    const paginatedMembresias = filteredMembresias.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredMembresias.length / itemsPerPage);

    // Resetear la página actual cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Función para cambiar de página
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleToggleStatus = (membresiaId: number, isActive: boolean) => {
        Swal.fire({
            title: isActive ? '¿Desactivar membresía?' : '¿Activar membresía?',
            text: isActive
                ? '¿Está seguro que desea desactivar esta membresía?'
                : '¿Está seguro que desea activar esta membresía?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: isActive ? '#d33' : '#000',
            cancelButtonColor: '#6c757d',
            confirmButtonText: isActive ? 'Sí, desactivar' : 'Sí, activar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete(membresiaId);
                Swal.fire({
                    title: isActive ? 'Desactivada!' : 'Activada!',
                    text: isActive ? 'La membresía ha sido desactivada.' : 'La membresía ha sido activada.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };


    return (
        <div>
        <div className="mt-5 rounded-md border">
            <div className="relative overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Vigencia</TableHead>
                            <TableHead>Servicios</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((membresia) => (
                            <TableRow key={membresia.id}>
                                <TableCell className="font-semibold">{membresia.nombre}</TableCell>
                                <TableCell>{formatCOP(membresia.precio)}</TableCell>
                                <TableCell>
                                    <span
                                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent inline-flex items-center ${membresia.estado ? " text-green-800" : " text-red-800"}`}
                                    >
                                        {membresia.estado ? "Activo" : "Inactivo"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {membresia.dias_acceso}/{membresia.vigencia_dias} días
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {membresia.servicios.slice(0, 2).map((servicio, index) => (
                                            <Badge key={index} variant="secondary" className="mr-1">
                                                {servicio}
                                            </Badge>
                                        ))}
                                        {membresia.servicios.length > 2 && (
                                            <Badge variant="secondary">+{membresia.servicios.length - 2}</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                    <Link to={`/membresias/${membresia.id}`}>
                                            <Button variant="ghost" size="icon" title="Editar">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link to={`/membresias/${membresia.id}`}>
                                            <Button variant="ghost" size="icon" title="Editar">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(membresia.id)}
                                            title={membresia.estado ? "Desactivar" : "Activar"}
                                        >
                                            <Power className={`h-4 w-4 ${membresia.estado ? "text-green-500" : "text-red-500"}`} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                
                
            </div>
            
        </div>
        <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {paginatedMembresias.length} de {filteredMembresias.length} membresías
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
    )
}