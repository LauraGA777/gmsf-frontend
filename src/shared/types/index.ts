// User related types
export interface User {
  id: string;
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  id_rol: number;
  role?: Role; // Rol completo con permisos y privilegios
  roleCode?: string; // Código del rol para compatibilidad
  roleName?: string; // Nombre del rol para UI
  roleSource?: string; // Origen del rol: 'database' | 'fallback' | 'unknown'
  clientId?: string;
  trainerId?: string;
  avatar?: string;
  estado?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
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
  // Permisos dinámicos del usuario
  userPermissions?: UserPermission[];
}

// Interfaz para permisos específicos del usuario
export interface UserPermission {
  moduleId: number;
  moduleName: string;
  privileges: UserPrivilege[];
}

export interface UserPrivilege {
  id: number;
  name: string;
  granted: boolean;
}

// Auth Context types - Mejorado para soporte completo de permisos dinámicos
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  login: (correo: string, contrasena: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (requiredRoles: number[]) => boolean;
  hasModulePermission: (moduleName: PermissionName, privilegeName?: PrivilegeName) => boolean;
  checkPermission: (moduleName: PermissionName, privilegeName?: PrivilegeName) => boolean;
  roles: Role[];
  permissions: Permission[];
  privileges: Privilege[];
  loadRoles: () => Promise<void>;
  loadPermissions: () => Promise<void>;
  refreshUserPermissions: () => Promise<void>;
  getUserPermissions: () => UserPermission[];
  isInitialized: boolean;
  error: string | null;
  permissionsLoading: boolean;
}

// Role types (moved from role.ts for central management)
export interface Permission {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  privilegios?: Privilege[];
  // Para compatibilidad con componentes existentes
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Privilege {
  id: number;
  codigo?: string;
  nombre: string;
  id_permiso: number;
  descripcion?: string;
  estado?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  // Para compatibilidad con componentes existentes
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Role {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  ruta?: string; // Ruta específica del rol desde la BD
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  permisos?: Permission[];
  privilegios?: Privilege[];
  userCount?: number;
  // Campos para compatibilidad con el frontend actual
  name: string;
  description: string;
  status: "Activo" | "Inactivo";
  isActive: boolean;
  permissions?: Permission[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export type RoleFormData = Omit<Role, "id" | "createdAt" | "updatedAt" | "userCount" | "codigo" | "fecha_creacion" | "fecha_actualizacion">

// Tipos para el manejo de permisos en el frontend
export interface PermissionSelection {
  permissionId: number;
  permissionName: string;
  privileges: {
    id: number;
    name: string;
    selected: boolean;
  }[];
}

// Respuesta del servidor para permisos del usuario
export interface UserPermissionsResponse {
  success: boolean;
  data: {
    role: Role;
    permissions: UserPermission[];
    redirectPath?: string;
  };
  error?: string;
}

// Tipos para validación de permisos
export interface PermissionCheck {
  moduleName: PermissionName;
  privilegeName?: PrivilegeName;
  fallbackRoles?: number[];
}

export interface PermissionValidationResult {
  hasAccess: boolean;
  reason?: 'permission_granted' | 'fallback_role' | 'access_denied';
  requiredPermission?: string;
  userRole?: string;
}

// Permission Service types - Actualizado para incluir todos los módulos del sistema
export type PermissionName =
  | "Panel de control"
  | "Gestión de roles"
  | "Gestión de usuarios"
  | "Gestión de entrenadores" 
  | "Gestión de servicios"
  | "Gestión de clientes"
  | "Gestión de contratos"
  | "Gestión de membresías"
  | "Control de asistencia"
  | "Gestión de programaciones"
  | "Servicios personalizados"
  | "Gestión de encuestas"
  | "Reportes y estadísticas"
  | "Configuración del sistema"
  | "Gestión de horarios"
  | "Gestión de inscripciones";

export type PrivilegeName = "Crear" | "Leer" | "Actualizar" | "Eliminar" | "Exportar" | "Reportar";

// Route Protection types - Mejorado para soportar validaciones más granulares
export interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredModule: PermissionName;
  requiredPrivilege?: PrivilegeName;
  fallbackRoles?: number[];
  redirectTo?: string;
  showNotAuthorized?: boolean;
  customValidation?: (user: User | null) => boolean;
}

// Legacy role types for backward compatibility
export interface LegacyRole {
  id: number;
  nombre: string;
  ruta: string;
  permisos: string[];
}

export const DEFAULT_ROLES: Record<string, LegacyRole> = {
  ADMIN: {
    id: 1,
    nombre: "admin",
    ruta: "/dashboard",
    permisos: ["ver_usuarios", "editar_usuarios", "ver_estadisticas"],
  },
  ENTRENADOR: {
    id: 2,
    nombre: "entrenador",
    ruta: "/dashboard",
    permisos: ["ver_clientes", "editar_rutinas", "ver_horarios"],
  },
  CLIENTE: {
    id: 3,
    nombre: "cliente",
    ruta: "/client",
    permisos: ["ver_perfil", "ver_rutinas", "ver_membresia"],
  },
  BENEFICIARIO: {
    id: 4,
    nombre: "beneficiario",
    ruta: "/client",
    permisos: ["ver_perfil", "ver_rutinas", "ver_membresia"],
  },
} as const;

// User Role type for compatibility
export type UserRole = 1 | 2 | 3 | 4;

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
  fecha_registro?: Date; // Cambiado a opcional
  fecha_actualizacion?: Date; // Cambiado a opcional
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
      tipo_documento?: "CC" | "CE" | "TI" | "PP" | "DIE";
      numero_documento?: string;
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

// Trainer related types - Actualizado para coincidir con la estructura de BD
export interface Trainer {
  id: number;
  codigo?: string;
  id_usuario: number;
  especialidades?: string[];
  certificaciones?: string[];
  experiencia_anos?: number;
  fecha_contratacion?: Date;
  estado: boolean;
  fecha_registro?: Date;
  fecha_actualizacion?: Date;
  // Relación con usuario
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono?: string;
    direccion?: string;
    genero?: 'M' | 'F' | 'O';
    tipo_documento: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
    numero_documento: string;
    fecha_nacimiento?: Date;
    avatar?: string;
  };
  // Campos calculados o derivados
  fullName?: string;
  activeClients?: number;
  totalSessions?: number;
  rating?: number;
  // Para compatibilidad con componentes existentes
  name?: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  status?: "Activo" | "Inactivo";
  availability?: Availability[];
  bio?: string;
  avatar?: string;
}

export interface Availability {
  id?: number;
  id_entrenador?: number;
  dia_semana: number; // 0 = Domingo, 1 = Lunes, etc.
  hora_inicio: string; // Format: "HH:mm"
  hora_fin: string; // Format: "HH:mm"
  estado: boolean;
  // Para compatibilidad
  day?: string;
  startTime?: string;
  endTime?: string;
}

// Trainer form data
export interface TrainerFormData {
  id_usuario?: number;
  especialidades?: string[];
  certificaciones?: string[];
  experiencia_anos?: number;
  fecha_contratacion?: string;
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
    fecha_nacimiento?: string;
    contrasena?: string;
    avatar?: string;
  };
  disponibilidad?: Availability[];
}

// Service related types - Actualizado para coincidir con la estructura de BD
export interface Service {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio?: number;
  capacidad_maxima?: number;
  tipo_servicio: 'Grupal' | 'Personal' | 'Virtual';
  estado: boolean;
  fecha_registro?: Date;
  fecha_actualizacion?: Date;
  // Campos calculados
  totalSessions?: number;
  activeClients?: number;
  // Para compatibilidad con componentes existentes
  name?: string;
  description?: string;
  duration?: number; // in minutes
  price?: number;
  capacity?: number;
  trainerId?: string;
  trainerName?: string;
  status?: "Activo" | "Inactivo";
}

// Service form data
export interface ServiceFormData {
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio?: number;
  capacidad_maxima?: number;
  tipo_servicio: 'Grupal' | 'Personal' | 'Virtual';
  estado?: boolean;
}

// Attendance related types - Actualizado para coincidir con la estructura de BD
export interface Attendance {
  id: number;
  codigo?: string;
  id_persona: number;
  fecha: Date;
  hora_entrada: Date;
  hora_salida?: Date;
  id_programacion?: number;
  observaciones?: string;
  estado: 'Presente' | 'Tardanza' | 'Ausente';
  fecha_registro?: Date;
  fecha_actualizacion?: Date;
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
  programacion?: {
    id: number;
    fecha: Date;
    hora_inicio: Date;
    hora_fin: Date;
    servicio?: {
      id: number;
      nombre: string;
    };
    entrenador?: {
      id: number;
      usuario?: {
        nombre: string;
        apellido: string;
      };
    };
  };
  // Para compatibilidad con componentes existentes
  clientId?: string;
  clientName?: string;
  date?: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  trainingId?: number;
  notes?: string;
}

// Attendance form data
export interface AttendanceFormData {
  id_persona: number;
  fecha: string;
  hora_entrada: string;
  hora_salida?: string;
  id_programacion?: number;
  observaciones?: string;
  estado: 'Presente' | 'Tardanza' | 'Ausente';
}

// Attendance filters
export interface AttendanceFilters {
  fechaInicio?: Date;
  fechaFin?: Date;
  id_persona?: number;
  id_programacion?: number;
  estado?: 'Presente' | 'Tardanza' | 'Ausente';
  id_entrenador?: number;
  id_servicio?: number;
}

// Tipos de membresía
export interface Membership {
  id: number;
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
  status: 'Activo' | 'Inactivo' | 'Congelado';
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

// Mapper functions for trainers
export const mapDbTrainerToUiTrainer = (dbTrainer: any): Trainer => {
  if (!dbTrainer) {
    throw new Error('Trainer data is required');
  }

  const usuario = dbTrainer.usuario || {};
  
  return {
    id: dbTrainer.id,
    codigo: dbTrainer.codigo || `T${dbTrainer.id.toString().padStart(3, "0")}`,
    id_usuario: dbTrainer.id_usuario,
    especialidades: dbTrainer.especialidades || [],
    certificaciones: dbTrainer.certificaciones || [],
    experiencia_anos: dbTrainer.experiencia_anos,
    fecha_contratacion: dbTrainer.fecha_contratacion ? new Date(dbTrainer.fecha_contratacion) : undefined,
    estado: dbTrainer.estado,
    fecha_registro: dbTrainer.fecha_registro ? new Date(dbTrainer.fecha_registro) : undefined,
    fecha_actualizacion: dbTrainer.fecha_actualizacion ? new Date(dbTrainer.fecha_actualizacion) : undefined,
    usuario: dbTrainer.usuario,
    fullName: usuario.nombre && usuario.apellido ? `${usuario.nombre} ${usuario.apellido}` : usuario.nombre || 'Sin nombre',
    // Para compatibilidad
    name: usuario.nombre && usuario.apellido ? `${usuario.nombre} ${usuario.apellido}` : usuario.nombre || 'Sin nombre',
    email: usuario.correo || '',
    phone: usuario.telefono || '',
    specialties: dbTrainer.especialidades || [],
    status: dbTrainer.estado ? "Activo" : "Inactivo",
    bio: dbTrainer.bio || '',
    avatar: usuario.avatar || '',
  };
};

// Mapper functions for services
export const mapDbServiceToUiService = (dbService: any): Service => {
  if (!dbService) {
    throw new Error('Service data is required');
  }
  
  return {
    id: dbService.id,
    codigo: dbService.codigo || `S${dbService.id.toString().padStart(3, "0")}`,
    nombre: dbService.nombre,
    descripcion: dbService.descripcion,
    duracion_minutos: dbService.duracion_minutos,
    precio: dbService.precio,
    capacidad_maxima: dbService.capacidad_maxima,
    tipo_servicio: dbService.tipo_servicio,
    estado: dbService.estado,
    fecha_registro: dbService.fecha_registro ? new Date(dbService.fecha_registro) : undefined,
    fecha_actualizacion: dbService.fecha_actualizacion ? new Date(dbService.fecha_actualizacion) : undefined,
    // Para compatibilidad
    name: dbService.nombre,
    description: dbService.descripcion || '',
    duration: dbService.duracion_minutos,
    price: dbService.precio || 0,
    capacity: dbService.capacidad_maxima || 0,
    status: dbService.estado ? "Activo" : "Inactivo",
  };
};

// Mapper functions for attendance
export const mapDbAttendanceToUiAttendance = (dbAttendance: any): Attendance => {
  if (!dbAttendance) {
    throw new Error('Attendance data is required');
  }
  
  const persona = dbAttendance.persona || {};
  const usuario = persona.usuario || {};
  
  return {
    id: dbAttendance.id,
    codigo: dbAttendance.codigo || `A${dbAttendance.id.toString().padStart(4, "0")}`,
    id_persona: dbAttendance.id_persona,
    fecha: new Date(dbAttendance.fecha),
    hora_entrada: new Date(dbAttendance.hora_entrada),
    hora_salida: dbAttendance.hora_salida ? new Date(dbAttendance.hora_salida) : undefined,
    id_programacion: dbAttendance.id_programacion,
    observaciones: dbAttendance.observaciones,
    estado: dbAttendance.estado,
    fecha_registro: dbAttendance.fecha_registro ? new Date(dbAttendance.fecha_registro) : undefined,
    fecha_actualizacion: dbAttendance.fecha_actualizacion ? new Date(dbAttendance.fecha_actualizacion) : undefined,
    persona: dbAttendance.persona,
    programacion: dbAttendance.programacion,
    // Para compatibilidad
    clientId: dbAttendance.id_persona?.toString() || '',
    clientName: usuario.nombre && usuario.apellido ? `${usuario.nombre} ${usuario.apellido}` : usuario.nombre || 'Sin nombre',
    date: new Date(dbAttendance.fecha),
    checkInTime: new Date(dbAttendance.hora_entrada),
    checkOutTime: dbAttendance.hora_salida ? new Date(dbAttendance.hora_salida) : undefined,
    trainingId: dbAttendance.id_programacion,
    notes: dbAttendance.observaciones,
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

// Tipos para auditoría y logs del sistema
export interface AuditLog {
  id: number;
  usuario_id: number;
  accion: string;
  modulo: PermissionName;
  descripcion: string;
  ip_address?: string;
  user_agent?: string;
  datos_anteriores?: any;
  datos_nuevos?: any;
  fecha_creacion: Date;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
  };
}

// Tipos para configuración del sistema
export interface SystemConfig {
  id: number;
  clave: string;
  valor: string;
  descripcion?: string;
  tipo: 'string' | 'number' | 'boolean' | 'json';
  categoria: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

// Tipos para notificaciones del sistema
export interface SystemNotification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  usuario_id?: number;
  rol_id?: number;
  leida: boolean;
  fecha_expiracion?: Date;
  fecha_creacion: Date;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

// Tipos para dashboard y reportes
export interface DashboardStats {
  totalClients: number;
  activeContracts: number;
  expiringSoon: number;
  todayAttendance: number;
  monthlyRevenue: number;
  totalTrainers: number;
  activeServices: number;
  pendingTasks: number;
}

export interface ReportData {
  id: string;
  name: string;
  type: 'clients' | 'contracts' | 'attendance' | 'revenue' | 'services';
  data: any[];
  generatedAt: Date;
  generatedBy: string;
  filters?: any;
}

// Tipos para validación de formularios
export interface ValidationRule {
  field: string;
  rule: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Tipos para operaciones en lote
export interface BulkOperation {
  operation: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  targetIds: (string | number)[];
  data?: any;
  confirmation?: boolean;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  successIds: (string | number)[];
  failedIds: (string | number)[];
}

// Tipos para manejo de estados de carga y errores más granulares
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | string;
  errorCode?: number;
  details?: any;
  timestamp?: Date;
  canRetry?: boolean;
}

// Tipos para paginación mejorada
export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationConfig;
  filters?: any;
  aggregations?: any;
}
