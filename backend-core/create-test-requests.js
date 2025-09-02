const { User, EmergencyRequest } = require('./models');

async function createTestRequests() {
  try {
    // Get victim user
    const victim = await User.findOne({ where: { role: 'victim' } });
    
    if (!victim) {
      console.log('No victim user found');
      return;
    }

    // Create sample natural disaster requests
    const requests = [
      {
        userId: victim.id,
        type: 'flood',
        description: 'Major flooding in residential area, families trapped on second floors',
        location: 'River Valley District, Low-lying areas',
        urgency: 'critical',
        status: 'pending',
        contactInfo: 'Multiple families affected: 555-0123'
      },
      {
        userId: victim.id,
        type: 'earthquake',
        description: 'Earthquake damage, building partially collapsed, people trapped',
        location: 'Downtown Business District, Old Building',
        urgency: 'critical',
        status: 'assigned',
        contactInfo: 'Building security: 555-0456'
      },
      {
        userId: victim.id,
        type: 'landslide',
        description: 'Landslide blocked main road, vehicles and people trapped',
        location: 'Mountain Highway, Slope area near Mile 23',
        urgency: 'high',
        status: 'in_progress',
        contactInfo: 'Road maintenance: 555-0789'
      },
      {
        userId: victim.id,
        type: 'wildfire',
        description: 'Wildfire approaching residential area, evacuation needed',
        location: 'Forest Hills neighborhood, near Pine Ridge',
        urgency: 'critical',
        status: 'pending',
        contactInfo: 'Community leader: 555-0321'
      },
      {
        userId: victim.id,
        type: 'tsunami',
        description: 'Tsunami warning issued, coastal evacuation in progress',
        location: 'Coastal Highway, Beach communities',
        urgency: 'critical',
        status: 'completed',
        contactInfo: 'Emergency services coordinated evacuation',
        completedAt: new Date()
      },
      {
        userId: victim.id,
        type: 'cyclone',
        description: 'Hurricane/Cyclone approaching, strong winds and flooding expected',
        location: 'Coastal regions, multiple districts',
        urgency: 'high',
        status: 'pending',
        contactInfo: 'Meteorological office: 555-0987'
      },
      {
        userId: victim.id,
        type: 'drought',
        description: 'Severe drought affecting rural communities, water shortage critical',
        location: 'Rural farming district, multiple villages',
        urgency: 'medium',
        status: 'assigned',
        contactInfo: 'Village council: 555-0654'
      }
    ];

    for (const request of requests) {
      await EmergencyRequest.create(request);
    }

    console.log('✅ Sample natural disaster requests created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test requests:', error);
  } finally {
    process.exit();
  }
}

createTestRequests();