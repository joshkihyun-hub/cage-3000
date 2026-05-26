import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireActiveUser } from '@/lib/auth-guards';

// Soft delete: 회원 탈퇴 시 개인정보는 익명화하지만 주문 이력은 보존한다.
// (전자상거래법상 계약/결제 기록은 5년 이상 보관 의무가 있음.)
export async function DELETE() {
    const { session, error } = await requireActiveUser();
    if (error) return error;

    const userId = session.user.id;
    const anonStamp = Date.now();

    try {
        await prisma.$transaction([
            prisma.account.deleteMany({ where: { userId } }),
            prisma.session.deleteMany({ where: { userId } }),
            prisma.user.update({
                where: { id: userId },
                data: {
                    name: '탈퇴한 회원',
                    email: `withdrawn-${anonStamp}-${userId}@deleted.cage3000.local`,
                    phoneNumber: `__deleted_${anonStamp}_${userId}`,
                    hashedPassword: null,
                    address: null,
                    detailAddress: null,
                    zipCode: null,
                    birthDate: null,
                    marketingConsent: false,
                    marketingAgreedAt: null,
                    image: null,
                    status: 'withdrawn',
                },
            }),
        ]);

        return NextResponse.json({ message: 'Account withdrawn successfully' });
    } catch (err) {
        console.error('Withdraw error:', err);
        return NextResponse.json({ error: '탈퇴 처리에 실패했습니다.' }, { status: 500 });
    }
}
