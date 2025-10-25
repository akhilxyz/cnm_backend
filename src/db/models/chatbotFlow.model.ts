import { DataTypes, Model } from "sequelize";
import sequelize from "../config";
import User from "./user.model";
import WhatsAppAccount from "./whatsAppAccount.model";

export class ChatbotFlow extends Model {
  public id!: number;
  public whatsappAccountId!: number;
  public name!: string;
  public description?: string | null;
  public triggerKeyword?: string | null;
  public flowData!: object;
  public isActive!: boolean;
  public createdBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatbotFlow.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    whatsappAccountId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    triggerKeyword: { type: DataTypes.STRING, allowNull: true },
    flowData: { type: DataTypes.JSON, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "chatbot_flows",
    timestamps: true,
  }
);

// Associations
ChatbotFlow.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
ChatbotFlow.belongsTo(WhatsAppAccount, { foreignKey: "whatsappAccountId", as: "account" });

export default ChatbotFlow;