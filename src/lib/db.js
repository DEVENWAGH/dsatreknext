import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create connection with retry logic
let client;
let db;

const createConnection = () => {
  if (!client) {
    client = postgres(connectionString, {
      prepare: false,
      max: 10,
      ssl: 'require',
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      onnotice: () => {}, // Suppress notices
    });
    db = drizzle(client, { schema });
  }
  return db;
};

// Initialize connection
const database = createConnection();

export { database as db };
export default database;
