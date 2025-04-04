import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import NextAuth, { NextAuthOptions } from "next-auth";
import { loginUser } from "@/lib/hooks/login";
import { env } from "@/env.mjs";

export type { Session } from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        firstName?: string;
        lastName?: string;
        email: string;
        accessToken?: string;
        role?: "admin" | "user";
    }

    interface Session {
        user: User;
    }
}

// NextAuth Konfiguration
const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
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
                    }

                    throw new Error("Invalid email or password");
                } catch (error) {
                    console.error("Authorization error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                if (!profile?.email) {
                    console.error("Google login failed: No email provided");
                    return false;
                }
                return true;
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                if (account?.provider === "google") {
                    token.userId = user.id;
                    token.email = user.email;
                    token.firstName = user.name?.split(" ")[0] || "";
                    token.lastName = user.name?.split(" ")[1] || "";
                    token.role = "user"; // Standardrolle für Google-Nutzer
                } else {
                    token.userId = user.id;
                    token.firstName = user.firstName;
                    token.lastName = user.lastName;
                    token.email = user.email;
                    token.role = user.role;
                    token.accessToken = user.accessToken;
                }
            }
            return token;
        },

        async session({ session, token }) {
            // @ts-ignore
            session.user = {
                id: token.userId,
                email: token.email,
                firstName: token.firstName,
                lastName: token.lastName,
                role: token.role,
                accessToken: token.accessToken,
            };
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
