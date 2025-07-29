import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { User } from './user.js';

export const UserProfile = pgTable(
  'user_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => User.id, { onDelete: 'cascade' }),
    bio: text('bio'),
    githubUrl: text('github_url'),
    linkedinUrl: text('linkedin_url'),
    portfolioUrl: text('portfolio_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [
    index('user_profile_user_id_idx').on(t.userId),
  ]
);