import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { LoginSchema } from '../../../shared/src/schemas/auth';
import { NodeHasher } from '../lib/password';
import { generateSessionToken, hashSessionToken } from '../lib/session';
import { getDb } from '../db/client';
import { accounts, sessions } from '../db/schema';
import { AppEnv } from '../types';
import { requireSession } from '../middleware/auth';

export const authRoutes = new Hono<AppEnv>();
const hasher = new NodeHasher();

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400);

  const { username, password } = parsed.data;
  const db = getDb();

  const [account] = await db.select().from(accounts).where(eq(accounts.username, username)).limit(1);

  if (!account || !account.isActive) {
    return c.json({ error: 'Invalid username or password' }, 401);
  }

  const valid = await hasher.verify(password, account.passwordHash);
  if (!valid) return c.json({ error: 'Invalid username or password' }, 401);

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(sessions).values({
    accountId: account.id,
    tokenHash,
    expiresAt,
  });

  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return c.json({ 
    message: 'Logged in', 
    user: { id: account.id, username: account.username, role: account.role } 
  });
});

authRoutes.post('/logout', async (c) => {
  const token = getCookie(c, 'session');
  if (token) {
    const db = getDb();
    const tokenHash = hashSessionToken(token);
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }
  deleteCookie(c, 'session', { path: '/' });
  return c.json({ message: 'Logged out' });
});

authRoutes.get('/me', async (c) => {
  const token = getCookie(c, 'session');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const db = getDb();
  const tokenHash = hashSessionToken(token);

  const [session] = await db.select({
    accountId: accounts.id,
    username: accounts.username,
    role: accounts.role,
  })
  .from(sessions)
  .innerJoin(accounts, eq(sessions.accountId, accounts.id))
  .where(eq(sessions.tokenHash, tokenHash))
  .limit(1);

  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  return c.json({ user: session });
});

// NEW: Change Password Route
authRoutes.post('/change-password', requireSession, async (c) => {
  const accountId = c.get('accountId');
  const body = await c.req.json();
  
  if (!body.oldPassword || !body.newPassword || body.newPassword.length < 6) {
    return c.json({ error: 'Invalid passwords. New password must be at least 6 characters.' }, 400);
  }

  const db = getDb();
  const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));

  if (!account) return c.json({ error: 'Account not found' }, 404);

  const valid = await hasher.verify(body.oldPassword, account.passwordHash);
  if (!valid) return c.json({ error: 'Current password is incorrect' }, 401);

  const newHash = await hasher.hash(body.newPassword);
  await db.update(accounts).set({ 
    passwordHash: newHash, 
    mustChangePassword: false 
  }).where(eq(accounts.id, accountId));

  return c.json({ message: 'Password updated successfully' });
});
