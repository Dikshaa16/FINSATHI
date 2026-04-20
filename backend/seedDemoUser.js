/**
 * Seed Demo User
 * Creates a demo user account for testing
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('./config/database');
const { User, FinancialProfile } = require('./models');

async function seedDemoUser() {
  try {
    console.log('🌱 Seeding demo user...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models
    await sequelize.sync();
    console.log('✅ Models synchronized');

    // Check if demo user already exists
    const existingUser = await User.findOne({
      where: { email: 'demo@finsathi.com' }
    });

    if (existingUser) {
      console.log('ℹ️  Demo user already exists');
      return;
    }

    // Create demo user (password will be hashed by User model's beforeCreate hook)
    const user = await User.create({
      id: uuidv4(),
      email: 'demo@finsathi.com',
      password: 'Demo123!',
      firstName: 'Demo',
      lastName: 'User',
      phoneNumber: '+91 9876543210',
      isActive: true
    });

    console.log('✅ Demo user created');

    // Create financial profile
    await FinancialProfile.create({
      id: uuidv4(),
      userId: user.id,
      monthlyIncome: 50000,
      currentBalance: 25000,
      fixedExpenses: 15000,
      averageDailySpending: 500,
      spendingConsistency: 0.7,
      impulsiveness: 0.3,
      savingsGoalAdherence: 0.6,
      needsDiscipline: 0.8,
      wantsDiscipline: 0.6,
      savingsDiscipline: 0.7,
      autoFlowEnabled: false,
      needsPercentage: 50,
      wantsPercentage: 30,
      savingsPercentage: 20
    });

    console.log('✅ Financial profile created');
    console.log('\n📧 Demo Credentials:');
    console.log('   Email: demo@finsathi.com');
    console.log('   Password: Demo123!');
    console.log('\n✨ Demo user seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo user:', error);
    process.exit(1);
  }
}

seedDemoUser();
