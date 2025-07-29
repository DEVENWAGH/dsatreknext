import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';

export const Submission = pgTable(
  'submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    problemId: uuid('problem_id').notNull(),
    code: text('code').notNull(),
    language: text('language').notNull(),
    status: text('status').notNull(),
    runtime: text('runtime'),
    memory: text('memory'),
    testCasesPassed: text('test_cases_passed'),
    totalTestCases: text('total_test_cases'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  t => [
    index('submission_user_idx').on(t.userId),
    index('submission_problem_idx').on(t.problemId),
    index('submission_status_idx').on(t.status),
  ]
);
