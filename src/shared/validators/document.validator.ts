import { z } from "zod";

// Esquema completo de usuario con validación de documentos integrada
export const createUserDocumentSchema = () => {
  return z.object({
    id: z.number().optional(),
    nombre: z.string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede tener más de 100 caracteres"),
    apellido: z.string()
      .min(3, "El apellido debe tener al menos 3 caracteres")
      .max(100, "El apellido no puede tener más de 100 caracteres"),
    correo: z.string()
      .email("Correo electrónico inválido")
      .min(5, "El correo es demasiado corto")
      .max(100, "El correo no puede tener más de 100 caracteres"),
    contrasena: z.string().optional().or(z.literal("")),
    telefono: z.string()
      .refine(
        (val) => val === "" || /^\d{7,15}$/.test(val),
        "El teléfono debe tener entre 7 y 15 dígitos"
      )
      .optional()
      .or(z.literal(""))
      .or(z.undefined()),
    direccion: z.string()
      .min(5, "La dirección debe tener al menos 5 caracteres")
      .max(200, "La dirección no puede tener más de 200 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-]+$/, "La dirección contiene caracteres no permitidos")
      .refine(
        (address) => {
          if (!address || address.trim().length === 0) return true; // Opcional
          const trimmed = address.trim().toLowerCase();
          const roadTypes = ['calle', 'carrera', 'diagonal', 'transversal', 'avenida', 'autopista', 'cl', 'cra', 'dg', 'tv', 'av', 'aut'];
          return roadTypes.some(type => trimmed.startsWith(type));
        },
        { message: "La dirección debe comenzar con un tipo de vía válido (Calle, Carrera, Diagonal, etc.)" }
      )
      .refine(
        (address) => {
          if (!address || address.trim().length === 0) return true; // Opcional
          return /\d/.test(address);
        },
        { message: "La dirección debe contener números" }
      )
      .optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"], {
      required_error: "El tipo de documento es requerido",
    }),
    numero_documento: z.string()
      .min(5, "El número de documento debe tener al menos 5 caracteres")
      .max(20, "El número de documento no puede tener más de 20 caracteres"),
    fecha_nacimiento: z.string().refine(
      (date) => {
        if (!date) return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime())) return false;
        
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 13;
      },
      { message: "El cliente debe tener al menos 13 años" }
    ).refine(
      (date) => {
        if (!date) return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime())) return false;
        
        // No permitir fechas futuras
        const today = new Date();
        return birthDate <= today;
      },
      { message: "La fecha de nacimiento no puede ser una fecha futura" }
    ).refine(
      (date) => {
        if (!date) return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime())) return false;
        
        // Validar fechas inconsistentes (como 31/02)
        const day = birthDate.getDate();
        const month = birthDate.getMonth();
        const year = birthDate.getFullYear();
        
        const reconstructedDate = new Date(year, month, day);
        return reconstructedDate.getDate() === day && 
               reconstructedDate.getMonth() === month && 
               reconstructedDate.getFullYear() === year;
      },
      { message: "Fecha inconsistente o inválida" }
    ),
  }).refine(
    (data) => {
      const { tipo_documento, numero_documento } = data;
      
      if (!tipo_documento || !numero_documento) return true;
      
      // Validaciones específicas por tipo de documento
      switch (tipo_documento) {
        case 'CC': // Cédula de ciudadanía: solo números
        case 'CE': // Cédula de extranjería: solo números
        case 'TI': // Tarjeta de identidad: solo números
          return /^\d+$/.test(numero_documento);
        case 'PP': // Pasaporte: números y letras
        case 'DIE': // Documento de identificación extranjera: números y letras
          return /^[A-Za-z0-9]+$/.test(numero_documento);
        default:
          return true;
      }
    }, {
      message: "El formato del número de documento no es válido para el tipo seleccionado",
      path: ["numero_documento"]
    }
  );
};

// Función de validación de documentos independiente para uso directo
export const validateDocumentFormat = (tipo: string, numero: string): boolean => {
  if (!tipo || !numero) return false;
  
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

// Esquemas específicos para clientes
export const emergencyContactSchema = z.object({
  nombre_contacto: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  telefono_contacto: z.string()
    .refine(
      (val) => /^\d{7,15}$/.test(val),
      "El teléfono debe tener entre 7 y 15 dígitos"
    ),
  relacion_contacto: z.string().min(3, "La relación debe tener al menos 3 caracteres"),
  es_mismo_beneficiario: z.boolean(),
});

export const beneficiarySchema = z.object({
  usuario: createUserDocumentSchema(),
  relacion: z.string().min(3, "La relación debe tener al menos 3 caracteres"),
});

export const createClientSchema = z.object({
  usuario: createUserDocumentSchema(),
  contactos_emergencia: z.array(emergencyContactSchema)
    .min(1, "Se requiere al menos un contacto de emergencia"),
  beneficiarios: z.array(beneficiarySchema).optional(),
  es_beneficiario_propio: z.boolean(),
});

// Esquemas específicos para entrenadores
export const createTrainerUserSchema = () => {
  return z.object({
    id: z.number().optional(),
    nombre: z.string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede tener más de 100 caracteres"),
    apellido: z.string()
      .min(3, "El apellido debe tener al menos 3 caracteres")
      .max(100, "El apellido no puede tener más de 100 caracteres"),
    correo: z.string()
      .email("Correo electrónico inválido")
      .min(5, "El correo es demasiado corto")
      .max(100, "El correo no puede tener más de 100 caracteres"),
    contrasena: z.string().optional().or(z.literal("")),
    telefono: z.string()
      .refine(
        (val) => val === "" || /^\d{7,15}$/.test(val),
        "El teléfono debe tener entre 7 y 15 dígitos"
      )
      .optional()
      .or(z.literal(""))
      .or(z.undefined()),
    direccion: z.string()
      .min(5, "La dirección debe tener al menos 5 caracteres")
      .max(200, "La dirección no puede tener más de 200 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s#\-]+$/, "La dirección contiene caracteres no permitidos")
      .refine(
        (address) => {
          if (!address || address.trim().length === 0) return true; // Opcional
          const trimmed = address.trim().toLowerCase();
          const roadTypes = ['calle', 'carrera', 'diagonal', 'transversal', 'avenida', 'autopista', 'cl', 'cra', 'dg', 'tv', 'av', 'aut'];
          return roadTypes.some(type => trimmed.startsWith(type));
        },
        { message: "La dirección debe comenzar con un tipo de vía válido (Calle, Carrera, Diagonal, etc.)" }
      )
      .refine(
        (address) => {
          if (!address || address.trim().length === 0) return true; // Opcional
          return /\d/.test(address);
        },
        { message: "La dirección debe contener números" }
      )
      .optional(),
    genero: z.enum(['M', 'F', 'O']).optional(),
    tipo_documento: z.enum(["CC", "CE", "TI", "PP", "DIE"], {
      required_error: "El tipo de documento es requerido",
    }),
    numero_documento: z.string()
      .min(5, "El número de documento debe tener al menos 5 caracteres")
      .max(20, "El número de documento no puede tener más de 20 caracteres"),
    fecha_nacimiento: z.string().refine(
      (date) => {
        if (!date) return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime())) return false;
        
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 16;
      },
      { message: "El entrenador debe tener al menos 16 años" }
    ).refine(
      (date) => {
        if (!date) return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime())) return false;
        
        // No permitir fechas futuras
        const today = new Date();
        return birthDate <= today;
      },
      { message: "La fecha de nacimiento no puede ser una fecha futura" }
    ).refine(
      (date) => {
        if (!date) return false;
        const birthDate = new Date(date);
        if (isNaN(birthDate.getTime())) return false;
        
        // Validar fechas inconsistentes (como 31/02)
        const day = birthDate.getDate();
        const month = birthDate.getMonth();
        const year = birthDate.getFullYear();
        
        const reconstructedDate = new Date(year, month, day);
        return reconstructedDate.getDate() === day && 
               reconstructedDate.getMonth() === month && 
               reconstructedDate.getFullYear() === year;
      },
      { message: "Fecha inconsistente o inválida" }
    ),
  }).refine(
    (data: any) => {
      const { tipo_documento, numero_documento } = data;
      
      if (!tipo_documento || !numero_documento) return true;
      
      // Validaciones específicas por tipo de documento
      switch (tipo_documento) {
        case 'CC': // Cédula de ciudadanía: solo números
        case 'CE': // Cédula de extranjería: solo números
        case 'TI': // Tarjeta de identidad: solo números
          return /^\d+$/.test(numero_documento);
        case 'PP': // Pasaporte: números y letras
        case 'DIE': // Documento de identificación extranjera: números y letras
          return /^[A-Za-z0-9]+$/.test(numero_documento);
        default:
          return true;
      }
    }, {
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
};

export const createTrainerSchema = z.object({
  usuario: createTrainerUserSchema(),
  especialidad: z.string().min(3, "La especialidad es requerida y debe tener al menos 3 caracteres"),
  estado: z.boolean().optional().default(true),
});

// Tipos de TypeScript inferidos
export type CreateClientFormValues = z.infer<typeof createClientSchema>;
export type CreateTrainerFormValues = z.infer<typeof createTrainerSchema>;
export type UserDocumentSchema = z.infer<ReturnType<typeof createUserDocumentSchema>>;

export default {
  createUserDocumentSchema,
  createClientSchema,
  createTrainerSchema,
  emergencyContactSchema,
  beneficiarySchema,
  validateDocumentFormat
};
