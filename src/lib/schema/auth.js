import {
  pgTable,
  uuid,
  text,
  timestamp,
  bigint,
  integer,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const accounts = pgTable('accounts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('userId').notNull(),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: bigint('expires_at', { mode: 'number' }),
  id_token: text('id_token'),
  scope: text('scope'),
  session_state: text('session_state'),
  token_type: text('token_type'),
});

export const sessions = pgTable('sessions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('userId').notNull(),
  expires: timestamp('expires').notNull(),
  sessionToken: varchar('sessionToken', { length: 255 }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_token',
  {
    identifier: text('identifier').notNull(),
    expires: timestamp('expires').notNull(),
    token: text('token').notNull(),
  },
  vt => ({
    compositePk: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  })
);
