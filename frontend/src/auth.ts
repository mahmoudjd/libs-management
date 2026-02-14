import NextAuth, {NextAuthOptions, Session} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { googleLogin, loginUser } from "@/lib/hooks/login";
import { env } from "@/env";

export type { Session } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    expiresAt?: number
    accessToken: string
    firstName: string
    lastName: string
    name: string
    salesRole: string
    email?: string
  }

  export interface Session {
    user: User
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const loginResponse = await loginUser({
            email: credentials?.email || "",
            password: credentials?.password || "",
          });

          if (loginResponse?.user) {
            return {
              id: loginResponse.user.id,
              firstName: loginResponse.user.firstName,
              lastName: loginResponse.user.lastName,
              name: `${loginResponse.user.firstName} ${loginResponse.user.lastName}`.trim(),
              salesRole: loginResponse.user.role,
              email: loginResponse.user.email,
              accessToken: loginResponse.user.accessToken,
            };
          } else {
            throw new Error("Invalid email or password");
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google" ) {
        return !!profile?.email
      }
      // The endpoint doesn't exist, so we'll just return true to allow sign-in
      // In a production app, you would implement proper user lookup/creation
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // For Google users, we need to set all the properties used in the session
        const fullName = user?.name || ""
        const [firstName, ...restName] = fullName.split(" ")
        if (!user?.email) {
          return token
        }

        const responseGoogleLog = await googleLogin({
          email: user.email,
          firstName: firstName || "",
          lastName: restName.join(" ")
        })
        const googleUser = responseGoogleLog?.user
        if (!googleUser) {
          return token
        }

        token.userId = googleUser.id;
        token.name = googleUser?.firstName + " " + googleUser?.lastName;
        token.firstName = googleUser?.firstName;
        token.lastName = googleUser?.lastName;
        token.email = googleUser.email;
        token.role = googleUser?.role;
        token.accessToken = googleUser?.accessToken;
      } else if (user) {
        token.userId = user.id;
        token.name = user?.firstName + " " + user?.lastName;
        token.firstName = user?.firstName;
        token.lastName = user?.lastName;
        token.email = user.email;
        token.role = user?.salesRole;
        token.accessToken = user?.accessToken;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        // @ts-ignore
        id: token.userId,
        name: token.name || '',
        // @ts-ignore
        firstName: token.firstName,
        // @ts-ignore
        lastName: token.lastName,
        email: token.email || '',
        // @ts-ignore
        salesRole: token.role || 'user' ,
        // @ts-ignore
        accessToken: token.accessToken,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
