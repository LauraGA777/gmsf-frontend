import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface UserAttributes {
    id: number;
    codigo: string;
    nombre: string;
    apellido: string;
    correo: string;
    contrasena_hash: string;
    telefono?: string;
    direccion?: string;
    genero?: 'M' | 'F' | 'O';
    tipo_documento: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
    numero_documento: string;
    fecha_actualizacion: Date;
    asistencias_totales: number;
    fecha_nacimiento: Date;
    estado: boolean;
    id_rol?: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'fecha_actualizacion' | 'asistencias_totales' | 'estado'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public codigo!: string;
    public nombre!: string;
    public apellido!: string;
    public correo!: string;
    public contrasena_hash!: string;
    public telefono!: string;
    public direccion!: string;
    public genero!: 'M' | 'F' | 'O';
    public tipo_documento!: 'CC' | 'CE' | 'TI' | 'PP' | 'DIE';
    public numero_documento!: string;
    public fecha_actualizacion!: Date;
    public asistencias_totales!: number;
    public fecha_nacimiento!: Date;
    public estado!: boolean;
    public id_rol!: number;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    codigo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
        validate: {
            is: /^U\d{3}$/
        }
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [3, 100]
        }
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [3, 100]
        }
    },
    correo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    contrasena_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(15),
        allowNull: true,
        validate: {
            is: /^\d{7,15}$/
        }
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    genero: {
        type: DataTypes.CHAR(1),
        allowNull: true,
        validate: {
            isIn: [['M', 'F', 'O']]
        }
    },
    tipo_documento: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            isIn: [['CC', 'CE', 'TI', 'PP', 'DIE']]
        }
    },
    numero_documento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    fecha_actualizacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    asistencias_totales: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: true,
            isBefore: new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString()
        }
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    id_rol: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'roles',
            key: 'id'
        },
        onDelete: 'SET NULL'
    }
}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: false
});

export default User;