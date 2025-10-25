// src/models/new_leads.model.ts
import { DataTypes, Model } from "sequelize";
import sequelize from '../config'; // adjust path to your sequelize instance

export class NewLead extends Model {
  declare id: number;
  declare whatsappAccountId: string;
  declare phoneNumber: string;
  declare wa_id: string;
  declare name: string | null;
  declare messageType: string | null;
  declare message: string | null;
  declare mediaUrl: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

NewLead.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    whatsappAccountId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wa_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    messageType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "new_leads",
    tableName: "new_leads",
    timestamps: true,
  }
);

export default NewLead;
