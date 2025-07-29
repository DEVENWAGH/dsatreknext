const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { Problem } = require('./src/lib/schema/problem.js');
const { eq, asc } = require('drizzle-orm');

// Database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function updatePremiumStatus() {
  try {
    console.log('Starting premium status update...');
    
    // Get all problems ordered by creation date
    const allProblems = await db
      .select()
      .from(Problem)
      .orderBy(asc(Problem.createdAt));
    
    console.log(`Found ${allProblems.length} problems`);
    
    // Update first 3 problems as demo (isPremium = false)
    for (let i = 0; i < Math.min(3, allProblems.length); i++) {
      await db
        .update(Problem)
        .set({ isPremium: false })
        .where(eq(Problem.id, allProblems[i].id));
      
      console.log(`Updated problem ${i + 1}: ${allProblems[i].title} - Demo`);
    }
    
    // Update remaining problems as premium (isPremium = true)
    for (let i = 3; i < allProblems.length; i++) {
      await db
        .update(Problem)
        .set({ isPremium: true })
        .where(eq(Problem.id, allProblems[i].id));
      
      console.log(`Updated problem ${i + 1}: ${allProblems[i].title} - Premium`);
    }
    
    console.log('Premium status update completed successfully!');
  } catch (error) {
    console.error('Error updating premium status:', error);
  }
}

updatePremiumStatus();