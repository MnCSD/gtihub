import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Credentials provider requires JWT strategy
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // You can customize other pages if desired
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const loginField = credentials.email.toLowerCase();
        
        // Try to find user by email first, then by name (username)
        let user = await prisma.user.findUnique({
          where: { email: loginField },
        });
        
        // If not found by email, try by name (username)
        if (!user) {
          user = await prisma.user.findFirst({
            where: { name: { equals: credentials.email, mode: 'insensitive' } },
          });
        }
        
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image ?? undefined };
      },
    }),
    // Add OAuth providers here (e.g., GitHub/Google) later
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user data to the token on sign-in
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image; // NextAuth uses 'picture' for images in JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        // @ts-expect-error augment user id and image
        session.user.id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  // Use env secret in production
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
};
