export interface Role {
  createdBy: string
  id: string
  name: string
  description: string
  status: "Activo" | "Inactivo"
  permissions: Permissions[]
  createdAt: string
  updatedAt: string
  userCount?: number
  isActive: boolean
}

export type RoleFormData = Omit<Role, "id" | "createdAt" | "updatedAt" | "userCount">
