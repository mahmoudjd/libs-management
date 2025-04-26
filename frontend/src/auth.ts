import NextAuth, {NextAuthOptions} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser } from "@/lib/hooks/login";
import { env } from "@/env.mjs";

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
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                try {
                    const loginResponse = await loginUser({
                        email: credentials?.email || "",
                        password: credentials?.password || "",
                    });

                    if (loginResponse?.user) {
                        return loginResponse.user;
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
        async signIn({account, profile}) {
            if (!profile?.email) {
                throw new Error("No profile")
            }
            // The endpoint doesn't exist, so we'll just return true to allow sign-in
            // In a production app, you would implement proper user lookup/creation
            return true;
        },
        async jwt({token, user, account}) {
            if (account?.provider === "google") {
                console.log("Google: ", user)
                // For Google users, we need to set all the properties used in the session
                token.sub = user.id || user.sub
                token.userId = user.id || user.sub
                token.email = user.email
                token.name = user.name
                // Split name into firstName and lastName if available
                const nameParts = user.name?.split(' ') || ['', '']
                token.firstName = nameParts[0] || ''
                token.lastName = nameParts.slice(1).join(' ') || ''
                // Default role for Google users
                token.role = 'user'
            } else if (user) {
                token.sub = user.id;
                token.userId = user.id;
                token.name = user?.firstName + " " + user?.lastName;
                token.firstName = user?.firstName;
                token.lastName = user?.lastName;
                token.email = user.email;
                token.role = user?.role;
                token.accessToken = user?.accessToken;
            }
            // console.log("TOKEN", token)
            return token;
        },
        async session({session, token}) {
            session.user = {
                id: token.userId || token.sub,
                firstName: token.firstName || '',
                lastName: token.lastName || '',
                email: token.email || '',
                role: token.role || 'user',
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
