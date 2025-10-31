import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../drizzle/schema';
import scenariosData from '../src/data/conversation-scenarios.json';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function addNewScenarios() {
  console.log('🌱 Adding new conversation scenarios...');

  try {
    // Get existing scenario titles to avoid duplicates
    const existingScenarios = await db.select({ title: schema.scenarios.title }).from(schema.scenarios);
    const existingTitles = new Set(existingScenarios.map(s => s.title));

    // Filter out scenarios that already exist
    const newScenarios = scenariosData.filter(scenario => !existingTitles.has(scenario.title));

    if (newScenarios.length === 0) {
      console.log('✨ No new scenarios to add. All scenarios already exist in database.');
      return;
    }

    console.log(`📝 Found ${newScenarios.length} new scenarios to add:`);
    newScenarios.forEach(s => console.log(`  - ${s.title}`));

    // Add new scenarios
    for (const scenario of newScenarios) {
      await db.insert(schema.scenarios).values({
        title: scenario.title,
        description: scenario.description || null,
        category: scenario.category,
        difficulty: scenario.difficulty as any,
        dialog: scenario.dialog,
        tags: scenario.tags,
      });
      console.log(`  ✅ Added: ${scenario.title}`);
    }

    console.log(`🎉 Successfully added ${newScenarios.length} new conversation scenarios!`);
  } catch (error) {
    console.error('❌ Error adding scenarios:', error);
    throw error;
  }
}

addNewScenarios()
  .then(() => {
    console.log('✨ Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to add scenarios:', error);
    process.exit(1);
  });
