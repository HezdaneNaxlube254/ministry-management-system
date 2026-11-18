import { Hono } from 'hono';
import { peopleService } from '../features/people/service';

export const peopleRoutes = new Hono();

peopleRoutes.get('/search', async (c) => {
  const query = c.req.query('q') || '';
  const results = await peopleService.search(query);
  return c.json({ results });
});

peopleRoutes.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.fullName || typeof body.fullName !== 'string') return c.json({ error: 'fullName is required' }, 400);
  const force = body.force === true; 
  try {
    const result = await peopleService.addPerson(body.fullName, body.phone || null, force);
    if (result.warning) return c.json({ warning: result.warning, duplicates: result.duplicates }, 409);
    return c.json({ person: result.person }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
