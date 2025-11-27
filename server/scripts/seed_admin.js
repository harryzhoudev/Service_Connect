require('dotenv').config();
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');

const FALLBACK_MONGO = 'mongodb://127.0.0.1:27017/service_connect_db';
const mongoUri = process.env.MONGO_URI || FALLBACK_MONGO;

async function seed() {
  try {
    await connectDB(mongoUri);

    const email = 'admin@admin.com';
    const name = 'admin';
    const password = 'Adminpasss';
    const role = 'superuser';

    let user = await User.findOne({ email });

    if (user) {
      user.name = name;
      user.role = role;
      user.password = password; // pre-save hook will hash
      await user.save();
      console.log('Updated existing user to superuser:', email);
    } else {
      await User.create({ name, email, password, role });
      console.log('Created superuser:', email);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to seed superuser:', err);
    process.exit(1);
  }
}

seed();
