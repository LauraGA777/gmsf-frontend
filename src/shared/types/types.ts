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
  fecha_uso: string; // Formato: "2025-08-16"
  hora_registro: string; // Formato: "19:21:22"
  estado: "Activo" | "Eliminado";
  fecha_registro: string; // Formato: "2025-08-16T14:21:22.119Z" o "2025-08-16 14:01:58.831+00"
  fecha_actualizacion: string;
  usuario_registro: number;
  usuario_actualizacion: number | null;
  
  // ✅ Campos adicionales que pueden venir del backend
  contrato?: {
    id: number;
    codigo: string;
    id_persona: number;
    id_membresia: number;
    fecha_inicio: string;
    membresia?: {
      nombre: string;
    };
  };
  
  // ✅ Campos calculados para la vista
  fechaFormateada?: string;
  diaDeLaSemana?: string;
  horaFormateada?: string;
}