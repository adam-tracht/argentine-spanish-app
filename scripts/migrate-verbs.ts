import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🔄 Running verb table migration...');

  try {
    // Step 1: Add new columns
    console.log('  Adding new columns...');
    await sql`ALTER TABLE "verbs" ADD COLUMN "conjugations" jsonb NOT NULL DEFAULT '{}'::jsonb`;
    await sql`ALTER TABLE "verbs" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL`;
    console.log('  ✅ Columns added');

    // Step 2: Migrate existing data
    console.log('  Migrating existing data...');
    await sql`
      UPDATE "verbs" SET "conjugations" = jsonb_build_object(
        'presente', jsonb_build_object(
          'yo', "presente_yo",
          'vos', "presente_vos"
        ),
        'preterito', jsonb_build_object(
          'yo', "pasado_yo",
          'vos', "pasado_vos"
        )
      )
    `;
    console.log('  ✅ Data migrated');

    // Step 3: Drop old columns
    console.log('  Dropping old columns...');
    await sql`ALTER TABLE "verbs" DROP COLUMN "presente_vos"`;
    await sql`ALTER TABLE "verbs" DROP COLUMN "pasado_vos"`;
    await sql`ALTER TABLE "verbs" DROP COLUMN "presente_yo"`;
    await sql`ALTER TABLE "verbs" DROP COLUMN "pasado_yo"`;
    console.log('  ✅ Old columns dropped');

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
