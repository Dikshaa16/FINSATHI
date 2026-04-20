const { User } = require('./models');

async function checkProfile() {
  try {
    const user = await User.findOne({ 
      where: { email: 'ankit@gmail.com' }
    });
    
    if (user) {
      console.log('\n📋 User Profile Data:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', user.firstName, user.lastName);
      console.log('Phone:', user.phoneNumber);
      console.log('Date of Birth:', user.dateOfBirth);
      console.log('Profile Picture:', user.profilePicture ? `${user.profilePicture.substring(0, 50)}... (${user.profilePicture.length} chars)` : 'NULL');
      console.log('Created At:', user.createdAt);
      console.log('Updated At:', user.updatedAt);
    } else {
      console.log('User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProfile();
