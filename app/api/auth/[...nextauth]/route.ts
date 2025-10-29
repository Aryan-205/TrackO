import NextAuth, { DefaultSession, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { comparePasswords } from "@/lib/hash";
import { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

type CustomUser = Omit<DefaultSession['user'], 'name' | 'email' | 'image'>;

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;      
      name: string;    
      email: string;   
    } & CustomUser; 
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
  }
}

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (!user) return null;
        const valid = await comparePasswords(credentials.password, user.password);
        if (!valid) return null;
        return { id: String(user.id), email: user.email, name:user.name };
      }
    })
  ],
  pages: {
    signIn: "/signin",
    error: "/signin"
  },
  session: { strategy: "jwt" as const },

  callbacks: {

    async jwt({ token, user }:{token:JWT, user?:{ id: string, name: string, email: string }}) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    // 💡 Session callback types are fixed here
    async session({ session, token }:{session:Session, token:JWT}) {
      session.user.id = token.id as string || token.sub; 
      session.user.name = token.name; 
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
