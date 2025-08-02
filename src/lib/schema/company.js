import { pgTable, uuid, text, index, jsonb } from 'drizzle-orm/pg-core';

export const Company = pgTable(
  'company',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    companyUrl: jsonb('company_url'),
  },
  t => [index('company_name_idx').on(t.name)]
);
