'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Block } from '@/components/block';

function FailBody() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const code = searchParams.get('code');

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">결제가 완료되지 않았습니다</h1>
          <p className="text-sm text-zinc-700 mt-2 leading-relaxed">
            결제가 처리되지 않았거나 취소되었습니다.
            <br className="hidden md:block" />
            요금이 청구되지 않았으니 다시 시도해 주세요.
          </p>
        </Block>

        {(code || message) && (
          <Block className="mt-3">
            {code && (
              <p className="text-sm text-zinc-700">
                <span className="text-zinc-400 mr-2">Code</span>
                {code}
              </p>
            )}
            {message && (
              <p className="text-sm text-zinc-700 break-words mt-1">
                <span className="text-zinc-400 mr-2">Message</span>
                {message}
              </p>
            )}
          </Block>
        )}

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Block>
            <Link href="/checkout" className="text-sm md:text-base hover:underline">
              결제 다시 시도 →
            </Link>
          </Block>
          <Block>
            <Link href="/cart" className="text-sm md:text-base hover:underline">
              장바구니로 →
            </Link>
          </Block>
        </div>

        <Block className="mt-3">
          <p className="text-xs text-zinc-500">
            문제가 계속되면 contact@cage3000.com 으로 문의해 주세요.
          </p>
        </Block>
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
