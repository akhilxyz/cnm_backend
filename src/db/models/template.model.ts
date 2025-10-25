import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config';

export interface ITemplateAttributes {
    id?: number;
    whatsappAccountId: number;
    name: string;
    language: string;
    category: string;
    header?: object | null;
    body: string;
    footer?: string | null;
    buttons?: object | null;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt?: Date;
    updatedAt?: Date;
}

interface ITemplateCreationAttributes
    extends Optional<ITemplateAttributes, 'id' | 'header' | 'footer' | 'buttons' | 'status'> { }

export class Template extends Model<ITemplateAttributes, ITemplateCreationAttributes>
    implements ITemplateAttributes {
    public id!: number;
    public whatsappAccountId!: number;
    public name!: string;
    public language!: string;
    public category!: string;
    public header?: object | null;
    public body!: string;
    public footer?: string | null;
    public buttons?: object | null;
    public status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Template.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        whatsappAccountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'whatsapp_accounts', key: 'id' },
            onDelete: 'CASCADE',
        },
        name: { type: DataTypes.STRING(100), allowNull: false },
        language: { type: DataTypes.STRING(10), allowNull: false },
        category: { type: DataTypes.STRING(50), allowNull: false },
        header: { type: DataTypes.JSON, allowNull: true },
        body: { type: DataTypes.TEXT, allowNull: false },
        footer: { type: DataTypes.STRING(255), allowNull: true },
        buttons: { type: DataTypes.JSON, allowNull: true },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            defaultValue: 'PENDING',
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    { sequelize, tableName: 'templates', modelName: 'Template', timestamps: true }
);

export default Template;
