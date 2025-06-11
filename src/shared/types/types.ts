export type UserRole = 1 | 2 | 3; // Admin | Entrenador | Cliente

export interface Cliente {
  codigo: string;
  nombre: string;
  apellido: string;
  documento: string;
}

export interface Contrato {
  tipo: string;
  estado: "Activo" | "Inactivo" | "Eliminado";
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
  usuario_registro: string;
  usuario_actualizacion: string;
  cliente: Cliente;
  contrato: Contrato;
}