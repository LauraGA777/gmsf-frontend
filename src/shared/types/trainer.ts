// Tipos que coinciden con el backend
export interface User {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string
  direccion?: string
  genero?: string
  tipo_documento?: string
  numero_documento: string
  fecha_nacimiento?: string | Date
}

export interface Trainer {
  id: number
  codigo: string
  id_usuario: number
  fecha_registro: string | Date
  especialidad: string
  estado: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
  usuario?: User
}

// Para el formulario del frontend
export interface TrainerFormData {
  numero_documento: string
  especialidad: string
  estado?: boolean
}

// Para mapear los datos del usuario al formulario
export interface TrainerDisplayData {
  id?: number
  codigo?: string
  name: string
  lastName: string
  email: string
  phone: string
  address: string
  gender: string
  documentType: string
  documentNumber: string
  birthDate: Date | string
  specialty: string
  hireDate: Date | string
  isActive: boolean
  services: string[]
}
