
const { v7: uuidv7 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv7(),
    },
    name: {type: DataTypes.STRING(50), unique:true, allowNull:false, validate:{notEmpty:true}},
    whatsapp_number: { type: DataTypes.STRING(20), unique: true, allowNull:false },
    deviceKey: { type: DataTypes.STRING(50), unique:true},
    clientStatus:{type: Boolean, defaultValue: false},
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false }
  }, {
    tableName: 'devices',
    underscored: true,
    timestamps: true,
  });

  
  function generateRandomKey(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
  
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return result;
  }


  Device.beforeSave(async (device) => {
    const rawKey = generateRandomKey(16);
      device.deviceKey = rawKey;
  });

  return Device;
};