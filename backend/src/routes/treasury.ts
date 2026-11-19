import { Hono } from 'hono';
import { eq, desc, inArray } from 'drizzle-orm';
import { getDb } from '../db/client';
import { transactions, categories, transactionItems } from '../db/schema';
import { Policy } from '../middleware/policy';
import { RealClock } from '../lib/clock';

export const treasuryRoutes = new Hono();
const policy = new Policy(new RealClock());

treasuryRoutes.get('/categories', async (c) => {
  const db = getDb();
  const data = await db.select().from(categories);
  return c.json({ categories: data });
});

treasuryRoutes.post('/categories', async (c) => {
  const body = await c.req.json();
  const db = getDb();
  const [cat] = await db
    .insert(categories)
    .values({ name: body.name, fieldLabel: body.fieldLabel || null })
    .onConflictDoNothing()
    .returning();
  return c.json({ category: cat }, 201);
});

treasuryRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const db = getDb();

  const [tx] = await db.insert(transactions).values({
    type: body.type,
    amount: body.amount,
    transactionCost: body.transactionCost || 0,
    description: body.description,
    category: body.category,
    schoolId: body.schoolId || null,
    venue: body.venue || null,
    dynamicField: body.dynamicField || null,
    reference: body.reference || null,
    counterparty: body.counterparty || null,
    parentTransactionId: body.parentTransactionId || null,
    isBalanceMarker: body.isBalanceMarker || false,
    date: new Date(body.date),
  }).returning();

  if (body.items && body.items.length > 0) {
    const itemsToInsert = body.items.map((i: any) => ({
      transactionId: tx.id,
      name: i.name,
      amount: i.amount,
    }));
    await db.insert(transactionItems).values(itemsToInsert);
  }

  return c.json({ transaction: tx }, 201);
});

treasuryRoutes.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const db = getDb();
  const [existing] = await db.select().from(transactions).where(eq(transactions.id, id));

  if (!existing) return c.json({ error: 'Not found' }, 404);
  if (policy.isLocked({ department: 'treasury', createdAt: existing.createdAt })) {
    return c.json({ error: 'LOCKED: Cannot edit after 24 hours. Ask the Chair.' }, 403);
  }

  const body = await c.req.json();
  const [updated] = await db.update(transactions).set({
    type: body.type,
    amount: body.amount,
    transactionCost: body.transactionCost || 0,
    description: body.description,
    category: body.category,
    schoolId: body.schoolId || null,
    venue: body.venue || null,
    dynamicField: body.dynamicField || null,
    reference: body.reference || null,
    counterparty: body.counterparty || null,
    parentTransactionId: body.parentTransactionId || null,
    isBalanceMarker: body.isBalanceMarker || false,
    date: new Date(body.date),
  }).where(eq(transactions.id, id)).returning();

  await db.delete(transactionItems).where(eq(transactionItems.transactionId, id));
  if (body.items && body.items.length > 0) {
    const itemsToInsert = body.items.map((i: any) => ({
      transactionId: id,
      name: i.name,
      amount: i.amount,
    }));
    await db.insert(transactionItems).values(itemsToInsert);
  }

  return c.json({ transaction: updated });
});

treasuryRoutes.get('/', async (c) => {
  const db = getDb();
  const txs = await db.select().from(transactions).orderBy(desc(transactions.date));

  if (txs.length === 0) return c.json({ transactions: [] });

  const txIds = txs.map(t => t.id);
  const allItems = await db.select().from(transactionItems).where(inArray(transactionItems.transactionId, txIds));

  const txsWithItems = txs.map(tx => ({
    ...tx,
    isLocked: policy.isLocked({ department: 'treasury', createdAt: tx.createdAt }),
    items: allItems.filter(i => i.transactionId === tx.id),
  }));

  return c.json({ transactions: txsWithItems });
});
