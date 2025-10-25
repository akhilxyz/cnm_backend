import { DataTypes, Model, Optional } from "sequelize";
import sequelize from '../config'; // adjust path to your sequelize instance

interface BroadcastAttributes {
  id: number;
  whatsappAccountId: number;
  name: string;
  templateId: number;
  segmentFilter: object | null;
  status: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed';
  totalRecipients: number;
  scheduledAt?: Date | null;
  startedAt?: Date | null;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BroadcastCreationAttributes extends Optional<BroadcastAttributes, 'id' | 'status' | 'totalRecipients' | 'scheduledAt' | 'startedAt'> { }

export class Broadcast extends Model<BroadcastAttributes, BroadcastCreationAttributes>
  implements BroadcastAttributes {
  public id!: number;
  public whatsappAccountId!: number;
  public name!: string;
  public templateId!: number;
  public segmentFilter!: object | null;
  public status!: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed';
  public totalRecipients!: number;
  public scheduledAt!: Date | null;
  public startedAt!: Date | null;
  public createdBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Broadcast.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    whatsappAccountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'whatsapp_account_id'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'template_id'
    },
    segmentFilter: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'segment_filter'
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'paused', 'completed'),
      allowNull: false,
      defaultValue: 'draft',
    },
    totalRecipients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'total_recipients'
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_at'
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'started_at'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by'
    },
  },
  {
    sequelize,
    tableName: 'broadcasts',
    modelName: 'Broadcast',
  }
);

export default Broadcast;
