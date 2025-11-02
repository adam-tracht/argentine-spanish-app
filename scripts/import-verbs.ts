import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../drizzle/schema';
import * as fs from 'fs';
import * as path from 'path';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function importVerbs() {
  console.log('🌱 Importing verbs from seed-verbs.json...');

  // Read the verbs file
  const verbsPath = path.join(__dirname, '../src/data/seed-verbs.json');
  const verbsData = JSON.parse(fs.readFileSync(verbsPath, 'utf-8'));

  console.log(`📝 Found ${verbsData.length} verbs to import`);

  // Clear existing verbs
  console.log('🗑️  Clearing existing verbs...');
  await db.delete(schema.verbs);

  // Import all verbs
  const values = verbsData.map((verb: any) => ({
    infinitive: verb.infinitive,
    english: verb.english,
    conjugations: verb.conjugations,
    exampleSpanish: verb.exampleSpanish || null,
    exampleEnglish: verb.exampleEnglish || null,
    isIrregular: verb.isIrregular || false,
    category: verb.category || null,
  }));

  await db.insert(schema.verbs).values(values);
  console.log(`🎉 Successfully imported ${verbsData.length} verbs!`);
  console.log('✨ Script finished');
}

importVerbs().catch((error) => {
  console.error('❌ Error importing verbs:', error);
  process.exit(1);
});
