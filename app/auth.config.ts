import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roleId = (user as any).roleId;
        token.organizationId = (user as any).organizationId;
        token.branchId = (user as any).organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).roleId = token.roleId;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).branchId = token.branchId;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  providers: [], // Providers will be added in auth.ts with their full implementation
  session: {
    strategy: "jwt",
    maxAge: 3600,
  },
} satisfies NextAuthConfig;
