import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { User } from './user.js';

export const UserStatistics = pgTable(
  'user_statistics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' })
      .unique(),
    totalSolved: integer('total_solved').default(0),
    totalSubmissions: integer('total_submissions').default(0),
    acceptanceRate: decimal('acceptance_rate', {
      precision: 5,
      scale: 2,
    }).default('0.00'),
    currentStreak: integer('current_streak').default(0),
    longestStreak: integer('longest_streak').default(0),
    totalActiveDays: integer('total_active_days').default(0),
    easyCount: integer('easy_count').default(0),
    mediumCount: integer('medium_count').default(0),
    hardCount: integer('hard_count').default(0),
    rank: integer('rank').default(0),
    level: text('level').default('Beginner'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [
    index('user_statistics_user_id_idx').on(t.userId),
    index('user_statistics_rank_idx').on(t.rank),
  ]
);
