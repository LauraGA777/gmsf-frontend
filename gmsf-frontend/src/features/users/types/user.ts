export interface User {
    id: string;
    tipoDocumento: string;
    numeroDocumento: string;
    nombre: string;
    apellido: string;
    correo: string;
    genero: string;
    telefono?: string;
    direccion?: string;
    fechaNacimiento?: string;
    estado: boolean;
    fechaRegistro: string;
}