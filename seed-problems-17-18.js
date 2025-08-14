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

// Database connection
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});
const db = drizzle(sql);

async function seedProblems() {
  try {
    console.log('🌱 Starting problems 17-18 seeding process...\n');

    // Read the new JSON file
    const jsonFilePath = path.join(__dirname, 'problems-17-18.json');
    const problemsData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    console.log(`📂 Found ${problemsData.length} problems to seed\n`);

    // Process and insert each problem
    for (let i = 0; i < problemsData.length; i++) {
      const problem = problemsData[i];

      console.log(`📝 Processing Problem ${i + 1}: "${problem.title}"`);

      try {
        // Map JSON fields to database schema
        const dbProblem = {
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

        // Insert into database
        await db.insert(Problem).values(dbProblem);

        console.log(`   ✅ Successfully inserted: ${problem.title}`);
      } catch (error) {
        console.error(
          `   ❌ Error inserting problem "${problem.title}":`,
          error.message
        );
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
