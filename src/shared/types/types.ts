export type UserRole = 1 | 2 | 3 | 4; // Admin | Entrenador | Cliente | Beneficario

export interface Usuario {
  nombre: string;
  apellido: string;
  numero_documento: string;
}

export interface Persona {
  id_persona: number;
  codigo: string;
  id_usuario: number;
  id_titular: number | null;
  relacion: string | null;
  fecha_registro: string;
  fecha_actualizacion: string;
  estado: boolean;
  usuario: Usuario;
}

export interface Membresia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  dias_acceso: number;
  vigencia_dias: number;
  precio: string;
  fecha_creacion: string;
  estado: boolean;
}

export interface Contrato {
  id: number;
  codigo: string;
  id_persona: number;
  id_membresia: number;
  fecha_inicio: string;
  fecha_fin: string;
  membresia_precio: string;
  estado: "Activo" | "Inactivo" | "Eliminado";
  fecha_registro: string;
  fecha_actualizacion: string;
  usuario_registro: number | null;
  usuario_actualizacion: number | null;
  membresia: Membresia;
}

export interface AttendanceRecord {
  id: number;
  id_persona: number;
  id_contrato: number;
  fecha_uso: string;
  hora_registro: string;
  estado: "Activo" | "Eliminado";
  fecha_registro: string;
  fecha_actualizacion: string;
  usuario_registro: number | null;
  usuario_actualizacion: number | null;
  persona: Persona;
  contrato: Contrato;
}