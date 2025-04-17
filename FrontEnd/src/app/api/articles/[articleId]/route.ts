import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ArticleParams {
    articleId: string;
}

// GET /api/articles/[articleId]
// Fetches a single article by its ID
export async function GET(
  request: Request, // Keep request parameter even if unused for now
  // Type params explicitly as a Promise to satisfy the constraint
  { params }: { params: Promise<ArticleParams> } 
) {
  try {
    // Await params before accessing properties
    const resolvedParams = await params;
    const articleIdNum = parseInt(resolvedParams.articleId, 10);

    if (isNaN(articleIdNum)) {
      return NextResponse.json({ error: 'Invalid article ID format' }, { status: 400 });
    }

    const article = await prisma.article.findUnique({
      where: {
        id: articleIdNum,
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Avoid logging the raw articleId here if possible, in case it contained sensitive info
    console.error(`Failed to fetch article by ID:`, error); 
    return NextResponse.json({ error: `Failed to fetch article: ${errorMessage}` }, { status: 500 });
  }
}
