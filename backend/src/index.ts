import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth';
import { peopleRoutes } from './routes/people';
import { targetRoutes } from './routes/targets';
import { reportRoutes } from './routes/reports';
import { treasuryRoutes } from './routes/treasury';
import { adminRoutes } from './routes/admin';
import { requireSession, requireOnboarded } from './middleware/auth';
import { AppEnv } from './types';

const app = new Hono<AppEnv>();

app.use('*', logger());
app.use('*', cors({ origin: (origin) => origin ?? '*', credentials: true }));

app.get('/api/health', (c) => c.json({ status: 'ok' }));
app.route('/api/auth', authRoutes);

app.use('/api/*', requireSession);
app.route('/api/targets', targetRoutes);

app.use('/api/*', requireOnboarded);
app.route('/api/people', peopleRoutes);
app.route('/api/reports', reportRoutes);
app.route('/api/treasury', treasuryRoutes);
app.route('/api/admin', adminRoutes);

export default app;
