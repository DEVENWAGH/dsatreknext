import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';

export const Community = pgTable(
  'community',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    username: text('username').notNull(),
    title: text('title'),
    content: jsonb('content').notNull(),
    topic: text('topic').default('Interview'),
    isAnonymous: boolean('is_anonymous').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  t => [
    index('community_message_created_idx').on(t.createdAt),
    index('community_message_expires_idx').on(t.expiresAt),
    index('community_message_user_idx').on(t.userId),
  ]
);
