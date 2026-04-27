const { loadEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const User = require('./models/User');

async function seed() {
  const env = loadEnv();
  await connectDB(env.mongoUri);

  const users = [
    {
      name: 'Dr. Anita Sharma',
      email: 'doctor@hospital.com',
      password: 'Doctor@123',
      role: 'doctor'
    },
    {
      name: 'Reception Staff',
      email: 'staff@hospital.com',
      password: 'Staff@123',
      role: 'staff'
    }
  ];

  for (const item of users) {
    const exists = await User.findOne({ email: item.email });
    if (exists) {
      exists.name = item.name;
      exists.role = item.role;
      exists.password = item.password;
      await exists.save();
    } else {
      await User.create(item);
    }
  }

  console.log('Seeded demo doctor and staff users');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
