import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import NextAuth, { NextAuthOptions } from "next-auth";
import { loginUser } from "@/lib/hooks/login";

export type { Session } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    accessToken: string
    role: "admin" | "user"
  }
}



// NextAuth Konfiguration
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("Login attempt:", credentials);

          const email = z.string().email().parse(credentials?.email);
          const password = z.string().min(6).parse(credentials?.password);

          const loginResponse = await loginUser({ email, password });

          console.log("Login response:", loginResponse); // 🔥 Debugging

          if (loginResponse?.user) {
            return loginResponse.user;
          } else {
            throw new Error("Invalid email or password");
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.userId = user.id
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.email = user.email
        token.role = user.role
        token.accessToken = user.accessToken
      }
      return token
    },
    session: ({ session, token }) => {
      // @ts-expect-error
      session.user.accessToken = token.accessToken
      // @ts-expect-error
      session.user.userId = token.userId
      // @ts-expect-error
      session.user.role = token.role

      return session
    }
  },
  pages: {
    signIn: "login"
  }
};

const handler = NextAuth(authOptions)


export { handler as GET, handler as POST, authOptions }

