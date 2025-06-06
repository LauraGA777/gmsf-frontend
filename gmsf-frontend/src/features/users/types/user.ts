export interface User {
    id: string
    tipoDocumento: "CC" | "CE" | "TI" | "TE"
    numeroDocumento: string
    nombre: string
    apellido: string
    correo: string
    telefono?: string
    direccion?: string
    rol: "Administrador" | "Entrenador" | "Cliente" | "Beneficiario"
    fechaNacimiento: string
    estado: boolean
    fechaRegistro: string
    ultimaActividad?: string
    contratosActivos?: number
  }

export interface UserFormData {
    tipoDocumento: string
    numeroDocumento: string
    nombre: string
    apellido: string
    correo: string
    contraseña: string
    confirmarContraseña: string
    rol: string
    fechaNacimiento: string
    telefono?: string
    direccion?: string
  }
  