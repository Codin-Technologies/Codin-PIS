import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.roleId = user.roleId;
        token.organizationId = user.organizationId;
        token.branchId = user.organizationId;
        token.loginAt = user.loginAt ?? null;
        token.lastLoginAt = user.lastLoginAt ?? null;
        token.mustChangePassword = Boolean(user.mustChangePassword);
      }

      if (trigger === 'update' && session) {
        if ('mustChangePassword' in session) {
          token.mustChangePassword = Boolean(session.mustChangePassword);
        }
        if ('lastLoginAt' in session) {
          token.lastLoginAt = session.lastLoginAt ?? null;
        }
        if ('loginAt' in session) {
          token.loginAt = session.loginAt ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.roleId = token.roleId;
        session.user.organizationId = token.organizationId;
        session.user.branchId = token.branchId;
        session.user.loginAt = token.loginAt ?? null;
        session.user.lastLoginAt = token.lastLoginAt ?? null;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
        session.loginAt = token.loginAt ?? null;
        session.lastLoginAt = token.lastLoginAt ?? null;
        session.mustChangePassword = Boolean(token.mustChangePassword);
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
