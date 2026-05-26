import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                address: true,
                role: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
