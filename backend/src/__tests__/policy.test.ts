import { describe, it, expect } from 'vitest';
import { Policy, AuthContext, Resource, PolicyError } from '../middleware/policy';
import { FixedClock } from '../lib/clock';

describe('Policy Engine', () => {
  const clock = new FixedClock('2026-01-01T12:00:00Z');
  const policy = new Policy(clock);

  const chair: AuthContext = { accountId: 1, role: 'chair', hasApprovedTargets: true };
  const secretary: AuthContext = { accountId: 2, role: 'secretary', department: 'secretary', hasApprovedTargets: true };
  const treasurer: AuthContext = { accountId: 3, role: 'treasurer', department: 'treasury', hasApprovedTargets: true };
  const newLeader: AuthContext = { accountId: 4, role: 'prayer-sec', department: 'prayer', hasApprovedTargets: false };

  const secretaryRecord: Resource = {
    department: 'secretary',
    createdAt: new Date('2026-01-01T10:00:00Z'),
  };

  const oldRecord: Resource = {
    department: 'treasury',
    createdAt: new Date('2025-12-31T10:00:00Z'),
  };

  describe('Onboarding Gate', () => {
    it('blocks a new leader from doing anything', () => {
      expect(() => policy.requireOnboarded(newLeader)).toThrow(PolicyError);
    });
    it('allows an onboarded leader', () => {
      expect(() => policy.requireOnboarded(secretary)).not.toThrow();
    });
  });

  describe('24-Hour Lock', () => {
    it('unlocks records less than 24 hours old', () => {
      expect(policy.canEdit(secretary, secretaryRecord)).toBe(true);
    });
    it('locks records older than 24 hours', () => {
      expect(() => policy.canEdit(treasurer, oldRecord)).toThrow('Record is locked after 24 hours');
    });
    it('allows the Chair to override the lock', () => {
      expect(policy.canEdit(chair, oldRecord)).toBe(true);
    });
  });

  describe('Department Scoping', () => {
    it('allows an exec member to edit their own department', () => {
      expect(policy.canEdit(secretary, secretaryRecord)).toBe(true);
    });
    it('blocks an exec member from editing another department', () => {
      expect(policy.canEdit(treasurer, secretaryRecord)).toBe(false);
    });
  });

  describe('Creation Rules', () => {
    it('allows exec to create in their department', () => {
      expect(policy.canCreate(secretary, 'secretary')).toBe(true);
    });
    it('blocks exec from creating in another department', () => {
      expect(policy.canCreate(secretary, 'treasury')).toBe(false);
    });
    it('allows Chair to create anywhere', () => {
      expect(policy.canCreate(chair, 'treasury')).toBe(true);
    });
  });
});
