import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    ...(process.env.GITHUB_CLIENT_ID
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            authorization: {
              params: { scope: 'repo read:user user:email' },
            },
          }),
        ]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/auth/login' },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === 'github') {
        token.githubAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};
