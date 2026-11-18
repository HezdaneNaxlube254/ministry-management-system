import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { accounts } from './schema';
import { NodeHasher } from '../lib/password';

const url = process.env.DATABASE_URL!;
async function seed() {
  const db = drizzle(neon(url));
  const hasher = new NodeHasher();
  const hash = await hasher.hash('password123');
  try {
    await db.insert(accounts).values({
      username: 'treasurer',
      passwordHash: hash,
      role: 'treasurer',
      displayName: 'Ministry Treasurer',
      mustChangePassword: false,
      isActive: true,
    });
    console.log('✅ Treasurer account created');
  } catch (error: any) {
    console.log('Already exists');
  }
  process.exit(0);
}
seed();
