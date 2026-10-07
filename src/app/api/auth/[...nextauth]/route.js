import crypto from 'crypto';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// 비밀번호 지문 — 토큰에 비밀번호 해시 자체는 넣지 않고 짧은 지문만 담는다. 비밀번호가
// 바뀌거나(재설정) 지워지면(아래 Google 연결) 지문이 달라져 예전 토큰이 무효가 된다.
// JWT 세션은 서버에 지울 기록이 없어서, 다른 기기를 로그아웃시키는 수단이 이것뿐이다.
function passwordFingerprint(hashedPassword) {
  if (!hashedPassword) return 'none';
  return crypto.createHash('sha256').update(hashedPassword).digest('hex').slice(0, 16);
}

// 토큰을 DB와 다시 맞춰 보는 간격. 그 사이에는 토큰 값을 그대로 믿는다.
const RECHECK_MS = 60_000;

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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        // 비밀번호 대입 방지 — bcrypt 비교 전에 IP·계정 단위로 시도 횟수를 제한한다.
        const byIp = await rateLimit(`login:ip:${getClientIp(req)}`, { limit: 20, windowMs: 10 * 60_000 });
        const byEmail = await rateLimit(`login:email:${email}`, { limit: 10, windowMs: 10 * 60_000 });
        if (!byIp.ok || !byEmail.ok) {
          throw new Error('RATE_LIMITED');
        }

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
    async signIn({ user, account, profile }) {
      if (!account || account.provider === 'credentials') return true;
      // 이메일 소유가 확인된 Google 계정만 받는다 — 아래 자동 연결이 그 확인에 기대고 있다.
      if (account.provider === 'google' && profile?.email_verified !== true) return false;
      if (!user?.email) return true;
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { id: true, status: true, emailVerified: true, hashedPassword: true },
      });
      // 신규 가입(아직 DB에 없음)은 통과 — adapter가 이 콜백 뒤에 생성한다.
      if (!dbUser) return true;
      if (dbUser.status === 'suspended') return '/auth/signin?error=SUSPENDED';
      if (dbUser.status === 'withdrawn') return '/auth/signin?error=WITHDRAWN';

      const data = { lastLoginAt: new Date(), loginCount: { increment: 1 } };
      // 같은 이메일의 기존 계정이 메일 인증을 한 번도 안 했다면, 그 비밀번호는 이메일 주인이
      // 만든 것이라는 보장이 없다(남의 주소로 먼저 가입해 두는 계정 선점). Google이 주인임을
      // 확인해 준 지금 그 비밀번호를 지우고 인증된 계정으로 바꾼다 — 비밀번호 지문이 달라져
      // 그 비밀번호로 들어와 있던 다른 기기도 로그아웃된다. 진짜 주인은 Google로 계속
      // 들어오거나 비밀번호 찾기로 새로 정하면 된다.
      if (!dbUser.emailVerified) {
        data.emailVerified = new Date();
        if (dbUser.hashedPassword) data.hashedPassword = null;
      }
      await prisma.user.update({ where: { id: dbUser.id }, data });
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      // 로그인·프로필 수정 때, 그리고 그 밖에는 RECHECK_MS마다 DB와 다시 맞춘다 —
      // 프로필·권한·상태 변경이 재로그인 없이 반영되고, 무효가 된 토큰은 여기서 걸러진다.
      const stale = Date.now() - (token.checkedAt || 0) > RECHECK_MS;
      if (token.id && (user || trigger === 'update' || !token.role || stale)) {
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
            hashedPassword: true,
          },
        });
        const fingerprint = passwordFingerprint(dbUser?.hashedPassword);
        // 여기서 던지면 NextAuth가 세션 쿠키를 지운다(= 그 기기 로그아웃). 계정이 없어졌거나
        // 탈퇴했거나, 토큰을 받은 뒤 비밀번호가 바뀐 경우. 이 장치 이전에 발급된 토큰(pwv 없음)은
        // 한 번만 현재 지문을 받아들여, 배포했다고 모두가 로그아웃되지는 않게 한다.
        if (!dbUser || dbUser.status === 'withdrawn' || (token.pwv && token.pwv !== fingerprint)) {
          throw new Error('SESSION_REVOKED');
        }
        token.pwv = fingerprint;
        token.checkedAt = Date.now();
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.role = dbUser.role;
        token.status = dbUser.status;
        token.phoneNumber = dbUser.phoneNumber;
        token.address = dbUser.address;
        token.detailAddress = dbUser.detailAddress;
        token.zipCode = dbUser.zipCode;
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
