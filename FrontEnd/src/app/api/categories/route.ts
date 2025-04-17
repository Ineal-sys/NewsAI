import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories
// Fetches distinct non-null categories from the 'articles' table
export async function GET() {
  try {
    // Corrected: Use prisma.articles instead of prisma.article
    const distinctCategoryRecords = await prisma.articles.findMany({
      where: {
        category: {
          not: null, // Ensure category is not null
          not: ''    // Also ensure category is not an empty string if that's possible
        },
      },
      select: {
        category: true, // Select only the category field
      },
      distinct: ['category'], // Get distinct category values
    });

    // Extract category names into a simple array
    // Filter out any null/undefined just in case, and ensure they are strings
    const categories = distinctCategoryRecords
      .map(item => item.category)
      .filter((category): category is string => typeof category === 'string' && category.trim() !== ''); 

    // Sort categories alphabetically
    categories.sort();

    return NextResponse.json(categories);

  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Use a generic error message for the client
    return NextResponse.json({ error: 'Failed to fetch categories.' }, { status: 500 });
  }
}
