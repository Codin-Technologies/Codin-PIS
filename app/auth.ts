import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { verifyUserCredentials } from "@/lib/auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          } as any;
        } catch (error: any) {
          console.error("Auth error:", error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roleId = (user as any).roleId
        token.organizationId = (user as any).organizationId
        token.branchId = (user as any).organizationId // Mapping organizationId as branchId for now
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).roleId = token.roleId;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).branchId = token.branchId;
        session.user.id = token.sub as string;
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: { 
    strategy: "jwt",
    maxAge: 3600 // 1 hour in seconds
  }
})
