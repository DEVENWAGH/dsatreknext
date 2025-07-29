import { db } from './src/lib/db.js';
import { DailyChallenge, Problem } from './src/lib/schema/index.js';

async function seedDailyChallenges() {
  try {
    console.log('🌱 Seeding daily challenges...');

    // Get all problems
    const problems = await db.select().from(Problem);
    
    if (problems.length === 0) {
      console.log('❌ No problems found. Please seed problems first.');
      return;
    }

    // Generate challenges for current month
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const challenges = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const randomProblem = problems[Math.floor(Math.random() * problems.length)];
      const challengeDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      challenges.push({
        problemId: randomProblem.id,
        challengeDate,
        month: monthKey,
        day: String(day),
      });
    }

    // Insert challenges
    await db.insert(DailyChallenge).values(challenges);
    
    console.log(`✅ Successfully seeded ${challenges.length} daily challenges for ${year}-${String(month + 1).padStart(2, '0')}`);
    
  } catch (error) {
    console.error('❌ Error seeding daily challenges:', error);
  }
}

seedDailyChallenges();