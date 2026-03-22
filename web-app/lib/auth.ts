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
    async jwt({ token, account, profile }) {
      // Quando faz login com Google, salva o email original
      if (account?.provider === 'google') {
        token.primaryEmail = token.email;
        token.primaryName = token.name;
        token.primaryPicture = token.picture;
      }
      // Quando conecta GitHub, preserva identidade Google e adiciona GitHub token
      if (account?.provider === 'github') {
        token.githubAccessToken = account.access_token;
        token.githubConnected = true;
        // Restaura identidade Google se existia
        if (token.primaryEmail) {
          token.email = token.primaryEmail as string;
          token.name = token.primaryName as string;
          token.picture = token.primaryPicture as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      // Garante que o email é sempre o primário (Google)
      if (token.primaryEmail && session.user) {
        session.user.email = token.primaryEmail as string;
        session.user.name = token.primaryName as string;
      }
      (session as any).githubConnected = !!token.githubConnected;
      (session as any).githubAccessToken = token.githubAccessToken || null;
      return session;
    },
  },
};
