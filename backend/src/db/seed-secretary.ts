import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { accounts } from './schema';
import { NodeHasher } from '../lib/password';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL missing'); process.exit(1); }

async function seed() {
  const db = drizzle(neon(url!));
  const hasher = new NodeHasher();
  const hash = await hasher.hash('password123');

  try {
    await db.insert(accounts).values({
      username: 'secretary',
      passwordHash: hash,
      role: 'secretary',
      displayName: 'Ministry Secretary',
      mustChangePassword: false,
      isActive: true,
    });
    console.log('✅ Secretary account created (username: secretary, password: password123)');
  } catch (error: any) {
    if (error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
      console.log('⚠️ Secretary already exists. Skipping.');
    } else {
      console.error(error);
    }
  }
  process.exit(0);
}
seed();
