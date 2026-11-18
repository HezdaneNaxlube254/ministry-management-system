#!/usr/bin/env bash
set -euo pipefail
ROOT="$(pwd)"
echo "Building project at: $ROOT"

cat > package.json <<'PKG'
{
  "name": "ministry-system",
  "private": true,
  "workspaces": ["shared", "backend", "frontend"],
  "scripts": {
    "dev": "concurrently -n backend,frontend -c blue,green \"npm run dev -w backend\" \"npm run dev -w frontend\"",
    "dev:backend": "npm run dev -w backend",
    "dev:frontend": "npm run dev -w frontend",
    "db:generate": "npm run db:generate -w backend",
    "db:migrate": "npm run db:migrate -w backend"
  },
  "devDependencies": { "concurrently": "^9.1.0" }
}
PKG

cat > .gitignore <<'GIT'
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
drizzle/meta/
GIT

cat > README.md <<'MD'
# Ministry System (local dev)

## Setup
    npm install
    cp backend/.env.example backend/.env
    npm run dev

Frontend: http://localhost:5173
Backend:  http://localhost:3000/api/health

## Database (deferred)
Add a Neon pooled connection string as DATABASE_URL in backend/.env, then:
    npm run db:generate
    npm run db:migrate
MD

mkdir -p shared/src/schemas
cat > shared/package.json <<'PKG'
{
  "name": "@ministry/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "dependencies": { "zod": "^3.23.8" }
}
PKG

cat > shared/tsconfig.json <<'TS'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
TS

cat > shared/src/constants.ts <<'TS'
export const ROLE_NAMES = [
  'chair', 'patron', 'secretary', 'treasurer',
  'prayer-sec', 'dad', 'mum', 'os', 'facilitator',
] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

export const DEPARTMENTS = ['secretary', 'treasury', 'prayer', 'family', 'os'] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
TS

cat > shared/src/schemas/auth.ts <<'TS'
import { z } from 'zod';
export const LoginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof LoginSchema>;
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
TS

cat > shared/src/index.ts <<'TS'
export * from './schemas/auth';
export * from './constants';
TS

mkdir -p backend/src/db backend/src/middleware
cat > backend/package.json <<'PKG'
{
  "name": "@ministry/backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/node-entry.ts",
    "build": "tsc",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/db/migrate.ts"
  },
  "dependencies": {
    "@hono/node-server": "^1.13.7",
    "@neondatabase/serverless": "^0.10.4",
    "@node-rs/argon2": "^2.0.2",
    "@ministry/shared": "*",
    "dotenv": "^16.4.5",
    "drizzle-orm": "^0.38.3",
    "hono": "^4.6.14",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "drizzle-kit": "^0.30.1",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2"
  }
}
PKG

cat > backend/tsconfig.json <<'TS'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "noEmit": true
  },
  "include": ["src", "drizzle.config.ts"]
}
TS

cat > backend/.env.example <<'ENV'
# Paste your Neon pooled connection string here (contains "-pooler")
DATABASE_URL=
PORT=3000
ENV

cat > backend/src/index.ts <<'TS'
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { LoginSchema } from '@ministry/shared';

const app = new Hono();

app.use('*', cors({
  origin: (origin) => origin ?? '*',
  credentials: true,
}));

app.get('/api/health', (c) => c.json({
  status: 'ok',
  timestamp: new Date().toISOString(),
  db: process.env.DATABASE_URL ? 'configured' : 'not-configured',
}));

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400);
  return c.json({ message: 'Login placeholder - auth not wired yet' }, 501);
});

export default app;
TS

cat > backend/src/node-entry.ts <<'TS'
import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './index';

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Backend listening on http://localhost:${info.port}`);
});
TS

cat > backend/src/db/schema.ts <<'TS'
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  displayName: text('display_name'),
  mustChangePassword: boolean('must_change_password').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').notNull().references(() => accounts.id),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
TS

cat > backend/src/db/client.ts <<'TS'
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set. Add it to backend/.env.');
  return drizzle(neon(url), { schema });
}
TS

cat > backend/src/db/migrate.ts <<'TS'
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL missing in backend/.env'); process.exit(1); }

await migrate(drizzle(neon(url)), { migrationsFolder: './drizzle' });
console.log('Migrations applied.');
TS

cat > backend/drizzle.config.ts <<'TS'
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
TS

mkdir -p frontend/src/lib
cat > frontend/package.json <<'PKG'
{
  "name": "@ministry/frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ministry/shared": "*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
PKG

cat > frontend/tsconfig.json <<'TS'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["src", "vite.config.ts"]
}
TS

cat > frontend/vite.config.ts <<'TS'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
TS

cat > frontend/index.html <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ministry System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

cat > frontend/src/main.tsx <<'TSX'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
TSX

cat > frontend/src/App.tsx <<'TSX'
import { useEffect, useState } from 'react';
import { healthCheck } from './lib/api';

export default function App() {
  const [status, setStatus] = useState('checking...');
  useEffect(() => {
    healthCheck()
      .then(r => setStatus(`Backend: ${r.status} at ${r.timestamp} (db: ${r.db})`))
      .catch(e => setStatus(`Error: ${e.message}`));
  }, []);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Ministry System - Local Dev</h1>
      <p data-testid="health-status">{status}</p>
    </div>
  );
}
TSX

cat > frontend/src/lib/api.ts <<'TS'
type Health = { status: string; timestamp: string; db: string };

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const healthCheck = () => apiFetch<Health>('/health');
TS

cp backend/.env.example backend/.env
echo 'DATABASE_URL is empty for now - app will still run; DB routes need Neon later.'
echo 'Installing dependencies (this may take a minute)...'
npm install
echo ''
echo '=== DONE ==='
echo 'Next steps:'
echo '  1) npm run dev'
echo '  2) Open http://localhost:5173'
echo '  3) Later, when network is good: put Neon pooled URL in backend/.env, then:'
echo '     npm run db:generate && npm run db:migrate'
