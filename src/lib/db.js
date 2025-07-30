import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not set');
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString, {
  prepare: false,
  max: 5,
  ssl: 'require',
  connect_timeout: 30,
  idle_timeout: 30,
  onnotice: () => {},
});

const db = drizzle(client, { schema });

export { db };
export default db;
