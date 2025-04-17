import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        // Changed from email to name (pseudo)
        name: { label: "Pseudo", type: "text", placeholder: "jsmith" }, 
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check for name instead of email
        if (!credentials?.name || !credentials.password) { 
          console.error('Missing credentials');
          return null;
        }

        // Find user by name instead of email
        const user = await prisma.user.findUnique({
          where: { name: credentials.name } 
        });

        if (!user || !user.password) { // Check if user and password hash exist
          console.error('No user found or user has no password hash:', credentials.name);
          return null;
        }

        // Compare the provided password with the hashed password in the DB
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          console.error('Invalid password for user:', credentials.name);
          return null;
        }

        console.log('User authorized:', user.name);
        // Return user object without the password and email
        return {
          id: user.id,
          name: user.name,
          // email: user.email, // Remove email from returned user object
          image: user.image,
        };
      }
    })
    // Add other providers like Google, GitHub etc. here if needed
  ],
  session: {
    strategy: 'jwt', // Using JWT for session management
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret for signing JWTs - MUST be set in .env
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    // error: '/auth/error', // Optional: Custom error page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Add name to JWT, remove email if it was there
        token.name = user.name; 
        // delete token.email; // If email was previously added
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { 
        session.user.id = token.id as string;
        // Add name to session, remove email if it was there
        session.user.name = token.name as string;
        // delete session.user.email; // If email was previously added
      }
      return session;
    },
  },
};
