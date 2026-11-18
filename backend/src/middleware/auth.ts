import { Context, Next } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { accounts, sessions, targets } from '../db/schema';
import { hashSessionToken } from '../lib/session';
import { getCookie } from 'hono/cookie';

// 1. Basic Session Check (Runs on ALL protected routes, including targets)
export async function requireSession(c: Context, next: Next) {
  const token = getCookie(c, 'session');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const db = getDb();
  const tokenHash = hashSessionToken(token);

  const [session] = await db.select({
    accountId: accounts.id,
    role: accounts.role,
  })
  .from(sessions)
  .innerJoin(accounts, eq(sessions.accountId, accounts.id))
  .where(eq(sessions.tokenHash, tokenHash))
  .limit(1);

  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  c.set('accountId', session.accountId);
  c.set('role', session.role);

  await next();
}

// 2. Onboarding Check (Runs on EVERYTHING except targets and auth)
export async function requireOnboarded(c: Context, next: Next) {
  const role = c.get('role') as string;
  const accountId = c.get('accountId') as number;

  const leaderRoles = ['secretary', 'treasurer', 'prayer-sec', 'dad', 'mum', 'os'];
  
  if (leaderRoles.includes(role)) {
    const db = getDb();
    const userTargets = await db.select().from(targets).where(eq(targets.accountId, accountId));
    
    if (userTargets.length === 0) {
      return c.json({ error: 'ONBOARDING_REQUIRED', message: 'You must set your targets first' }, 403);
    }
  }

  await next();
}
