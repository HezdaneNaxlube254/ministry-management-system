import { Hono } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { LoginSchema } from '../../../shared/src/schemas/auth';
import { NodeHasher } from '../lib/password';
import { generateSessionToken, hashSessionToken } from '../lib/session';
import { getDb } from '../db/client';
import { accounts, sessions } from '../db/schema';

export const authRoutes = new Hono();
const hasher = new NodeHasher();

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400);

  const { username, password } = parsed.data;
  const db = getDb();

  // 1. Find account in Neon
  const [account] = await db.select().from(accounts).where(eq(accounts.username, username)).limit(1);

  // Generic error message to prevent username enumeration
  if (!account || !account.isActive) {
    return c.json({ error: 'Invalid username or password' }, 401);
  }

  // 2. Verify password
  const valid = await hasher.verify(password, account.passwordHash);
  if (!valid) return c.json({ error: 'Invalid username or password' }, 401);

  // 3. Create session
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  
  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(sessions).values({
    accountId: account.id,
    tokenHash,
    expiresAt,
  });

  // 4. Set httpOnly cookie
  setCookie(c, 'session', token, {
    httpOnly: true,
   secure: true,
sameSite: 'None',
    maxAge: 60 * 60 * 24 * 7, // 1 week
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
    // In a real app, we might just delete the session row.
    // For audit purposes, we could mark it inactive, but delete is fine here.
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

  // Join sessions and accounts to get the user
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
