export interface Training {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  id_entrenador: number;
  id_cliente: number;
  estado: 'Programado' | 'En proceso' | 'Completado' | 'Cancelado';
  notas?: string;
  fecha_creacion: Date;
  created_at: Date;
  updated_at: Date;
  entrenador?: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
  };
  cliente?: {
    id_persona: number;
    codigo: string;
    usuario?: {
      id: number;
      nombre: string;
      apellido: string;
      correo: string;
      telefono?: string;
    };
  };
}

export interface TrainingsResponse {
  data: Training[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface TrainingResponse {
  data: Training;
  message: string;
}

export interface AvailabilityResponse {
  available: boolean;
  conflicts?: Training[];
  message: string;
}
