export interface Membership {
  id: string
  code: string
  name: string
  description: string
  price: number
  accessDays: number
  validityDays: number
  isActive: boolean
  createdAt: Date
  activeContracts: number
}

export interface MembershipFormData {
  name: string
  description: string
  price: number
  accessDays: number
  validityDays: number
}

export interface ValidationErrors {
  name?: string
  description?: string
  price?: string
  accessDays?: string
  validityDays?: string
}

export type FilterStatus = "all" | "active" | "inactive"
