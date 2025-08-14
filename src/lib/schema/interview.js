import { pgTable, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core';
import { User } from './user.js';

export const interviews = pgTable('interviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => User.id, { onDelete: 'cascade' })
    .notNull(),
  position: text('position'),
  companyName: text('company_name'),
  jobDescription: text('job_description'),
  interviewType: text('interview_type'),
  difficulty: text('difficulty').default('medium'),
  duration: text('duration'),
  questions: jsonb('questions'),
  interviewerName: text('interviewer_name'),
  scheduledAt: timestamp('scheduled_at'),
  feedback: text('feedback'),
  rating: text('rating'),
  status: text('status').default('scheduled'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
