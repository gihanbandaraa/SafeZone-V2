const { EmergencyRequest } = require('./models');

async function updateEmergencyRequestsSchema() {
  try {
    console.log('Updating emergency_requests table schema...');
    
    // Sync the model to add new columns
    await EmergencyRequest.sync({ alter: true });
    
    console.log('✅ Successfully updated emergency_requests table schema');
    console.log('New fields added:');
    console.log('- assignedAt: DATE (when request was assigned)');
    console.log('- completedBy: ENUM (who marked as completed)');
    console.log('- canBeDeleted: BOOLEAN (deletion permission flag)');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
}

// Run the update
updateEmergencyRequestsSchema();