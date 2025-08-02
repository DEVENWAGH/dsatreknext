import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { Problem } from './problem.js';

export const DailyChallenge = pgTable(
  'daily_challenges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problem_id')
      .references(() => Problem.id)
      .notNull(),
    challengeDate: date('challenge_date').notNull(),
    month: text('month').notNull(), // e.g., "2025-01"
    day: text('day').notNull(), // e.g., "27"
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [
    index('daily_challenge_date_idx').on(t.challengeDate),
    index('daily_challenge_month_idx').on(t.month),
    unique('unique_challenge_date').on(t.challengeDate),
  ]
);
