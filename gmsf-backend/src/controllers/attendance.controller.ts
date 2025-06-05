import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { z } from 'zod';
import Attendance from '../models/attendance';
import User from '../models/user';
import Contract from '../models/contract';
import {
    listAttendanceSchema,
    searchAttendanceSchema,
    createAttendanceSchema,
    idSchema,
    deleteAttendanceSchema,
    QueryParams,
    SearchParams,
    CreateAttendanceData,
    DeleteAttendanceData
} from '../validators/attendance.validator';
import Person from '../models/person';
import Membership from '../models/membership';

// Registrar uso de membresía
export const registerAttendance = async (req: Request<{}, {}, CreateAttendanceData>, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // Validar datos de entrada
        const attendanceData = createAttendanceSchema.parse(req.body);
        const userId = (req.user as any)?.id;

        // Verificar si el contrato existe y está activo
        const contract = await Contract.findOne({
            where: {
                id: attendanceData.id_contrato,
                estado: 'Activo',
                fecha_inicio: {
                    [Op.lte]: new Date()
                },
                fecha_fin: {
                    [Op.gte]: new Date()
                }
            },
            include: [
                {
                    model: Person,
                    as: 'persona',
                    include: [{
                        model: User,
                        attributes: ['id', 'estado', 'asistencias_totales']
                    }]
                }
            ]
        });

        if (!contract) {
            return res.status(404).json({
                status: 'error',
                message: 'Contrato no encontrado o inactivo'
            });
        }

        // Verificar si el usuario está activo
        if (!contract.persona?.User?.estado) {
            return res.status(400).json({
                status: 'error',
                message: 'El usuario está inactivo'
            });
        }

        // Verificar si ya registró asistencia hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingAttendance = await Attendance.findOne({
            where: {
                id_persona: contract.id_persona,
                fecha_uso: today,
                estado: 'Activo'
            }
        });

        if (existingAttendance) {
            return res.status(400).json({
                status: 'error',
                message: 'El usuario ya registró asistencia hoy'
            });
        }

        // Registrar la asistencia
        const newAttendance = await Attendance.create({
            id_persona: contract.id_persona,
            id_contrato: contract.id,
            fecha_uso: today,
            hora_registro: new Date(),
            estado: 'Activo',
            usuario_registro: userId,
            fecha_registro: new Date(),
            fecha_actualizacion: new Date()
        });

        // Incrementar contador de asistencias del usuario
        if (contract.persona?.User?.id) {
            await User.increment('asistencias_totales', {
                by: 1,
                where: { id: contract.persona.User.id }
            });
        }

        // Obtener la asistencia creada con datos completos
        const attendance = await Attendance.findByPk(newAttendance.id, {
            include: [
                {
                    model: Person,
                    as: 'persona',
                    include: [{
                        model: User,
                        attributes: ['codigo', 'nombre', 'apellido', 'numero_documento']
                    }]
                },
                {
                    model: Contract,
                    as: 'contrato',
                    include: [{
                        model: Membership,
                        as: 'membresia',
                        attributes: ['codigo', 'nombre']
                    }]
                }
            ]
        });

        return res.status(201).json({
            status: 'success',
            message: 'Asistencia registrada exitosamente',
            data: attendance
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos de asistencia inválidos',
                errors: error.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensaje: err.message
                }))
            });
        }
        console.error('Error al registrar asistencia:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al registrar la asistencia'
        });
    }
};

// Obtener todas las asistencias con paginación
export const getAttendances = async (req: Request<{}, {}, {}, QueryParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { 
            page = '1', 
            limit = '10', 
            orderBy = 'fecha_uso', 
            direction = 'DESC',
            fecha_inicio,
            fecha_fin
        } = listAttendanceSchema.parse(req.query);

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Construir where según las fechas
        const where: any = {};
        
        if (fecha_inicio && fecha_fin) {
            where.fecha_uso = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }

        // Obtener asistencias y total
        const [attendances, total] = await Promise.all([
            Attendance.findAll({
                where,
                limit: limitNum,
                offset: offset,
                order: [[orderBy, direction]],
                include: [{
                    model: Contract,
                    as: 'contrato',
                    include: [{
                        model: User,
                        attributes: ['codigo', 'nombre', 'apellido']
                    }]
                }]
            }),
            Attendance.count({ where })
        ]);

        res.json({
            status: 'success',
            message: 'Asistencias obtenidas exitosamente',
            data: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                attendances
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Parámetros de consulta inválidos',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Buscar asistencias
export const searchAttendances = async (req: Request<{}, {}, {}, SearchParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { 
            codigo_usuario,
            nombre_usuario,
            fecha_inicio,
            fecha_fin,
            page = '1',
            limit = '10',
            orderBy = 'fecha_uso',
            direction = 'DESC'
        } = searchAttendanceSchema.parse(req.query);

        // Configurar paginación
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        // Construir condiciones de búsqueda
        const whereUser: any = {};
        const whereAttendance: any = {};

        if (codigo_usuario) {
            whereUser.codigo = {
                [Op.iLike]: `${codigo_usuario}%`
            };
        }

        if (nombre_usuario) {
            whereUser[Op.or] = [
                {
                    nombre: {
                        [Op.iLike]: `%${nombre_usuario}%`
                    }
                },
                {
                    apellido: {
                        [Op.iLike]: `%${nombre_usuario}%`
                    }
                }
            ];
        }

        if (fecha_inicio && fecha_fin) {
            whereAttendance.fecha_uso = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }

        // Realizar búsqueda
        const [attendances, total] = await Promise.all([
            Attendance.findAll({
                where: whereAttendance,
                limit: limitNum,
                offset: offset,
                order: [[orderBy, direction]],
                include: [{
                    model: Contract,
                    as: 'contrato',
                    include: [{
                        model: User,
                        where: whereUser,
                        attributes: ['codigo', 'nombre', 'apellido']
                    }]
                }]
            }),
            Attendance.count({
                where: whereAttendance,
                include: [{
                    model: Contract,
                    as: 'contrato',
                    include: [{
                        model: User,
                        where: whereUser
                    }]
                }]
            })
        ]);

        res.json({
            status: 'success',
            message: 'Búsqueda realizada exitosamente',
            data: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                attendances
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                status: 'error',
                message: 'Parámetros de búsqueda inválidos',
                errors: error.errors
            });
            return;
        }
        next(error);
    }
};

// Obtener detalles de una asistencia
export const getAttendanceDetails = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        // Validar ID
        const { id } = idSchema.parse({ id: req.params.id });

        // Buscar la asistencia con todos sus detalles
        const attendance = await Attendance.findByPk(id, {
            include: [{
                model: Contract,
                as: 'contrato',
                include: [{
                    model: User,
                    attributes: ['codigo', 'nombre', 'apellido']
                }]
            }]
        });

        if (!attendance) {
            return res.status(404).json({
                status: 'error',
                message: 'Asistencia no encontrada'
            });
        }

        return res.json({
            status: 'success',
            message: 'Detalles de asistencia obtenidos exitosamente',
            data: {
                attendance
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de asistencia inválido',
                errors: error.errors
            });
        }
        next(error);
    }
};

// Eliminar registros de asistencia
export const deleteAttendances = async (
    req: Request<{}, {}, DeleteAttendanceData>,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const { fecha_inicio, fecha_fin } = deleteAttendanceSchema.parse(req.body);

        // Verificar que la fecha_fin no sea mayor a la fecha actual
        const today = new Date();
        if (new Date(fecha_fin) > today) {
            return res.status(400).json({
                status: 'error',
                message: 'La fecha fin no puede ser mayor a la fecha actual'
            });
        }

        // Eliminar registros en el rango de fechas especificado
        const deletedCount = await Attendance.destroy({
            where: {
                fecha_uso: {
                    [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
                }
            }
        });

        return res.json({
            status: 'success',
            message: `${deletedCount} registros de asistencia eliminados exitosamente`,
            data: {
                deletedCount
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                status: 'error',
                message: 'Datos inválidos',
                errors: error.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensaje: err.message
                }))
            });
        }
        next(error);
    }
};

export class AttendanceController {
    // Obtener todas las asistencias
    public async getAll(req: Request, res: Response) {
        try {
            const attendances = await Attendance.findAll({
                where: { estado: "Activo" },
                include: [
                    {
                        model: Person,
                        as: "persona",
                        attributes: ["codigo", "id_usuario"],
                        include: [{
                            model: User,
                            attributes: ["nombre", "apellido", "numero_documento"]
                        }]
                    },
                    {
                        model: Contract,
                        as: "contrato",
                        attributes: ["codigo", "estado"]
                    }
                ],
                order: [["fecha_uso", "DESC"], ["hora_registro", "DESC"]]
            });

            return res.json({
                status: "success",
                data: attendances
            });
        } catch (error) {
            console.error("Error al obtener asistencias:", error);
            return res.status(500).json({
                status: "error",
                message: "Error al obtener las asistencias"
            });
        }
    }

    // Registrar nueva asistencia
    public async create(req: Request, res: Response) {
        try {
            const { numero_documento } = req.body;
            const userId = (req.user as any)?.id;

            // Buscar persona por número de documento
            const person = await Person.findOne({
                include: [{
                    model: User,
                    where: { 
                        numero_documento,
                        estado: true
                    }
                }]
            });

            if (!person) {
                return res.status(404).json({
                    status: "error",
                    message: "Persona no encontrada o usuario inactivo"
                });
            }

            // Buscar contrato activo
            const contract = await Contract.findOne({
                where: {
                    id_persona: person.id_persona,
                    estado: "Activo",
                    fecha_inicio: {
                        [Op.lte]: new Date()
                    },
                    fecha_fin: {
                        [Op.gte]: new Date()
                    }
                }
            });

            if (!contract) {
                return res.status(400).json({
                    status: "error",
                    message: "No se encontró un contrato activo para esta persona"
                });
            }

            // Verificar si ya registró asistencia hoy
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const existingAttendance = await Attendance.findOne({
                where: {
                    id_persona: person.id_persona,
                    fecha_uso: today,
                    estado: "Activo"
                }
            });

            if (existingAttendance) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya se registró una asistencia hoy para esta persona"
                });
            }

            // Registrar la asistencia
            const newAttendance = await Attendance.create({
                id_persona: person.id_persona,
                id_contrato: contract.id,
                fecha_uso: today,
                hora_registro: new Date(),
                estado: "Activo",
                usuario_registro: userId
            });

            // Incrementar contador de asistencias del usuario
            if (person.id_usuario) {
                await User.increment('asistencias_totales', {
                    by: 1,
                    where: { id: person.id_usuario }
                });
            }

            return res.status(201).json({
                status: "success",
                message: "Asistencia registrada correctamente",
                data: newAttendance
            });

        } catch (error) {
            console.error("Error al registrar asistencia:", error);
            return res.status(500).json({
                status: "error",
                message: "Error al registrar la asistencia"
            });
        }
    }

    // Obtener detalles de una asistencia
    public async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const attendance = await Attendance.findOne({
                where: { 
                    id,
                    estado: "Activo"
                },
                include: [
                    {
                        model: Person,
                        as: "persona",
                        include: [{
                            model: User,
                            attributes: ["nombre", "apellido", "numero_documento"]
                        }]
                    },
                    {
                        model: Contract,
                        as: "contrato",
                        include: [{
                            model: Membership,
                            as: "membresia"
                        }]
                    }
                ]
            });

            if (!attendance) {
                return res.status(404).json({
                    status: "error",
                    message: "Asistencia no encontrada"
                });
            }

            return res.json({
                status: "success",
                data: attendance
            });

        } catch (error) {
            console.error("Error al obtener asistencia:", error);
            return res.status(500).json({
                status: "error",
                message: "Error al obtener los detalles de la asistencia"
            });
        }
    }

    // Eliminar asistencia (borrado lógico)
    public async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req.user as any)?.id;

            const attendance = await Attendance.findByPk(id);

            if (!attendance) {
                return res.status(404).json({
                    status: "error",
                    message: "Asistencia no encontrada"
                });
            }

            // Actualizar estado a "Eliminado"
            await attendance.update({
                estado: "Eliminado",
                usuario_actualizacion: userId,
                fecha_actualizacion: new Date()
            });

            // Decrementar contador de asistencias
            const person = await Person.findByPk(attendance.id_persona);
            if (person?.id_usuario) {
                await User.decrement('asistencias_totales', {
                    by: 1,
                    where: { id: person.id_usuario }
                });
            }

            return res.json({
                status: "success",
                message: "Asistencia eliminada correctamente"
            });

        } catch (error) {
            console.error("Error al eliminar asistencia:", error);
            return res.status(500).json({
                status: "error",
                message: "Error al eliminar la asistencia"
            });
        }
    }
} 