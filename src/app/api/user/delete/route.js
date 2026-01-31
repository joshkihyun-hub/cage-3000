import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete the user
        // Relations (Account, Session) should cascade delete if configured in schema.
        // If not, we might need to delete them manually first, but usually Prisma handles cascade if defined in DB or Schema.
        // Looking at schema from context, Account/Session have onDelete: Cascade.

        await prisma.user.delete({
            where: {
                email: session.user.email,
            },
        });

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Delete user error:', error);
        // Determine if error is a foreign key constraint or something else
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
