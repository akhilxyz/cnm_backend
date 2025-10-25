import { DataTypes, Model } from 'sequelize';
import sequelize from '../config'; // adjust path to your sequelize instance

class OTP extends Model { }

OTP.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
},
  {
    sequelize: sequelize,
    modelName: 'OTP',
    tableName: 'otps',
    timestamps: true,
  }
);

export default OTP;
