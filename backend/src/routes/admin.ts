import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { accounts, schools, targets } from '../db/schema';
import { NodeHasher } from '../lib/password';
import { AppEnv } from '../types';

export const adminRoutes = new Hono<AppEnv>();
const hasher = new NodeHasher();

adminRoutes.get('/accounts', async (c) => {
  const role = c.get('role');
  if (role !== 'chair' && role !== 'patron') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const db = getDb();
  const all = await db.select({
    id: accounts.id,
    username: accounts.username,
    role: accounts.role,
    displayName: accounts.displayName,
    isActive: accounts.isActive,
    lastLoginAt: accounts.lastLoginAt,
  }).from(accounts);
  return c.json({ accounts: all });
});

adminRoutes.post('/accounts', async (c) => {
  const role = c.get('role');
  if (role !== 'chair' && role !== 'patron') return c.json({ error: 'Forbidden' }, 403);
  const body = await c.req.json();
  if (!body.username || !body.role) return c.json({ error: 'username and role required' }, 400);
  const password = body.password || 'ministry2026';
  const hash = await hasher.hash(password);
  const db = getDb();
  try {
    const [acc] = await db.insert(accounts).values({
      username: body.username,
      passwordHash: hash,
      role: body.role,
      displayName: body.displayName || body.username,
      mustChangePassword: true,
    }).returning();
    return c.json({ account: { id: acc.id, username: acc.username, role: acc.role } }, 201);
  } catch (e: any) {
    if (e.message.includes('unique')) return c.json({ error: 'Username already exists' }, 409);
    return c.json({ error: e.message }, 500);
  }
});

adminRoutes.put('/accounts/:id/reset-password', async (c) => {
  const role = c.get('role');
  if (role !== 'chair' && role !== 'patron') return c.json({ error: 'Forbidden' }, 403);
  const id = Number(c.req.param('id'));
  const hash = await hasher.hash('ministry2026');
  const db = getDb();
  await db.update(accounts).set({ passwordHash: hash, mustChangePassword: true }).where(eq(accounts.id, id));
  return c.json({ message: 'Password reset to ministry2026' });
});

adminRoutes.put('/accounts/:id/toggle', async (c) => {
  const role = c.get('role');
  if (role !== 'chair' && role !== 'patron') return c.json({ error: 'Forbidden' }, 403);
  const id = Number(c.req.param('id'));
  const db = getDb();
  const [acc] = await db.select().from(accounts).where(eq(accounts.id, id));
  if (!acc) return c.json({ error: 'Not found' }, 404);
  await db.update(accounts).set({ isActive: !acc.isActive }).where(eq(accounts.id, id));
  return c.json({ message: acc.isActive ? 'Deactivated' : 'Activated' });
});

adminRoutes.get('/schools', async (c) => {
  const db = getDb();
  const all = await db.select().from(schools);
  return c.json({ schools: all });
});

adminRoutes.post('/schools', async (c) => {
  const role = c.get('role');
  if (role !== 'chair' && role !== 'patron') return c.json({ error: 'Forbidden' }, 403);
  const body = await c.req.json();
  if (!body.name || !body.code) return c.json({ error: 'name and code required' }, 400);
  const db = getDb();
  try {
    const [s] = await db.insert(schools).values({ name: body.name, code: body.code }).returning();
    return c.json({ school: s }, 201);
  } catch (e: any) {
    return c.json({ error: e.message }, 409);
  }
});

adminRoutes.get('/targets/pending', async (c) => {
  const role = c.get('role');
  if (role !== 'chair' && role !== 'patron') return c.json({ error: 'Forbidden' }, 403);
  const db = getDb();
  const pending = await db.select({
    id: targets.id,
    accountId: targets.accountId,
    metricName: targets.metricName,
    targetValue: targets.targetValue,
    status: targets.status,
    createdAt: targets.createdAt,
  }).from(targets).where(eq(targets.status, 'pending'));
  return c.json({ targets: pending });
});

adminRoutes.put('/targets/:id/approve', async (c) => {
  const role = c.get('role');
  if (role !== 'chair' && role !== 'patron') return c.json({ error: 'Forbidden' }, 403);
  const id = Number(c.req.param('id'));
  const db = getDb();
  await db.update(targets).set({ status: 'approved' }).where(eq(targets.id, id));
  return c.json({ message: 'Approved' });
});

adminRoutes.put('/targets/:id/reject', async (c) => {
  const role = c.get('role');
  if (role !== 'chair' && role !== 'patron') return c.json({ error: 'Forbidden' }, 403);
  const id = Number(c.req.param('id'));
  const db = getDb();
  await db.update(targets).set({ status: 'rejected' }).where(eq(targets.id, id));
  return c.json({ message: 'Rejected' });
});
