import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyUserCredentials } from "@/lib/auth";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const user = await verifyUserCredentials(
            credentials?.email as string,
            credentials?.password as string
          );

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            roleId: user.roleId,
            organizationId: user.organizationId,
            loginAt: user.loginAt?.toISOString?.() ?? null,
            lastLoginAt: user.lastLoginAt?.toISOString?.() ?? null,
            mustChangePassword: Boolean(user.mustChangePassword),
          };
        } catch (error: unknown) {
          console.error("Auth error:", error instanceof Error ? error.message : error);
          return null;
        }
      },
    }),
  ],
});
