export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  isActive: boolean
  status?: string
  createdAt?: Date
}

export type ServiceFormData = Omit<Service, "id">
