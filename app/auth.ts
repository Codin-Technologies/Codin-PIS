import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/login`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: credentials?.email,
            password: credentials?.password,
          }),
        })

        const data = await res.json()

        if (res.ok && data.user) {
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.fullName,
            roleId: data.user.roleId,
            organizationId: data.user.organizationId,
          } as any
        }

        throw new Error(data.message || "Invalid credentials.")
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roleId = (user as any).roleId
        token.organizationId = (user as any).organizationId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).roleId = token.roleId;
        (session.user as any).organizationId = token.organizationId;
        session.user.id = token.sub as string;
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: "jwt" }
})