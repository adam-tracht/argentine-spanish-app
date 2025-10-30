import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verbs } from '@/../drizzle/schema';
import { eq, ilike, or } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let query = db.select().from(verbs);

    // Apply search filter
    if (search) {
      query = query.where(
        or(
          ilike(verbs.infinitive, `%${search}%`),
          ilike(verbs.english, `%${search}%`)
        )
      ) as any;
    }

    // Apply category filter
    if (category) {
      query = query.where(eq(verbs.category, category)) as any;
    }

    const results = await query;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching verbs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verbs' },
      { status: 500 }
    );
  }
}
