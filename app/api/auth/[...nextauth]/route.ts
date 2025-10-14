import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { comparePasswords, hashPassword } from "@/lib/hash";

const prisma = new PrismaClient();

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
    async jwt({ token, user }:{token:any, user:any}) {
      if (user) {
        token.id = user.id;
        token.name = user.name; // 👈 Add name from the user object to the JWT
      }
      return token;
    },
    async session({ session, token }:{session:any, token:any}) {
      session.user.id = token.id || token.sub; 
      session.user.name = token.name; 
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
