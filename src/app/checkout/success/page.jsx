'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Success page is reached by:
// 1) The checkout client redirecting after server-side payment verification.
//    In this case ?order=<orderNumber> is present and the order is already PAID.
// 2) PortOne's external redirect for some payment methods (NaverPay/KakaoPay
//    sometimes redirect from their own domain). Verification has already been
//    attempted by the client; if the redirect hits us cold we still want to
//    show a graceful "we've got your order, check email" screen.
function SuccessBody() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-sm text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-6">
          Order Confirmed
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-black mb-8 leading-tight">
          주문이 접수되었습니다.
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed mb-10">
          결제가 정상적으로 완료되었습니다.<br />
          주문 확인 메일을 발송했으니 받은 편지함을 확인해 주세요.
        </p>

        {orderNumber && (
          <div className="border-y border-zinc-200 py-6 mb-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-2">
              Order Number
            </p>
            <p className="font-serif text-lg text-black tracking-wide">{orderNumber}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="bg-black text-white py-3 px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
          >
            계속 쇼핑하기
          </Link>
          <Link
            href="/my-page"
            className="border border-black text-black py-3 px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
          >
            주문 내역
          </Link>
        </div>

        <p className="mt-12 text-[10px] text-zinc-400 leading-relaxed">
          문의는 contact@cage3000.com 으로 부탁드립니다.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SuccessBody />
    </Suspense>
  );
}
