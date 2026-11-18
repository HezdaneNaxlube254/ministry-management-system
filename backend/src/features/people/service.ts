import { ilike } from 'drizzle-orm';
import { getDb } from '../../db/client';
import { people } from '../../db/schema';
import { normalizeName, findDuplicates } from './matcher';

export class PeopleService {
  async search(query: string) {
    const db = getDb();
    if (!query) return await db.select().from(people).limit(50);
    const normQuery = `%${normalizeName(query)}%`;
    return await db.select().from(people).where(ilike(people.normalizedName, normQuery)).limit(20);
  }

  async checkDuplicates(fullName: string): Promise<string[]> {
    const db = getDb();
    const allPeople = await db.select({ fullName: people.fullName }).from(people);
    const existingNames = allPeople.map(p => p.fullName);
    return findDuplicates(fullName, existingNames);
  }

  async addPerson(fullName: string, phone: string | null, force: boolean = false) {
    const dupes = await this.checkDuplicates(fullName);
    if (dupes.length > 0 && !force) {
      return { warning: `Did you mean one of these? ${dupes.join(', ')}`, duplicates: dupes };
    }
    const db = getDb();
    const [newPerson] = await db.insert(people).values({
      fullName: fullName.trim(),
      normalizedName: normalizeName(fullName),
      phone: phone,
      status: 'active',
    }).returning();
    return { person: newPerson };
  }
}
export const peopleService = new PeopleService();
