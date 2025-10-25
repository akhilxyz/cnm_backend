import { DataTypes, Model } from "sequelize";
import sequelize from "../config";
import Contact from "./contact.model";

export class Campaign extends Model {
  public id!: number;
  public whatsappAccountId!: number;
  public title!: string;
  public templateName!: string;
  public languageCode!: string;
  public templateMeta!: any;
  public components!: any[];
  public contactIds!: number[];
  public contactCount!: number;
  public status!: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
  public scheduledAt?: Date;
  public startedAt?: Date;
  public completedAt?: Date;
  public messagesSent!: number;
  public messagesFailed!: number;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Campaign.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    templateName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    languageCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'en_US',
    },
    templateMeta: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    components: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    contactIds: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    contactCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'running', 'completed', 'failed', 'paused'),
      allowNull: false,
      defaultValue: 'draft',
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    messagesSent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    messagesFailed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "campaigns",
    timestamps: true,
  }
);

// Campaign Log Model for tracking individual messages
export class CampaignLog extends Model {
  public id!: number;
  public campaignId!: number;
  public contactId!: number;
  public phoneNumber!: string;
  public status!: 'pending' | 'sent' | 'failed' | 'delivered' | 'read';
  public messageId?: string;
  public errorMessage?: string;
  public sentAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CampaignLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    campaignId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed', 'delivered', 'read'),
      allowNull: false,
      defaultValue: 'pending',
    },
    messageId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "campaign_logs",
    timestamps: true,
  }
);

// Associations
Campaign.hasMany(CampaignLog, { foreignKey: 'campaignId', as: 'logs' });
CampaignLog.belongsTo(Campaign, { foreignKey: 'campaignId' });

// CampaignLog model associations
CampaignLog.belongsTo(Contact, {
  foreignKey: "contactId",
  as: "contact",
});

// Optional (if you want reverse relation)
Contact.hasMany(CampaignLog, {
  foreignKey: "contactId",
  as: "logs",
});