import { describe, it, expect } from 'vitest';
import { findDuplicates, normalizeName } from '../features/people/matcher';

describe('Deduplication Engine', () => {
  const existingRegistry = [
    'John Mwangi',
    'Mary Wambui',
    'Peter Kamau',
    'Sarah Atieno'
  ];

  it('normalizes names correctly', () => {
    expect(normalizeName('  John   Mwangi!! ')).toBe('john mwangi');
    expect(normalizeName('MARY wambui')).toBe('mary wambui');
  });

  it('finds exact matches ignoring case and punctuation', () => {
    const matches = findDuplicates('john mwangi', existingRegistry);
    expect(matches).toContain('John Mwangi');
    
    const matches2 = findDuplicates('Mary Wambui.', existingRegistry);
    expect(matches2).toContain('Mary Wambui');
  });

  it('finds near-matches (typos)', () => {
    const matches = findDuplicates('Jon Mwangi', existingRegistry);
    expect(matches).toContain('John Mwangi');

    const matches2 = findDuplicates('Peter Kaman', existingRegistry);
    expect(matches2).toContain('Peter Kamau');
  });

  it('does not flag completely different names', () => {
    const matches = findDuplicates('David Ochieng', existingRegistry);
    expect(matches).toHaveLength(0);
  });

  it('handles completely new names safely', () => {
    const matches = findDuplicates('Grace Njeri', existingRegistry);
    expect(matches).toHaveLength(0);
  });
});
