import { pgTable, text, integer, timestamp, boolean, pgEnum, serial, jsonb } from 'drizzle-orm/pg-core';

// Enums
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const categoryEnum = pgEnum('category', [
  'grammar',
  'social',
  'dating',
  'slang',
  'directions',
  'food_drink',
  'emotions',
  'other',
  'shopping',
  'restaurant',
  'health',
  'transportation',
  'communication',
  'time',
  'greetings',
  'questions',
  'weather',
  'family',
  'work',
  'common_words',
  'housing'
]);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vocabulary table
export const vocabulary = pgTable('vocabulary', {
  id: serial('id').primaryKey(),
  spanish: text('spanish').notNull(),
  english: text('english').notNull(),
  category: categoryEnum('category').notNull(),
  difficulty: difficultyEnum('difficulty').notNull().default('beginner'),
  tags: text('tags').array(), // e.g., ['bar', 'casual', 'slang']
  context: text('context'), // additional context or example usage
  pronunciation: text('pronunciation'), // phonetic guide
  isCustom: boolean('is_custom').default(false),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // null for default vocab
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Verbs table
export const verbs = pgTable('verbs', {
  id: serial('id').primaryKey(),
  infinitive: text('infinitive').notNull().unique(),
  english: text('english').notNull(),

  // Store conjugations as JSON object with structure:
  // { presente: { yo: '...', vos: '...', el: '...', nosotros: '...', vosotros: '...', ellos: '...' }, ... }
  conjugations: jsonb('conjugations').notNull(),

  exampleSpanish: text('example_spanish'),
  exampleEnglish: text('example_english'),
  isIrregular: boolean('is_irregular').default(false),
  category: text('category'), // e.g., 'essential', 'social', 'slang'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Conversation scenarios table
export const scenarios = pgTable('scenarios', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(), // e.g., 'bar', 'dating', 'directions'
  difficulty: difficultyEnum('difficulty').notNull().default('beginner'),
  dialog: jsonb('dialog').notNull(), // Array of { speaker: 'you' | 'other', spanish: string, english: string, options?: string[] }
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User progress for spaced repetition
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  vocabId: integer('vocab_id').references(() => vocabulary.id, { onDelete: 'cascade' }),
  verbId: integer('verb_id').references(() => verbs.id, { onDelete: 'cascade' }),

  // Spaced repetition fields
  lastReviewed: timestamp('last_reviewed'),
  nextReview: timestamp('next_review'),
  easeFactor: integer('ease_factor').default(250), // SM-2 algorithm, stored as integer (2.5 = 250)
  interval: integer('interval').default(1), // days until next review
  repetitions: integer('repetitions').default(0),

  // Performance tracking
  correctCount: integer('correct_count').default(0),
  incorrectCount: integer('incorrect_count').default(0),

  // Flags
  isKnown: boolean('is_known').default(false),
  isFlagged: boolean('is_flagged').default(false), // user can flag for extra practice

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Quiz attempts and scores
export const quizAttempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category'),
  difficulty: difficultyEnum('difficulty'),
  mode: text('mode').notNull(), // 'flashcard', 'quiz', 'fill_blank', 'scenario'
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  timeSpentSeconds: integer('time_spent_seconds'),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// User stats and streaks
export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActivityDate: timestamp('last_activity_date'),
  totalCardsReviewed: integer('total_cards_reviewed').default(0),
  totalQuizzesTaken: integer('total_quizzes_taken').default(0),
  totalTimeSpentSeconds: integer('total_time_spent_seconds').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Custom user vocabulary
export const customVocab = pgTable('custom_vocab', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  spanish: text('spanish').notNull(),
  english: text('english').notNull(),
  category: categoryEnum('category').default('other'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
