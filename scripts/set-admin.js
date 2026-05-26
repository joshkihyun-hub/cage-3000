/**
 * Promote (or demote) a user to admin by email.
 *
 *   node scripts/set-admin.js <email>            # promote to admin
 *   node scripts/set-admin.js <email> --demote   # demote back to user
 *   node scripts/set-admin.js <email> --check    # show role without changing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const rawEmail = process.argv[2];
  const flag = process.argv[3];

  if (!rawEmail) {
    console.error('Usage: node scripts/set-admin.js <email> [--demote|--check]');
    process.exit(1);
  }

  const email = rawEmail.trim().toLowerCase();
  const demote = flag === '--demote';
  const check = flag === '--check';

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    console.error(`✗ User not found: ${email}`);
    process.exit(1);
  }

  console.log('\nCurrent user:');
  console.log(`  Name      : ${user.name}`);
  console.log(`  Email     : ${user.email}`);
  console.log(`  Role      : ${user.role}`);
  console.log(`  Status    : ${user.status}`);
  console.log(`  Joined    : ${user.createdAt.toISOString()}`);
  console.log(`  Last login: ${user.lastLoginAt ? user.lastLoginAt.toISOString() : '(never)'}`);

  if (check) {
    await prisma.$disconnect();
    return;
  }

  const nextRole = demote ? 'user' : 'admin';
  if (user.role === nextRole) {
    console.log(`\n→ Already ${nextRole}. No changes.`);
    await prisma.$disconnect();
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: nextRole },
    select: { name: true, email: true, role: true },
  });

  console.log(`\n✓ ${updated.name} (${updated.email}) is now: ${updated.role}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
