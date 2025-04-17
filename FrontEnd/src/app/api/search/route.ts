// src/app/api/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Import only the client instance
import { Prisma } from '@prisma/client'; // Import the Prisma namespace for types
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

// GET /api/search?q=[query]&page=1&limit=15&includeRead=true
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const includeRead = searchParams.get('includeRead') === 'true'; // Check for the new parameter

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  const skip = (page - 1) * limit;

  try {
    // Corrected: Use Prisma.articlesWhereInput based on model name 'articles'
    const searchOrClause: Prisma.articlesWhereInput = { 
      OR: [
        {
          title: {
            contains: query,
            // mode: 'insensitive', // MySQL doesn't support insensitive mode directly like this
          },
        },
        {
          summary: {
            contains: query,
            // mode: 'insensitive',
          },
        },
      ],
    };

    // Corrected: Use Prisma.articlesWhereInput
    let finalWhereClause: Prisma.articlesWhereInput = searchOrClause;

    // Only add the exclusion if the user is logged in AND includeRead is false
    if (userId && !includeRead) {
      // Correct: Uses prisma.readArticle (camelCase of ReadArticle)
      const readArticles = await prisma.readArticle.findMany({ 
        where: { userId: userId },
        select: { articleId: true },
      });
      const readArticleIds = readArticles.map(ra => ra.articleId);

      if (readArticleIds.length > 0) {
          finalWhereClause = {
                AND: [
                    searchOrClause, 
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
                created_at: 'desc',
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
    console.error(`Failed to search articles for query "${query}":`, error);
    // Using a generic error message for the client
    return NextResponse.json({ error: `Failed to search articles.` }, { status: 500 }); 
  }
}
