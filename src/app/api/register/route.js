
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  const { name, phoneNumber, email, address, password } = await req.json();

  if (!name || !phoneNumber || !email || !address || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Check for existing user
  const existingEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (existingEmail) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const existingPhone = await prisma.user.findUnique({
    where: { phoneNumber }
  });

  if (existingPhone) {
    return NextResponse.json({ error: 'Phone number already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        phoneNumber,
        address,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
