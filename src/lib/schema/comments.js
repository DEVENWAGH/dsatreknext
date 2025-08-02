import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';

export const Comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').notNull(),
    userId: uuid('user_id').notNull(),
    username: text('username').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [
    index('comments_post_idx').on(t.postId),
    index('comments_user_idx').on(t.userId),
  ]
);
