import { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";
declare module "next-auth" {
 
  interface Session {
    user: {
      id: string;
      name?: string | null; 
   
    } & Omit<DefaultSession["user"], 'email' | 'name'>;
  }

   interface User {
    name?: string | null; 
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id?: string;
    name?: string | null;
  }
}
