import { useState } from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Label } from "@/shared/components/ui/label"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Search } from "lucide-react"

export function MembershipsFilters() {
    const [estado, setEstado] = useState<string>("todos")
    const [busqueda, setBusqueda] = useState<string>("")

    return (
        <Card className="mt-3">
            <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="busqueda">Buscar</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="busqueda"
                                type="text"
                                placeholder="Buscar membresía..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Select value={estado} onValueChange={setEstado}>
                            <SelectTrigger id="estado">
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="activo">Activo</SelectItem>
                                <SelectItem value="inactivo">Inactivo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}