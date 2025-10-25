import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import { Broadcast } from "./broadcast.model";

interface BroadcastRecipientAttributes {
  id: number;
  broadcastId: number;
  contactId: number;
  status: 'pending' | 'sent' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

interface BroadcastRecipientCreationAttributes extends Optional<BroadcastRecipientAttributes, 'id' | 'status'> { }

export class BroadcastRecipient extends Model<BroadcastRecipientAttributes, BroadcastRecipientCreationAttributes>
  implements BroadcastRecipientAttributes {
  public id!: number;
  public broadcastId!: number;
  public contactId!: number;
  public status!: 'pending' | 'sent' | 'failed';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BroadcastRecipient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    broadcastId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'broadcast_id',
      references: { model: Broadcast, key: 'id' },
      onDelete: 'CASCADE',
    },
    contactId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'contact_id'
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
  },
  {
    sequelize,
    tableName: 'broadcast_recipients',
    modelName: 'BroadcastRecipient',
  }
);

// Associations
Broadcast.hasMany(BroadcastRecipient, { foreignKey: 'broadcast_id', as: 'recipients' });
BroadcastRecipient.belongsTo(Broadcast, { foreignKey: 'broadcast_id', as: 'broadcast' });


export default BroadcastRecipient;
