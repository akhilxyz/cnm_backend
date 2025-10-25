import { DataTypes, Model } from "sequelize";
import sequelize from "../config";
import WhatsAppAccount from "./whatsAppAccount.model";
import Contact from "./contact.model";

export class Notification extends Model {
    public id!: number;
    public whatsappAccountId?: number | null; // now optional
    public contactId!: number;
    public title!: string;
    public message!: string;
    public read!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Notification.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        whatsappAccountId: { type: DataTypes.INTEGER, allowNull: true }, // allow null now
        contactId: { type: DataTypes.INTEGER, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        message: { type: DataTypes.TEXT, allowNull: false },
        read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
        sequelize,
        tableName: "notifications",
        timestamps: true,
    }
);

// Associations
Notification.belongsTo(WhatsAppAccount, { foreignKey: "whatsappAccountId", as: "account" });
Notification.belongsTo(Contact, { foreignKey: "contactId", as: "contact" });

export default Notification;
