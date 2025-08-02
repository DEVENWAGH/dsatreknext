import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { User } from './user.js';

export const OTP = pgTable(
  'otps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    otp: text('otp').notNull(),
    type: text('type').notNull(), // 'password_reset' or 'email_verification'
    expiresAt: timestamp('expires_at').notNull(),
    isUsed: text('is_used').default('false'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  t => [
    index('otp_email_idx').on(t.email),
    index('otp_code_idx').on(t.otp),
    index('otp_type_idx').on(t.type),
  ]
);

// Keep backward compatibility
export const PasswordReset = OTP;
