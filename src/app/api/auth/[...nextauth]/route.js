import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

const providers = [];

// Google 소셜 로그인 — 키가 설정된 환경에서만 활성화된다. 로그인/가입
// 페이지는 getProviders()로 실제 활성 여부를 확인해 버튼을 노출하므로,
// 키가 없어도 사이트는 정상 동작한다.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // 같은 이메일의 기존(이메일·비밀번호) 계정에 Google 로그인을 자동
      // 연결한다. Google은 이메일 소유를 검증해 주므로 안전하다 — 끄면
      // 기존 회원이 Google 버튼을 눌렀을 때 OAuthAccountNotLinked 오류를 본다.
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        };
      },
    })
  );
}

providers.push(
  CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        if (user.status === 'suspended') {
          throw new Error('SUSPENDED');
        }
        if (user.status === 'withdrawn') {
          throw new Error('WITHDRAWN');
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordCorrect) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            loginCount: { increment: 1 },
          },
        });

        return user;
      },
    })
);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 14, // 14 days
  },
  callbacks: {
    // OAuth 로그인도 credentials와 동일하게 계정 상태를 검사한다 —
    // authorize()는 credentials 전용이라 여기서 막지 않으면 정지/탈퇴
    // 계정이 Google 버튼으로 우회 로그인할 수 있다.
    async signIn({ user, account }) {
      if (!account || account.provider === 'credentials') return true;
      if (!user?.email) return true;
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { id: true, status: true },
      });
      // 신규 가입(아직 DB에 없음)은 통과 — adapter가 이 콜백 뒤에 생성한다.
      if (!dbUser) return true;
      if (dbUser.status === 'suspended') return '/auth/signin?error=SUSPENDED';
      if (dbUser.status === 'withdrawn') return '/auth/signin?error=WITHDRAWN';
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
      });
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      // On every JWT regeneration (including session refresh), re-fetch user from DB
      // so that profile edits and status changes propagate without re-login.
      if (token.id && (user || trigger === 'update' || !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            phoneNumber: true,
            address: true,
            detailAddress: true,
            zipCode: true,
          },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.phoneNumber = dbUser.phoneNumber;
          token.address = dbUser.address;
          token.detailAddress = dbUser.detailAddress;
          token.zipCode = dbUser.zipCode;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.phoneNumber = token.phoneNumber;
        session.user.address = token.address;
        session.user.detailAddress = token.detailAddress;
        session.user.zipCode = token.zipCode;
      }
      return session;
    },
  },
  events: {
    // adapter(OAuth) 경유 신규 가입에만 발생한다 — credentials 가입은
    // /api/register가 직접 생성하므로 여기 오지 않는다. Google 버튼 옆에
    // "가입 시 약관 동의로 간주" 고지를 노출하므로 동의 시각을 기록한다.
    async createUser({ user }) {
      const now = new Date();
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { termsAgreedAt: now, privacyAgreedAt: now },
        });
      } catch (err) {
        console.error('[auth] createUser consent stamp failed', err?.message);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
