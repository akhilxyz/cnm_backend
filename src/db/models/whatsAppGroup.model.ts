import { DataTypes, Model } from "sequelize";
import sequelize from "../config";

export class WhatsAppGroup extends Model {
  public id!: number;
  public whatsappAccountId!: number;
  public groupId!: string;
  public groupName!: string;
  public description?: string;
  public participants!: string[];
  public admins?: string[];
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WhatsAppGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    whatsappAccountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    groupName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    participants: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    admins: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "whatsapp_groups",
    timestamps: true,
  }
);