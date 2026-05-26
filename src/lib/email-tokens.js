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
    data: { userId, purpose, token, expiresAt },
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
    where: { token },
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
  await prisma.emailToken.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  return record.user;
}
