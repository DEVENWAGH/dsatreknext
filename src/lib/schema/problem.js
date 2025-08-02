import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';

export const Problem = pgTable(
  'problems',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: jsonb('description').notNull(), // Rich text editor content with styles and tags
    editorial: jsonb('editorial'), // Rich text editor content with styles and tags
    difficulty: text('difficulty').notNull(),
    tags: jsonb('tags'),
    starterCode: jsonb('starter_code'), // User's starting template code (what user sees and starts solving)
    topCode: jsonb('top_code'), // Code injected before user code (imports, input parsing)
    bottomCode: jsonb('bottom_code'), // Code injected after user code (test runner, output)
    solution: jsonb('solution'), // Complete solution for reference
    testCases: jsonb('test_cases'), // Test cases for validation
    hints: jsonb('hints'),
    companies: jsonb('companies').default([]),
    isPremium: boolean('is_premium').default(false),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [index('problem_difficulty_idx').on(t.difficulty)]
);
