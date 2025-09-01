const { User, EmergencyRequest } = require('./models');

async function createTestRequests() {
  try {
    // Get victim user
    const victim = await User.findOne({ where: { role: 'victim' } });
    
    if (!victim) {
      console.log('No victim user found');
      return;
    }

    // Create sample emergency requests
    const requests = [
      {
        userId: victim.id,
        type: 'Medical Emergency',
        description: 'Person collapsed on the street, needs immediate medical attention',
        location: 'Main Street, Downtown',
        urgency: 'critical',
        status: 'pending',
        contactInfo: 'Call 555-0123'
      },
      {
        userId: victim.id,
        type: 'Fire',
        description: 'Building fire reported, evacuation needed',
        location: 'Oak Avenue, Building 123',
        urgency: 'high',
        status: 'assigned',
        contactInfo: 'Building manager: 555-0456'
      },
      {
        userId: victim.id,
        type: 'Natural Disaster',
        description: 'Flood damage, need shelter and supplies',
        location: 'River Road, Residential Area',
        urgency: 'medium',
        status: 'in_progress',
        contactInfo: 'Family of 4: 555-0789'
      },
      {
        userId: victim.id,
        type: 'Accident',
        description: 'Car accident on highway, injuries reported',
        location: 'Highway 101, Mile Marker 45',
        urgency: 'high',
        status: 'completed',
        contactInfo: 'Emergency services already notified',
        completedAt: new Date()
      },
      {
        userId: victim.id,
        type: 'Missing Person',
        description: 'Child missing since yesterday evening',
        location: 'Central Park area',
        urgency: 'critical',
        status: 'pending',
        contactInfo: 'Parent: 555-0321'
      }
    ];

    for (const request of requests) {
      await EmergencyRequest.create(request);
    }

    console.log('✅ Sample emergency requests created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test requests:', error);
  } finally {
    process.exit();
  }
}

createTestRequests();