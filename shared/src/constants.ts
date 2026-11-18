export const ROLE_NAMES = [
  'chair', 'patron', 'secretary', 'treasurer',
  'prayer-sec', 'dad', 'mum', 'os', 'facilitator',
] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

export const DEPARTMENTS = ['secretary', 'treasury', 'prayer', 'family', 'os'] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;
