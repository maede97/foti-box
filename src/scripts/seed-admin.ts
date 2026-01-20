import { connectToDatabase } from '@/lib/mongodb';
import Admin from '@/models/admin';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  await connectToDatabase();

  const existingAdmin = await Admin.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('Default admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10); // Default password, change as needed
  const admin = new Admin({ username: 'admin', password: hashedPassword });
  await admin.save();

  console.log('Default admin created: username=admin, password=admin123');
}

seedAdmin().catch(console.error);
