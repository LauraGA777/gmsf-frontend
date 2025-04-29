import { addDays } from "date-fns";

// Actualizar la interfaz de Trainer para que coincida con la tabla entrenadores
export interface Trainer {
  id: number;
  nombre: string;
  apellido: string;
  especialidad?: string;
  estado: boolean;
}

// Actualizar la interfaz de Service para que coincida con la tabla servicios
export interface Service {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
  precio: number;
}

// Actualizar la interfaz de Client para que coincida con la tabla personas
export interface Client {
  id_persona: number;
  codigo: string; // Formato P0001
  id_usuario: number;
  tipo_documento: "CC" | "TI";
  numero_documento: string;
  nombre: string;
  apellido: string;
  genero: "Masculino" | "Femenino" | "Otro";
  email: string;
  telefono: string;
  direccion?: string;
  fecha_nacimiento?: string;
  estado: boolean;
  asistencias_totales?: number;
  id_titular?: number;
  relacion?: string;
  fecha_registro: string;
  fecha_actualizacion?: string;
}

// Actualizar la interfaz de Training para que coincida con la tabla programaciones
export interface Training {
  id: number;
  codigo: string; // Formato PR0001
  id_servicio: number;
  id_entrenador: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  cupo_maximo: number;
  cupos_ocupados: number;
  estado: "Activo" | "Pendiente" | "Completado" | "Cancelado";
  fecha_registro: string;
  fecha_actualizacion?: string;

  // Campos adicionales para la UI (no están en la BD)
  service?: Service;
  trainer?: Trainer;
}

// Actualizar la interfaz de CustomService para que coincida con la tabla servicios_personalizados
export interface CustomService {
  id: number;
  codigo: string; // Formato SP0001
  id_servicio: number;
  id_entrenador: number;
  id_cliente: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: "Activo" | "Pendiente" | "Completado" | "Cancelado";
  fecha_registro: string;
  fecha_actualizacion?: string;

  // Campos adicionales para la UI (no están en la BD)
  service?: Service;
  trainer?: Trainer;
  client?: Client;
}

// Actualizar la interfaz de Contract para que coincida con la tabla contratos
export interface Contract {
  id: number;
  codigo: string; // Formato C0001
  id_cliente: number;
  id_membresia: number;
  fecha_inicio: string;
  fecha_fin: string;
  precio_total: number;
  estado: "Activo" | "Cancelado" | "Vencido" | "Por vencer";
  fecha_registro: string;
  fecha_actualizacion?: string;
  usuario_registro?: number;
  usuario_actualizacion?: number;

  // Campos adicionales para la UI (no están en la BD)
  client?: Client;
  membership?: Membership;
}

// Actualizar la interfaz de Membership para que coincida con la tabla membresias
export interface Membership {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion_dias: number;
  precio: number;
  estado: boolean;
}

// Actualizar los datos de ejemplo para incluir los nuevos campos
export const mockTrainers: Trainer[] = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    especialidad: "Entrenamiento funcional",
    estado: true,
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    especialidad: "Yoga",
    estado: true,
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Rodríguez",
    especialidad: "Crossfit",
    estado: true,
  },
];

export const mockServices: Service[] = [
  {
    id: 1,
    nombre: "Entrenamiento funcional",
    descripcion: "Entrenamiento que mejora la fuerza y resistencia",
    estado: true,
    precio: 50000
  },
  {
    id: 2,
    nombre: "Yoga",
    descripcion: "Disciplina que busca el equilibrio físico y mental",
    estado: true,
    precio: 45000
  },
  {
    id: 3,
    nombre: "Crossfit",
    descripcion: "Entrenamiento de alta intensidad",
    estado: true,
    precio: 60000
  },
  {
    id: 4,
    nombre: "Pilates",
    descripcion: "Sistema de entrenamiento físico y mental",
    estado: true,
    precio: 55000
  },
];

export const mockClients: Client[] = [
  {
    id_persona: 1,
    codigo: "P0001",
    id_usuario: 1,
    tipo_documento: "CC",
    numero_documento: "1234567890",
    nombre: "Ana",
    apellido: "Martínez",
    genero: "Femenino",
    email: "ana.martinez@example.com",
    telefono: "3001234567",
    direccion: "Calle 123 #45-67",
    fecha_nacimiento: "1990-05-15",
    estado: true,
    asistencias_totales: 15,
    fecha_registro: "2023-01-15",
  },
  {
    id_persona: 2,
    codigo: "P0002",
    id_usuario: 2,
    tipo_documento: "CC",
    numero_documento: "0987654321",
    nombre: "Pedro",
    apellido: "Sánchez",
    genero: "Masculino",
    email: "pedro.sanchez@example.com",
    telefono: "3109876543",
    direccion: "Carrera 45 #12-34",
    fecha_nacimiento: "1985-10-20",
    estado: true,
    asistencias_totales: 8,
    fecha_registro: "2023-02-10",
  },
  {
    id_persona: 3,
    codigo: "P0003",
    id_usuario: 3,
    tipo_documento: "CC",
    numero_documento: "5678901234",
    nombre: "Laura",
    apellido: "Gómez",
    genero: "Femenino",
    email: "laura.gomez@example.com",
    telefono: "3205678901",
    direccion: "Avenida 67 #89-12",
    fecha_nacimiento: "1992-03-25",
    estado: true,
    asistencias_totales: 20,
    fecha_registro: "2023-01-05",
  },
];

export const mockTrainings: Training[] = [
  {
    id: 1,
    codigo: "PR0001",
    id_servicio: 1,
    id_entrenador: 1,
    fecha: "2025-04-05",
    hora_inicio: "08:00:00",
    hora_fin: "09:00:00",
    cupo_maximo: 10,
    cupos_ocupados: 5,
    estado: "Activo",
    fecha_registro: "2025-03-30T10:00:00",
    service: mockServices.find((s) => s.id === 1),
    trainer: mockTrainers.find((t) => t.id === 1),
  },
  {
    id: 2,
    codigo: "PR0002",
    id_servicio: 2,
    id_entrenador: 2,
    fecha: "2025-04-05",
    hora_inicio: "10:00:00",
    hora_fin: "11:00:00",
    cupo_maximo: 8,
    cupos_ocupados: 3,
    estado: "Activo",
    fecha_registro: "2025-03-30T10:15:00",
    service: mockServices.find((s) => s.id === 2),
    trainer: mockTrainers.find((t) => t.id === 2),
  },
  {
    id: 3,
    codigo: "PR0003",
    id_servicio: 3,
    id_entrenador: 3,
    fecha: "2025-04-05",
    hora_inicio: "16:00:00",
    hora_fin: "17:30:00",
    cupo_maximo: 12,
    cupos_ocupados: 8,
    estado: "Activo",
    fecha_registro: "2025-03-30T10:30:00",
    service: mockServices.find((s) => s.id === 3),
    trainer: mockTrainers.find((t) => t.id === 3),
  },
  {
    id: 4,
    codigo: "PR0004",
    id_servicio: 4,
    id_entrenador: 2,
    fecha: "2025-04-06",
    hora_inicio: "09:00:00",
    hora_fin: "10:00:00",
    cupo_maximo: 10,
    cupos_ocupados: 2,
    estado: "Activo",
    fecha_registro: "2025-03-30T11:00:00",
    service: mockServices.find((s) => s.id === 4),
    trainer: mockTrainers.find((t) => t.id === 2),
  },
];

export const mockCustomServices: CustomService[] = [
  {
    id: 1,
    codigo: "SP0001",
    id_servicio: 1,
    id_entrenador: 1,
    id_cliente: 1,
    fecha: "2025-04-05",
    hora_inicio: "14:00:00",
    hora_fin: "15:00:00",
    estado: "Activo",
    fecha_registro: "2025-03-30T09:00:00",
    service: mockServices.find((s) => s.id === 1),
    trainer: mockTrainers.find((t) => t.id === 1),
    client: mockClients.find((c) => c.id_persona === 1),
  },
  {
    id: 2,
    codigo: "SP0002",
    id_servicio: 3,
    id_entrenador: 3,
    id_cliente: 2,
    fecha: "2025-04-06",
    hora_inicio: "11:00:00",
    hora_fin: "12:00:00",
    estado: "Activo",
    fecha_registro: "2025-03-30T09:30:00",
    service: mockServices.find((s) => s.id === 3),
    trainer: mockTrainers.find((t) => t.id === 3),
    client: mockClients.find((c) => c.id_persona === 2),
  },
  {
    id: 3,
    codigo: "SP0003",
    id_servicio: 2,
    id_entrenador: 2,
    id_cliente: 3,
    fecha: "2025-04-07",
    hora_inicio: "15:00:00",
    hora_fin: "16:00:00",
    estado: "Pendiente",
    fecha_registro: "2025-03-30T10:00:00",
    service: mockServices.find((s) => s.id === 2),
    trainer: mockTrainers.find((t) => t.id === 2),
    client: mockClients.find((c) => c.id_persona === 3),
  },
];

// Membresías unificadas para todo el sistema
export const mockMemberships: Membership[] = [
  {
    id: 1,
    nombre: "Mensualidad",
    descripcion: "1 mes con entrenamiento semipersonalizado",
    duracion_dias: 30,
    precio: 65000,
    estado: true,
  },
  {
    id: 2,
    nombre: "Tiquetera",
    descripcion: "12 entrenamientos en un mes con entrenamiento semipersonalizado",
    duracion_dias: 30,
    precio: 50000,
    estado: true,
  },
  {
    id: 3,
    nombre: "Easy",
    descripcion: "1 mes de acceso",
    duracion_dias: 30,
    precio: 55000,
    estado: true,
  },
  {
    id: 4,
    nombre: "Día",
    descripcion: "Acceso por un día",
    duracion_dias: 1,
    precio: 7000,
    estado: true,
  },
  {
    id: 5,
    nombre: "Trimestral",
    descripcion: "Plan estándar por 3 meses",
    duracion_dias: 90,
    precio: 150000,
    estado: true,
  },
  {
    id: 6,
    nombre: "Semestral",
    descripcion: "Plan estándar por 6 meses",
    duracion_dias: 180,
    precio: 280000,
    estado: true,
  },
  {
    id: 7,
    nombre: "Anual",
    descripcion: "Acceso completo por un año",
    duracion_dias: 365,
    precio: 500000,
    estado: true,
  },
];

// Usar la misma referencia para MOCK_MEMBERSHIPS
export const MOCK_MEMBERSHIPS = mockMemberships;

// Actualizar los clientes para que coincidan con la estructura de la tabla personas
export const MOCK_CLIENTS: any[] = [
  {
    id: "0001",
    name: "Juan Carlos Pérez Rodríguez",
    email: "juan.perez@example.com",
    documentNumber: "1098765432",
    documentType: "C.C.",
    phone: "3001234567",
    address: "Calle 123 #45-67, Bogotá",
    birthdate: new Date(1985, 5, 15),
    emergencyContact: "María Pérez",
    emergencyPhone: "3109876543",
    membershipType: "Premium",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 45),
    isBeneficiary: false,
    beneficiaryName: "Ana María Pérez",
    beneficiaryRelation: "Familiar",
    beneficiaryDocumentType: "C.C.",
    beneficiaryDocumentNumber: "1087654321",
    beneficiaryPhone: "3112345678",
    beneficiaryEmail: "ana.perez@example.com",
  },
  {
    id: "0002",
    name: "María Fernanda González López",
    email: "maria.gonzalez@example.com",
    documentNumber: "1087654321",
    documentType: "C.C.",
    phone: "3109876543",
    address: "Carrera 45 #12-34, Medellín",
    birthdate: new Date(1990, 3, 22),
    emergencyContact: "Carlos González",
    emergencyPhone: "3001234567",
    membershipType: "Estándar",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 15),
    isBeneficiary: true,
  },
  {
    id: "0003",
    name: "Carlos Andrés Rodríguez Gómez",
    email: "carlos.rodriguez@example.com",
    documentNumber: "1076543210",
    documentType: "C.C.",
    phone: "3205678901",
    address: "Avenida 67 #89-12, Cali",
    birthdate: new Date(1982, 8, 10),
    emergencyContact: "Ana Rodríguez",
    emergencyPhone: "3154321098",
    membershipType: "Básico",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 5),
    isBeneficiary: false,
    beneficiaryName: "Laura Rodríguez",
    beneficiaryRelation: "Familiar",
    beneficiaryDocumentType: "T.I.",
    beneficiaryDocumentNumber: "1065432109",
    beneficiaryPhone: "3187654321",
    beneficiaryEmail: "laura.rodriguez@example.com",
  },
  {
    id: "0004",
    name: "Ana María Martínez Vargas",
    email: "ana.martinez@example.com",
    documentNumber: "1065432109",
    documentType: "C.C.",
    phone: "3154321098",
    address: "Calle 78 #90-12, Barranquilla",
    birthdate: new Date(1988, 11, 5),
    emergencyContact: "Pedro Martínez",
    emergencyPhone: "3205678901",
    membershipType: "Premium",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 60),
    isBeneficiary: true,
  },
  {
    id: "0005",
    name: "Luis Alberto Sánchez Pérez",
    email: "luis.sanchez@example.com",
    documentNumber: "1054321098",
    documentType: "C.C.",
    phone: "3006789012",
    address: "Carrera 12 #34-56, Bucaramanga",
    birthdate: new Date(1975, 2, 18),
    emergencyContact: "Carmen Sánchez",
    emergencyPhone: "3154321098",
    membershipType: "Estándar",
    status: "Inactivo",
    membershipEndDate: addDays(new Date(), -10),
    isBeneficiary: true,
  },
  {
    id: "0006",
    name: "Laura Catalina Gómez Ramírez",
    email: "laura.gomez@example.com",
    documentNumber: "1043210987",
    documentType: "C.C.",
    phone: "3209876543",
    address: "Avenida 34 #56-78, Pereira",
    birthdate: new Date(1992, 7, 25),
    emergencyContact: "Andrés Gómez",
    emergencyPhone: "3006789012",
    membershipType: "Premium",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 75),
    isBeneficiary: true,
  },
  {
    id: "0007",
    name: "Roberto Alejandro Díaz Castro",
    email: "roberto.diaz@example.com",
    documentNumber: "1032109876",
    documentType: "C.C.",
    phone: "3105432167",
    address: "Calle 56 #78-90, Manizales",
    birthdate: new Date(1980, 4, 12),
    emergencyContact: "Sofía Díaz",
    emergencyPhone: "3209876543",
    membershipType: "Básico",
    status: "Inactivo",
    membershipEndDate: addDays(new Date(), -30),
    isBeneficiary: false,
    beneficiaryName: "Miguel Díaz",
    beneficiaryRelation: "Familiar",
    beneficiaryDocumentType: "C.C.",
    beneficiaryDocumentNumber: "1021098765",
    beneficiaryPhone: "3176543210",
    beneficiaryEmail: "miguel.diaz@example.com",
  },
  {
    id: "0008",
    name: "Patricia Elena Vargas Morales",
    email: "patricia.vargas@example.com",
    documentNumber: "1021098765",
    documentType: "C.C.",
    phone: "3157890123",
    address: "Carrera 90 #12-34, Cartagena",
    birthdate: new Date(1987, 9, 30),
    emergencyContact: "Javier Vargas",
    emergencyPhone: "3105432167",
    membershipType: "Estándar",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 3),
    isBeneficiary: true,
  },
  {
    id: "0009",
    name: "Miguel Ángel Torres Herrera",
    email: "miguel.torres@example.com",
    documentNumber: "1010987654",
    documentType: "C.C.",
    phone: "3003456789",
    address: "Avenida 12 #34-56, Santa Marta",
    birthdate: new Date(1983, 1, 8),
    emergencyContact: "Valentina Torres",
    emergencyPhone: "3157890123",
    membershipType: "Premium",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 90),
    isBeneficiary: true,
  },
  {
    id: "0010",
    name: "Carmen Rosa Ruiz Jiménez",
    email: "carmen.ruiz@example.com",
    documentNumber: "1000987654",
    documentType: "C.C.",
    phone: "3206543210",
    address: "Calle 34 #56-78, Pasto",
    birthdate: new Date(1978, 6, 20),
    emergencyContact: "Ricardo Ruiz",
    emergencyPhone: "3003456789",
    membershipType: "Familiar",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 75),
    isBeneficiary: false,
    beneficiaryName: "Daniel Ruiz",
    beneficiaryRelation: "Familiar",
    beneficiaryDocumentType: "C.C.",
    beneficiaryDocumentNumber: "1098765432",
    beneficiaryPhone: "3165432109",
    beneficiaryEmail: "daniel.ruiz@example.com",
  },
  {
    id: "0011",
    name: "Javier Enrique López Mendoza",
    email: "javier.lopez@example.com",
    documentNumber: "0987654321",
    documentType: "C.C.",
    phone: "3152345678",
    address: "Carrera 67 #89-12, Ibagué",
    birthdate: new Date(1981, 10, 15),
    emergencyContact: "Natalia López",
    emergencyPhone: "3206543210",
    membershipType: "Básico",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 10),
    isBeneficiary: true,
  },
  {
    id: "0012",
    name: "Sofía Valentina Ramírez Ortiz",
    email: "sofia.ramirez@example.com",
    documentNumber: "0976543210",
    documentType: "C.C.",
    phone: "3108901234",
    address: "Avenida 89 #12-34, Neiva",
    birthdate: new Date(1993, 5, 28),
    emergencyContact: "Gabriel Ramírez",
    emergencyPhone: "3152345678",
    membershipType: "Premium",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 50),
    isBeneficiary: true,
  },
  {
    id: "0013",
    name: "Daniel Sebastián Morales Duarte",
    email: "daniel.morales@example.com",
    documentNumber: "0965432109",
    documentType: "C.C.",
    phone: "3004567890",
    address: "Calle 12 #34-56, Villavicencio",
    birthdate: new Date(1986, 3, 12),
    emergencyContact: "Camila Morales",
    emergencyPhone: "3108901234",
    membershipType: "Estándar",
    status: "Inactivo",
    membershipEndDate: addDays(new Date(), -15),
    isBeneficiary: false,
    beneficiaryName: "Isabella Morales",
    beneficiaryRelation: "Familiar",
    beneficiaryDocumentType: "C.C.",
    beneficiaryDocumentNumber: "0954321098",
    beneficiaryPhone: "3154321098",
    beneficiaryEmail: "isabella.morales@example.com",
  },
  {
    id: "0014",
    name: "Valentina Isabel Castro Medina",
    email: "valentina.castro@example.com",
    documentNumber: "0954321098",
    documentType: "C.C.",
    phone: "3207654321",
    address: "Carrera 34 #56-78, Armenia",
    birthdate: new Date(1989, 8, 5),
    emergencyContact: "Santiago Castro",
    emergencyPhone: "3004567890",
    membershipType: "Familiar",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 85),
    isBeneficiary: true,
  },
  {
    id: "0015",
    name: "Andrés Felipe Herrera Quintero",
    email: "andres.herrera@example.com",
    documentNumber: "0943210987",
    documentType: "C.C.",
    phone: "3151098765",
    address: "Avenida 56 #78-90, Popayán",
    birthdate: new Date(1984, 7, 17),
    emergencyContact: "Mariana Herrera",
    emergencyPhone: "3207654321",
    membershipType: "Básico",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 7),
    isBeneficiary: true,
  },
  {
    id: "0016",
    name: "Gabriela Alejandra Ortiz Rojas",
    email: "gabriela.ortiz@example.com",
    documentNumber: "0932109876",
    documentType: "C.C.",
    phone: "3006789012",
    address: "Calle 78 #90-12, Tunja",
    birthdate: new Date(1991, 2, 25),
    emergencyContact: "Mateo Ortiz",
    emergencyPhone: "3151098765",
    membershipType: "Premium",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 65),
    isBeneficiary: false,
    beneficiaryName: "Samuel Ortiz",
    beneficiaryRelation: "Familiar",
    beneficiaryDocumentType: "C.C.",
    beneficiaryDocumentNumber: "0921098765",
    beneficiaryPhone: "3143210987",
    beneficiaryEmail: "samuel.ortiz@example.com",
  },
  {
    id: "0017",
    name: "Santiago José Mendoza Vargas",
    email: "santiago.mendoza@example.com",
    documentNumber: "0921098765",
    documentType: "C.C.",
    phone: "3102345678",
    address: "Carrera 12 #34-56, Montería",
    birthdate: new Date(1979, 11, 10),
    emergencyContact: "Valeria Mendoza",
    emergencyPhone: "3006789012",
    membershipType: "Estándar",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 25),
    isBeneficiary: true,
  },
  {
    id: "0018",
    name: "Isabella Catalina Duarte Soto",
    email: "isabella.duarte@example.com",
    documentNumber: "0910987654",
    documentType: "C.C.",
    phone: "3208901234",
    address: "Avenida 34 #56-78, Sincelejo",
    birthdate: new Date(1994, 4, 8),
    emergencyContact: "Nicolás Duarte",
    emergencyPhone: "3102345678",
    membershipType: "Trimestral",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 80),
    isBeneficiary: true,
  },
  {
    id: "0019",
    name: "Mateo Alejandro Soto Rincón",
    email: "mateo.soto@example.com",
    documentNumber: "0900987654",
    documentType: "C.C.",
    phone: "3153456789",
    address: "Calle 56 #78-90, Riohacha",
    birthdate: new Date(1987, 1, 15),
    emergencyContact: "Luciana Soto",
    emergencyPhone: "3208901234",
    membershipType: "Básico",
    status: "Inactivo",
    membershipEndDate: addDays(new Date(), -5),
    isBeneficiary: false,
    beneficiaryName: "Emilia Soto",
    beneficiaryRelation: "Familiar",
    beneficiaryDocumentType: "C.C.",
    beneficiaryDocumentNumber: "0890987654",
    beneficiaryPhone: "3132109876",
    beneficiaryEmail: "emilia.soto@example.com",
  },
  {
    id: "0020",
    name: "Valeria Camila Rincón Parra",
    email: "valeria.rincon@example.com",
    documentNumber: "0890987654",
    documentType: "C.C.",
    phone: "3005432109",
    address: "Carrera 78 #90-12, Quibdó",
    birthdate: new Date(1990, 9, 20),
    emergencyContact: "Sebastián Rincón",
    emergencyPhone: "3153456789",
    membershipType: "Semestral",
    status: "Activo",
    membershipEndDate: addDays(new Date(), 160),
    isBeneficiary: true,
  },
];

// Actualizar los contratos para que coincidan con la estructura de la tabla contratos
export const MOCK_CONTRACTS: any[] = [
  {
    id: 1,
    id_cliente: 1,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -15),
    fecha_fin: addDays(new Date(), 45),
    estado: "Activo",
    cliente_nombre: "Juan Carlos Pérez Rodríguez",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1098765432",
    cliente_documento_tipo: "C.C.",
    precio_total: 65000
  },
  {
    id: 2,
    id_cliente: 2,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -15),
    fecha_fin: addDays(new Date(), 15),
    estado: "Activo",
    cliente_nombre: "María Fernanda González López",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "1087654321",
    cliente_documento_tipo: "C.C.",
    precio_total: 50000
  },
  {
    id: 3,
    id_cliente: 3,
    id_membresia: 3,
    fecha_inicio: addDays(new Date(), -25),
    fecha_fin: addDays(new Date(), 5),
    estado: "Activo",
    cliente_nombre: "Carlos Andrés Rodríguez Gómez",
    membresia_nombre: "Easy",
    membresia_precio: 55000,
    cliente_documento: "1076543210",
    cliente_documento_tipo: "C.C.",
    precio_total: 55000
  },
  {
    id: 4,
    id_cliente: 4,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -30),
    fecha_fin: addDays(new Date(), 60),
    estado: "Activo",
    cliente_nombre: "Ana María Martínez Vargas",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1065432109",
    cliente_documento_tipo: "C.C.",
    precio_total: 65000
  },
  {
    id: 5,
    id_cliente: 5,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -40),
    fecha_fin: addDays(new Date(), -10),
    estado: "Cancelado",
    cliente_nombre: "Luis Alberto Sánchez Pérez",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "1054321098",
    cliente_documento_tipo: "C.C.",
    precio_total: 50000
  },
  {
    id: 6,
    id_cliente: 6,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -45),
    fecha_fin: addDays(new Date(), 75),
    estado: "Activo",
    cliente_nombre: "Laura Catalina Gómez Ramírez",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1043210987",
    cliente_documento_tipo: "C.C.",
    precio_total: 65000
  },
  {
    id: 7,
    id_cliente: 7,
    id_membresia: 3,
    fecha_inicio: addDays(new Date(), -60),
    fecha_fin: addDays(new Date(), -30),
    estado: "Cancelado",
    cliente_nombre: "Roberto Alejandro Díaz Castro",
    membresia_nombre: "Easy",
    membresia_precio: 55000,
    cliente_documento: "1032109876",
    cliente_documento_tipo: "C.C.",
    precio_total: 55000
  },
  {
    id: 8,
    id_cliente: 8,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -27),
    fecha_fin: addDays(new Date(), 3),
    estado: "Activo",
    cliente_nombre: "Patricia Elena Vargas Morales",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "1021098765",
    cliente_documento_tipo: "C.C.",
    precio_total: 50000
  },
  {
    id: 9,
    id_cliente: 9,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -60),
    fecha_fin: addDays(new Date(), 90),
    estado: "Activo",
    cliente_nombre: "Miguel Ángel Torres Herrera",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1010987654",
    cliente_documento_tipo: "C.C.",
    precio_total: 65000
  },
  {
    id: 10,
    id_cliente: 10,
    id_membresia: 5,
    fecha_inicio: addDays(new Date(), -45),
    fecha_fin: addDays(new Date(), 75),
    estado: "Activo",
    cliente_nombre: "Carmen Rosa Ruiz Jiménez",
    membresia_nombre: "Trimestral",
    membresia_precio: 150000,
    cliente_documento: "1000987654",
    cliente_documento_tipo: "C.C.",
    precio_total: 150000
  },
  {
    id: 11,
    id_cliente: 11,
    id_membresia: 3,
    fecha_inicio: addDays(new Date(), -20),
    fecha_fin: addDays(new Date(), 10),
    estado: "Activo",
    cliente_nombre: "Javier Enrique López Mendoza",
    membresia_nombre: "Easy",
    membresia_precio: 55000,
    cliente_documento: "0987654321",
    cliente_documento_tipo: "C.C.",
    precio_total: 55000
  },
  {
    id: 12,
    id_cliente: 12,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -20),
    fecha_fin: addDays(new Date(), 50),
    estado: "Activo",
    cliente_nombre: "Sofía Valentina Ramírez Ortiz",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "0976543210",
    cliente_documento_tipo: "C.C.",
    precio_total: 65000
  },
  {
    id: 13,
    id_cliente: 13,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -45),
    fecha_fin: addDays(new Date(), -15),
    estado: "Cancelado",
    cliente_nombre: "Daniel Sebastián Morales Duarte",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "0965432109",
    cliente_documento_tipo: "C.C.",
    precio_total: 50000
  },
  {
    id: 14,
    id_cliente: 14,
    id_membresia: 5,
    fecha_inicio: addDays(new Date(), -25),
    fecha_fin: addDays(new Date(), 85),
    estado: "Activo",
    cliente_nombre: "Valentina Isabel Castro Medina",
    membresia_nombre: "Trimestral",
    membresia_precio: 150000,
    cliente_documento: "0954321098",
    cliente_documento_tipo: "C.C.",
    precio_total: 150000
  },
  {
    id: 15,
    id_cliente: 15,
    id_membresia: 3,
    fecha_inicio: addDays(new Date(), -23),
    fecha_fin: addDays(new Date(), 7),
    estado: "Activo",
    cliente_nombre: "Andrés Felipe Herrera Quintero",
    membresia_nombre: "Easy",
    membresia_precio: 55000,
    cliente_documento: "0943210987",
    cliente_documento_tipo: "C.C.",
    precio_total: 55000
  },
  {
    id: 16,
    id_cliente: 16,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -35),
    fecha_fin: addDays(new Date(), 65),
    estado: "Activo",
    cliente_nombre: "Gabriela Alejandra Ortiz Rojas",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "0932109876",
    cliente_documento_tipo: "C.C.",
    precio_total: 65000
  },
  {
    id: 17,
    id_cliente: 17,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -5),
    fecha_fin: addDays(new Date(), 25),
    estado: "Activo",
    cliente_nombre: "Santiago José Mendoza Vargas",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "0921098765",
    cliente_documento_tipo: "C.C.",
    precio_total: 50000
  },
  {
    id: 18,
    id_cliente: 18,
    id_membresia: 5,
    fecha_inicio: addDays(new Date(), -10),
    fecha_fin: addDays(new Date(), 80),
    estado: "Activo",
    cliente_nombre: "Isabella Catalina Duarte Soto",
    membresia_nombre: "Trimestral",
    membresia_precio: 150000,
    cliente_documento: "0910987654",
    cliente_documento_tipo: "C.C.",
    precio_total: 150000
  },
  {
    id: 19,
    id_cliente: 19,
    id_membresia: 3,
    fecha_inicio: addDays(new Date(), -35),
    fecha_fin: addDays(new Date(), -5),
    estado: "Cancelado",
    cliente_nombre: "Mateo Alejandro Soto Rincón",
    membresia_nombre: "Easy",
    membresia_precio: 55000,
    cliente_documento: "0900987654",
    cliente_documento_tipo: "C.C.",
    precio_total: 55000
  },
  {
    id: 20,
    id_cliente: 20,
    id_membresia: 6,
    fecha_inicio: addDays(new Date(), -20),
    fecha_fin: addDays(new Date(), 160),
    estado: "Activo",
    cliente_nombre: "Valeria Camila Rincón Parra",
    membresia_nombre: "Semestral",
    membresia_precio: 280000,
    cliente_documento: "0890987654",
    cliente_documento_tipo: "C.C.",
    precio_total: 280000
  },
];
