import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🔄 Adding new vocabulary categories...');

  try {
    // Add new category enum values
    console.log('  Adding family category...');
    await sql`ALTER TYPE "category" ADD VALUE IF NOT EXISTS 'family'`;

    console.log('  Adding work category...');
    await sql`ALTER TYPE "category" ADD VALUE IF NOT EXISTS 'work'`;

    console.log('  Adding common_words category...');
    await sql`ALTER TYPE "category" ADD VALUE IF NOT EXISTS 'common_words'`;

    console.log('  Adding housing category...');
    await sql`ALTER TYPE "category" ADD VALUE IF NOT EXISTS 'housing'`;

    console.log('🎉 Migration completed successfully!');
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
    throw error;
  }
}

runMigration().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
