import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { User } from './user.js';

export const PasswordReset = pgTable(
  'password_resets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => User.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    otp: text('otp').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    isUsed: text('is_used').default('false'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  t => [
    index('password_reset_email_idx').on(t.email),
    index('password_reset_otp_idx').on(t.otp),
  ]
);