import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { targets } from '../db/schema';
import { AppEnv } from '../types';

export const targetRoutes = new Hono<AppEnv>();

targetRoutes.get('/', async (c) => {
  const accountId = c.get('accountId');
  const db = getDb();
  const userTargets = await db.select().from(targets).where(eq(targets.accountId, accountId));
  return c.json({ targets: userTargets });
});

targetRoutes.post('/', async (c) => {
  const accountId = c.get('accountId');
  const body = await c.req.json();

  if (!Array.isArray(body.targets) || body.targets.length < 3) {
    return c.json({ error: 'You must provide at least 3 targets' }, 400);
  }

  const db = getDb();
  await db.delete(targets).where(eq(targets.accountId, accountId));

  const toInsert = body.targets.map((t: any) => ({
    accountId,
    metricName: t.metricName,
    targetValue: String(t.targetValue),
    status: 'pending',
  }));

  await db.insert(targets).values(toInsert);
  return c.json({ message: 'Targets submitted successfully' }, 201);
});
