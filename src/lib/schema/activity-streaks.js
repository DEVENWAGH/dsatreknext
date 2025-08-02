import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  date,
  index,
} from 'drizzle-orm/pg-core';
import { User } from './user.js';

export const ActivityStreaks = pgTable(
  'activity_streaks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    activityDate: date('activity_date').notNull(),
    problemsSolved: integer('problems_solved').default(0),
    submissionsCount: integer('submissions_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [
    index('activity_streaks_user_id_idx').on(t.userId),
    index('activity_streaks_date_idx').on(t.activityDate),
    index('activity_streaks_user_date_idx').on(t.userId, t.activityDate),
  ]
);
