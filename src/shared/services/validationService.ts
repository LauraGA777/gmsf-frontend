import { z } from 'zod';

/**
 * Servicio centralizado de validación para formularios de GMSF
 * Implementa todas las reglas de validación según los requerimientos:
 * - Email: máximo 64 caracteres, formato válido
 * - Teléfono: 5-20 dígitos, sin 4+ dígitos consecutivos iguales
 * - Documento: permite dígitos consecutivos, formato según tipo
 * - Fecha nacimiento: Cliente 13+ años, Entrenador 16+ años, máximo 120 años
 * - Dirección: formato colombiano, largo y variado
 */

// Validaciones personalizadas
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Verificar longitud total del email (máximo 64 caracteres)
  if (email.length > 64) return false;
  
  // Verificar que no tenga espacios en blanco
  if (/\s/.test(email)) return false;
  
  // Verificar que tenga exactamente un @
  const atCount = (email.match(/@/g) || []).length;
  if (atCount !== 1) return false;
  
  // Separar parte local y dominio
  const [localPart, domain] = email.split('@');
  
  // Validar parte local
  if (!localPart || localPart.length === 0 || localPart.length > 80) return false;
  if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (/\.{2,}/.test(localPart)) return false;
  
  // Validar dominio
  if (!domain || domain.length === 0) return false;
  if (!domain.includes('.')) return false;
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) return false;
  if (/^[.-]|[.-]$/.test(domain)) return false;
  
  // Validar formato completo del email
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Verificar que solo contenga números
  if (!/^\d+$/.test(phone)) return false;
  
  // Verificar longitud (5-20 caracteres)
  if (phone.length < 5 || phone.length > 20) return false;
  
  // Verificar que no tenga 4 o más dígitos consecutivos iguales
  if (/(\d)\1{3,}/.test(phone)) return false;
  
  return true;
};

export const validateDocument = (tipo: string, numero: string): boolean => {
  if (!tipo || !numero) return false;
  
  // Verificar longitud
  if (numero.length < 5 || numero.length > 20) return false;
  
  // Validaciones específicas por tipo de documento
  switch (tipo) {
    case 'CC':
    case 'CE':
    case 'TI':
      return /^\d+$/.test(numero);
    case 'PP':
    case 'DIE':
      return /^[A-Za-z0-9]+$/.test(numero);
    default:
      return false;
  }
};

export const validateBirthDate = (date: string, minAge: number): boolean => {
  if (!date) return false;
  
  const birthDate = new Date(date);
  if (isNaN(birthDate.getTime())) return false;
  
  const today = new Date();
  
  // No permitir fechas futuras
  if (birthDate > today) return false;
  
  // Calcular edad
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // Verificar edad mínima y máxima (120 años)
  return age >= minAge && age <= 120;
};

export const validateColombianAddress = (address: string): boolean => {
  if (!address || address.trim().length === 0) return true; // Opcional
  
  const trimmedAddress = address.trim();
  
  // Validar longitud mínima
  if (trimmedAddress.length < 5) return false;
  
  // Caracteres permitidos
  const allowedChars = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-ABCDEFGHIJKLMNOPQRSTUVWXYZ]+$/;
  if (!allowedChars.test(trimmedAddress)) return false;
  
  // Tipos de vía válidos
  const roadTypes = ['calle', 'cl', 'carrera', 'cra', 'cr', 'diagonal', 'dg', 'transversal', 'tv', 'avenida', 'av', 'autopista'];
  const startsWithValidRoad = roadTypes.some(type => 
    trimmedAddress.toLowerCase().startsWith(type.toLowerCase())
  );
  
  if (!startsWithValidRoad) return false;
  
  // Debe contener números
  if (!/\d/.test(trimmedAddress)) return false;
  
  // Formato básico (flexible para permitir direcciones variadas)
  const hasBasicFormat = /\d+.*#.*\d+.*-.*\d+/i.test(trimmedAddress) || 
                        /\d+.*#.*\d+[a-zA-Z]*.*-.*\d+/i.test(trimmedAddress) ||
                        /\d+[a-zA-Z]*.*#.*\d+.*-.*\d+/i.test(trimmedAddress);
  
  return hasBasicFormat;
};

// Esquemas Zod para validación completa

// Esquema base de usuario
export const baseUserSchema = z.object({
  id: z.number().optional(),
  nombre: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  apellido: z.string()
    .min(3, "El apellido debe tener al menos 3 caracteres")
    .max(100, "El apellido no puede tener más de 100 caracteres"),
  correo: z.string()
    .min(5, "El correo electrónico debe tener mínimo 5 caracteres")
    .max(64, "El correo electrónico debe tener máximo 64 caracteres")
    .refine(validateEmail, "Formato de correo electrónico inválido"),
  telefono: z.string()
    .refine((val) => val === "" || validatePhone(val), "El teléfono debe tener entre 5-20 dígitos y no puede contener 4 o más dígitos consecutivos iguales")
    .optional()
    .or(z.literal("")),
  direccion: z.string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .refine(validateColombianAddress, "Formato de dirección inválido. Use formato colombiano: Tipo vía + número # número - número")
    .optional(),
  genero: z.enum(['M', 'F', 'O']).optional(),
  tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"], {
    required_error: "El tipo de documento es requerido",
  }),
  numero_documento: z.string()
    .min(5, "El número de documento debe tener al menos 5 caracteres")
    .max(20, "El número de documento no puede tener más de 20 caracteres"),
});

// Esquema para cliente (13+ años)
export const clientUserSchema = baseUserSchema.extend({
  contrasena: z.string().optional().or(z.literal("")),
  fecha_nacimiento: z.string()
    .refine((date) => validateBirthDate(date, 13), "El cliente debe tener entre 13 y 120 años. No se permiten fechas futuras"),
}).refine(
  (data) => validateDocument(data.tipo_documento, data.numero_documento),
  {
    message: "El formato del número de documento no es válido para el tipo seleccionado",
    path: ["numero_documento"]
  }
);

// Esquema para entrenador (16+ años)
export const trainerUserSchema = baseUserSchema.extend({
  contrasena: z.string().optional().or(z.literal("")),
  fecha_nacimiento: z.string()
    .refine((date) => validateBirthDate(date, 16), "El entrenador debe tener entre 16 y 120 años. No se permiten fechas futuras"),
}).refine(
  (data) => validateDocument(data.tipo_documento, data.numero_documento),
  {
    message: "El formato del número de documento no es válido para el tipo seleccionado",
    path: ["numero_documento"]
  }
).refine(
  (data: any) => {
    // Si no tiene ID (es usuario nuevo), la contraseña es requerida
    if (!data.id && (!data.contrasena || (typeof data.contrasena === 'string' && data.contrasena.length < 6))) {
      return false;
    }
    return true;
  },
  {
    message: "La contraseña es requerida y debe tener al menos 6 caracteres para usuarios nuevos",
    path: ["contrasena"]
  }
);

// Esquema para contactos de emergencia
export const emergencyContactSchema = z.object({
  nombre_contacto: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  telefono_contacto: z.string()
    .refine(validatePhone, "El teléfono debe tener entre 5-20 dígitos y no puede contener 4 o más dígitos consecutivos iguales"),
  relacion_contacto: z.string()
    .min(3, "La relación debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres"),
  es_mismo_beneficiario: z.boolean().default(false),
});

// Esquema para beneficiarios
export const beneficiarySchema = z.object({
  usuario: clientUserSchema,
  relacion_con_titular: z.string()
    .min(3, "La relación con el titular debe tener al menos 3 caracteres")
    .max(50, "La relación no puede tener más de 50 caracteres"),
});

// Esquema para crear cliente
export const createClientSchema = z.object({
  usuario: clientUserSchema,
  contactos_emergencia: z.array(emergencyContactSchema)
    .min(1, "Se requiere al menos un contacto de emergencia"),
  beneficiarios: z.array(beneficiarySchema).optional(),
  es_beneficiario_propio: z.boolean(),
});

// Esquema para crear entrenador
export const createTrainerSchema = z.object({
  usuario: trainerUserSchema,
  especialidad: z.string()
    .min(3, "La especialidad es requerida y debe tener al menos 3 caracteres")
    .max(100, "La especialidad no puede tener más de 100 caracteres"),
  estado: z.boolean().default(true),
});

// Esquemas para edición (campos opcionales)
export const updateClientUserSchema = baseUserSchema.extend({
  contrasena: z.string().optional().or(z.literal("")),
  fecha_nacimiento: z.string()
    .refine((date) => !date || validateBirthDate(date, 13), "El cliente debe tener entre 13 y 120 años. No se permiten fechas futuras")
    .optional(),
}).partial().refine(
  (data) => !data.tipo_documento || !data.numero_documento || validateDocument(data.tipo_documento, data.numero_documento),
  {
    message: "El formato del número de documento no es válido para el tipo seleccionado",
    path: ["numero_documento"]
  }
);

export const updateTrainerUserSchema = baseUserSchema.extend({
  contrasena: z.string().optional().or(z.literal("")),
  fecha_nacimiento: z.string()
    .refine((date) => !date || validateBirthDate(date, 16), "El entrenador debe tener entre 16 y 120 años. No se permiten fechas futuras")
    .optional(),
}).partial().refine(
  (data) => !data.tipo_documento || !data.numero_documento || validateDocument(data.tipo_documento, data.numero_documento),
  {
    message: "El formato del número de documento no es válido para el tipo seleccionado",
    path: ["numero_documento"]
  }
);

export const updateClientSchema = z.object({
  usuario: updateClientUserSchema,
  contactos_emergencia: z.array(emergencyContactSchema).optional(),
  beneficiarios: z.array(beneficiarySchema).optional(),
  estado: z.boolean().optional(),
});

export const updateTrainerSchema = z.object({
  usuario: updateTrainerUserSchema,
  especialidad: z.string()
    .min(3, "La especialidad debe tener al menos 3 caracteres")
    .max(100, "La especialidad no puede tener más de 100 caracteres")
    .optional(),
  estado: z.boolean().optional(),
});

// Tipos TypeScript inferidos
export type CreateClientFormValues = z.infer<typeof createClientSchema>;
export type CreateTrainerFormValues = z.infer<typeof createTrainerSchema>;
export type UpdateClientFormValues = z.infer<typeof updateClientSchema>;
export type UpdateTrainerFormValues = z.infer<typeof updateTrainerSchema>;
export type ClientUserSchema = z.infer<typeof clientUserSchema>;
export type TrainerUserSchema = z.infer<typeof trainerUserSchema>;
export type EmergencyContact = z.infer<typeof emergencyContactSchema>;
export type Beneficiary = z.infer<typeof beneficiarySchema>;

// Funciones de ayuda para mensajes de error
export const getValidationErrorMessage = (field: string, value: any, context: 'cliente' | 'entrenador' = 'cliente'): string => {
  switch (field) {
    case 'email':
      if (!validateEmail(value)) {
        return 'Formato de correo electrónico inválido. Máximo 64 caracteres.';
      }
      break;
    case 'phone':
      if (!validatePhone(value)) {
        return 'El teléfono debe tener entre 5-20 dígitos y no puede contener 4 o más dígitos consecutivos iguales.';
      }
      break;
    case 'birthDate':
      const minAge = context === 'cliente' ? 13 : 16;
      if (!validateBirthDate(value, minAge)) {
        return `Debe tener entre ${minAge} y 120 años. No se permiten fechas futuras.`;
      }
      break;
    case 'address':
      if (!validateColombianAddress(value)) {
        return 'Formato de dirección inválido. Use formato colombiano: Tipo vía + número # número - número.';
      }
      break;
    default:
      return 'Valor inválido';
  }
  return '';
};

export default {
  // Validadores
  validateEmail,
  validatePhone,
  validateDocument,
  validateBirthDate,
  validateColombianAddress,
  
  // Esquemas
  createClientSchema,
  createTrainerSchema,
  updateClientSchema,
  updateTrainerSchema,
  emergencyContactSchema,
  beneficiarySchema,
  
  // Tipos
  getValidationErrorMessage
};
