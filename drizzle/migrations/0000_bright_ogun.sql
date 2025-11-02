CREATE TYPE "public"."category" AS ENUM('grammar', 'social', 'dating', 'slang', 'directions', 'food_drink', 'emotions', 'other', 'shopping', 'restaurant', 'health', 'transportation', 'communication', 'time', 'greetings', 'questions', 'weather', 'feelings');--> statement-breakpoint
CREATE TYPE "public"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TABLE "custom_vocab" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"spanish" text NOT NULL,
	"english" text NOT NULL,
	"category" "category" DEFAULT 'other',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text,
	"difficulty" "difficulty",
	"mode" text NOT NULL,
	"score" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"time_spent_seconds" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"difficulty" "difficulty" DEFAULT 'beginner' NOT NULL,
	"dialog" jsonb NOT NULL,
	"tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"vocab_id" integer,
	"verb_id" integer,
	"last_reviewed" timestamp,
	"next_review" timestamp,
	"ease_factor" integer DEFAULT 250,
	"interval" integer DEFAULT 1,
	"repetitions" integer DEFAULT 0,
	"correct_count" integer DEFAULT 0,
	"incorrect_count" integer DEFAULT 0,
	"is_known" boolean DEFAULT false,
	"is_flagged" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_activity_date" timestamp,
	"total_cards_reviewed" integer DEFAULT 0,
	"total_quizzes_taken" integer DEFAULT 0,
	"total_time_spent_seconds" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verbs" (
	"id" serial PRIMARY KEY NOT NULL,
	"infinitive" text NOT NULL,
	"presente_vos" text NOT NULL,
	"pasado_vos" text NOT NULL,
	"presente_yo" text NOT NULL,
	"pasado_yo" text NOT NULL,
	"english" text NOT NULL,
	"example_spanish" text,
	"example_english" text,
	"is_irregular" boolean DEFAULT false,
	"category" text,
	CONSTRAINT "verbs_infinitive_unique" UNIQUE("infinitive")
);
--> statement-breakpoint
CREATE TABLE "vocabulary" (
	"id" serial PRIMARY KEY NOT NULL,
	"spanish" text NOT NULL,
	"english" text NOT NULL,
	"category" "category" NOT NULL,
	"difficulty" "difficulty" DEFAULT 'beginner' NOT NULL,
	"tags" text[],
	"context" text,
	"pronunciation" text,
	"is_custom" boolean DEFAULT false,
	"user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_vocab" ADD CONSTRAINT "custom_vocab_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_vocab_id_vocabulary_id_fk" FOREIGN KEY ("vocab_id") REFERENCES "public"."vocabulary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_verb_id_verbs_id_fk" FOREIGN KEY ("verb_id") REFERENCES "public"."verbs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;