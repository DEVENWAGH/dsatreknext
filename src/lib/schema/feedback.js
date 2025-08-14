import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { User } from './user.js';

export const Feedback = pgTable(
  'feedback',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => User.id, { onDelete: 'cascade' }),
    email: text('email'),
    name: text('name'),
    message: text('message').notNull(),
    type: text('type').default('general'), // general, bug, feature, etc.
    status: text('status').default('pending'), // pending, reviewed, resolved
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [
    index('feedback_user_id_idx').on(t.userId),
    index('feedback_status_idx').on(t.status),
    index('feedback_created_at_idx').on(t.createdAt),
  ]
);
