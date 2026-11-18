import dotenv from 'dotenv'; dotenv.config({ path: 'backend/.env' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { schools, categories } from './schema';

const db = drizzle(neon(process.env.DATABASE_URL!));

async function seed() {
  await db.insert(schools).values([
    { name: 'Kamulu Secondary', code: 'kamulu-sec' },
    { name: 'Mwangaza High', code: 'mwangaza-high' },
    { name: 'Kibera Girls', code: 'kibera-girls' },
    { name: 'Kibera Boys', code: 'kibera-boys' },
    { name: 'Mathare Community', code: 'mathare-comm' },
    { name: 'Dandora Secondary', code: 'dandora-sec' },
    { name: 'Kawangware Mixed', code: 'kawangware-mixed' },
    { name: 'Rongai Academy', code: 'rongai-acad' },
  ]).onConflictDoNothing();

  await db.insert(categories).values([
    { name: 'Bonding' },
    { name: 'Fellowship' },
    { name: 'School Ministration' },
    { name: 'Transport' },
    { name: 'General' },
    { name: 'Donation' },
  ]).onConflictDoNothing();
  
  console.log('✅ Schools and Categories seeded');
  process.exit(0);
}
seed();
