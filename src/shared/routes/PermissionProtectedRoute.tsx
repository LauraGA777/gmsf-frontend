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
    emergencyBypass = false
}: PermissionProtectedRouteProps) {
    const { isAuthenticated, isLoading: authLoading, user, isInitialized, error } = useAuth()
    const {
        hasModuleAccess,
        hasPrivilege,
        hasAnyPrivilege,
        hasAllPrivileges,
        isLoading: permissionsLoading,
        isReady: permissionsReady,
        lastError: permissionsError
    } = usePermissions()
    const location = useLocation()

    // 🔄 ESTADOS DE CARGA MEJORADOS
    const isAppLoading = authLoading || permissionsLoading || !isInitialized || !permissionsReady
    const hasErrors = error || permissionsError

    // 🔄 Loading state - Más específico y detallado
    if (isAppLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center max-w-md p-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando aplicación</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {authLoading ? "🔐 Verificando autenticación..." :
                            permissionsLoading ? "🔑 Cargando permisos del usuario..." :
                                !isInitialized ? "⚙️ Inicializando sistema..." :
                                    !permissionsReady ? "🎯 Finalizando configuración..." :
                                        "📋 Preparando interfaz..."}
                    </p>
                    <div className="text-xs text-gray-500">
                        Por favor espere mientras se configura su sesión
                    </div>
                </div>
            </div>
        )
    }

    // ❌ Error state SOLO después de intentar cargar
    if (hasErrors) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
                <div className="text-center max-w-md p-6">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar permisos</h2>
                    <p className="text-red-600 mb-4">
                        {permissionsError || error || "Error desconocido al cargar los permisos del usuario"}
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Reintentar
                        </button>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // 🚫 Not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // 🔍 Verificación de usuario válido
    if (!user) {
        return <Navigate to="/login" state={{ from: location, error: "Datos de usuario no disponibles" }} replace />
    }

    // 🎭 Verificación de rol válido
    if (!user.id_rol) {
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

    if (!hasModulePermission) {
        // 🚨 BYPASS DE EMERGENCIA SOLO PARA ADMIN (usar con extrema precaución)
        if (emergencyBypass && user.id_rol === BACKEND_ROLES.ADMINISTRADOR) {
            return <>{children}</>
        }

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
                } else {
                hasRequiredPrivilege = hasAnyPrivilege(requiredModule, privilegeList)
                }
        } else {
            // Si se pasa un solo privilegio
            hasRequiredPrivilege = hasPrivilege(requiredModule, requiredPrivilege)
            }

        if (!hasRequiredPrivilege) {
            // 🚨 BYPASS DE EMERGENCIA SOLO PARA ADMIN (usar con extrema precaución)
            if (emergencyBypass && user.id_rol === BACKEND_ROLES.ADMINISTRADOR) {
                return <>{children}</>
            }
            return <Navigate to="/not-authorized" replace />
        }
    }

    // 3. ✅ Acceso concedido basado en permisos de BD
    return <>{children}</>
}
