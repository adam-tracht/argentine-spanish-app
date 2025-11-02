-- Custom SQL migration file, put your code below! --

-- Add new conjugations column
ALTER TABLE "verbs" ADD COLUMN "conjugations" jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE "verbs" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;

-- Migrate existing data to new structure
UPDATE "verbs" SET "conjugations" = jsonb_build_object(
  'presente', jsonb_build_object(
    'yo', "presente_yo",
    'vos', "presente_vos"
  ),
  'preterito', jsonb_build_object(
    'yo', "pasado_yo",
    'vos', "pasado_vos"
  )
);

-- Drop old columns
ALTER TABLE "verbs" DROP COLUMN "presente_vos";
ALTER TABLE "verbs" DROP COLUMN "pasado_vos";
ALTER TABLE "verbs" DROP COLUMN "presente_yo";
ALTER TABLE "verbs" DROP COLUMN "pasado_yo";
