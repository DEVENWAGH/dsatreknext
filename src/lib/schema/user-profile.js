import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  date,
  json,
} from 'drizzle-orm/pg-core';
import { User } from './user.js';

export const UserProfile = pgTable(
  'user_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => User.id, { onDelete: 'cascade' }),
    // Basic Info
    bio: text('bio'),
    gender: text('gender'),
    location: text('location'),
    birthday: date('birthday'),
    summary: text('summary'),
    // Social Links
    websiteUrl: text('website_url'),
    githubUrl: text('github_url'),
    linkedinUrl: text('linkedin_url'),
    twitterUrl: text('twitter_url'),
    // Legacy field for compatibility
    portfolioUrl: text('portfolio_url'),
    // Experience & Education (JSON arrays)
    experience: json('experience'),
    education: json('education'),
    // Skills (JSON array)
    skills: json('skills'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  t => [index('user_profile_user_id_idx').on(t.userId)]
);
