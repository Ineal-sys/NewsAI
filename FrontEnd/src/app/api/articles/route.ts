// src/app/api/articles/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import only the client instance
import { Prisma } from '@prisma/client'; // Import the Prisma namespace for types
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

// Helper function to check if a string is a valid sort key for the 'articles' model
// Corrected: Changed Prisma.ArticleOrderByWithRelationInput to Prisma.articlesOrderByWithRelationInput
function isValidSortKey(key: string): key is keyof Prisma.articlesOrderByWithRelationInput {
    const allowedKeys: Array<keyof Prisma.articlesOrderByWithRelationInput> = ['created_at', 'Date_Feed', 'rating', 'title'];
    return allowedKeys.includes(key as keyof Prisma.articlesOrderByWithRelationInput);
}

// GET /api/articles?page=1&limit=15&rating=6&sortBy=created_at&order=desc&includeRead=true
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const minRating = parseInt(searchParams.get('rating') || '6', 10);
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const includeRead = searchParams.get('includeRead') === 'true'; // Check for the new parameter

  const validSortBy = isValidSortKey(sortBy) ? sortBy : 'created_at';
  const validOrder = ['asc', 'desc'].includes(order) ? order as Prisma.SortOrder : 'desc';

  const skip = (page - 1) * limit;

  try {
    // Corrected: Use Prisma.articlesWhereInput
    const baseWhereClause: Prisma.articlesWhereInput = { 
      rating: {
        gte: minRating,
      },
    };

    // Corrected: Use Prisma.articlesWhereInput
    let finalWhereClause: Prisma.articlesWhereInput = baseWhereClause;

    // Only exclude read articles if the user is logged in AND includeRead is false
    if (userId && !includeRead) {
      const readArticles = await prisma.readArticle.findMany({
        where: { userId: userId },
        select: { articleId: true },
      });
      const readArticleIds = readArticles.map(ra => ra.articleId);

      if (readArticleIds.length > 0) {
          finalWhereClause = {
            AND: [
              baseWhereClause,
              {
                id: {
                    notIn: readArticleIds,
                }
              }
            ]
          };
      }
    }

    const [articles, totalCount] = await prisma.$transaction([
        // Corrected: Use prisma.articles
        prisma.articles.findMany({ 
            where: finalWhereClause,
            orderBy: {
                [validSortBy]: validOrder,
            },
            skip: skip,
            take: limit,
        }),
        // Corrected: Use prisma.articles
        prisma.articles.count({ 
            where: finalWhereClause,
        })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
        articles,
        totalCount,
        totalPages,
        currentPage: page,
        limit
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    // Using a generic error message for the client
    return NextResponse.json({ error: `Failed to fetch articles.` }, { status: 500 });
  }
}
