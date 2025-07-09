import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'
import { useAuth } from '@/shared/contexts/authContext'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { permissionService, PERMISSIONS, PRIVILEGES } from '@/shared/services/permissionService'
import { roleService } from '@/shared/services/roleService'
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Eye, User, Shield, Settings } from 'lucide-react'

export function PermissionsDebugPage() {
    const { user, isAuthenticated, isInitialized } = useAuth()
    const { hasModuleAccess, hasPrivilege, getAccessibleModules, isLoading } = usePermissions()
    const [debugInfo, setDebugInfo] = useState<any>(null)
    const [rolesInfo, setRolesInfo] = useState<any>(null)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadDebugInfo()
    }, [user, isAuthenticated, isInitialized])

    const loadDebugInfo = async () => {
        try {
            // Obtener información de debug de permisos
            permissionService.debugPermissions()

            // Obtener módulos accesibles
            const accessibleModules = getAccessibleModules()

            // Simular obtención de roles si el usuario está autenticado
            let roleData = null
            if (isAuthenticated && user?.id_rol) {
                try {
                    const roles = await roleService.getRoles(1, 50)
                    roleData = roles
                } catch (error) {
                    console.error("Error obteniendo roles:", error)
                }
            }

            setDebugInfo({
                user,
                isAuthenticated,
                isInitialized,
                isLoading,
                accessibleModules,
                timestamp: new Date().toISOString()
            })

            setRolesInfo(roleData)
        } catch (error) {
            console.error("Error loading debug info:", error)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            if (user?.id && typeof user.id === 'number') {
                await permissionService.initializeWithUserId(user.id)
            }
            await loadDebugInfo()
        } catch (error) {
            console.error("Error refreshing permissions:", error)
        } finally {
            setRefreshing(false)
        }
    }

    const testModulePermissions = () => {
        // Obtener valores únicos para evitar duplicados
        const modules = [...new Set(Object.values(PERMISSIONS))]
        return modules.map((module, index) => ({
            module,
            hasAccess: hasModuleAccess(module as any),
            // Usar índice como parte de la clave para garantizar unicidad
            key: `${module}-${index}`
        }))
    }

    const testPrivilegePermissions = () => {
        // Obtener valores únicos para evitar duplicados
        const privileges = [...new Set(Object.values(PRIVILEGES))]
        return privileges.slice(0, 10).map((privilege, index) => ({
            privilege,
            hasPrivilege: hasPrivilege(PERMISSIONS.CLIENTES as any, privilege as any),
            // Usar índice como parte de la clave para garantizar unicidad
            key: `${privilege}-${index}`
        }))
    }

    const StatusIcon = ({ condition }: { condition: boolean }) => (
        condition ?
            <CheckCircle className="h-4 w-4 text-green-500" /> :
            <XCircle className="h-4 w-4 text-red-500" />
    )

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Debug de Permisos</h1>
                    <p className="text-muted-foreground">
                        Panel de depuración para verificar el sistema de permisos sincronizado
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualizar
                </Button>
            </div>

            {/* Estado General del Sistema */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Estado General del Sistema
                    </CardTitle>
                    <CardDescription>
                        Información sobre el estado actual de autenticación y permisos
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                        <StatusIcon condition={isAuthenticated} />
                        <span className="text-sm">Autenticado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusIcon condition={isInitialized} />
                        <span className="text-sm">Inicializado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusIcon condition={!isLoading} />
                        <span className="text-sm">Permisos Cargados</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusIcon condition={!!user?.id_rol} />
                        <span className="text-sm">Rol Asignado</span>
                    </div>
                </CardContent>
            </Card>

            {/* Información del Usuario */}
            {user && (
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
                                <label className="text-sm font-medium text-muted-foreground">ID</label>
                                <p className="text-sm">{user.id}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                <p className="text-sm">{user.nombre}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-sm">{user.correo}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">ID Rol</label>
                                <p className="text-sm">{user.id_rol}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Módulos Accesibles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Módulos Accesibles
                    </CardTitle>
                    <CardDescription>
                        Módulos a los que el usuario actual tiene acceso
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {debugInfo?.accessibleModules?.map((module: any) => (
                            <Badge key={module.name} variant="secondary" className="justify-center p-2">
                                {module.name}
                            </Badge>
                        ))}
                        {(!debugInfo?.accessibleModules || debugInfo.accessibleModules.length === 0) && (
                            <div className="col-span-full text-center text-muted-foreground py-4">
                                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                No hay módulos accesibles o usuario no autenticado
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Test de Permisos por Módulo */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Test de Permisos por Módulo
                    </CardTitle>
                    <CardDescription>
                        Verificación de acceso a cada módulo del sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {testModulePermissions().map(({ module, hasAccess, key }) => (
                            <div key={key} className="flex items-center justify-between p-3 border rounded">
                                <span className="text-sm font-medium">{module}</span>
                                <StatusIcon condition={hasAccess} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Test de Privilegios (muestra) */}
            <Card>
                <CardHeader>
                    <CardTitle>Test de Privilegios (Muestra - CLIENTES)</CardTitle>
                    <CardDescription>
                        Verificación de privilegios específicos para el módulo CLIENTES
                    </CardDescription>
                </CardHeader>
                <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testPrivilegePermissions().map(({ privilege, hasPrivilege: hasPriv, key }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded">
                <span className="text-sm font-medium">{privilege}</span>
                <StatusIcon condition={hasPriv} />
              </div>
            ))}
          </div>
                </CardContent>
            </Card>

            {/* Información de Roles (si disponible) */}
            {rolesInfo && (
                <Card>
                    <CardHeader>
                        <CardTitle>Roles del Sistema</CardTitle>
                        <CardDescription>
                            Roles disponibles en el sistema (desde API)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            <p><strong>Total roles:</strong> {rolesInfo.total || 0}</p>
                            <p><strong>Página:</strong> {rolesInfo.pagina || 1}</p>
                            <Separator className="my-3" />
                            <div className="space-y-2">
                                {rolesInfo.roles?.slice(0, 5).map((role: any) => (
                                    <div key={role.id} className="flex items-center justify-between p-2 border rounded">
                                        <div>
                                            <span className="font-medium">{role.nombre}</span>
                                            <span className="text-muted-foreground ml-2">({role.codigo})</span>
                                        </div>
                                        <Badge variant={role.estado ? "default" : "secondary"}>
                                            {role.estado ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Debug Info Raw */}
            <Card>
                <CardHeader>
                    <CardTitle>Información de Debug (Raw)</CardTitle>
                    <CardDescription>
                        Datos técnicos para desarrolladores
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
