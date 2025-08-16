export interface User {
    id: number
    codigo: string
    nombre: string
    apellido: string
    correo: string
    numero_documento: string
    fecha_actualizacion: string
    asistencias_totales: number
    estado: boolean
    id_rol: number
    tipo_documento: string
    fecha_nacimiento: string
    telefono: string
    direccion: string
    genero: string
    primer_acceso: boolean // ✅ Nuevo campo para controlar primer acceso
}

export interface UserFormData {
    nombre?: string;
    apellido?: string;
    correo?: string;
    confirmarCorreo?: string; // Campo solo para frontend, no se envía a la API
    telefono?: string;
    direccion?: string;
    genero?: 'M' | 'F' | 'O';
    tipo_documento?: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
    numero_documento?: string;
    fecha_nacimiento?: string;
    id_rol?: number;
    // ✅ Se eliminan los campos de contraseña del formulario de usuario
    // contrasena?: string;
    // confirmarContrasena?: string;
}

export interface UpdateUserFormData extends Partial<UserFormData> {
    codigo: string
}
