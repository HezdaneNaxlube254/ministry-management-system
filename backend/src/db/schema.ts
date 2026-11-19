import { pgTable, serial, text, timestamp, integer, boolean, numeric } from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  displayName: text('display_name'),
  mustChangePassword: boolean('must_change_password').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  phone: text('phone'),
  status: text('status').default('active').notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
});

export const targets = pgTable('targets', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
  termId: integer('term_id').default(1).notNull(),
  metricName: text('metric_name').notNull(),
  targetValue: numeric('target_value').notNull(),
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  fieldLabel: text('field_label'),
});

export const terms = pgTable('terms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  openingBalance: integer('opening_balance').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ministrationReports = pgTable('ministration_reports', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').notNull().references(() => schools.id),
  submittedById: integer('submitted_by_id').references(() => people.id),
  submittedBy: text('submitted_by').notNull(),
  role: text('role').notNull(),
  studentsPresent: integer('students_present').notNull(),
  ministersPresent: integer('ministers_present').notNull(),
  topic: text('topic'),
  challenges: text('challenges'),
  recommendations: text('recommendations'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  amount: integer('amount').notNull(),
  transactionCost: integer('transaction_cost').default(0).notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  schoolId: integer('school_id').references(() => schools.id),
  venue: text('venue'),
  dynamicField: text('dynamic_field'),
  reference: text('reference'),
  counterparty: text('counterparty'),
  parentTransactionId: integer('parent_transaction_id'),
  isBalanceMarker: boolean('is_balance_marker').default(false).notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transactionItems = pgTable('transaction_items', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  amount: integer('amount').notNull(),
});
