'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function FailBody() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const code = searchParams.get('code');

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-screen-sm text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-6">
          Payment Failed
        </p>
        <h1 className="text-3xl md:text-4xl text-black mb-8 leading-tight">
          결제가 완료되지 않았습니다.
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed mb-10">
          결제가 처리되지 않았거나 취소되었습니다.<br />
          요금이 청구되지 않았으니 다시 시도해 주세요.
        </p>

        {(code || message) && (
          <div className="border-y border-zinc-200 py-6 mb-10 text-left space-y-2">
            {code && (
              <p className="text-xs text-zinc-500">
                <span className="uppercase tracking-[0.2em] text-zinc-400 mr-2">Code</span>
                {code}
              </p>
            )}
            {message && (
              <p className="text-xs text-zinc-500 break-words">
                <span className="uppercase tracking-[0.2em] text-zinc-400 mr-2">Message</span>
                {message}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="bg-black text-white py-3 px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
          >
            결제 다시 시도
          </Link>
          <Link
            href="/cart"
            className="border border-black text-black py-3 px-8 text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
          >
            장바구니로
          </Link>
        </div>

        <p className="mt-12 text-[10px] text-zinc-400 leading-relaxed">
          문제가 계속되면 contact@cage3000.com 으로 문의해 주세요.
        </p>
      </div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <FailBody />
    </Suspense>
  );
}
