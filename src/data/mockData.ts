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
  id: string;
  codigo: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipo_documento: "CC" | "TI";
  numero_documento: string;
  direccion?: string;
  fecha_nacimiento?: string;
  genero: "Masculino" | "Femenino" | "Otro";
  estado: "Activo" | "Inactivo" | "Congelado" | "Pendiente de pago";
  asistencias_totales?: number;
  id_titular?: string;
  relacion?: string;
  fecha_registro: string;
  fecha_actualizacion?: string;
  membershipEndDate?: Date;
  membershipType?: string;
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
    id: "1",
    codigo: "P0001",
    nombre: "Juan Carlos",
    apellido: "Pérez Rodríguez",
    email: "juan.perez@example.com",
    telefono: "3001234567",
    tipo_documento: "CC",
    numero_documento: "1098765432",
    direccion: "Calle 123 #45-67, Bogotá",
    fecha_nacimiento: "1985-06-15",
    genero: "Masculino",
    estado: "Activo",
    asistencias_totales: 15,
    fecha_registro: "2023-01-15",
    membershipEndDate: addDays(new Date(), 45),
    membershipType: "Mensualidad"
  },
  {
    id: "2",
    codigo: "P0002",
    nombre: "María Fernanda",
    apellido: "González López",
    email: "maria.gonzalez@example.com",
    telefono: "3109876543",
    tipo_documento: "CC",
    numero_documento: "1087654321",
    direccion: "Carrera 45 #12-34, Medellín",
    fecha_nacimiento: "1990-04-22",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 8,
    fecha_registro: "2023-02-10",
    membershipEndDate: addDays(new Date(), 15),
    membershipType: "Tiquetera"
  },
  {
    id: "3",
    codigo: "P0003",
    nombre: "Carlos Andrés",
    apellido: "Rodríguez Gómez",
    email: "carlos.rodriguez@example.com",
    telefono: "3205678901",
    tipo_documento: "CC",
    numero_documento: "1076543210",
    direccion: "Avenida 67 #89-12, Cali",
    fecha_nacimiento: "1982-09-10",
    genero: "Masculino",
    estado: "Activo",
    asistencias_totales: 20,
    fecha_registro: "2023-01-05",
    membershipEndDate: addDays(new Date(), 5),
    membershipType: "Easy"
  },
  {
    id: "4",
    codigo: "P0004",
    nombre: "Ana María",
    apellido: "Martínez Vargas",
    email: "ana.martinez@example.com",
    telefono: "3154321098",
    tipo_documento: "CC",
    numero_documento: "1065432109",
    direccion: "Calle 78 #90-12, Barranquilla",
    fecha_nacimiento: "1988-12-05",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 12,
    fecha_registro: "2023-03-20",
    membershipEndDate: addDays(new Date(), 60),
    membershipType: "Mensualidad"
  },
  {
    id: "5",
    codigo: "P0005",
    nombre: "Luis Alberto",
    apellido: "Sánchez Pérez",
    email: "luis.sanchez@example.com",
    telefono: "3006789012",
    tipo_documento: "CC",
    numero_documento: "1054321098",
    direccion: "Carrera 12 #34-56, Bucaramanga",
    fecha_nacimiento: "1975-03-18",
    genero: "Masculino",
    estado: "Inactivo",
    asistencias_totales: 5,
    fecha_registro: "2023-04-10",
    membershipEndDate: addDays(new Date(), -10),
    membershipType: "Tiquetera"
  },
  {
    id: "6",
    codigo: "P0006",
    nombre: "Valentina",
    apellido: "Gómez Torres",
    email: "valentina.gomez@example.com",
    telefono: "3157894561",
    tipo_documento: "CC",
    numero_documento: "1043219876",
    direccion: "Calle 45 #23-67, Medellín",
    fecha_nacimiento: "1992-08-12",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 18,
    fecha_registro: "2023-02-05",
    membershipEndDate: addDays(new Date(), 25),
    membershipType: "Trimestral"
  },
  {
    id: "7",
    codigo: "P0007",
    nombre: "Santiago",
    apellido: "López Ramírez",
    email: "santiago.lopez@example.com",
    telefono: "3209876543",
    tipo_documento: "CC",
    numero_documento: "1032165498",
    direccion: "Avenida 34 #56-78, Bogotá",
    fecha_nacimiento: "1988-11-30",
    genero: "Masculino",
    estado: "Congelado",
    asistencias_totales: 7,
    fecha_registro: "2023-03-15",
    membershipEndDate: addDays(new Date(), 30),
    membershipType: "Mensualidad"
  },
  {
    id: "8",
    codigo: "P0008",
    nombre: "Camila",
    apellido: "Hernández Díaz",
    email: "camila.hernandez@example.com",
    telefono: "3152345678",
    tipo_documento: "CC",
    numero_documento: "1021987654",
    direccion: "Carrera 67 #12-34, Cali",
    fecha_nacimiento: "1995-04-18",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 22,
    fecha_registro: "2023-01-20",
    membershipEndDate: addDays(new Date(), 75),
    membershipType: "Trimestral"
  },
  {
    id: "9",
    codigo: "P0009",
    nombre: "Mateo",
    apellido: "Vargas Jiménez",
    email: "mateo.vargas@example.com",
    telefono: "3004567890",
    tipo_documento: "CC",
    numero_documento: "1010987654",
    direccion: "Calle 89 #45-67, Barranquilla",
    fecha_nacimiento: "1990-09-25",
    genero: "Masculino",
    estado: "Pendiente de pago",
    asistencias_totales: 10,
    fecha_registro: "2023-02-28",
    membershipEndDate: addDays(new Date(), -5),
    membershipType: "Mensualidad"
  },
  {
    id: "10",
    codigo: "P0010",
    nombre: "Isabella",
    apellido: "Martínez Ruiz",
    email: "isabella.martinez@example.com",
    telefono: "3178901234",
    tipo_documento: "CC",
    numero_documento: "1009876543",
    direccion: "Avenida 12 #34-56, Medellín",
    fecha_nacimiento: "1993-12-10",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 25,
    fecha_registro: "2023-01-10",
    membershipEndDate: addDays(new Date(), 180),
    membershipType: "Semestral"
  },
  {
    id: "11",
    codigo: "P0011",
    nombre: "Sebastián",
    apellido: "García Castro",
    email: "sebastian.garcia@example.com",
    telefono: "3123456789",
    tipo_documento: "CC",
    numero_documento: "1098765123",
    direccion: "Carrera 23 #67-89, Bogotá",
    fecha_nacimiento: "1987-05-20",
    genero: "Masculino",
    estado: "Activo",
    asistencias_totales: 30,
    fecha_registro: "2023-03-05",
    membershipEndDate: addDays(new Date(), 320),
    membershipType: "Anual"
  },
  {
    id: "12",
    codigo: "P0012",
    nombre: "Valeria",
    apellido: "Sánchez Morales",
    email: "valeria.sanchez@example.com",
    telefono: "3167890123",
    tipo_documento: "CC",
    numero_documento: "1087654890",
    direccion: "Calle 56 #78-90, Cali",
    fecha_nacimiento: "1991-07-15",
    genero: "Femenino",
    estado: "Inactivo",
    asistencias_totales: 5,
    fecha_registro: "2023-04-15",
    membershipEndDate: addDays(new Date(), -15),
    membershipType: "Mensualidad"
  },
  {
    id: "13",
    codigo: "P0013",
    nombre: "Daniel",
    apellido: "Rodríguez Parra",
    email: "daniel.rodriguez@example.com",
    telefono: "3012345678",
    tipo_documento: "CC",
    numero_documento: "1076543219",
    direccion: "Avenida 78 #90-12, Barranquilla",
    fecha_nacimiento: "1989-02-28",
    genero: "Masculino",
    estado: "Activo",
    asistencias_totales: 17,
    fecha_registro: "2023-02-15",
    membershipEndDate: addDays(new Date(), 20),
    membershipType: "Mensualidad"
  },
  {
    id: "14",
    codigo: "P0014",
    nombre: "Sofía",
    apellido: "López Herrera",
    email: "sofia.lopez@example.com",
    telefono: "3145678901",
    tipo_documento: "CC",
    numero_documento: "1065432198",
    direccion: "Carrera 90 #12-34, Medellín",
    fecha_nacimiento: "1994-10-05",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 12,
    fecha_registro: "2023-03-25",
    membershipEndDate: addDays(new Date(), 10),
    membershipType: "Tiquetera"
  },
  {
    id: "15",
    codigo: "P0015",
    nombre: "Alejandro",
    apellido: "Gómez Vargas",
    email: "alejandro.gomez@example.com",
    telefono: "3189012345",
    tipo_documento: "CC",
    numero_documento: "1054321987",
    direccion: "Calle 34 #56-78, Bogotá",
    fecha_nacimiento: "1986-08-12",
    genero: "Masculino",
    estado: "Congelado",
    asistencias_totales: 8,
    fecha_registro: "2023-01-30",
    membershipEndDate: addDays(new Date(), 45),
    membershipType: "Trimestral"
  },
  {
    id: "16",
    codigo: "P0016",
    nombre: "Gabriela",
    apellido: "Martínez Soto",
    email: "gabriela.martinez@example.com",
    telefono: "3001234987",
    tipo_documento: "CC",
    numero_documento: "1043219870",
    direccion: "Avenida 45 #67-89, Cali",
    fecha_nacimiento: "1992-03-18",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 20,
    fecha_registro: "2023-02-20",
    membershipEndDate: addDays(new Date(), 30),
    membershipType: "Mensualidad"
  },
  {
    id: "17",
    codigo: "P0017",
    nombre: "Nicolás",
    apellido: "Hernández Rojas",
    email: "nicolas.hernandez@example.com",
    telefono: "3156789012",
    tipo_documento: "CC",
    numero_documento: "1032165487",
    direccion: "Carrera 67 #89-01, Barranquilla",
    fecha_nacimiento: "1988-11-10",
    genero: "Masculino",
    estado: "Activo",
    asistencias_totales: 15,
    fecha_registro: "2023-03-10",
    membershipEndDate: addDays(new Date(), 60),
    membershipType: "Trimestral"
  },
  {
    id: "18",
    codigo: "P0018",
    nombre: "Mariana",
    apellido: "García Pérez",
    email: "mariana.garcia@example.com",
    telefono: "3209876123",
    tipo_documento: "CC",
    numero_documento: "1021987645",
    direccion: "Calle 12 #34-56, Medellín",
    fecha_nacimiento: "1995-05-25",
    genero: "Femenino",
    estado: "Pendiente de pago",
    asistencias_totales: 7,
    fecha_registro: "2023-04-05",
    membershipEndDate: addDays(new Date(), -2),
    membershipType: "Mensualidad"
  },
  {
    id: "19",
    codigo: "P0019",
    nombre: "Samuel",
    apellido: "Rodríguez Díaz",
    email: "samuel.rodriguez@example.com",
    telefono: "3178901245",
    tipo_documento: "CC",
    numero_documento: "1010987632",
    direccion: "Avenida 23 #45-67, Bogotá",
    fecha_nacimiento: "1990-12-15",
    genero: "Masculino",
    estado: "Activo",
    asistencias_totales: 22,
    fecha_registro: "2023-01-25",
    membershipEndDate: addDays(new Date(), 150),
    membershipType: "Semestral"
  },
  {
    id: "20",
    codigo: "P0020",
    nombre: "Luciana",
    apellido: "Sánchez Torres",
    email: "luciana.sanchez@example.com",
    telefono: "3123456098",
    tipo_documento: "CC",
    numero_documento: "1009876521",
    direccion: "Carrera 56 #78-90, Cali",
    fecha_nacimiento: "1993-09-08",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 18,
    fecha_registro: "2023-02-08",
    membershipEndDate: addDays(new Date(), 280),
    membershipType: "Anual"
  },
  {
    id: "21",
    codigo: "P0021",
    nombre: "Emilio",
    apellido: "López Castro",
    email: "emilio.lopez@example.com",
    telefono: "3167890145",
    tipo_documento: "CC",
    numero_documento: "1098765098",
    direccion: "Calle 89 #01-23, Barranquilla",
    fecha_nacimiento: "1987-07-30",
    genero: "Masculino",
    estado: "Inactivo",
    asistencias_totales: 3,
    fecha_registro: "2023-03-30",
    membershipEndDate: addDays(new Date(), -20),
    membershipType: "Tiquetera"
  },
  {
    id: "22",
    codigo: "P0022",
    nombre: "Antonella",
    apellido: "Martínez Gómez",
    email: "antonella.martinez@example.com",
    telefono: "3012345987",
    tipo_documento: "CC",
    numero_documento: "1087654367",
    direccion: "Avenida 12 #34-56, Medellín",
    fecha_nacimiento: "1991-04-12",
    genero: "Femenino",
    estado: "Activo",
    asistencias_totales: 25,
    fecha_registro: "2023-01-12",
    membershipEndDate: addDays(new Date(), 25),
    membershipType: "Mensualidad"
  },
  {
    id: "23",
    codigo: "P0023",
    nombre: "Maximiliano",
    apellido: "García Ruiz",
    email: "maximiliano.garcia@example.com",
    telefono: "3145678923",
    tipo_documento: "CC",
    numero_documento: "1076543287",
    direccion: "Carrera 45 #67-89, Bogotá",
    fecha_nacimiento: "1989-10-20",
    genero: "Masculino",
    estado: "Activo",
    asistencias_totales: 15,
    fecha_registro: "2023-02-25",
    membershipEndDate: addDays(new Date(), 15),
    membershipType: "Tiquetera"
  },
  {
    id: "24",
    codigo: "P0024",
    nombre: "Renata",
    apellido: "Rodríguez Morales",
    email: "renata.rodriguez@example.com",
    telefono: "3189012378",
    tipo_documento: "CC",
    numero_documento: "1065432176",
    direccion: "Calle 67 #89-01, Cali",
    fecha_nacimiento: "1994-02-15",
    genero: "Femenino",
    estado: "Congelado",
    asistencias_totales: 10,
    fecha_registro: "2023-03-15",
    membershipEndDate: addDays(new Date(), 40),
    membershipType: "Mensualidad"
  },
  {
    id: "25",
    codigo: "P0025",
    nombre: "Benjamín",
    apellido: "Sánchez Herrera",
    email: "benjamin.sanchez@example.com",
    telefono: "3001234567",
    tipo_documento: "CC",
    numero_documento: "1054321965",
    direccion: "Avenida 90 #12-34, Barranquilla",
    fecha_nacimiento: "1986-12-05",
    genero: "Masculino",
    estado: "Activo",
    asistencias_totales: 28,
    fecha_registro: "2023-01-05",
    membershipEndDate: addDays(new Date(), 90),
    membershipType: "Trimestral"
  }
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
    client: mockClients.find((c) => c.id === "1"),
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
    client: mockClients.find((c) => c.id === "2"),
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
    client: mockClients.find((c) => c.id === "3"),
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

// Actualizar los contratos para que coincidan con la estructura de la tabla contratos
export interface Contract {
  id: number;
  codigo: string;
  id_cliente: number;
  id_membresia: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  precio_total: number;
  estado: "Activo" | "Cancelado" | "Vencido" | "Por vencer" | "Congelado" | "Pendiente de pago";
  fecha_registro: string;
  fecha_actualizacion?: string;
  usuario_registro?: number;
  usuario_actualizacion?: number;
  cliente_nombre: string;
  membresia_nombre: string;
  membresia_precio: number;
  cliente_documento: string;
  cliente_documento_tipo: string;
}

// Datos mockup actualizados para contratos
export const mockContracts: Contract[] = [
  {
    id: 1,
    codigo: "C0001",
    id_cliente: 1,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -15),
    fecha_fin: addDays(new Date(), 45),
    precio_total: 65000,
    estado: "Activo",
    fecha_registro: "2023-05-15",
    cliente_nombre: "Juan Carlos Pérez Rodríguez",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1098765432",
    cliente_documento_tipo: "CC"
  },
  {
    id: 2,
    codigo: "C0002",
    id_cliente: 2,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -15),
    fecha_fin: addDays(new Date(), 15),
    precio_total: 50000,
    estado: "Activo",
    fecha_registro: "2023-05-15",
    cliente_nombre: "María Fernanda González López",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "1087654321",
    cliente_documento_tipo: "CC"
  },
  {
    id: 3,
    codigo: "C0003",
    id_cliente: 3,
    id_membresia: 3,
    fecha_inicio: addDays(new Date(), -25),
    fecha_fin: addDays(new Date(), 5),
    precio_total: 55000,
    estado: "Activo",
    fecha_registro: "2023-05-05",
    cliente_nombre: "Carlos Andrés Rodríguez Gómez",
    membresia_nombre: "Easy",
    membresia_precio: 55000,
    cliente_documento: "1076543210",
    cliente_documento_tipo: "CC"
  },
  {
    id: 4,
    codigo: "C0004",
    id_cliente: 4,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -30),
    fecha_fin: addDays(new Date(), 60),
    precio_total: 65000,
    estado: "Activo",
    fecha_registro: "2023-04-30",
    cliente_nombre: "Ana María Martínez Vargas",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1065432109",
    cliente_documento_tipo: "CC"
  },
  {
    id: 5,
    codigo: "C0005",
    id_cliente: 5,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -40),
    fecha_fin: addDays(new Date(), -10),
    precio_total: 50000,
    estado: "Cancelado",
    fecha_registro: "2023-04-20",
    cliente_nombre: "Luis Alberto Sánchez Pérez",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "1054321098",
    cliente_documento_tipo: "CC"
  },
  {
    id: 6,
    codigo: "C0006",
    id_cliente: 6,
    id_membresia: 5,
    fecha_inicio: addDays(new Date(), -25),
    fecha_fin: addDays(new Date(), 25),
    precio_total: 150000,
    estado: "Activo",
    fecha_registro: "2023-05-05",
    cliente_nombre: "Valentina Gómez Torres",
    membresia_nombre: "Trimestral",
    membresia_precio: 150000,
    cliente_documento: "1043219876",
    cliente_documento_tipo: "CC"
  },
  {
    id: 7,
    codigo: "C0007",
    id_cliente: 7,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -30),
    fecha_fin: addDays(new Date(), 30),
    precio_total: 65000,
    estado: "Congelado",
    fecha_registro: "2023-04-30",
    cliente_nombre: "Santiago López Ramírez",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1032165498",
    cliente_documento_tipo: "CC"
  },
  {
    id: 8,
    codigo: "C0008",
    id_cliente: 8,
    id_membresia: 5,
    fecha_inicio: addDays(new Date(), -15),
    fecha_fin: addDays(new Date(), 75),
    precio_total: 150000,
    estado: "Activo",
    fecha_registro: "2023-05-15",
    cliente_nombre: "Camila Hernández Díaz",
    membresia_nombre: "Trimestral",
    membresia_precio: 150000,
    cliente_documento: "1021987654",
    cliente_documento_tipo: "CC"
  },
  {
    id: 9,
    codigo: "C0009",
    id_cliente: 9,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -35),
    fecha_fin: addDays(new Date(), -5),
    precio_total: 65000,
    estado: "Pendiente de pago",
    fecha_registro: "2023-04-25",
    cliente_nombre: "Mateo Vargas Jiménez",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1010987654",
    cliente_documento_tipo: "CC"
  },
  {
    id: 10,
    codigo: "C0010",
    id_cliente: 10,
    id_membresia: 6,
    fecha_inicio: addDays(new Date(), -10),
    fecha_fin: addDays(new Date(), 180),
    precio_total: 280000,
    estado: "Activo",
    fecha_registro: "2023-05-20",
    cliente_nombre: "Isabella Martínez Ruiz",
    membresia_nombre: "Semestral",
    membresia_precio: 280000,
    cliente_documento: "1009876543",
    cliente_documento_tipo: "CC"
  },
  {
    id: 11,
    codigo: "C0011",
    id_cliente: 11,
    id_membresia: 7,
    fecha_inicio: addDays(new Date(), -45),
    fecha_fin: addDays(new Date(), 320),
    precio_total: 500000,
    estado: "Activo",
    fecha_registro: "2023-04-15",
    cliente_nombre: "Sebastián García Castro",
    membresia_nombre: "Anual",
    membresia_precio: 500000,
    cliente_documento: "1098765123",
    cliente_documento_tipo: "CC"
  },
  {
    id: 12,
    codigo: "C0012",
    id_cliente: 12,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -45),
    fecha_fin: addDays(new Date(), -15),
    precio_total: 65000,
    estado: "Vencido",
    fecha_registro: "2023-04-15",
    cliente_nombre: "Valeria Sánchez Morales",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1087654890",
    cliente_documento_tipo: "CC"
  },
  {
    id: 13,
    codigo: "C0013",
    id_cliente: 13,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -10),
    fecha_fin: addDays(new Date(), 20),
    precio_total: 65000,
    estado: "Activo",
    fecha_registro: "2023-05-20",
    cliente_nombre: "Daniel Rodríguez Parra",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1076543219",
    cliente_documento_tipo: "CC"
  },
  {
    id: 14,
    codigo: "C0014",
    id_cliente: 14,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -20),
    fecha_fin: addDays(new Date(), 10),
    precio_total: 50000,
    estado: "Activo",
    fecha_registro: "2023-05-10",
    cliente_nombre: "Sofía López Herrera",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "1065432198",
    cliente_documento_tipo: "CC"
  },
  {
    id: 15,
    codigo: "C0015",
    id_cliente: 15,
    id_membresia: 5,
    fecha_inicio: addDays(new Date(), -45),
    fecha_fin: addDays(new Date(), 45),
    precio_total: 150000,
    estado: "Congelado",
    fecha_registro: "2023-04-15",
    cliente_nombre: "Alejandro Gómez Vargas",
    membresia_nombre: "Trimestral",
    membresia_precio: 150000,
    cliente_documento: "1054321987",
    cliente_documento_tipo: "CC"
  },
  {
    id: 16,
    codigo: "C0016",
    id_cliente: 16,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -30),
    fecha_fin: addDays(new Date(), 30),
    precio_total: 65000,
    estado: "Activo",
    fecha_registro: "2023-04-30",
    cliente_nombre: "Gabriela Martínez Soto",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1043219870",
    cliente_documento_tipo: "CC"
  },
  {
    id: 17,
    codigo: "C0017",
    id_cliente: 17,
    id_membresia: 5,
    fecha_inicio: addDays(new Date(), -30),
    fecha_fin: addDays(new Date(), 60),
    precio_total: 150000,
    estado: "Activo",
    fecha_registro: "2023-04-30",
    cliente_nombre: "Nicolás Hernández Rojas",
    membresia_nombre: "Trimestral",
    membresia_precio: 150000,
    cliente_documento: "1032165487",
    cliente_documento_tipo: "CC"
  },
  {
    id: 18,
    codigo: "C0018",
    id_cliente: 18,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -32),
    fecha_fin: addDays(new Date(), -2),
    precio_total: 65000,
    estado: "Pendiente de pago",
    fecha_registro: "2023-04-28",
    cliente_nombre: "Mariana García Pérez",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1021987645",
    cliente_documento_tipo: "CC"
  },
  {
    id: 19,
    codigo: "C0019",
    id_cliente: 19,
    id_membresia: 6,
    fecha_inicio: addDays(new Date(), -30),
    fecha_fin: addDays(new Date(), 150),
    precio_total: 280000,
    estado: "Activo",
    fecha_registro: "2023-04-30",
    cliente_nombre: "Samuel Rodríguez Díaz",
    membresia_nombre: "Semestral",
    membresia_precio: 280000,
    cliente_documento: "1010987632",
    cliente_documento_tipo: "CC"
  },
  {
    id: 20,
    codigo: "C0020",
    id_cliente: 20,
    id_membresia: 7,
    fecha_inicio: addDays(new Date(), -20),
    fecha_fin: addDays(new Date(), 280),
    precio_total: 500000,
    estado: "Activo",
    fecha_registro: "2023-05-10",
    cliente_nombre: "Luciana Sánchez Torres",
    membresia_nombre: "Anual",
    membresia_precio: 500000,
    cliente_documento: "1009876521",
    cliente_documento_tipo: "CC"
  },
  {
    id: 21,
    codigo: "C0021",
    id_cliente: 21,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -50),
    fecha_fin: addDays(new Date(), -20),
    precio_total: 50000,
    estado: "Cancelado",
    fecha_registro: "2023-04-10",
    cliente_nombre: "Emilio López Castro",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "1098765098",
    cliente_documento_tipo: "CC"
  },
  {
    id: 22,
    codigo: "C0022",
    id_cliente: 22,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -5),
    fecha_fin: addDays(new Date(), 25),
    precio_total: 65000,
    estado: "Activo",
    fecha_registro: "2023-05-25",
    cliente_nombre: "Antonella Martínez Gómez",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1087654367",
    cliente_documento_tipo: "CC"
  },
  {
    id: 23,
    codigo: "C0023",
    id_cliente: 23,
    id_membresia: 2,
    fecha_inicio: addDays(new Date(), -15),
    fecha_fin: addDays(new Date(), 15),
    precio_total: 50000,
    estado: "Activo",
    fecha_registro: "2023-05-15",
    cliente_nombre: "Maximiliano García Ruiz",
    membresia_nombre: "Tiquetera",
    membresia_precio: 50000,
    cliente_documento: "1076543287",
    cliente_documento_tipo: "CC"
  },
  {
    id: 24,
    codigo: "C0024",
    id_cliente: 24,
    id_membresia: 1,
    fecha_inicio: addDays(new Date(), -20),
    fecha_fin: addDays(new Date(), 40),
    precio_total: 65000,
    estado: "Congelado",
    fecha_registro: "2023-05-10",
    cliente_nombre: "Renata Rodríguez Morales",
    membresia_nombre: "Mensualidad",
    membresia_precio: 65000,
    cliente_documento: "1065432176",
    cliente_documento_tipo: "CC"
  },
  {
    id: 25,
    codigo: "C0025",
    id_cliente: 25,
    id_membresia: 5,
    fecha_inicio: addDays(new Date(), -30),
    fecha_fin: addDays(new Date(), 90),
    precio_total: 150000,
    estado: "Activo",
    fecha_registro: "2023-04-30",
    cliente_nombre: "Benjamín Sánchez Herrera",
    membresia_nombre: "Trimestral",
    membresia_precio: 150000,
    cliente_documento: "1054321965",
    cliente_documento_tipo: "CC"
  }
];

// Exportar los contratos para uso en la aplicación
export const MOCK_CONTRACTS = mockContracts;

// Exportar los clientes para uso en la aplicación
export const MOCK_CLIENTS = mockClients;
