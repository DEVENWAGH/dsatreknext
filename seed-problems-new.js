import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Problem } from './src/lib/schema/problem.js';

// Load environment variables
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection using your preferred format
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});
const db = drizzle(sql);

// Test connection
async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

async function seedProblems() {
  try {
    console.log('🌱 Starting problems seeding process...\n');

    // Test database connection first
    await testConnection();

    // Read the new JSON file
    const jsonFilePath = path.join(__dirname, 'problems-15-16.json');
    const problemsData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    console.log(`📂 Found ${problemsData.length} problems to seed\n`);

    // Process and insert each problem
    for (let i = 0; i < problemsData.length; i++) {
      const problem = problemsData[i];

      console.log(`📝 Processing Problem ${i + 1}: "${problem.title}"`);

      try {
        // Map JSON fields to database schema
        const dbProblem = {
          // Let database generate UUID if the provided one is invalid
          title: problem.title,
          description: problem.description,
          editorial: problem.editorial || null,
          difficulty: problem.difficulty.toLowerCase(),
          tags: problem.tags || [],
          starterCode: problem.starter_code || {},
          topCode: problem.top_code || {},
          bottomCode: problem.bottom_code || {},
          solution: problem.solution || {},
          testCases: problem.test_cases || [],
          hints: problem.hints || [],
          companies: problem.companies || [],
          isPremium: problem.is_premium || false,
          isActive: problem.is_active !== undefined ? problem.is_active : true,
          createdAt: problem.created_at
            ? new Date(problem.created_at)
            : new Date(),
          updatedAt: problem.updated_at
            ? new Date(problem.updated_at)
            : new Date(),
        };

        // Insert into database (let database generate UUID)
        await db.insert(Problem).values(dbProblem);

        console.log(`   ✅ Successfully inserted/updated: ${problem.title}`);
      } catch (error) {
        console.error(
          `   ❌ Error inserting problem "${problem.title}":`,
          error.message
        );
        console.error('   Problem data:', JSON.stringify(problem, null, 2));
        throw error;
      }
    }

    console.log(`\n🎉 Successfully seeded ${problemsData.length} problems!`);

    // Verify the insertion
    const count = await db.select().from(Problem);
    console.log(`📊 Total problems in database: ${count.length}`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await sql.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedProblems()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

export { seedProblems };
