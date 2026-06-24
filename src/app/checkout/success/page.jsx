'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/shared/context/cart-context';

// Reached by two distinct paths:
//
// 1) Inline/popup flow (PC): the checkout client already verified the payment
//    server-side, then redirected here with ?order=<orderNumber>. Nothing to do
//    but clear the cart and show the receipt.
//
// 2) Redirect flow (mobile card / KakaoPay / NaverPay / TossPay): PortOne
//    redirects the browser back to this page with ?paymentId=... (success) or
//    ?code=...&message=... (failure). The code after requestPayment never ran,
//    so THIS page must trigger server-side settlement via /api/payment/confirm.
//    The webhook is the ultimate safety net if even this doesn't run.
function SuccessBody() {
  const router = useRouter();
  const params = useSearchParams();
  const { clearCart } = useCart();

  const orderParam = params.get('order'); // inline flow
  const paymentId = params.get('paymentId'); // redirect flow
  const code = params.get('code'); // redirect failure

  // 'confirming' (verifying redirect payment) | 'done' (confirmed) |
  // 'received' (confirm didn't confirm, webhook will settle — soft success)
  const [phase, setPhase] = useState(code ? 'redirecting' : paymentId ? 'confirming' : 'done');
  const orderNumber = orderParam || paymentId || '';
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    // Failure redirect from PortOne → hand off to the dedicated fail page.
    if (code) {
      const qs = new URLSearchParams();
      qs.set('code', code);
      const message = params.get('message');
      if (message) qs.set('message', message);
      router.replace(`/checkout/fail?${qs.toString()}`);
      return;
    }

    // Inline flow: already settled by the checkout client before redirecting.
    if (!paymentId) {
      clearCart();
      return;
    }

    // Redirect success: settle now (idempotent). Cart clears either way.
    (async () => {
      try {
        const res = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
        });
        const data = await res.json().catch(() => ({}));
        clearCart();
        setPhase(res.ok && data.status === 'success' ? 'done' : 'received');
      } catch {
        clearCart();
        setPhase('received');
      }
    })();
    // Run once on mount; URL params are stable for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'redirecting') {
    return <div className="min-h-screen bg-white" />;
  }

  if (phase === 'confirming') {
    return (
      <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-6">Verifying</p>
          <h1 className="text-2xl md:text-3xl text-black mb-4">결제를 확인하고 있습니다…</h1>
          <p className="text-sm text-zinc-500">잠시만 기다려 주세요.</p>
        </div>
      </div>
    );
  }

  const isSoft = phase === 'received';

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-sm text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-6">
          {isSoft ? 'Order Received' : 'Order Confirmed'}
        </p>
        <h1 className="text-3xl md:text-4xl text-black mb-8 leading-tight">
          주문이 접수되었습니다.
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed mb-10">
          {isSoft ? (
            <>
              결제 확인이 진행 중입니다.<br />
              확인이 완료되면 주문 확인 메일을 보내드립니다.
            </>
          ) : (
            <>
              결제가 정상적으로 완료되었습니다.<br />
              주문 확인 메일을 발송했으니 받은 편지함을 확인해 주세요.
            </>
          )}
        </p>

        {orderNumber && (
          <div className="border-y border-zinc-200 py-6 mb-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 mb-2">
              Order Number
            </p>
            <p className="text-lg text-black tracking-wide">{orderNumber}</p>
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

        <p className="mt-8 text-[10px] text-zinc-400">
          비회원으로 주문하셨나요?{' '}
          <Link href="/order-lookup" className="underline hover:text-black transition-colors">
            주문 조회
          </Link>
        </p>

        <p className="mt-6 text-[10px] text-zinc-400 leading-relaxed">
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
