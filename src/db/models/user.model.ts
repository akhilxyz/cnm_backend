import { DataTypes, Model } from 'sequelize';
import sequelize from '../config'; // adjust path to your sequelize instance

class User extends Model { }

User.init(
  {
    id: {
      type: DataTypes.INTEGER, // or UUID if preferred
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aboutMe: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    linkedAccounts: {
      type: DataTypes.TEXT, // or TEXT if stringified JSON
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING, // URL to avatar
      allowNull: true,
    },
    lang: {
      type: DataTypes.STRING,
      defaultValue: 'en',
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'USER',
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    loginWith: {
      type: DataTypes.ENUM('email', 'phone', 'gmail'),
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
