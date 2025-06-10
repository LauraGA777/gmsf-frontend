export interface Client {
  id_persona: number;
  id_usuario?: number;
  codigo: string;
  id_titular?: number;
  relacion?: string;
  fecha_registro: Date;
  fecha_actualizacion: Date;
  estado: boolean;
  usuario?: {
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
    fecha_actualizacion?: Date;
    asistencias_totales?: number;
    estado: boolean;
    id_rol?: number;
  };
  contactos_emergencia?: EmergencyContact[];
  titular?: Client;
  beneficiarios?: Client[];
}

export interface EmergencyContact {
  id: number;
  id_persona: number;
  nombre_contacto: string;
  telefono_contacto: string;
  relacion_contacto?: string;
  es_mismo_beneficiario: boolean;
  fecha_registro: Date;
  fecha_actualizacion: Date;
}

export interface ClientsResponse {
  data: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface ClientResponse {
  data: Client;
  message: string;
}
