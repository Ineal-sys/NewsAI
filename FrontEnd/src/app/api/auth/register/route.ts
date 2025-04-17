// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import cuid from 'cuid'; // Import cuid

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, password } = body; 

    if (!name || !password) {
      return NextResponse.json({ error: 'Pseudo and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ error: 'Password should be at least 6 characters long' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { name: name }, 
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this pseudo already exists' }, { status: 409 }); // 409 Conflict
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate a CUID for the user ID
    const userId = cuid(); 

    // Create the user in the database, providing the generated ID
    const user = await prisma.user.create({
      data: {
        id: userId, // Provide the generated ID
        name: name, 
        password: hashedPassword,
      },
    });

    const userWithoutPassword = {
        id: user.id,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    // Handle potential Prisma errors more specifically
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //   if (error.code === 'P2002') {
    //       // This specific code indicates a unique constraint violation
    //       return NextResponse.json({ error: 'Pseudo already taken' }, { status: 409 });
    //   }
    // }
    // Generic error for other cases
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: `An unexpected error occurred during registration: ${errorMessage}` }, { status: 500 });
  }
}
