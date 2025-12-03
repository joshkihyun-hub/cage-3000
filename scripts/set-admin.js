const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });
    console.log(`User ${user.name} (${user.email}) is now an admin.`);
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
