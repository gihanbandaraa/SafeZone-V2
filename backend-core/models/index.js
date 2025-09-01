const sequelize = require('./database');
const User = require('./User');
const Organization = require('./Organization');
const EmergencyRequest = require('./EmergencyRequest');

// Define associations
User.hasOne(Organization, { foreignKey: 'userId', as: 'organization' });
Organization.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(EmergencyRequest, { foreignKey: 'userId', as: 'requests' });
EmergencyRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(EmergencyRequest, { foreignKey: 'assignedOrganizationId', as: 'assignedRequests' });
EmergencyRequest.belongsTo(User, { foreignKey: 'assignedOrganizationId', as: 'assignedOrganization' });

User.hasMany(EmergencyRequest, { foreignKey: 'assignedVolunteerId', as: 'volunteerAssignments' });
EmergencyRequest.belongsTo(User, { foreignKey: 'assignedVolunteerId', as: 'assignedVolunteer' });

module.exports = {
  sequelize,
  User,
  Organization,
  EmergencyRequest
};