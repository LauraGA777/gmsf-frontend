// Interfaces del Backend
export interface IPermission {
  id: number
  nombre: string
  descripcion?: string
  codigo: string
  estado: boolean
  privilegios?: IPrivilege[]
}

export interface IPrivilege {
  id: number
  nombre: string
  descripcion?: string
  codigo: string
  id_permiso?: number
}

export interface IRole {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  estado: boolean
  permisos?: IPermission[]
  privilegios?: IPrivilege[]
  usuarios?: any[] // Para la asociación con usuarios
  fecha_creacion?: Date
  fecha_actualizacion?: Date
  // Mantener compatibilidad con el frontend existente
  createdAt?: Date
  updatedAt?: Date
}

// Interfaces del Frontend
export interface Permission extends IPermission {
  privileges?: Privilege[] // Versión frontend de privilegios
}

export interface Privilege extends IPrivilege {
  selected?: boolean // Para UI
}

export interface Role extends IRole {
  // Campos adicionales para el frontend
  name: string // Alias para nombre
  description: string // Alias para descripcion
  status: "Activo" | "Inactivo" // Representación UI del estado
  isActive: boolean // Alias para estado
  permissions?: Permission[] // Alias para permisos
}

// Tipo para el formulario de roles
export type RoleFormData = Omit<
  Role,
  "id" | "createdAt" | "updatedAt" | "fecha_creacion" | "fecha_actualizacion" | "codigo" | "permisos" | "privilegios" | "usuarios"
> & {
  permissions?: number[] // IDs de permisos
  privileges?: number[] // IDs de privilegios
}

// Interfaz para la selección de permisos en el frontend
export interface PermissionSelection {
  permissionId: number
  permissionName: string
  permissionCode: string
  permissionDescription?: string
  module?: string // Nuevo campo para agrupar por módulo
  description?: string
  privileges: {
    id: number
    name: string
    code: string
    selected: boolean
  }[]
  selected?: boolean // Para manejar la selección del permiso completo
}

// Tipos para las respuestas de la API
export interface ApiResponse<T> {
  status: "success" | "error"
  message?: string
  data?: T
}

export interface RoleResponse {
  role: IRole
}

export interface RolesResponse {
  roles: IRole[]
  total: number
  pagina: number
  limite: number
  total_paginas: number
}

export interface PermissionsResponse {
  permisos: IPermission[]
}

// Tipos para la respuesta del backend con módulos
export interface IModulo {
  id: number
  nombre: string
  descripcion?: string
  permisos: IPermission[]
}

export interface ModulosResponse {
  modulos: IModulo[]
}

// Tipos para la respuesta del endpoint de rol con permisos
export interface RoleWithPermissionsResponse {
  rol: IRole
  modulos: {
    nombre: string
    permiso?: IPermission // Permiso principal del módulo (opcional)
    permisos?: IPermission[] // Array de permisos (para compatibilidad legacy)
    privilegios?: IPrivilege[] // Privilegios directos del módulo
  }[]
  resumen?: {
    total_modulos: number
    total_permisos: number
    total_privilegios: number
  }
}

// Interfaz para información de usuarios asociados a roles
export interface UserInfo {
  id: number
  codigo: string
  nombre: string
  apellido: string
  correo: string
  estado?: boolean
  fecha_creacion?: Date
  fecha_actualizacion?: Date
}

// Respuesta del backend para usuarios por rol
export interface UsersResponse {
  usuarios: UserInfo[]
}