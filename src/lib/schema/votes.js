import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const Votes = pgTable(
  'votes',
  {
    userId: uuid('user_id').notNull(),
    postId: uuid('post_id').notNull(),
    voteType: text('vote_type').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  t => [primaryKey({ columns: [t.userId, t.postId] })]
);
