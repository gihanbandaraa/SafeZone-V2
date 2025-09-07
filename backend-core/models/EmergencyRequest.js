const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const EmergencyRequest = sequelize.define('EmergencyRequest', {
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
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  coordinates: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Stores {latitude, longitude} for map visualization'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Human readable address'
  },
  urgency: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  contactInfo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  assignedVolunteerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the request was assigned to a volunteer'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedBy: {
    type: DataTypes.ENUM('victim', 'volunteer', 'organization'),
    allowNull: true,
    comment: 'Who marked the request as completed'
  },
  canBeDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this request can be deleted by organization'
  }
}, {
  tableName: 'emergency_requests',
  timestamps: true,
  hooks: {
    beforeUpdate: (request, options) => {
      // Prevent deletion when request is assigned or in progress
      if (request.status === 'assigned' || request.status === 'in_progress') {
        request.canBeDeleted = false;
      }
      
      // Allow deletion only when completed or cancelled
      if (request.status === 'completed' || request.status === 'cancelled') {
        request.canBeDeleted = true;
      }
      
      // Set assignedAt timestamp when status changes to assigned
      if (request.status === 'assigned' && !request.assignedAt) {
        request.assignedAt = new Date();
      }
      
      // Set completedAt timestamp when status changes to completed
      if (request.status === 'completed' && !request.completedAt) {
        request.completedAt = new Date();
      }
    }
  }
});

// Instance method to check if request can be deleted
EmergencyRequest.prototype.canDelete = function(userRole, userId) {
  // Only allow deletion if:
  // 1. Request is pending (not yet assigned)
  // 2. Request is completed or cancelled
  // 3. User is the original victim (can delete their own request anytime)
  // 4. User is organization and request allows deletion
  
  if (this.userId === userId) {
    // Victim can delete their own request anytime
    return true;
  }
  
  if (userRole === 'organization') {
    // Organization can only delete if allowed
    return this.canBeDeleted && (this.status === 'pending' || this.status === 'completed' || this.status === 'cancelled');
  }
  
  // Volunteers cannot delete requests
  return false;
};

// Instance method to check if status can be changed
EmergencyRequest.prototype.canChangeStatus = function(newStatus, userRole, userId) {
  const currentStatus = this.status;
  
  // Define valid status transitions
  const validTransitions = {
    pending: ['assigned', 'cancelled'],
    assigned: ['in_progress', 'cancelled'],
    in_progress: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };
  
  // Check if transition is valid
  if (!validTransitions[currentStatus].includes(newStatus)) {
    return { valid: false, reason: 'Invalid status transition' };
  }
  
  // Check user permissions for status changes
  if (userRole === 'victim' && userId === this.userId) {
    // Victims can cancel their own requests or mark as completed
    if (newStatus === 'cancelled' || newStatus === 'completed') {
      return { valid: true };
    }
  }
  
  if (userRole === 'volunteer' && userId === this.assignedVolunteerId) {
    // Assigned volunteers can update to in_progress or completed
    if (newStatus === 'in_progress' || newStatus === 'completed') {
      return { valid: true };
    }
  }
  
  if (userRole === 'organization') {
    // Organizations can assign requests and cancel them
    if (newStatus === 'assigned' || newStatus === 'cancelled') {
      return { valid: true };
    }
  }
  
  return { valid: false, reason: 'Insufficient permissions' };
};

module.exports = EmergencyRequest;