const { EmergencyRequest, User } = require('./models');

async function createMapTestData() {
  try {
    console.log('🗺️  Creating test data with coordinates for map visualization...\n');

    // Find victim user
    const victimUser = await User.findOne({ where: { role: 'victim' } });
    
    if (!victimUser) {
      console.log('❌ No victim user found');
      return;
    }

    // Test requests with real-world coordinates
    const testRequests = [
      {
        type: 'flood',
        description: 'Severe flooding in downtown area, water level rising rapidly. Multiple buildings affected.',
        location: 'Downtown Financial District',
        coordinates: { latitude: 37.7946, longitude: -122.3999 },
        address: '100 Pine Street, San Francisco, CA 94111',
        urgency: 'critical',
        contactInfo: '+1 (555) 123-4567'
      },
      {
        type: 'earthquake',
        description: 'Building collapsed after 6.5 magnitude earthquake. People trapped inside.',
        location: 'Mission District',
        coordinates: { latitude: 37.7599, longitude: -122.4148 },
        address: '2000 Mission Street, San Francisco, CA 94110',
        urgency: 'critical',
        contactInfo: '+1 (555) 234-5678'
      },
      {
        type: 'wildfire',
        description: 'Fast-moving wildfire threatening residential neighborhood. Immediate evacuation needed.',
        location: 'Twin Peaks Area',
        coordinates: { latitude: 37.7544, longitude: -122.4477 },
        address: '50 Twin Peaks Boulevard, San Francisco, CA 94114',
        urgency: 'high',
        contactInfo: '+1 (555) 345-6789'
      },
      {
        type: 'landslide',
        description: 'Heavy rains caused landslide blocking major road. Vehicles stranded.',
        location: 'Pacific Heights',
        coordinates: { latitude: 37.7886, longitude: -122.4324 },
        address: '1500 Fillmore Street, San Francisco, CA 94115',
        urgency: 'medium',
        contactInfo: '+1 (555) 456-7890'
      },
      {
        type: 'tsunami',
        description: 'Tsunami warning issued. Coastal areas need immediate evacuation.',
        location: 'Ocean Beach',
        coordinates: { latitude: 37.7594, longitude: -122.5107 },
        address: '4000 Great Highway, San Francisco, CA 94122',
        urgency: 'critical',
        contactInfo: '+1 (555) 567-8901'
      },
      {
        type: 'cyclone',
        description: 'Category 3 hurricane approaching. High winds and storm surge expected.',
        location: 'Marina District',
        coordinates: { latitude: 37.8044, longitude: -122.4381 },
        address: '3000 Lyon Street, San Francisco, CA 94123',
        urgency: 'high',
        contactInfo: '+1 (555) 678-9012'
      },
      {
        type: 'drought',
        description: 'Severe water shortage affecting multiple neighborhoods.',
        location: 'Castro District',
        coordinates: { latitude: 37.7609, longitude: -122.4350 },
        address: '400 Castro Street, San Francisco, CA 94114',
        urgency: 'medium',
        contactInfo: '+1 (555) 789-0123'
      },
      {
        type: 'other',
        description: 'Gas leak detected in residential building. Area evacuated as precaution.',
        location: 'Richmond District',
        coordinates: { latitude: 37.7756, longitude: -122.4697 },
        address: '5000 Geary Boulevard, San Francisco, CA 94118',
        urgency: 'high',
        contactInfo: '+1 (555) 890-1234'
      }
    ];

    console.log('Creating emergency requests with coordinates...');
    
    for (let i = 0; i < testRequests.length; i++) {
      const requestData = {
        userId: victimUser.id,
        ...testRequests[i],
        status: i % 4 === 0 ? 'completed' : i % 3 === 0 ? 'in_progress' : i % 2 === 0 ? 'assigned' : 'pending'
      };

      const request = await EmergencyRequest.create(requestData);
      
      console.log(`✅ ${i + 1}. ${request.type} (${request.urgency}) - ${request.address}`);
      console.log(`   📍 ${request.coordinates.latitude}, ${request.coordinates.longitude}`);
      console.log(`   📋 Status: ${request.status}\n`);
    }

    console.log('🎉 Test data created successfully!');
    console.log('\n📊 Summary:');
    console.log('- 8 emergency requests with geographic coordinates');
    console.log('- Mixed urgency levels (critical, high, medium)');
    console.log('- Various disaster types');
    console.log('- Different status states for testing');
    console.log('- Real San Francisco locations for realistic testing');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    process.exit(0);
  }
}

createMapTestData();