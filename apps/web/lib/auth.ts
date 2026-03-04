import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type Session } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { authAccounts, sessions, users, verificationTokens } from "@/lib/schema";
import { env } from "@/lib/env";

function getEmailTransport() {
  return nodemailer.createTransport(env.EMAIL_SERVER);
}

const emailFrom = env.EMAIL_FROM || "Mythos <no-reply@mythos.local>";

const authConfig = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: authAccounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }),
  session: { strategy: "jwt" },
  secret: env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    }),
    GitHub({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    }),
    EmailProvider({
      from: emailFrom,
      maxAge: 24 * 60 * 60, // 24 hours
      sendVerificationRequest: async ({ identifier, url }) => {
        const transport = getEmailTransport();
        await transport.sendMail({
          to: identifier,
          from: emailFrom,
          subject: "Your Mythos sign-in link",
          text: `Sign in to Mythos using this magic link: ${url}`,
          html: `<p>Sign in to <strong>Mythos</strong> with the secure link below.</p><p><a href="${url}">Sign in</a></p><p>This link expires in 24 hours.</p>`
        });
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email && account?.provider !== "email") return false;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login",
    error: "/login"
  },
  trustHost: true
});

export const { handlers, auth, signIn, signOut } = authConfig;
export const { GET, POST } = handlers;

type RouteContext = { params?: Record<string, string> };

export function withAuth<T extends RouteContext = RouteContext>(
  handler: (req: NextRequest, ctx: T & { session: Session }) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, ctx?: T) => {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, { ...(ctx || ({} as T)), session });
  };
}
