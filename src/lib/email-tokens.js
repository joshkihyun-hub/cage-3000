import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const TTL_MS = {
  email_verify: 24 * 60 * 60 * 1000, // 24h
  password_reset: 60 * 60 * 1000, // 1h
};

function generateRawToken() {
  // 32 bytes → 64-char hex. Cryptographically random.
  return crypto.randomBytes(32).toString('hex');
}

// DB에는 링크에 든 토큰 원문이 아니라 해시만 둔다 — DB가 새어 나가도 그 안의
// 값으로는 비밀번호 재설정·인증 링크를 만들 수 없다.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function issueEmailToken({ userId, purpose }) {
  if (!TTL_MS[purpose]) {
    throw new Error(`Unknown email token purpose: ${purpose}`);
  }

  // Invalidate any prior unconsumed token of the same purpose for this user so
  // re-requesting a verification email always points to the freshest link.
  await prisma.emailToken.updateMany({
    where: { userId, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const token = generateRawToken();
  const expiresAt = new Date(Date.now() + TTL_MS[purpose]);

  await prisma.emailToken.create({
    data: { userId, purpose, token: hashToken(token), expiresAt },
  });

  return token;
}

// Consume a token: validate it's the right purpose, not expired, not consumed,
// mark it consumed, return its user. Throws on any failure.
export async function consumeEmailToken({ token, purpose }) {
  if (!token || typeof token !== 'string') {
    throw new Error('TOKEN_INVALID');
  }
  const record = await prisma.emailToken.findUnique({
    where: { token: hashToken(token) },
    include: { user: true },
  });
  if (!record || record.purpose !== purpose) {
    throw new Error('TOKEN_INVALID');
  }
  if (record.consumedAt) {
    throw new Error('TOKEN_USED');
  }
  if (record.expiresAt < new Date()) {
    throw new Error('TOKEN_EXPIRED');
  }
  // 아직 안 쓴 경우에만 쓴 것으로 표시한다 — 같은 링크로 동시에 두 번 요청해도 한 번만 통과.
  const { count } = await prisma.emailToken.updateMany({
    where: { id: record.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (count === 0) {
    throw new Error('TOKEN_USED');
  }
  return record.user;
}
