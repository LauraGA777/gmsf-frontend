export interface Contract {
  id: number;
  codigo: string;
  id_persona: number;
  id_membresia: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  membresia_precio: number;
  estado: 'Activo' | 'Congelado' | 'Vencido' | 'Cancelado' | 'Por vencer';
  fecha_registro: Date;
  fecha_actualizacion: Date;
  usuario_registro?: number;
  usuario_actualizacion?: number;
  motivo?: string;
  persona?: {
    id_persona: number;
    codigo: string;
    usuario?: {
      id: number;
      codigo: string;
      nombre: string;
      apellido: string;
      correo: string;
      telefono?: string;
      tipo_documento: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
      numero_documento: string;
    };
  };
  membresia?: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    dias_acceso: number;
    vigencia_dias: number;
    precio: number;
    fecha_creacion: Date;
    estado: boolean;
  };
  historial?: ContractHistory[];
}

export interface ContractHistory {
  id: number;
  id_contrato: number;
  estado_anterior?: string;
  estado_nuevo: string;
  fecha_cambio: Date;
  usuario_cambio?: number;
  motivo?: string;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface ContractsResponse {
  data: Contract[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

export interface ContractResponse {
  data: Contract;
  message: string;
}
