const { sequelize, User, Organization, EmergencyRequest } = require('./models');

async function setupCompleteDatabase() {
  try {
    console.log('🔧 Setting up complete SafeZone database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Create/recreate all tables (force: true drops and recreates)
    await sequelize.sync({ force: true });
    console.log('📊 Database tables created successfully.');
    
    // Create admin user
    const adminUser = await User.create({
      email: 'admin@safezone.com',
      password: 'admin123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      status: 'active'
    });
    console.log('👤 Admin user created');
    
    // Create organization users
    const orgUser1 = await User.create({
      email: 'redcross@safezone.com',
      password: 'org123',
      firstName: 'Red',
      lastName: 'Cross',
      role: 'organization',
      status: 'active'
    });
    
    const orgUser2 = await User.create({
      email: 'firerescue@safezone.com',
      password: 'org123',
      firstName: 'Fire',
      lastName: 'Rescue',
      role: 'organization',
      status: 'active'
    });
    
    // Create organization profiles
    const org1 = await Organization.create({
      userId: orgUser1.id,
      name: 'Red Cross Disaster Relief',
      type: 'red_cross',
      description: 'International disaster relief and emergency assistance organization',
      verified: true,
      serviceAreas: ['flood', 'earthquake', 'tsunami', 'wildfire'],
      capabilities: ['evacuation', 'shelter_management', 'emergency_supplies', 'search_rescue']
    });
    
    const org2 = await Organization.create({
      userId: orgUser2.id,
      name: 'City Fire & Rescue Department',
      type: 'rescue_services',
      description: 'Professional fire fighting and emergency rescue services',
      verified: true,
      serviceAreas: ['wildfire', 'earthquake', 'flood'],
      capabilities: ['firefighting', 'search_rescue', 'medical_assistance', 'evacuation']
    });
    
    console.log('🏢 Organizations created');
    
    // Create volunteer users
    const volunteers = [];
    const volunteerData = [
      { email: 'volunteer1@safezone.com', firstName: 'John', lastName: 'Smith' },
      { email: 'volunteer2@safezone.com', firstName: 'Sarah', lastName: 'Johnson' },
      { email: 'volunteer3@safezone.com', firstName: 'Mike', lastName: 'Wilson' },
      { email: 'volunteer4@safezone.com', firstName: 'Emily', lastName: 'Brown' },
    ];
    
    for (const volData of volunteerData) {
      const volunteer = await User.create({
        ...volData,
        password: 'volunteer123',
        role: 'volunteer',
        status: 'active'
      });
      volunteers.push(volunteer);
    }
    console.log('🤝 Volunteers created');
    
    // Create victim users
    const victims = [];
    const victimDataList = [
      { email: 'victim1@safezone.com', firstName: 'Jane', lastName: 'Doe' },
      { email: 'victim2@safezone.com', firstName: 'Robert', lastName: 'Taylor' },
      { email: 'victim3@safezone.com', firstName: 'Lisa', lastName: 'Anderson' },
      { email: 'victim4@safezone.com', firstName: 'David', lastName: 'Martinez' },
    ];
    
    for (const victimInfo of victimDataList) {
      const victim = await User.create({
        ...victimInfo,
        password: 'victim123',
        role: 'victim',
        status: 'active'
      });
      victims.push(victim);
    }
    console.log('🆘 Victims created');
    
    // Create emergency requests with proper coordinates
    const emergencyRequests = [
      {
        userId: victims[0].id,
        type: 'flood',
        urgency: 'high',
        description: 'Severe flooding in residential area. Multiple families trapped on second floors. Water level rising rapidly.',
        location: '123 Riverside Drive, Downtown District',
        address: '123 Riverside Drive, Downtown District',
        coordinates: { latitude: 40.7128, longitude: -74.0060 }, // New York coordinates
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: victims[1].id,
        type: 'earthquake',
        urgency: 'critical',
        description: 'Building collapse after 6.2 magnitude earthquake. People trapped under debris.',
        location: '456 Main Street, Central Plaza',
        address: '456 Main Street, Central Plaza',
        coordinates: { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles coordinates
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
      },
      {
        userId: victims[2].id,
        type: 'wildfire',
        urgency: 'high',
        description: 'Fast-moving wildfire approaching residential neighborhood. Immediate evacuation needed.',
        location: '789 Forest Lane, Hillside Community',
        address: '789 Forest Lane, Hillside Community',
        coordinates: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco coordinates
        status: 'assigned',
        assignedVolunteerId: volunteers[0].id,
        assignedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        createdAt: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      },
      {
        userId: victims[3].id,
        type: 'landslide',
        urgency: 'medium',
        description: 'Road blocked by landslide. Several vehicles trapped but no immediate injuries reported.',
        location: '321 Mountain Road, Valley View',
        address: '321 Mountain Road, Valley View',
        coordinates: { latitude: 39.7392, longitude: -104.9903 }, // Denver coordinates
        status: 'in_progress',
        assignedVolunteerId: volunteers[1].id,
        assignedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        userId: victims[0].id, // Same victim can have multiple requests
        type: 'tsunami',
        urgency: 'critical',
        description: 'Tsunami warning issued. Coastal evacuation in progress. Need immediate assistance.',
        location: '555 Ocean Boulevard, Coastal District',
        address: '555 Ocean Boulevard, Coastal District',
        coordinates: { latitude: 21.3099, longitude: -157.8581 }, // Honolulu coordinates
        status: 'pending',
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        userId: victims[1].id,
        type: 'cyclone',
        urgency: 'high',
        description: 'Category 3 cyclone approaching. Strong winds and heavy rain. Infrastructure damage.',
        location: '888 Coastal Highway, Beachfront Area',
        address: '888 Coastal Highway, Beachfront Area',
        coordinates: { latitude: 25.7617, longitude: -80.1918 }, // Miami coordinates
        status: 'pending',
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        userId: victims[2].id,
        type: 'drought',
        urgency: 'low',
        description: 'Severe drought conditions. Water shortage in rural community. Need emergency water supply.',
        location: '999 Rural Route 1, Farmland District',
        address: '999 Rural Route 1, Farmland District',
        coordinates: { latitude: 41.8781, longitude: -87.6298 }, // Chicago coordinates
        status: 'completed',
        assignedVolunteerId: volunteers[2].id,
        completedBy: 'volunteer',
        assignedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000) // 26 hours ago
      },
      {
        userId: victims[3].id,
        type: 'other',
        urgency: 'medium',
        description: 'Chemical spill at industrial facility. Area evacuation required. No injuries yet.',
        location: '777 Industrial Park, Manufacturing Zone',
        address: '777 Industrial Park, Manufacturing Zone',
        coordinates: { latitude: 42.3601, longitude: -71.0589 }, // Boston coordinates
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      }
    ];
    
    // Create all emergency requests
    for (const requestData of emergencyRequests) {
      await EmergencyRequest.create(requestData);
    }
    
    console.log('🚨 Emergency requests created with coordinates');
    
    console.log('');
    console.log('🎉 Complete database setup finished successfully!');
    console.log('');
    console.log('📊 Database contains:');
    console.log(`  • 1 Admin user`);
    console.log(`  • 2 Organizations (Red Cross, Fire Rescue)`);
    console.log(`  • ${volunteers.length} Volunteers`);
    console.log(`  • ${victims.length} Victims`);
    console.log(`  • ${emergencyRequests.length} Emergency requests with real coordinates`);
    console.log('');
    console.log('📝 Test accounts:');
    console.log('  Admin:       admin@safezone.com / admin123');
    console.log('  Red Cross:   redcross@safezone.com / org123');
    console.log('  Fire Rescue: firerescue@safezone.com / org123');
    console.log('  Volunteers:  volunteer1-4@safezone.com / volunteer123');
    console.log('  Victims:     victim1-4@safezone.com / victim123');
    console.log('');
    console.log('🗺️  Emergency requests include various disaster types with:');
    console.log('  • Real GPS coordinates for testing navigation');
    console.log('  • Different urgency levels (low, medium, high, critical)');
    console.log('  • Various statuses (pending, assigned, in_progress, completed)');
    console.log('  • Realistic timestamps and descriptions');
    console.log('');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error(error);
    if (error.name === 'SequelizeConnectionError') {
      console.log('');
      console.log('💡 Database connection failed. Please check:');
      console.log('  1. PostgreSQL is running');
      console.log('  2. Database credentials in .env file');
      console.log('  3. Database "safezone_core" exists');
      console.log('');
    }
  } finally {
    await sequelize.close();
    process.exit();
  }
}

setupCompleteDatabase();