// User related types
import { ROLES } from "@/shared/contexts/authContext";

export interface User {
  id: string;
  nombre: string;
  correo: string;
  id_rol: number;
  role?: keyof typeof ROLES;
  clientId?: string;
  trainerId?: string;
  avatar?: string;
  contract?: {
    id: string;
    estado: string;
    fecha_inicio: string;
    fecha_fin: string;
    membresia_nombre: string;
  };
  activeContract?: {
    id: string;
    status: string;
    startDate: Date;
    endDate: Date;
    membershipType: string;
  };
}

// Client/Person related types
export interface Client {
  id_persona: number;
  codigo: string;
  id_usuario?: number;
  id_titular?: number;
  relacion?: string;
  fecha_registro: Date;
  fecha_actualizacion: Date;
  estado: boolean;
  // Relaciones populadas
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
    asistencias_totales: number;
  };
  titular?: {
    id_persona: number;
    codigo: string;
    usuario?: {
      id: number;
      nombre: string;
      apellido: string;
    };
  };
  beneficiarios?: Array<{
    id_persona: number;
    codigo: string;
    relacion?: string;
    usuario?: {
      id: number;
      nombre: string;
      apellido: string;
      correo: string;
      telefono?: string;
      tipo_documento: string;
      numero_documento: string;
    };
  }>;
  contactos_emergencia?: Array<{
    id: number;
    nombre_contacto: string;
    telefono_contacto: string;
    relacion_contacto?: string;
    es_mismo_beneficiario: boolean;
  }>;
}

// Training related types
export interface Training {
  id: number;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_entrenador: number;
  id_cliente: number;
  estado: 'Programado' | 'En proceso' | 'Completado' | 'Cancelado';
  notas?: string;
  fecha_creacion: string;
  created_at: string;
  updated_at: string;
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

// Contract related types
export interface Contract {
  id: number;
  codigo: string;
  id_persona: number;
  id_membresia: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  membresia_precio: number;
  estado: "Activo" | "Congelado" | "Vencido" | "Cancelado" | "Por vencer";
  fecha_registro: Date;
  fecha_actualizacion: Date;
  usuario_registro?: number;
  usuario_actualizacion?: number;
  // Relaciones populadas
  persona?: {
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
  membresia?: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
    dias_acceso: number;
    vigencia_dias: number;
    precio: number;
    estado: boolean;
  };
  registrador?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  actualizador?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

// Contract History types
export interface ContractHistory {
  id: number;
  id_contrato: number;
  estado_anterior?: "Activo" | "Congelado" | "Vencido" | "Cancelado" | "Por vencer";
  estado_nuevo: "Activo" | "Congelado" | "Vencido" | "Cancelado" | "Por vencer";
  fecha_cambio: Date;
  usuario_cambio?: number;
  motivo?: string;
  created_at: Date;
  updated_at: Date;
}

// Contract form data types
export interface ContractFormData {
  id_persona: number;
  id_membresia: number;
  fecha_inicio: string;
  membresia_precio?: number;
  usuario_registro?: number;
}

// Contract renewal data
export interface ContractRenewalData {
  id_contrato: number;
  id_membresia: number;
  fecha_inicio: string;
  fecha_fin: string;
  membresia_precio: number;
  usuario_registro: number;
}

// Contract freeze data
export interface ContractFreezeData {
  id_contrato: number;
  motivo: string;
  usuario_actualizacion: number;
}

// Search related types
// Search related types
export interface SearchFilters {
  client?: string;
  trainer?: string;
  service?: string;
  dateRange: {
    from?: Date;
    to?: Date;
  };
  status?: string; // Added status field for estado column search
}

// Trainer related types
export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialties: string[];
  status: "Activo" | "Inactivo";
  availability?: Availability[];
  bio?: string;
  avatar?: string;
}

export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

// Service related types
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  capacity: number;
  trainerId?: string;
  trainerName?: string;
  status: "Activo" | "Inactivo";
}

// Attendance related types
export interface Attendance {
  id: string;
  clientId: string;
  clientName: string;
  date: Date;
  checkInTime: Date;
  checkOutTime?: Date;
  trainingId?: number;
  notes?: string;
}

// Tipos de membresía
export interface Membership {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  dias_acceso: number;
  vigencia_dias: number;
  precio: number;
  fecha_creacion: string;
  estado: boolean;
}

// Tipos de programación
export interface Schedule {
  id: number;
  codigo?: string;
  id_servicio: number;
  id_entrenador: number;
  fecha: Date;
  hora_inicio: Date;
  hora_fin: Date;
  cupo_maximo: number;
  cupos_ocupados: number;
  estado: "Activo" | "Cancelado";
  servicio_nombre?: string;
  entrenador_nombre?: string;
  fecha_registro?: Date;
  fecha_actualizacion?: Date;
}

// Tipos de inscripción
export interface Enrollment {
  id: number;
  id_programacion: number;
  id_persona: number;
  fecha_inscripcion: Date;
  estado: "Confirmado" | "Cancelado" | "Asistió";
  persona_nombre?: string;
  fecha_actualizacion?: Date;
}

// Actualizar la interfaz Survey para que coincida con la tabla encuestas
export interface Survey {
  id: number;
  codigo?: string;
  titulo: string;
  descripcion?: string;
  id_servicio?: number;
  fecha_inicio: Date;
  fecha_fin?: Date;
  estado: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  usuario_creacion?: number;
  servicio_nombre?: string;
  respuestas_count?: number;
  calificacion_promedio?: number;
}

// Añadir la interfaz para servicios personalizados que coincida con la tabla
export interface PersonalizedService {
  id: number;
  codigo?: string;
  id_servicio: number;
  id_entrenador: number;
  id_cliente: number;
  fecha: Date;
  hora_inicio: Date;
  hora_fin: Date;
  estado: "Completo" | "Disponible" | "Cancelado";
  fecha_registro?: Date;
  fecha_actualizacion?: Date;
  // Campos adicionales para la UI
  servicio_nombre?: string;
  entrenador_nombre?: string;
  cliente_nombre?: string;
}

// Client form data types
export interface ClientFormData {
  id_titular?: number;
  relacion?: string;
  estado?: boolean;
  usuario?: {
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
  };
  contactos_emergencia?: Array<{
    nombre_contacto: string;
    telefono_contacto: string;
    relacion_contacto?: string;
    es_mismo_beneficiario: boolean;
  }>;
}

// Emergency Contact types
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

export interface EmergencyContactFormData {
  nombre_contacto: string;
  telefono_contacto: string;
  relacion_contacto?: string;
  es_mismo_beneficiario: boolean;
}

// UI Client types (for backward compatibility with existing components)
export interface UIClient {
  id: string;
  codigo: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  documentType: string;
  documentNumber: string;
  gender?: 'M' | 'F' | 'O';
  birthDate?: Date;
  status: 'Activo' | 'Inactivo' | 'Congelado' | 'Pendiente de pago';
  membershipType?: string;
  membershipEndDate?: Date;
  // Beneficiary info (if applicable)
  beneficiaryName?: string;
  beneficiaryEmail?: string;
  beneficiaryPhone?: string;
  beneficiaryDocumentNumber?: string;
  beneficiaryRelation?: string;
}

// Function to map DB Client to UI Client
export const mapDbClientToUiClient = (dbClient: any): UIClient => {
  if (!dbClient) {
    throw new Error('Client data is required');
  }

  const usuario = dbClient.usuario || {};
  const titular = dbClient.titular || {};
  const beneficiarios = dbClient.beneficiarios || [];
  
  // If this is a beneficiary, show both titular and beneficiary info
  const isBeneficiary = !!dbClient.id_titular;
  const primaryBeneficiary = beneficiarios.length > 0 ? beneficiarios[0] : null;

  return {
    id: (dbClient.id_persona || dbClient.id)?.toString() || '',
    codigo: dbClient.codigo || `P${(dbClient.id_persona || dbClient.id)?.toString().padStart(3, "0")}`,
    name: usuario.nombre && usuario.apellido 
      ? `${usuario.nombre} ${usuario.apellido}`
      : usuario.nombre || 'Sin nombre',
    firstName: usuario.nombre || '',
    lastName: usuario.apellido || '',
    email: usuario.correo || '',
    phone: usuario.telefono || '',
    address: usuario.direccion || '',
    documentType: usuario.tipo_documento || 'CC',
    documentNumber: usuario.numero_documento || '',
    gender: usuario.genero,
    birthDate: usuario.fecha_nacimiento ? new Date(usuario.fecha_nacimiento) : undefined,
    status: dbClient.estado === false ? 'Inactivo' : 'Activo',
    
    // Beneficiary information (show if this client has beneficiaries OR if this is a beneficiary)
    beneficiaryName: isBeneficiary 
      ? `${usuario.nombre} ${usuario.apellido}` 
      : primaryBeneficiary?.usuario 
        ? `${primaryBeneficiary.usuario.nombre} ${primaryBeneficiary.usuario.apellido}`
        : undefined,
    beneficiaryEmail: isBeneficiary 
      ? usuario.correo 
      : primaryBeneficiary?.usuario?.correo,
    beneficiaryPhone: isBeneficiary 
      ? usuario.telefono 
      : primaryBeneficiary?.usuario?.telefono,
    beneficiaryDocumentNumber: isBeneficiary 
      ? usuario.numero_documento 
      : primaryBeneficiary?.usuario?.numero_documento,
    beneficiaryRelation: isBeneficiary 
      ? dbClient.relacion 
      : primaryBeneficiary?.relacion,
  };
};

export const mapDbContractToUiContract = (dbContract: any): Contract => {
  // Verificar que dbContract existe
  if (!dbContract) {
    throw new Error('dbContract is null or undefined');
  }

  const id = dbContract.id;
  if (!id) {
    console.warn('Contract without ID found:', dbContract);
    throw new Error('Contract must have an ID');
  }

  return {
    id: dbContract.id,
    codigo:
      dbContract.codigo || `C${dbContract.id.toString().padStart(4, "0")}`,
    id_persona: dbContract.id_persona || dbContract.id_persona,
    id_membresia: dbContract.id_membresia,
    fecha_inicio: new Date(dbContract.fecha_inicio),
    fecha_fin: new Date(dbContract.fecha_fin),
    membresia_precio: dbContract.membresia_precio,
    estado: dbContract.estado,
    fecha_registro: dbContract.fecha_registro
      ? new Date(dbContract.fecha_registro)
      : undefined,
    fecha_actualizacion: dbContract.fecha_actualizacion
      ? new Date(dbContract.fecha_actualizacion)
      : undefined,
    usuario_registro: dbContract.usuario_registro,
    usuario_actualizacion: dbContract.usuario_actualizacion,
    persona: dbContract.persona,
    membresia: dbContract.membresia,
    registrador: dbContract.registrador,
    actualizador: dbContract.actualizador,
  };
};

export const mapDbScheduleToUiSchedule = (dbSchedule: any): Schedule => {
  return {
    id: dbSchedule.id,
    codigo:
      dbSchedule.codigo || `P${dbSchedule.id.toString().padStart(4, "0")}`,
    id_servicio: dbSchedule.id_servicio,
    id_entrenador: dbSchedule.id_entrenador,
    fecha: new Date(dbSchedule.fecha),
    hora_inicio: new Date(dbSchedule.hora_inicio),
    hora_fin: new Date(dbSchedule.hora_fin),
    cupo_maximo: dbSchedule.cupo_maximo,
    cupos_ocupados: dbSchedule.cupos_ocupados,
    estado: dbSchedule.estado === true ? "Activo" : "Cancelado",
    servicio_nombre: dbSchedule.servicio_nombre,
    entrenador_nombre: dbSchedule.entrenador_nombre,
    fecha_registro: dbSchedule.fecha_registro
      ? new Date(dbSchedule.fecha_registro)
      : undefined,
    fecha_actualizacion: dbSchedule.fecha_actualizacion
      ? new Date(dbSchedule.fecha_actualizacion)
      : undefined,
  };
};

export const mapDbPersonalizedServiceToUiPersonalizedService = (
  dbService: any
): PersonalizedService => {
  return {
    id: dbService.id,
    codigo: dbService.codigo || `SP${dbService.id.toString().padStart(4, "0")}`,
    id_servicio: dbService.id_servicio,
    id_entrenador: dbService.id_entrenador,
    id_cliente: dbService.id_cliente,
    fecha: new Date(dbService.fecha),
    hora_inicio: new Date(dbService.hora_inicio),
    hora_fin: new Date(dbService.hora_fin),
    estado: dbService.estado,
    fecha_registro: dbService.fecha_registro
      ? new Date(dbService.fecha_registro)
      : undefined,
    fecha_actualizacion: dbService.fecha_actualizacion
      ? new Date(dbService.fecha_actualizacion)
      : undefined,
    servicio_nombre: dbService.servicio_nombre,
    entrenador_nombre: dbService.entrenador_nombre,
    cliente_nombre: dbService.cliente_nombre,
  };
};

export const mapDbEnrollmentToUiEnrollment = (
  dbEnrollment: any
): Enrollment => {
  return {
    id: dbEnrollment.id,
    id_programacion: dbEnrollment.id_programacion,
    id_persona: dbEnrollment.id_persona,
    fecha_inscripcion: new Date(dbEnrollment.fecha_inscripcion),
    estado: dbEnrollment.estado,
    persona_nombre: dbEnrollment.persona_nombre,
    fecha_actualizacion: dbEnrollment.fecha_actualizacion
      ? new Date(dbEnrollment.fecha_actualizacion)
      : undefined,
  };
};

// Actualizar la interfaz CalendarProps para incluir los nuevos props
import type * as React from "react";
import type { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  captionLayout?: "buttons" | "dropdown" | "dropdown-buttons";
  fromYear?: number;
  toYear?: number;
};
