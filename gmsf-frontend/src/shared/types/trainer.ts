export interface Trainer {
  id: string
  name: string
  lastName: string
  email: string
  phone: string
  address: string
  gender: string
  documentType: string
  documentNumber: string
  birthDate: Date
  specialty: string
  bio?: string
  hireDate: Date
  isActive: boolean
  services: string[]
}

export type TrainerFormData = Omit<Trainer, "id">
