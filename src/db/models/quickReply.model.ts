import { DataTypes, Model } from "sequelize";
import  sequelize  from "../config";
import User from "./user.model";
import WhatsAppAccount from "./whatsAppAccount.model";

export class QuickReply extends Model {
  public id!: number;
  public whatsappAccountId!: number;
  public shortcut!: string;
  public message!: string;
  public mediaUrl?: string | null;
  public mediaType?: string | null;
  public createdBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

QuickReply.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    whatsappAccountId: { type: DataTypes.INTEGER, allowNull: false },
    shortcut: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    mediaUrl: { type: DataTypes.STRING, allowNull: true },
    mediaType: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "quick_replies",
    timestamps: true,
  }
);

// Associations
QuickReply.belongsTo(User, { foreignKey: "createdBy", as: "creator" });
QuickReply.belongsTo(WhatsAppAccount, { foreignKey: "whatsappAccountId", as: "account" });

export default QuickReply;