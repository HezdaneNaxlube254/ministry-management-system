export type Role = 'chair' | 'patron' | 'secretary' | 'treasurer' | 'prayer-sec' | 'dad' | 'mum' | 'os' | 'facilitator';

export type AppEnv = {
  Variables: {
    accountId: number;
    role: Role;
  };
};
