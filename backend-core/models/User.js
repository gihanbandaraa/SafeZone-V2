const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('./database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 128] }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 50] }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [2, 50] }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('victim', 'volunteer', 'organization', 'admin'),
    allowNull: false,
    defaultValue: 'victim'
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'suspended'),
    allowNull: false,
    defaultValue: 'pending'
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

// Instance methods
User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;