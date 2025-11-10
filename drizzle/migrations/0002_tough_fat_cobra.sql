-- Custom SQL migration file, put your code below! --

-- Add new category values to the enum
ALTER TYPE "category" ADD VALUE 'family';
ALTER TYPE "category" ADD VALUE 'work';
ALTER TYPE "category" ADD VALUE 'common_words';
ALTER TYPE "category" ADD VALUE 'housing';
