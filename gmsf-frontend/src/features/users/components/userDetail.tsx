import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { User } from "../types/user";

interface UserDetailProps {
    user: User;
    onBack: () => void;
    onEdit: () => void;
}

export function UserDetail({ user, onBack, onEdit }: UserDetailProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle>Detalles del Usuario</CardTitle>
                    </div>
                    <Button
                        size="sm"
                        onClick={onEdit}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white py-2 h-9 text-sm px-4 bg-black hover:bg-gray-800"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Nombre Completo</h3>
                            <p className="mt-1 text-lg">
                                {user.nombre} {user.apellido}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Documento</h3>
                            <p className="mt-1">
                                {user.tipoDocumento} {user.numeroDocumento}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <p className="mt-1">{user.email}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Género</h3>
                            <p className="mt-1">{user.genero}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                            <span
                                className={`mt-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent inline- items-center ${user.estado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                    }`}
                            >
                                {user.estado ? "Activo" : "Inactivo"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                            <p className="mt-1">{user.telefono || "No especificado"}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                            <p className="mt-1">{user.direccion || "No especificada"}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Fecha de Nacimiento</h3>
                            <p className="mt-1">
                                {user.fechaNacimiento
                                    ? format(new Date(user.fechaNacimiento), "dd MMMM yyyy", { locale: es })
                                    : "No especificada"}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Fecha de Registro</h3>
                            <p className="mt-1">
                                {user.fechaRegistro
                                    ? format(new Date(user.fechaRegistro), "dd MMMM yyyy, HH:mm", { locale: es })
                                    : "No disponible"}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={onBack}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white py-2 h-9 text-sm px-4 bg-black hover:bg-gray-800"
                >
                    Volver
                </Button>
            </CardFooter>
        </Card>
    );
}