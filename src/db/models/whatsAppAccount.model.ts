import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config'; // adjust path to your sequelize instance

// Define the attributes for WhatsAppAccount
interface WhatsAppAccountAttributes {
    id: number;
    userId: number;
    phoneNumber: string;
    displayName: string | null;
    businessName: string | null;
    phoneNumberId: string | null;
    businessAccountId: string | null;
    apiKey: string;
    appToken: string;
    webhookVerifyToken: string;
    webhookUrl?: string | null;
    profilePic?: string | null;
    status: 'active' | 'pending' | 'suspended' | 'disconnected';
    createdAt?: Date;
    updatedAt?: Date;
}

// For creation (id and timestamps auto-generated)
type WhatsAppAccountCreationAttributes = Optional<
    WhatsAppAccountAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'webhookUrl' | 'profilePic'
>;

// Sequelize model definition
class WhatsAppAccount
    extends Model<WhatsAppAccountAttributes, WhatsAppAccountCreationAttributes>
    implements WhatsAppAccountAttributes {
    public id!: number;
    public userId!: number;
    public phoneNumber!: string;
    public displayName!: string | null;
    public businessName!: string | null;
    public phoneNumberId!: string | null;
    public businessAccountId!: string | null;
    public apiKey!: string;
    public appToken!: string
    public webhookVerifyToken!: string;
    public webhookUrl!: string | null;
    public profilePic!: string | null;
    public status!: 'active' | 'pending' | 'suspended' | 'disconnected';
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

WhatsAppAccount.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'phone_number',
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'display_name',
        },
        businessName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'business_name',
        },
        phoneNumberId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'phone_number_id',
        },
        businessAccountId: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'business_account_id',
        },
        apiKey: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'api_key',
        },
        appToken: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'app_token',
        },
        webhookVerifyToken: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'webhook_verify_token',
        },
        webhookUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'webhook_url',
        },
        profilePic: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'profile_pic',
        },
        status: {
            type: DataTypes.ENUM('active', 'pending', 'suspended', 'disconnected'),
            allowNull: false,
            defaultValue: 'active',
        },
    },
    {
        sequelize,
        modelName: 'WhatsAppAccount',
        tableName: 'whatsapp_accounts',
        timestamps: true,
        underscored: true,
    }
);

export default WhatsAppAccount;
