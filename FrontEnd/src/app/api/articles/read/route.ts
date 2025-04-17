import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'; // Corrected import path
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma types

// POST /api/articles/read
// Marks an article as read for the current user
export async function POST(request: Request) {
  const session = await getServerSession(authOptions); // Get session info server-side

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  let body;
  try {
    body = await request.json();
  } catch (parseError) { // Give error a different name
    console.error("Invalid JSON body:", parseError);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  
  const { articleId } = body;

  if (!articleId || typeof articleId !== 'number') {
    return NextResponse.json({ error: 'Valid articleId is required' }, { status: 400 });
  }

  try {
    // Use upsert to create or update the read status
    // This avoids issues if the user clicks "mark read" multiple times
    const readArticle = await prisma.readArticle.upsert({
      where: {
        userId_articleId: { // Unique constraint defined in schema
          userId: userId,
          articleId: articleId,
        },
      },
      update: {
        read_at: new Date(), // Update timestamp if already exists
      },
      create: {
        userId: userId,
        articleId: articleId,
        // read_at defaults to CURRENT_TIMESTAMP
      },
    });

    return NextResponse.json(readArticle, { status: 200 }); // Return 200 OK on success

  } catch (error) { // Type the error
    // Check if error is due to foreign key constraint violation (article not found)
     if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
          // Check for field name if available in meta, handle potential undefined
          const fieldName = error.meta?.field_name as string | undefined;
          if (fieldName?.includes('articleId')) {
            console.error(`Article not found for marking as read: ID ${articleId}`);
            return NextResponse.json({ error: `Article with ID ${articleId} not found.` }, { status: 404 });
         } else {
            // Handle other P2003 errors if necessary
             console.error("Foreign key constraint error:", error);
             return NextResponse.json({ error: 'Database relation error' }, { status: 400 });
         }
     }
    
    // Handle other potential errors
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Failed to mark article as read:", error); // Log the actual error object
    return NextResponse.json({ error: `Failed to mark article as read: ${errorMessage}` }, { status: 500 });
  }
}
