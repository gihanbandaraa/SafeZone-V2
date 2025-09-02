const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 200] }
  },
  type: {
    type: DataTypes.ENUM('disaster_relief', 'government_emergency', 'red_cross', 'rescue_services', 'relief_ngo'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  serviceAreas: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  capabilities: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'organizations',
  timestamps: true
});

module.exports = Organization;