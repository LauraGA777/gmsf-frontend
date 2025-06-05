import { DataTypes, Model, type Optional } from "sequelize"
import sequelize from "../config/db"
import User from "./user"
import Person from "./person"

interface TrainingAttributes {
    id: number
    titulo: string
    descripcion?: string
    fecha_inicio: Date
    fecha_fin: Date
    id_entrenador: number
    id_cliente: number
    estado: "Programado" | "Completado" | "Cancelado"
    notas?: string
    fecha_creacion: Date
}

interface TrainingCreationAttributes
    extends Optional<TrainingAttributes, "id" | "descripcion" | "notas" | "fecha_creacion"> { }

class Training
    extends Model<TrainingAttributes, TrainingCreationAttributes>
    implements TrainingAttributes {
    public id!: number
    public titulo!: string
    public descripcion?: string
    public fecha_inicio!: Date
    public fecha_fin!: Date
    public id_entrenador!: number
    public id_cliente!: number
    public estado!: "Programado" | "Completado" | "Cancelado"
    public notas?: string
    public fecha_creacion!: Date

    // Timestamps
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
}

Training.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        titulo: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fecha_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        id_entrenador: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "usuarios",
                key: "id",
            },
        },
        id_cliente: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "personas",
                key: "id_persona",
            },
        },
        estado: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: "Programado",
            validate: {
                isIn: [["Programado", "Completado", "Cancelado"]],
            },
        },
        notas: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fecha_creacion: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "Entrenamiento",
        tableName: "entrenamientos",
        timestamps: true,
        underscored: true,
    },
)

// Associations
Training.belongsTo(User, { foreignKey: "id_entrenador", as: "entrenador" })
Training.belongsTo(Person, { foreignKey: "id_cliente", as: "cliente" })

User.hasMany(Training, { foreignKey: "id_entrenador", as: "entrenamientos_asignados" })
Person.hasMany(Training, { foreignKey: "id_cliente", as: "entrenamientos" })

export default Training