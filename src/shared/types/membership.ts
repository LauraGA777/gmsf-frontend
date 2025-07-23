export interface Membership {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  precio: number
  dias_acceso: number
  vigencia_dias: number
  estado: boolean
  fecha_creacion: string
  acceso?: string
  precio_formato?: string
}

export interface MembershipFormData {
  nombre: string
  descripcion: string
  precio: number
  dias_acceso: number
  vigencia_dias: number
}

export interface ValidationErrors {
  nombre?: string
  descripcion?: string
  precio?: string
  dias_acceso?: string
  vigencia_dias?: string
}

export type FilterStatus = "all" | "active" | "inactive"
