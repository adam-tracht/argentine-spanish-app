import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../../../../../drizzle/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { spanish, english, category, difficulty, tags, context, userId } = body;

    // Validate required fields
    if (!spanish || !english || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: spanish, english, category, difficulty' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['grammar', 'social', 'dating', 'slang', 'directions', 'food_drink', 'emotions', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await db.insert(schema.vocabulary).values({
      spanish,
      english,
      category: category as any,
      difficulty: difficulty as any,
      tags: tags || null,
      context: context || null,
      isCustom: !!userId,
      userId: userId || null,
    }).returning();

    return NextResponse.json({
      success: true,
      vocabulary: result[0],
      message: 'Vocabulary added successfully'
    });
  } catch (error) {
    console.error('Error adding vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to add vocabulary' },
      { status: 500 }
    );
  }
}
