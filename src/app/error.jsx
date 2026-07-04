'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Block } from '@/components/block';

// Route-segment error boundary. Catches render/runtime errors in pages so the
// user sees a branded recovery screen instead of a white screen.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">문제가 발생했습니다</h1>
          <p className="text-sm text-zinc-700 mt-2">
            일시적인 오류일 수 있습니다. 다시 시도해 주세요.
          </p>
        </Block>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Block>
            <button
              type="button"
              onClick={() => reset()}
              className="text-sm md:text-base hover:underline"
            >
              다시 시도 →
            </button>
          </Block>
          <Block>
            <Link href="/" className="text-sm md:text-base hover:underline">
              홈으로 →
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
