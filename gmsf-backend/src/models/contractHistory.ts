import { DataTypes, Model, type Optional } from "sequelize"
import sequelize from "../config/db"
import Contract from "./contract"
import User from "./user"

interface ContractHistoryAttributes {
  id: number
  id_contrato: number
  estado_anterior?: string
  estado_nuevo: string
  fecha_cambio: Date
  usuario_cambio?: number
  motivo?: string
}

interface ContractHistoryCreationAttributes extends Optional<ContractHistoryAttributes, "id" | "fecha_cambio"> { }

class ContractHistory
  extends Model<ContractHistoryAttributes, ContractHistoryCreationAttributes>
  implements ContractHistoryAttributes {
  public id!: number
  public id_contrato!: number
  public estado_anterior?: string
  public estado_nuevo!: string
  public fecha_cambio!: Date
  public usuario_cambio?: number
  public motivo?: string

  // Timestamps
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

ContractHistory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_contrato: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "contratos",
        key: "id",
      },
    },
    estado_anterior: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    estado_nuevo: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    fecha_cambio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    usuario_cambio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ContractHistory",
    tableName: "historial_contratos",
    timestamps: true,
    underscored: true,
  },
)

// Associations
ContractHistory.belongsTo(Contract, { foreignKey: "id_contrato", as: "contract" })
ContractHistory.belongsTo(User, { foreignKey: "usuario_cambio", as: "user" })

Contract.hasMany(ContractHistory, { foreignKey: "id_contrato", as: "history" })

export default ContractHistory 