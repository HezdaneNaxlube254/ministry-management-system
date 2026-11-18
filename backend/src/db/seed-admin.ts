import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { accounts } from './schema';
import { NodeHasher } from '../lib/password';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL missing in backend/.env');
  process.exit(1);
}

async function seed() {
  const db = drizzle(neon(url!));
  const hasher = new NodeHasher();
  
  console.log('Hashing password (this takes a moment)...');
  const passwordHash = await hasher.hash('password123');

  console.log('Inserting Chair account into Neon...');
  try {
    await db.insert(accounts).values({
      username: 'chair',
      passwordHash: passwordHash,
      role: 'chair',
      displayName: 'Ministry Chair',
      mustChangePassword: false, // Set to true in production
      isActive: true,
    });
    console.log('✅ Chair account created successfully!');
    console.log('Username: chair');
    console.log('Password: password123');
  } catch (error: any) {
    if (error.message.includes('unique constraint')) {
      console.log('⚠️ Chair account already exists. Skipping.');
    } else {
      console.error('Error seeding account:', error);
    }
  }
  process.exit(0);
}

seed();
