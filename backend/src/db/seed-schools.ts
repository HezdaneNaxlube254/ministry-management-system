import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { schools, categories } from './schema';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL missing'); process.exit(1); }

async function seed() {
  const db = drizzle(neon(url!));

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
    { name: 'Bonding', fieldLabel: 'Venue' },
    { name: 'Fellowship', fieldLabel: 'Venue' },
    { name: 'School Ministration', fieldLabel: null },
    { name: 'School Visit', fieldLabel: 'School Name' },
    { name: 'Transport', fieldLabel: 'Destination' },
    { name: 'Printing & Stationery', fieldLabel: 'Item Printed' },
    { name: 'T-Shirts & Merch', fieldLabel: 'Item' },
    { name: 'Events', fieldLabel: 'Event Name' },
    { name: 'Fundraising', fieldLabel: 'Campaign' },
    { name: 'General', fieldLabel: 'Reason' },
    { name: 'Donation', fieldLabel: 'Donor' },
    { name: 'Refund', fieldLabel: 'Original Source' },
    { name: 'Balance Marker', fieldLabel: 'Label (e.g. Bal c/f)' },
  ]).onConflictDoNothing();

  console.log('✅ Schools and Categories seeded');
  process.exit(0);
}
seed();
