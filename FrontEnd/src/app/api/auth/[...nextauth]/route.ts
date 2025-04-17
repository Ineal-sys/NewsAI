import NextAuth from 'next-auth';
// Import the configured options from the lib file
import { authOptions } from '@/lib/auth';

// Initialize NextAuth with the imported options
const handler = NextAuth(authOptions);

// Export the handlers for GET and POST requests
export { handler as GET, handler as POST };
