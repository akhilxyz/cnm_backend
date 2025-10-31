import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config'; // adjust path to your sequelize instance

export interface IContactAttributes {
  id?: number;
  whatsappAccountId: number;
  name: string;
  phoneNumber: string;
  countryCode?: string;
  status?: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  tag? : string;
  lastMessageAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IContactCreationAttributes extends Optional<IContactAttributes, 'id' | 'status' | 'lastMessageAt' | 'countryCode'> { }

export class Contact extends Model<IContactAttributes, IContactCreationAttributes> implements IContactAttributes {
  public id!: number;
  public whatsappAccountId!: number;
  public name!: string;
  public phoneNumber!: string;
  public countryCode!: string;
  public status?: 'ACTIVE' | 'BLOCKED' | 'DELETED';
  public lastMessageAt?: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    whatsappAccountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'whatsapp_accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tag: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      // unique: true,
    },
    countryCode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'BLOCKED', 'DELETED'),
      defaultValue: 'ACTIVE',
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Contact',
    tableName: 'contacts',
    timestamps: true,
  }
);

export default Contact;
