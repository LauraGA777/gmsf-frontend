import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/shared/contexts/authContext"
import { usePermissions } from "@/shared/hooks/usePermissions"
import type { PermissionName, PrivilegeName } from "@/shared/services/permissionService"

// ✅ ROLES SINCRONIZADOS CON EL BACKEND
export const BACKEND_ROLES = {
    ADMINISTRADOR: 1,
    ENTRENADOR: 2,
    RECEPCIONISTA: 3,
    CLIENTE: 4
} as const

interface PermissionProtectedRouteProps {
    children: React.ReactNode
    requiredModule: PermissionName
    requiredPrivilege?: PrivilegeName | PrivilegeName[] // Puede ser uno o varios privilegios
    requireAllPrivileges?: boolean // Si se requieren TODOS los privilegios o solo uno
    // 🚨 ELIMINADOS: fallbackRoles, allowedRoles - Solo permisos de BD
    // 🚨 ELIMINADOS: strictMode - Siempre modo estricto por defecto
    emergencyBypass?: boolean // Solo para casos críticos de emergencia (ej: admin sin permisos)
}

export function PermissionProtectedRoute({
    children,
    requiredModule,
    requiredPrivilege,
    requireAllPrivileges = false,
    emergencyBypass = false // Solo para casos críticos
}: PermissionProtectedRouteProps) {
    const { isAuthenticated, isLoading, user, isInitialized, error } = useAuth()
    const { hasModuleAccess, hasPrivilege, hasAnyPrivilege, hasAllPrivileges, isLoading: permissionsLoading } = usePermissions()
    const location = useLocation()

    // 🔄 Loading state - Mejorado con más contexto
    if (isLoading || permissionsLoading || !isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">
                        {isLoading ? "Verificando autenticación..." :
                            permissionsLoading ? "Cargando permisos..." :
                                "Inicializando aplicación..."}
                    </p>
                </div>
            </div>
        )
    }

    // ❌ Error state - Nuevo manejo de errores
    if (error) {
        console.error("🚨 Error en PermissionProtectedRoute:", error)
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
                <div className="text-center max-w-md p-6">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error de Autenticación</h2>
                    <p className="text-red-600 mb-4">
                        No se pudieron cargar los permisos de usuario. Por favor, inicie sesión nuevamente.
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Ir a Login
                    </button>
                </div>
            </div>
        )
    }

    // 🚫 Not authenticated
    if (!isAuthenticated) {
        console.log("🚫 Usuario no autenticado, redirigiendo a login")
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // 🔍 Verificación de usuario válido
    if (!user) {
        console.error("❌ Usuario autenticado pero datos de usuario no disponibles")
        return <Navigate to="/login" state={{ from: location, error: "Datos de usuario no disponibles" }} replace />
    }

    // 🎭 Verificación de rol válido
    if (!user.id_rol) {
        console.warn("⚠️ Usuario sin rol asignado:", user.id)
        return (
            <div className="flex items-center justify-center min-h-screen bg-yellow-50">
                <div className="text-center max-w-md p-6">
                    <div className="text-yellow-500 text-6xl mb-4">🎭</div>
                    <h2 className="text-xl font-semibold text-yellow-800 mb-2">Sin Rol Asignado</h2>
                    <p className="text-yellow-600">
                        Su usuario no tiene un rol asignado. Contacte al administrador.
                    </p>
                </div>
            </div>
        )
    }

    // 🎯 LÓGICA DE AUTORIZACIÓN ESTRICTA - SOLO BASE DE DATOS

    // 1. 🔍 Verificar acceso al módulo requerido (OBLIGATORIO)
    const hasModulePermission = hasModuleAccess(requiredModule)
    console.log(`🔍 [BD] Verificando acceso al módulo "${requiredModule}":`, hasModulePermission)
    
    if (!hasModulePermission) {
        // 🚨 BYPASS DE EMERGENCIA SOLO PARA ADMIN (usar con extrema precaución)
        if (emergencyBypass && user.id_rol === BACKEND_ROLES.ADMINISTRADOR) {
            console.warn(`⚠️ [EMERGENCIA] Bypass activado para admin en módulo "${requiredModule}" - REVISAR PERMISOS EN BD`)
            return <>{children}</>
        }
        
        console.log(`❌ [BD] Acceso denegado: sin permisos para el módulo "${requiredModule}"`)
        return <Navigate to="/not-authorized" replace />
    }

    // 2. 🔑 Verificar privilegios específicos (si se requieren)
    if (requiredPrivilege) {
        let hasRequiredPrivilege = false
        
        if (Array.isArray(requiredPrivilege)) {
            // Si se pasa un array de privilegios
            const privilegeList = requiredPrivilege as PrivilegeName[]
            
            if (requireAllPrivileges) {
                hasRequiredPrivilege = hasAllPrivileges(requiredModule, privilegeList)
                console.log(`🔑 [BD] Verificando TODOS los privilegios [${privilegeList.join(', ')}] para "${requiredModule}":`, hasRequiredPrivilege)
            } else {
                hasRequiredPrivilege = hasAnyPrivilege(requiredModule, privilegeList)
                console.log(`🔑 [BD] Verificando ALGÚN privilegio [${privilegeList.join(', ')}] para "${requiredModule}":`, hasRequiredPrivilege)
            }
        } else {
            // Si se pasa un solo privilegio
            hasRequiredPrivilege = hasPrivilege(requiredModule, requiredPrivilege)
            console.log(`🔑 [BD] Verificando privilegio "${requiredPrivilege}" para "${requiredModule}":`, hasRequiredPrivilege)
        }
        
        if (!hasRequiredPrivilege) {
            // 🚨 BYPASS DE EMERGENCIA SOLO PARA ADMIN (usar con extrema precaución)
            if (emergencyBypass && user.id_rol === BACKEND_ROLES.ADMINISTRADOR) {
                console.warn(`⚠️ [EMERGENCIA] Bypass activado para admin en privilegio "${requiredPrivilege}" - REVISAR PERMISOS EN BD`)
                return <>{children}</>
            }
            
            console.log(`❌ [BD] Acceso denegado: sin privilegios requeridos para "${requiredModule}"`)
            return <Navigate to="/not-authorized" replace />
        }
    }

    // 3. ✅ Acceso concedido basado en permisos de BD
    console.log(`✅ [BD] Acceso concedido a "${requiredModule}" para usuario ${user.id} con rol ${user.id_rol} - Permisos verificados en BD`)
    return <>{children}</>
}
