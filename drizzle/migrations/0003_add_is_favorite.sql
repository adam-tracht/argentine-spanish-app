-- Add isFavorite column to user_progress table
ALTER TABLE "user_progress" ADD COLUMN "is_favorite" boolean DEFAULT false;
