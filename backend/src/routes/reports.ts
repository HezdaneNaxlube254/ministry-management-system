import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { ministrationReports, schools } from '../db/schema';

export const reportRoutes = new Hono();

reportRoutes.get('/schools', async (c) => {
  const db = getDb();
  const data = await db.select().from(schools);
  return c.json({ schools: data });
});

reportRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const db = getDb();
  const [report] = await db.insert(ministrationReports).values({
    schoolId: body.schoolId,
    submittedById: body.submittedById,
    submittedBy: body.submittedBy,
    role: body.role,
    studentsPresent: body.studentsPresent,
    ministersPresent: body.ministersPresent,
    topic: body.topic,
    challenges: body.challenges,
    recommendations: body.recommendations,
  }).returning();
  return c.json({ report }, 201);
});

reportRoutes.get('/', async (c) => {
  const db = getDb();
  const reports = await db.select({
    id: ministrationReports.id,
    schoolName: schools.name,
    submittedBy: ministrationReports.submittedBy,
    role: ministrationReports.role,
    students: ministrationReports.studentsPresent,
    topic: ministrationReports.topic,
  }).from(ministrationReports).innerJoin(schools, eq(ministrationReports.schoolId, schools.id));
  return c.json({ reports });
});
