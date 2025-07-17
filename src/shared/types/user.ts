export interface User {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  genero?: 'M' | 'F' | 'O';
  tipo_documento: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
  numero_documento: string;
  fecha_nacimiento: Date;
  contrasena?: string;
  estado: boolean;
  id_rol?: number;
  asistencias_totales: number;
  fecha_actualizacion?: Date;
  fecha_creacion?: Date;
  // Campos adicionales para compatibilidad
  avatar?: string;
  // Relaciones
  role?: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    estado: boolean;
  };
}

export interface UserFormData {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  genero?: 'M' | 'F' | 'O';
  tipo_documento: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
  numero_documento: string;
  fecha_nacimiento: string;
  contrasena?: string;
  estado?: boolean;
  id_rol?: number;
}

// Respuesta de la API para usuarios
export interface UserResponse {
  data: User;
  message?: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
} 