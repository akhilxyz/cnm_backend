import { DataTypes, Model } from 'sequelize';
import sequelize from "../config";

export class UserPlatform extends Model { }

UserPlatform.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User associated with this platform',
    },
    platformName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Platform name, e.g., WhatsApp',
    },
    platformId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Unique platform identifier (e.g., WhatsApp business ID)',
    },
    qrCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'QR code URL or base64 string',
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Shareable link to connect or open the platform',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isConnected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'user_platforms',
    modelName: 'UserPlatform',
    timestamps: true, // adds createdAt, updatedAt
  }
);

export default UserPlatform;
