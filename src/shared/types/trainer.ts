import type { User, UserFormData } from './user';

// La estructura principal de un Entrenador, tal como viene de la API
export interface Trainer {
    id: number;
    codigo: string;
    id_usuario: number;
    especialidad: string;
    estado: boolean;
    fecha_registro: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
    usuario?: User; // El objeto User está anidado
}

// Para el formulario de creación/edición, anidamos los datos del usuario
export interface TrainerFormData {
    usuario: UserFormData;
    especialidad: string;
    estado?: boolean;
}

// Respuesta de la API para un solo entrenador
export interface SingleTrainerResponse {
    trainer: Trainer;
    message?: string;
}

// Respuesta de la API para una lista paginada de entrenadores
export interface PaginatedTrainersResponse {
    data: Trainer[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message?: string;
}
