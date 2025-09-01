const { sequelize, User, Organization, EmergencyRequest } = require('./models');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up SafeZone database...');
    
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
    console.log('👤 Admin user created (admin@safezone.com / admin123)');
    
    // Create sample organization user
    const orgUser = await User.create({
      email: 'org@safezone.com',
      password: 'org123',
      firstName: 'Red',
      lastName: 'Cross',
      role: 'organization',
      status: 'active'
    });
    
    // Create organization profile
    await Organization.create({
      userId: orgUser.id,
      name: 'Red Cross Emergency Services',
      type: 'ngo',
      description: 'Emergency relief organization',
      verified: true,
      serviceAreas: ['medical', 'rescue', 'shelter'],
      capabilities: ['first_aid', 'evacuation', 'food_distribution']
    });
    console.log('🏢 Sample organization created (org@safezone.com / org123)');
    
    // Create sample volunteer
    await User.create({
      email: 'volunteer@safezone.com',
      password: 'volunteer123',
      firstName: 'John',
      lastName: 'Volunteer',
      role: 'volunteer',
      status: 'active'
    });
    console.log('🤝 Sample volunteer created (volunteer@safezone.com / volunteer123)');
    
    // Create sample victim
    await User.create({
      email: 'victim@safezone.com',
      password: 'victim123',
      firstName: 'Jane',
      lastName: 'Victim',
      role: 'victim',
      status: 'active'
    });
    console.log('🆘 Sample victim created (victim@safezone.com / victim123)');
    
    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📝 Test accounts created:');
    console.log('  Admin:     admin@safezone.com / admin123');
    console.log('  Org:       org@safezone.com / org123');
    console.log('  Volunteer: volunteer@safezone.com / volunteer123');
    console.log('  Victim:    victim@safezone.com / victim123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
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

setupDatabase();