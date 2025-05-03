// User related types
export type UserRole = "admin" | "trainer" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

// Client related types
export interface Client {
  id: string;
  codigo?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  documentType?: "CC" | "TI";
  documentNumber?: string;
  address?: string;
  birthdate?: Date;
  emergencyContact?: string;
  emergencyPhone?: string;
  membershipType?: string;
  membershipEndDate?: Date | null;
  status: "Activo" | "Inactivo" | "Congelado" | "Pendiente de pago";
  isBeneficiary?: boolean;
  beneficiaryRelation?: string;
  beneficiaryName?: string;
  beneficiaryDocumentType?: "CC" | "TI";
  beneficiaryDocumentNumber?: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  registrationDate?: Date | string;
  notes?: string;
  medicalInfo?: string;
  genero?: "Masculino" | "Femenino" | "Otro";
  asistencias_totales?: number;
  id_titular?: string;
}

// Training related types
export interface Training {
  id: number;
  client: string;
  clientId?: string;
  trainer: string;
  trainerId?: string;
  service: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  maxCapacity: number;
  occupiedSpots: number;
  status: "Activo" | "Pendiente" | "Completado" | "Cancelado";
  notes?: string;
  location?: string;
}

// Contract related types
export interface Contract {
  id: number;
  codigo?: string;
  id_cliente: number;
  id_membresia: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado:
    | "Activo"
    | "Cancelado"
    | "Vencido"
    | "Por vencer"
    | "Congelado"
    | "Pendiente de pago";
  cliente_nombre: string;
  membresia_nombre: string;
  membresia_precio?: number;
  cliente_documento?: string;
  cliente_documento_tipo?: string;
  precio_total: number;
  fecha_registro?: Date;
  fecha_actualizacion?: Date;
  usuario_registro?: number;
  usuario_actualizacion?: number;
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
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_dias: number;
  estado?: boolean;
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

// Funciones de utilidad para mapear entre formatos de BD y UI
export const mapDbClientToUiClient = (dbClient: any): Client => {
  return {
    id: dbClient.id.toString(),
    codigo: dbClient.codigo || `P${dbClient.id.toString().padStart(4, "0")}`,
    name: `${dbClient.nombre || ""} ${dbClient.apellido || ""}`.trim(),
    firstName: dbClient.nombre,
    lastName: dbClient.apellido,
    email: dbClient.email,
    phone: dbClient.telefono,
    documentType: dbClient.tipo_documento,
    documentNumber: dbClient.numero_documento,
    address: dbClient.direccion,
    birthdate: dbClient.fecha_nacimiento
      ? new Date(dbClient.fecha_nacimiento)
      : undefined,
    status: dbClient.estado ? "Activo" : "Inactivo",
    genero: dbClient.genero,
    emergencyContact: dbClient.contacto_emergencia,
    emergencyPhone: dbClient.telefono_emergencia,
    medicalInfo: dbClient.informacion_medica,
    registrationDate: dbClient.fecha_registro
      ? new Date(dbClient.fecha_registro)
      : undefined,
    notes: dbClient.notas,
    asistencias_totales: dbClient.asistencias_totales,
    id_titular: dbClient.id_titular?.toString(),
    isBeneficiary: !!dbClient.id_titular,
  };
};

export const mapDbContractToUiContract = (dbContract: any): Contract => {
  return {
    id: dbContract.id,
    codigo:
      dbContract.codigo || `C${dbContract.id.toString().padStart(4, "0")}`,
    id_cliente: dbContract.id_cliente,
    id_membresia: dbContract.id_membresia,
    fecha_inicio: new Date(dbContract.fecha_inicio),
    fecha_fin: new Date(dbContract.fecha_fin),
    estado: dbContract.estado,
    cliente_nombre: dbContract.cliente_nombre,
    membresia_nombre: dbContract.membresia_nombre,
    membresia_precio: dbContract.membresia_precio,
    precio_total: dbContract.precio_total,
    fecha_registro: dbContract.fecha_registro
      ? new Date(dbContract.fecha_registro)
      : undefined,
    fecha_actualizacion: dbContract.fecha_actualizacion
      ? new Date(dbContract.fecha_actualizacion)
      : undefined,
    usuario_registro: dbContract.usuario_registro,
    usuario_actualizacion: dbContract.usuario_actualizacion,
    cliente_documento: dbContract.cliente_documento,
    cliente_documento_tipo: dbContract.cliente_documento_tipo,
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
