import { DataTypes, Model } from "sequelize";
import sequelize from "../config";

export class WebhookLog extends Model {
  public id!: number;
  public whatsappAccountId?: number | null;
  public eventType!: string;
  public payload!: object;
  public status!: string;
  public errorMessage?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WebhookLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    whatsappAccountId: { type: DataTypes.INTEGER, allowNull: true },
    eventType: { type: DataTypes.STRING, allowNull: false },
    payload: { type: DataTypes.JSON, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    errorMessage: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "webhook_logs",
    timestamps: true,
  }
);

export default WebhookLog;
