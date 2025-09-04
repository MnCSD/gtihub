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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
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
      // Persist the user id to the token on sign-in
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.sub) {
        // @ts-expect-error augment user id
        session.user.id = token.sub;
      }
      return session;
    },
  },
  // Use env secret in production
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
};
