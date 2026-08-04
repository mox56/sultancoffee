import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  providers: [], // filled in by the full config
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.role = (user as any).role;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
};
