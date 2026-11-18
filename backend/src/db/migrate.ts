import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL missing in backend/.env'); process.exit(1); }

await migrate(drizzle(neon(url)), { migrationsFolder: './drizzle' });
console.log('Migrations applied.');
