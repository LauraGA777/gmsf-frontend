import type React from "react"
import { usePermissions } from "@/shared/hooks/usePermissions"
import type { PermissionName, PrivilegeName } from "@/shared/services/permissionService"

interface ProtectedComponentProps {
  children: React.ReactNode
  module: PermissionName
  privilege?: PrivilegeName
  fallback?: React.ReactNode
  showLoading?: boolean
}

export function ProtectedComponent({
  children,
  module,
  privilege,
  fallback = null,
  showLoading = false,
}: ProtectedComponentProps) {
  const { hasModuleAccess, hasPrivilege, isLoading } = usePermissions()

  // Mostrar loading si está configurado
  if (isLoading && showLoading) {
    return <div className="animate-pulse">Cargando permisos...</div>
  }

  // Si está cargando y no se debe mostrar loading, no renderizar nada
  if (isLoading) {
    return null
  }

  // Verificar acceso al módulo
  if (!hasModuleAccess(module)) {
    console.log(`🚫 Acceso denegado al módulo: ${module}`)
    return <>{fallback}</>
  }

  // Si se especifica un privilegio, verificarlo
  if (privilege && !hasPrivilege(module, privilege)) {
    console.log(`🚫 Privilegio denegado: ${privilege} en ${module}`)
    return <>{fallback}</>
  }

  console.log(`✅ Acceso concedido a ${module}${privilege ? ` con privilegio ${privilege}` : ""}`)
  return <>{children}</>
}
