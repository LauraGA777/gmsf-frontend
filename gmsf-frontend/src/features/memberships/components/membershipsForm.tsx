import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Button } from "@/shared/components/ui/button"
import { Switch } from "@/shared/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { X } from "lucide-react"
import { showError, showSuccess } from "@/shared/lib/sweetAlert"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { formatCOP } from "@/shared/lib/formatCop"

interface Servicio {
    id: number
    nombre: string
    estado: "activo" | "inactivo"
    precio: number
    duracion_clase: number
}

interface ServicioSeleccionado extends Servicio {
    cantidad: number
}

interface MembresiaFormProps {
    id: number | null
}

const servicios: Servicio[] = [
    { id: 1, nombre: "Gimnasio", estado: "activo", precio: 50000, duracion_clase: 0 },
    { id: 2, nombre: "Piscina", estado: "activo", precio: 35000, duracion_clase: 0 },
    { id: 3, nombre: "Sauna", estado: "activo", precio: 25000, duracion_clase: 0 },
    { id: 4, nombre: "Clases grupales", estado: "activo", precio: 40000, duracion_clase: 60 },
    { id: 5, nombre: "Entrenador personal", estado: "activo", precio: 80000, duracion_clase: 45 },
    { id: 6, nombre: "Yoga", estado: "activo", precio: 30000, duracion_clase: 90 },
    { id: 7, nombre: "Pilates", estado: "activo", precio: 35000, duracion_clase: 60 },
    { id: 8, nombre: "Spinning", estado: "activo", precio: 30000, duracion_clase: 45 },
    { id: 9, nombre: "Boxeo", estado: "activo", precio: 40000, duracion_clase: 60 },
    { id: 10, nombre: "Nutrición", estado: "activo", precio: 60000, duracion_clase: 30 },
]

export function MembershipsForm({ id }: MembresiaFormProps) {
    const navigate = useNavigate()

    const [nombre, setNombre] = useState("")
    const [precio, setPrecio] = useState("")
    const [diasAcceso, setDiasAcceso] = useState("")
    const [vigenciaDias, setVigenciaDias] = useState("")
    const [estado, setEstado] = useState(true)
    const [selectedServicios, setSelectedServicios] = useState<ServicioSeleccionado[]>([])
    const [servicioActual, setServicioActual] = useState<string>("")
    const [cantidadServicio, setCantidadServicio] = useState<number>(1)

    const [errors, setErrors] = useState<{
        nombre?: string
        precio?: string
        diasAcceso?: string
        vigenciaDias?: string
    }>({})

    useEffect(() => {
        if (id) {
            // Aquí iría la lógica para cargar los datos de la membresía
            // Por ahora usamos datos de ejemplo
            setNombre("Mensual Premium")
            setPrecio("120000")
            setDiasAcceso("30")
            setVigenciaDias("35")
            setEstado(true)
            setSelectedServicios([
                { id: 1, nombre: "Gimnasio", estado: "activo", precio: 50000, duracion_clase: 0, cantidad: 1 },
                { id: 2, nombre: "Piscina", estado: "activo", precio: 35000, duracion_clase: 0, cantidad: 1 },
                { id: 3, nombre: "Sauna", estado: "activo", precio: 25000, duracion_clase: 0, cantidad: 1 },
            ])
        }
    }, [id])

    const validateForm = () => {
        const newErrors: {
            nombre?: string
            precio?: string
            diasAcceso?: string
            vigenciaDias?: string
        } = {}

        if (!nombre || nombre.length < 3) {
            newErrors.nombre = "El nombre debe tener al menos 3 caracteres"
        }

        if (!precio || Number.parseFloat(precio) <= 0) {
            newErrors.precio = "El precio debe ser mayor a $0"
        }

        if (!diasAcceso || Number.parseInt(diasAcceso) <= 0) {
            newErrors.diasAcceso = "Los días de acceso deben ser mayores a 0"
        }

        if (!vigenciaDias || Number.parseInt(vigenciaDias) <= 0) {
            newErrors.vigenciaDias = "La vigencia debe ser mayor a 0"
        } else if (Number.parseInt(vigenciaDias) < Number.parseInt(diasAcceso)) {
            newErrors.vigenciaDias = "La vigencia debe ser mayor o igual a los días de acceso"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        // Aquí iría la lógica para guardar la membresía

        showSuccess(
            id ? "Membresía actualizada" : "Membresía creada",
            id ? "La membresía ha sido actualizada correctamente" : "La membresía ha sido creada correctamente",
        )

        navigate("/membresia")
    }

    const handleAddServicio = () => {
        if (!servicioActual) return

        const servicio = servicios.find((s) => s.id.toString() === servicioActual)
        if (!servicio) return

        // Verificar si ya existe para evitar duplicados
        if (selectedServicios.some((s) => s.id === servicio.id)) {
            showError("Servicio duplicado", "Este servicio ya ha sido agregado a la membresía")
            return
        }

        setSelectedServicios([...selectedServicios, { ...servicio, cantidad: cantidadServicio }])
        setServicioActual("")
        setCantidadServicio(1) // Resetear la cantidad a 1 después de agregar
    }

    const handleRemoveServicio = (id: number) => {
        setSelectedServicios(selectedServicios.filter((s) => s.id !== id))
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">
                                Nombre <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className={errors.nombre ? "border-red-500" : ""}
                            />
                            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="precio">
                                Precio (COP) <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="precio"
                                    type="number"
                                    min="0"
                                    value={precio}
                                    onChange={(e) => setPrecio(e.target.value)}
                                    className={errors.precio ? "border-red-500" : ""}
                                />
                            </div>
                            {errors.precio && <p className="text-xs text-red-500">{errors.precio}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dias-acceso">
                                Días de acceso <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="dias-acceso"
                                type="number"
                                min="1"
                                value={diasAcceso}
                                onChange={(e) => setDiasAcceso(e.target.value)}
                                className={errors.diasAcceso ? "border-red-500" : ""}
                            />
                            {errors.diasAcceso && <p className="text-xs text-red-500">{errors.diasAcceso}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vigencia-dias">
                                Vigencia (días) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="vigencia-dias"
                                type="number"
                                min="1"
                                value={vigenciaDias}
                                onChange={(e) => setVigenciaDias(e.target.value)}
                                className={errors.vigenciaDias ? "border-red-500" : ""}
                            />
                            {errors.vigenciaDias && <p className="text-xs text-red-500">{errors.vigenciaDias}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="estado" checked={estado} onCheckedChange={setEstado} />
                            <Label htmlFor="estado">Activo</Label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Servicios asociados</Label>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="md:col-span-2">
                                <Select value={servicioActual} onValueChange={setServicioActual}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar servicio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {servicios
                                            .filter((s) => s.estado === "activo")
                                            .map((servicio) => (
                                                <SelectItem key={servicio.id} value={servicio.id.toString()}>
                                                    {servicio.nombre} - {formatCOP(servicio.precio)}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={cantidadServicio}
                                        onChange={(e) => setCantidadServicio(Number(e.target.value))}
                                        placeholder="Cantidad"
                                    />
                                </div>
                                <Button type="button" variant="outline" className="w-1/2" onClick={handleAddServicio}>
                                    Agregar
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Servicio</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Precio</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedServicios.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                No hay servicios asociados a esta membresía
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        selectedServicios.map((servicio) => (
                                            <TableRow key={servicio.id}>
                                                <TableCell>{servicio.nombre}</TableCell>
                                                <TableCell>{servicio.cantidad}</TableCell>
                                                <TableCell>{formatCOP(servicio.precio * servicio.cantidad)}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleRemoveServicio(servicio.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        <span className="sr-only">Eliminar {servicio.nombre}</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={2}>Total</TableCell>
                                        <TableCell colSpan={2}>
                                            {formatCOP(
                                                selectedServicios.reduce((total, servicio) => total + servicio.precio * servicio.cantidad, 0),
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate("/membresia")}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-black hover:bg-gray-800">
                            {id ? "Actualizar" : "Crear"} Membresía
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}