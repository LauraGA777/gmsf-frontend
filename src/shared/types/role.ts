export interface Permission {
  id: number
  nombre: string
  estado: boolean
  privilegios?: Privilege[]
}

export interface Privilege {
  id: number
  nombre: string
  id_permiso: number
}

export interface Role {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  estado: boolean
  permisos?: Permission[]
  privilegios?: Privilege[]
  createdAt: Date
  updatedAt: Date
  userCount?: number
  // Campos para compatibilidad con el frontend actual
  name: string
  description: string
  status: "Activo" | "Inactivo"
  isActive: boolean
  permissions?: Permission[]
  createdBy?: string
}

export type RoleFormData = Omit<Role, "id" | "createdAt" | "updatedAt" | "userCount" | "codigo">

// Tipos para el manejo de permisos en el frontend
export interface PermissionSelection {
  permissionId: number
  permissionName: string
  privileges: {
    id: number
    name: string
    selected: boolean
  }[]
}
