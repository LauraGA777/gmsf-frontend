import { z } from 'zod';

// Esquema para validar ID
export const idSchema = z.object({
    id: z.string().regex(/^\d+$/, 'El ID debe ser un número')
});

// Esquema para crear asistencia
export const createAttendanceSchema = z.object({
    id_contrato: z.number({
        required_error: 'El ID del contrato es requerido',
        invalid_type_error: 'El ID del contrato debe ser un número'
    })
});

// Esquema para listar asistencias
export const listAttendanceSchema = z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    orderBy: z.enum(['fecha_uso']).optional(),
    direction: z.enum(['ASC', 'DESC']).optional(),
    fecha_inicio: z.string().datetime().optional(),
    fecha_fin: z.string().datetime().optional()
}).refine(
    (data) => {
        // Si se proporciona una fecha, ambas deben estar presentes
        if (data.fecha_inicio || data.fecha_fin) {
            return data.fecha_inicio && data.fecha_fin;
        }
        return true;
    },
    {
        message: 'Si se proporciona una fecha, debe proporcionar tanto fecha de inicio como fecha fin'
    }
).refine(
    (data) => {
        // Si ambas fechas están presentes, fecha_fin debe ser mayor a fecha_inicio
        if (data.fecha_inicio && data.fecha_fin) {
            return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
        }
        return true;
    },
    {
        message: 'La fecha fin debe ser mayor o igual a la fecha de inicio'
    }
);

// Esquema para búsqueda de asistencias
export const searchAttendanceSchema = z.object({
    codigo_usuario: z.string().optional(),
    nombre_usuario: z.string().optional(),
    fecha_inicio: z.string().datetime().optional(),
    fecha_fin: z.string().datetime().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    orderBy: z.enum(['fecha_uso']).optional(),
    direction: z.enum(['ASC', 'DESC']).optional()
}).refine(
    (data) => {
        // Si se proporciona una fecha, ambas deben estar presentes
        if (data.fecha_inicio || data.fecha_fin) {
            return data.fecha_inicio && data.fecha_fin;
        }
        return true;
    },
    {
        message: 'Si se proporciona una fecha, debe proporcionar tanto fecha de inicio como fecha fin'
    }
).refine(
    (data) => {
        // Si ambas fechas están presentes, fecha_fin debe ser mayor a fecha_inicio
        if (data.fecha_inicio && data.fecha_fin) {
            return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
        }
        return true;
    },
    {
        message: 'La fecha fin debe ser mayor o igual a la fecha de inicio'
    }
);

// Esquema para eliminar asistencias
export const deleteAttendanceSchema = z.object({
    fecha_inicio: z.string().datetime({
        message: 'La fecha de inicio debe ser una fecha válida'
    }),
    fecha_fin: z.string().datetime({
        message: 'La fecha fin debe ser una fecha válida'
    })
}).refine(
    (data) => {
        return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
    },
    {
        message: 'La fecha fin debe ser mayor o igual a la fecha de inicio'
    }
);

// Tipos inferidos de los esquemas
export type QueryParams = z.infer<typeof listAttendanceSchema>;
export type SearchParams = z.infer<typeof searchAttendanceSchema>;
export type CreateAttendanceData = z.infer<typeof createAttendanceSchema>;
export type DeleteAttendanceData = z.infer<typeof deleteAttendanceSchema>; 