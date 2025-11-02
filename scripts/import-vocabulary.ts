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

async function importVocabulary() {
  console.log('🌱 Importing vocabulary from vocabulary_additions.json...');

  // Read the vocabulary additions file
  const vocabPath = path.join(__dirname, '../../vocabulary_additions.json');
  const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf-8'));

  console.log(`📝 Found ${vocabData.length} vocabulary items to import`);

  // Get existing vocabulary to avoid duplicates
  const existingVocab = await db.select({ spanish: schema.vocabulary.spanish })
    .from(schema.vocabulary);
  const existingSpanishSet = new Set(existingVocab.map(v => v.spanish));

  // Filter out duplicates
  const newVocab = vocabData.filter((item: any) => !existingSpanishSet.has(item.spanish));

  console.log(`📊 ${newVocab.length} new items (${vocabData.length - newVocab.length} duplicates skipped)`);

  if (newVocab.length === 0) {
    console.log('✅ No new vocabulary to import!');
    return;
  }

  // Import vocabulary in batches
  const batchSize = 50;
  let imported = 0;

  for (let i = 0; i < newVocab.length; i += batchSize) {
    const batch = newVocab.slice(i, i + batchSize);

    const values = batch.map((item: any) => ({
      spanish: item.spanish,
      english: item.english,
      category: item.category as any,
      difficulty: item.difficulty as any,
      tags: item.tags || null,
      context: item.context || null,
      pronunciation: item.pronunciation || null,
      isCustom: false,
      userId: null,
    }));

    await db.insert(schema.vocabulary).values(values);
    imported += batch.length;
    console.log(`  ✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${batch.length} items (Total: ${imported}/${newVocab.length})`);
  }

  console.log(`🎉 Successfully imported ${imported} new vocabulary items!`);
  console.log('✨ Script finished');
}

importVocabulary().catch((error) => {
  console.error('❌ Error importing vocabulary:', error);
  process.exit(1);
});
