// models/WhatsAppChat.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config";
import Contact from "./contact.model";

export class WhatsAppChat extends Model {
  public id!: number;
  public whatsappAccountId!: number;
  public contactId!: number;
  public messageId!: string; // WhatsApp message ID
  public direction!: 'inbound' | 'outbound';
  public messageType!: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contacts' | 'sticker' | "template";
  public content!: string | null; // Text content
  public mediaUrl!: string | null; // Media URL
  public mediaId!: string | null; // WhatsApp media ID
  public mimeType!: string | null;
  public caption!: string | null;
  public fileName!: string | null;
  public fileSize!: number | null;
  public thumbnailUrl!: string | null;
  public status!: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'received';
  public errorMessage!: string | null;
  public metadata!: object | null;
  public timestamp!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WhatsAppChat.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    whatsappAccountId: { type: DataTypes.INTEGER, allowNull: false },
    contactId: { type: DataTypes.INTEGER, allowNull: false },
    messageId: { type: DataTypes.STRING, allowNull: false },
    direction: { 
      type: DataTypes.ENUM('inbound', 'outbound'), 
      allowNull: false 
    },
    messageType: { 
      type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'document', 'location', 'contacts', 'sticker', "template"), 
      allowNull: false 
    },
    content: { type: DataTypes.TEXT, allowNull: true },
    mediaUrl: { type: DataTypes.STRING, allowNull: true },
    mediaId: { type: DataTypes.STRING, allowNull: true },
    mimeType: { type: DataTypes.STRING, allowNull: true },
    caption: { type: DataTypes.TEXT, allowNull: true },
    fileName: { type: DataTypes.STRING, allowNull: true },
    fileSize: { type: DataTypes.INTEGER, allowNull: true },
    thumbnailUrl: { type: DataTypes.STRING, allowNull: true },
    status: { 
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed', 'received'), 
      allowNull: false,
      defaultValue: 'pending'
    },
    errorMessage: { type: DataTypes.TEXT, allowNull: true },
    metadata: { type: DataTypes.JSON, allowNull: true },
    timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: "whatsapp_chats",
    timestamps: true,
    indexes: [
      { fields: ['whatsappAccountId'] },
      { fields: ['contactId'] },
      { fields: ['messageId'] },
      { fields: ['timestamp'] },
      { fields: ['status'] }
    ]
  }
);


// Model Associations
WhatsAppChat.belongsTo(Contact, { foreignKey: 'contactId', as: 'contact' });
Contact.hasMany(WhatsAppChat, { foreignKey: 'contactId', as: 'chats' });

export default { WhatsAppChat };