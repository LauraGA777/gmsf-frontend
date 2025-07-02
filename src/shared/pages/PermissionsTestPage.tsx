import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { usePermissions } from "@/shared/hooks/usePermissions"
import { useAuth } from "@/shared/contexts/authContext"
import { Shield, CheckCircle, XCircle, User } from "lucide-react"

export function PermissionsTestPage() {
    const { user } = useAuth()
    const { hasModuleAccess, hasPrivilege, getAccessibleModules } = usePermissions()

    const modules = [
        "Panel de control",
        "Gestión de roles",
        "Gestión de usuarios",
        "Gestión de entrenadores",
        "Gestión de servicios",
        "Gestión de clientes",
        "Gestión de contratos",
        "Gestión de membresías",
        "Control de asistencia"
    ] as const

    const privileges = ["Crear", "Leer", "Actualizar", "Eliminar"] as const

    const accessibleModules = getAccessibleModules()

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold">Sistema de Permisos</h1>
                    <p className="text-gray-600">
                        Estado actual de permisos para el usuario: <strong>{user?.nombre}</strong>
                    </p>
                </div>
            </div>

            {/* Info del usuario */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Información del Usuario
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Nombre</p>
                            <p className="font-medium">{user?.nombre}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user?.correo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">ID Rol</p>
                            <Badge variant="outline">{user?.id_rol}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Módulos accesibles */}
            <Card>
                <CardHeader>
                    <CardTitle>Módulos Accesibles ({accessibleModules.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {accessibleModules.map((module) => (
                            <div key={module.name} className="p-3 border rounded-lg">
                                <h4 className="font-medium text-sm">{module.name}</h4>
                                <p className="text-xs text-gray-500">{module.route}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {module.privileges.map((priv) => (
                                        <Badge key={priv} variant="secondary" className="text-xs">
                                            {priv}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Matriz de permisos */}
            <Card>
                <CardHeader>
                    <CardTitle>Matriz de Permisos Detallada</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="text-left p-2 border-b font-medium">Módulo</th>
                                    <th className="text-center p-2 border-b font-medium">Acceso</th>
                                    {privileges.map((priv) => (
                                        <th key={priv} className="text-center p-2 border-b font-medium text-sm">
                                            {priv}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map((module) => {
                                    const hasAccess = hasModuleAccess(module)
                                    return (
                                        <tr key={module} className="hover:bg-gray-50">
                                            <td className="p-2 border-b text-sm font-medium">{module}</td>
                                            <td className="p-2 border-b text-center">
                                                {hasAccess ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                                                )}
                                            </td>
                                            {privileges.map((priv) => {
                                                const hasPriv = hasPrivilege(module, priv)
                                                return (
                                                    <td key={priv} className="p-2 border-b text-center">
                                                        {hasAccess && hasPriv ? (
                                                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
