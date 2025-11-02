import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../drizzle/schema';
import verbsData from '../src/data/seed-verbs.json';
import vocabData from '../src/data/seed-vocab.json';
import augmentedVocabData from '../src/data/augmented-dating-vocab.json';
import scenariosData from '../src/data/conversation-scenarios.json';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed verbs
    console.log('📚 Seeding verbs...');
    for (const verb of verbsData) {
      await db.insert(schema.verbs).values({
        infinitive: verb.infinitive,
        english: verb.english,
        conjugations: verb.conjugations as any,
        exampleSpanish: verb.exampleSpanish || null,
        exampleEnglish: verb.exampleEnglish || null,
        isIrregular: verb.isIrregular || false,
        category: verb.category || null,
      });
    }
    console.log(`✅ Seeded ${verbsData.length} verbs`);

    // Seed vocabulary
    console.log('📖 Seeding vocabulary...');
    const allVocab = [...vocabData, ...augmentedVocabData];
    for (const vocab of allVocab) {
      await db.insert(schema.vocabulary).values({
        spanish: vocab.spanish,
        english: vocab.english,
        category: vocab.category as any,
        difficulty: vocab.difficulty as any,
        tags: vocab.tags,
        context: vocab.context || null,
        isCustom: false,
        userId: null,
      });
    }
    console.log(`✅ Seeded ${allVocab.length} vocabulary entries`);

    // Seed scenarios
    console.log('💬 Seeding conversation scenarios...');
    for (const scenario of scenariosData) {
      await db.insert(schema.scenarios).values({
        title: scenario.title,
        description: scenario.description || null,
        category: scenario.category,
        difficulty: scenario.difficulty as any,
        dialog: scenario.dialog,
        tags: scenario.tags,
      });
    }
    console.log(`✅ Seeded ${scenariosData.length} conversation scenarios`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
