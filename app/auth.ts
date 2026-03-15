import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        let user = null;

        // logic to verify if the user exists
        user = {
          id: "usr_8f3a92kdl",
          email: credentials.email as string,
          fullName: "Kelvin Kijazi",
          phone: "+2557XXXXXXXX",
        };

        if (!user) {
          throw new Error("Invalid credentials.");
        }

        return user;
      },
    }),
  ],
  // Tell NextAuth to use your custom login page.
  pages: {
    signIn: "/login",
  },
});
