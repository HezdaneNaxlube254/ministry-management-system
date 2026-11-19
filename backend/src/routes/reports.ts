import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { ministrationReports, schools, accounts } from '../db/schema';
import { AppEnv } from '../types';

export const reportRoutes = new Hono<AppEnv>();

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
  const role = c.get('role');
  const accountId = c.get('accountId');
  const db = getDb();

  const baseQuery = db
    .select({
      id: ministrationReports.id,
      schoolId: ministrationReports.schoolId,
      schoolName: schools.name,
      submittedBy: ministrationReports.submittedBy,
      role: ministrationReports.role,
      students: ministrationReports.studentsPresent,
      ministers: ministrationReports.ministersPresent,
      topic: ministrationReports.topic,
      challenges: ministrationReports.challenges,
      recommendations: ministrationReports.recommendations,
      createdAt: ministrationReports.createdAt,
    })
    .from(ministrationReports)
    .innerJoin(schools, eq(ministrationReports.schoolId, schools.id));

  // Facilitators only see their own school's reports
  if (role === 'facilitator') {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, accountId));
    if (!account) return c.json({ reports: [] });
    const [facilitatorSchool] = await db.select().from(schools).where(eq(schools.code, account.username));
    if (!facilitatorSchool) return c.json({ reports: [] });
    const reports = await baseQuery.where(eq(ministrationReports.schoolId, facilitatorSchool.id));
    return c.json({ reports, mySchoolId: facilitatorSchool.id });
  }

  // All other roles see all reports
  const reports = await baseQuery;
  return c.json({ reports });
});
