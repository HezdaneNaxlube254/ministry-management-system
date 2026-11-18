import { Clock } from '../lib/clock';
import { EDIT_WINDOW_MS } from '../../../shared/src/constants';

export type Role = 'chair' | 'patron' | 'secretary' | 'treasurer' | 'prayer-sec' | 'dad' | 'mum' | 'os' | 'facilitator';
export type Department = 'secretary' | 'treasury' | 'prayer' | 'family' | 'os';

export interface AuthContext {
  accountId: number;
  role: Role;
  department?: Department;
  schoolId?: number;
  hasApprovedTargets: boolean;
}

export interface Resource {
  department: Department;
  schoolId?: number;
  createdAt: Date;
  deletedAt?: Date | null;
}

export class PolicyError extends Error {
  constructor(public code: string, message: string, public status: number = 403) {
    super(message);
  }
}

export class Policy {
  constructor(private clock: Clock) {}

  requireOnboarded(auth: AuthContext) {
    const leaderRoles = ['secretary', 'treasurer', 'prayer-sec', 'dad', 'mum', 'os'];
    if (leaderRoles.includes(auth.role) && !auth.hasApprovedTargets) {
      throw new PolicyError('ONBOARDING_REQUIRED', 'You must set your targets first', 403);
    }
  }

  isLocked(record: Resource): boolean {
    if (record.deletedAt) return true;
    const now = this.clock.now().getTime();
    const created = record.createdAt.getTime();
    return (now - created) > EDIT_WINDOW_MS;
  }

  canCreate(auth: AuthContext, targetDept: Department): boolean {
    if (auth.role === 'chair' || auth.role === 'patron') return true;
    if (auth.role === 'facilitator') return false;
    return auth.department === targetDept;
  }

  canEdit(auth: AuthContext, record: Resource): boolean {
    if (auth.role === 'chair' || auth.role === 'patron') return true;
    if (auth.role === 'facilitator') return false;
    if (auth.department !== record.department) return false;
    if (this.isLocked(record)) {
      throw new PolicyError('LOCKED', 'Record is locked after 24 hours', 403);
    }
    return true;
  }
}
