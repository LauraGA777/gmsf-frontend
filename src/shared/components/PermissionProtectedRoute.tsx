import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/shared/contexts/authContext"
import { usePermissions } from "@/shared/hooks/usePermissions"
import type { PermissionName, PrivilegeName } from "@/shared/services/permissionService"

interface PermissionProtectedRouteProps {
    children: React.ReactNode
    requiredModule: PermissionName
    requiredPrivilege?: PrivilegeName
    fallbackRoles?: number[] // Roles que siempre tienen acceso (ej: admin)
}

export function PermissionProtectedRoute({
    children,
    requiredModule,
    requiredPrivilege,
    fallbackRoles = [1] // Por defecto, admin siempre tiene acceso
}: PermissionProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth()
    const { hasModuleAccess, hasPrivilege, isLoading: permissionsLoading } = usePermissions()
    const location = useLocation()

    // Loading state
    if (isLoading || permissionsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check fallback roles first (admin access)
    if (user?.id_rol && fallbackRoles.includes(user.id_rol)) {
        return <>{children}</>
    }

    // Check module access
    if (!hasModuleAccess(requiredModule)) {
        return <Navigate to="/not-authorized" replace />
    }

    // Check specific privilege if required
    if (requiredPrivilege && !hasPrivilege(requiredModule, requiredPrivilege)) {
        return <Navigate to="/not-authorized" replace />
    }

    return <>{children}</>
}
